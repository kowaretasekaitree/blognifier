#!/usr/bin/env node

import { program } from 'commander'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import os from 'node:os'
import { startServer } from '../lib/server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageRoot = path.resolve(__dirname, '..')

// Generate cache directory path based on current working directory
function getCacheDir(postsDir) {
    const absolutePostsDir = path.resolve(postsDir)
    const hash = createHash('md5').update(absolutePostsDir).digest('hex').substring(0, 8)
    const safePath = absolutePostsDir.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
    return path.join(os.homedir(), '.cache', 'blognifier', `${safePath}_${hash}`)
}

// Ensure cache directory exists
function ensureCacheDir(cacheDir) {
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true })
    }
}

// Copy default assets if custom paths not provided
function setupAssets(options) {
    const assets = {
        templatesDir: options.templates || path.join(packageRoot, 'templates'),
        cssDir: options.css || path.join(packageRoot, 'css')
    }

    // Ensure default assets exist if using package defaults
    if (!options.templates && !fs.existsSync(assets.templatesDir)) {
        throw new Error('Default templates directory not found')
    }
    if (!options.css && !fs.existsSync(assets.cssDir)) {
        throw new Error('Default CSS directory not found')
    }

    return assets
}

program
    .name('blognifier')
    .description('Serve a directory of markdown posts as a blog with full-text search')
    .version('1.0.0')
    .argument('[posts-dir]', 'Directory containing markdown posts', '.')
    .option('-p, --port <port>', 'Port to serve on', '9000')
    .option('-t, --templates <dir>', 'Custom templates directory')
    .option('-c, --css <dir>', 'Custom CSS directory')
    .option('--cache-dir <dir>', 'Custom cache directory (overrides default)')
    .action(async (postsDir, options) => {
        try {
            // Resolve posts directory
            const absolutePostsDir = path.resolve(postsDir)
            
            if (!fs.existsSync(absolutePostsDir)) {
                console.error(`Error: Posts directory "${absolutePostsDir}" does not exist`)
                process.exit(1)
            }

            // Setup cache directory
            const cacheDir = options.cacheDir || getCacheDir(absolutePostsDir)
            ensureCacheDir(cacheDir)

            // Setup assets
            const assets = setupAssets(options)

            // Server configuration
            const config = {
                postsDir: absolutePostsDir,
                cacheDir,
                templatesDir: assets.templatesDir,
                cssDir: assets.cssDir,
                port: parseInt(options.port)
            }

            console.log(`Starting blognifier server...`)
            console.log(`Posts directory: ${config.postsDir}`)
            console.log(`Cache directory: ${config.cacheDir}`)
            console.log(`Templates: ${config.templatesDir}`)
            console.log(`CSS: ${config.cssDir}`)
            console.log(`Port: ${config.port}`)
            console.log()

            await startServer(config)
        } catch (error) {
            console.error('Error:', error.message)
            process.exit(1)
        }
    })

program.parse()
