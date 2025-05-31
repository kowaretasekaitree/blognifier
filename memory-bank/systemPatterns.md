# System Patterns: JustDoIt Blog Architecture

## Overall Architecture

### Request Flow Pattern
```
HTTP Request → Route Handler → Database Query → Template Render → HTTP Response
```

### Core Components
1. **HTTP Server**: Request routing and response handling
2. **Database Layer**: SQLite with FTS5 for content and search
3. **File System Monitor**: Directory change detection
4. **Template Engine**: Pug-based HTML generation
5. **Content Processor**: Markdown to HTML conversion

## Key Design Patterns

### Database Access Pattern
- **Single Database Instance**: Global `db` object shared across requests
- **Prepared Statements**: All queries use parameterized statements
- **WAL Mode**: Write-Ahead Logging for better concurrency
- **Schema Initialization**: Idempotent schema setup on startup

### File System Monitoring Pattern
- **Lazy Scanning**: Only rescan when directory mtime changes
- **Incremental Updates**: Only process changed files
- **Cleanup Strategy**: Remove deleted files from database
- **Atomic Operations**: Complete scan or no changes

### Route Handling Pattern
```javascript
routes: {
  "/posts/*": postHandler,
  "/search": searchHandler,
  "/css/*": staticHandler,
  "/": homeHandler,
  "/*": catchAllHandler
}
```

### Content Processing Pipeline
1. **File Detection**: Monitor `/posts` directory mtime
2. **Change Detection**: Compare file mtime with database records
3. **Content Extraction**: Read and parse markdown files
4. **Index Update**: Update FTS5 search index
5. **Metadata Storage**: Store file metadata in posts table

## Critical Implementation Paths

### Search Implementation
- **FTS5 Virtual Table**: `searchable` table with title and text columns
- **BM25 Ranking**: Built-in relevance scoring
- **Highlight Function**: `highlight(searchable, 1, '', '')` for snippets
- **Pagination**: LIMIT/OFFSET with lookahead for next page detection

### Template Rendering Strategy
- **File-based Templates**: Pug files in `/templates` directory
- **Shared Components**: `style.pug` and `searchbar.pug` includes
- **Data Binding**: Pass structured data objects to templates
- **Content-Type Headers**: Explicit HTML content type setting

### Static Asset Serving
- **Direct File Serving**: Use Bun.file() for CSS and images
- **Path Mapping**: URL path directly maps to file system path
- **No Caching Headers**: Rely on browser caching defaults

## Database Schema Design

### Posts Table
```sql
posts (
    title text primary key,    -- Post filename without .md
    changed integer,           -- File modification time
    scanned integer           -- Last scan timestamp
)
```

### Search Index
```sql
searchable using fts5(title, text)  -- Full-text search virtual table
```

### Metadata Table
```sql
mtime (
    id integer primary key,    -- Always 1
    mtime integer             -- Directory modification time
)
```

## Component Relationships

### Database Dependencies
- `posts` table tracks file metadata
- `searchable` FTS5 table enables search
- `mtime` table triggers rescanning

### Template Dependencies
- `main.pug` includes `style.pug` and `searchbar.pug`
- `post.pug` includes `style.pug`
- `search.pug` includes `style.pug` and `searchbar.pug`

### File System Dependencies
- `/posts/*.md` files are content source
- `/css/*` files are static assets
- `/templates/*.pug` files are view templates

## Performance Optimizations

### Database Optimizations
- WAL mode for better read concurrency
- Prepared statements for query efficiency
- FTS5 BM25 ranking for relevant results
- Minimal database writes (only on changes)

### File System Optimizations
- Directory-level change detection
- Incremental file processing
- Efficient cleanup of deleted files
- Single-pass directory scanning

### Memory Management
- Single database connection
- Reused prepared statements
- Minimal object allocation in hot paths
- Efficient string operations for URL parsing
