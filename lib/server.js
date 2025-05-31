import sqlite3 from 'sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import markdownit from 'markdown-it'
import pug from 'pug'
import express from 'express'

const md = markdownit()

// Promisify sqlite3 for easier async/await usage
function openDatabase(filename) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(filename, (err) => {
            if (err) reject(err);
            else resolve(db);
        });
    });
}

function runQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function getQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function allQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function ensureSchema(db) {
    await runQuery(db, "PRAGMA journal_mode = WAL;");
    
    // Create tables one by one to avoid issues
    await runQuery(db, `
        create table if not exists
        posts (
            title text primary key,
            changed integer,
            scanned integer
        )
    `);

    await runQuery(db, `
        create table if not exists
        mtime (
            id integer primary key, 
            mtime integer
        )
    `);

    await runQuery(db, `
        create virtual table if not exists 
        searchable using fts5(title, text)
    `);

    await runQuery(db, `
        insert or ignore into mtime(id, mtime) values(1, 42)
    `);
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
})

export async function startServer(config) {
    const { postsDir, cacheDir, templatesDir, cssDir, port } = config
    
    // Database setup
    const dbPath = path.join(cacheDir, 'blog.sqlite')
    const db = await openDatabase(dbPath)
    await ensureSchema(db)

    async function rescanIfNeeded() {
        const mtime = fs.statSync(postsDir).mtime.valueOf()
        const dbmtimeRow = await getQuery(db, "select mtime from mtime where id = 1")
        const dbmtime = dbmtimeRow.mtime

        if (dbmtime != mtime) {
            // must rescan
            const dbScanTime = mtime

            for (const fname of fs.readdirSync(postsDir).filter(a => a.endsWith(".md"))) {
                const fpath = path.join(postsDir, fname)
                const fmtime = fs.statSync(fpath).mtime.valueOf()
                const title = path.basename(fname, ".md")

                const oldpost = await allQuery(db, `select * from posts where title = ?`, [title])

                if ((oldpost.length > 0) && (oldpost[0].changed == fmtime)) {
                    continue;
                }

                await runQuery(db, `insert or replace into posts(title, changed, scanned) values (?, ?, ?)`,
                    [title, fmtime, dbScanTime])
                
                const text = fs.readFileSync(fpath).toString()
                await runQuery(db, `delete from searchable where title = ?`, [title])
                await runQuery(db, `insert into searchable(title, text) values(?, ?)`,
                    [title, text])
            }

            await runQuery(db, `insert or replace into mtime(id, mtime) values(1, ?)`,
                [dbScanTime])
            
            const deleted = await allQuery(db, `select title from posts where scanned != ?`, [dbScanTime])
            for (const item of deleted) {
                const title = item.title

                await runQuery(db, "delete from searchable where title = ? order by rank", [title])
                await runQuery(db, "delete from posts where title = ?", [title])
            }
        }
    }

    await rescanIfNeeded()

    const app = express()

    // Posts route handler
    app.get('/posts/*', async (req, res) => {
        let url = decodeURI(req.path)
        let fpath = url
        fpath = fpath.replace("posts/", "")
        fpath = path.join(postsDir, fpath)
        // const title = fpath.replaceAll('-', ' ')
        const title = path.basename(fpath)
        
        if (fpath.endsWith(".md")) {
            try {
                const text = fs.readFileSync(fpath, 'utf8')
                const render = md.render(text)

                const render2 = pug.renderFile(path.join(templatesDir, "post.pug"), {
                    title: title,
                    article: render
                })
                
                res.set("Content-Type", "text/html")
                res.send(render2)
            } catch (err) {
                // console.log(err)
                res.status(404).send("Not found")
            }
        } else {
            // Serve static files (images, etc.) from posts directory
            try {
                const fileName = path.basename(fpath)
                const filePath = path.join(postsDir, fileName)
                res.sendFile(path.resolve(filePath))
            } catch (err) {
                res.status(404).send("Not found")
            }
        }
    })

    // Search route handler
    app.get('/search', async (req, res) => {
        await rescanIfNeeded()
        const query = req.query.q

        if (query == "" || !query) {
            return res.redirect("/")
        }

        const pageSize = parseInt(req.query.pageSize) || 25
        const page = parseInt(req.query.page) || 1

        const offset = (page - 1) * pageSize

        const items = await allQuery(db,
            "select title, highlight(searchable, 1, '', '') as highlight from "
            + " searchable where searchable match ? "
            + " order by bm25(searchable)"
            + " limit ? offset ? ",
            [query, pageSize + 1, offset])

        let nextPageLink = undefined
        let prevPageLink = undefined

        if (items.length > pageSize) {
            nextPageLink = "/search?q=" + query + "&page=" + (page + 1)
            items.pop()
        }

        if (page > 1) {
            prevPageLink = "/search?q=" + query + "&page=" + (page - 1)
        }

        const processedItems = []
        for (const item of items) {
            const stats = await getQuery(db, "select * from posts where title = ?", [item.title])
            processedItems.push({
                title: item.title,
                fdate: dateFormatter.format(stats.changed),
                url: "/posts/" + item.title + ".md",
                highlight: item.highlight
            })
        }

        const output = pug.renderFile(path.join(templatesDir, "search.pug"), {
            results: processedItems,
            empty: processedItems.length == 0,
            nextPageLink: nextPageLink,
            prevPageLink: prevPageLink,
            query: query || ""
        })

        res.set("Content-Type", "text/html")
        res.send(output)
    })

    // CSS route handler
    app.get('/css/*', (req, res) => {
        const fileName = path.basename(req.path)
        const filePath = path.join(cssDir, fileName)
        res.sendFile(path.resolve(filePath))
    })

    // Homepage route handler
    app.get('/', async (req, res) => {
        await rescanIfNeeded()
        const title = "blog"
        const pageSize = parseInt(req.query.pageSize) || 25
        const page = parseInt(req.query.page) || 1

        const offset = (page - 1) * pageSize

        let nextPageLink = undefined
        let prevPageLink = undefined

        if (offset > 0) {
            prevPageLink = "/?page=" + (page - 1)
        }

        const countRow = await getQuery(db, `select count(*) as c from posts`)
        const count = countRow.c

        if ((offset + pageSize) < count) {
            nextPageLink = "/?page=" + (page + 1)
        }

        const posts = await allQuery(db, `select * from posts order by changed desc limit ? offset ?`,
            [pageSize, offset])
        
        const processedPosts = posts.map(el => {
            return {
                title: el.title,
                fdate: dateFormatter.format(el.changed),
                url: "/posts/" + el.title + ".md"
            }
        })

        const output = pug.renderFile(path.join(templatesDir, "main.pug"), {
            posts: processedPosts,
            nextPageLink: nextPageLink,
            prevPageLink: prevPageLink
        })
        
        res.set("Content-Type", "text/html")
        res.send(output)
    })

    // Catch-all route handler
    app.get('/*', (req, res) => {
        res.status(404).send("Page not found")
    })

    app.listen(port, () => {
        console.log(`🚀 Blognifier server running at http://localhost:${port}`)
        console.log(`📁 Serving posts from: ${postsDir}`)
        console.log(`💾 Database cache: ${path.join(cacheDir, 'blog.sqlite')}`)
        console.log()
        console.log(`Press Ctrl+C to stop the server`)
    })
}
