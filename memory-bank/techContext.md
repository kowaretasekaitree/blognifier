# Technical Context: JustDoIt Blog Platform

## Current Technology Stack

### Runtime Environment
- **Platform**: Node.js (v18+)
- **HTTP Framework**: Express.js
- **Module System**: ES Modules

### Core Dependencies
- **express**: HTTP server and routing framework
- **sqlite3**: SQLite database driver with async/await support
- **markdown-it**: Markdown to HTML conversion
- **pug**: Template engine for HTML generation
- **Node.js built-ins**: fs, path modules

### Database Technology
- **Engine**: SQLite 3 with WAL mode
- **Features**: FTS5 virtual tables, BM25 ranking
- **Schema**: Posts metadata + full-text search index
- **Driver**: sqlite3 with promisified wrapper functions

## Development Environment

### File Structure
```
/
├── main.js              # Main application
├── package.json         # Node.js dependencies
├── README.md           # Documentation
├── db.sqlite           # SQLite database
├── posts/              # Markdown content files
├── css/                # Static stylesheets
├── templates/          # Pug template files
└── memory-bank/        # Project documentation
```

### Key Files
- **main.js**: Primary application logic with Express.js server
- **templates/*.pug**: View templates (no changes needed for functionality)
- **posts/*.md**: Content files (automatically indexed)
- **css/***: Static assets served via Express

## Technical Implementation

### Database Layer
- **Connection**: Single SQLite connection with promisified operations
- **Schema**: Identical to original with posts, searchable (FTS5), and mtime tables
- **Operations**: Prepared statements for all queries
- **Performance**: WAL mode for better concurrency

### HTTP Server
- **Framework**: Express.js with route handlers
- **Routes**: 
  - `GET /` - Homepage with pagination
  - `GET /posts/*` - Individual posts and static assets
  - `GET /search` - Search functionality
  - `GET /css/*` - CSS file serving
  - `GET /*` - Catch-all handler

### File Operations
- **Static Serving**: Express.js sendFile for CSS and images
- **Content Reading**: Node.js fs.readFileSync for markdown files
- **Directory Monitoring**: fs.statSync for change detection

## Performance Considerations

### Database Performance
- Prepared statements for query efficiency
- WAL mode for better read concurrency
- FTS5 BM25 ranking for relevant search results
- Minimal database writes (only on content changes)

### HTTP Performance
- Express.js efficient routing
- Static asset serving with proper headers
- Minimal middleware overhead
- Efficient template rendering

### File System Performance
- Lazy directory scanning (only when mtime changes)
- Incremental file processing
- Efficient cleanup of deleted files
- Single-pass directory operations

## Dependencies Management

### Production Dependencies
```json
{
  "express": "^4.18.2",
  "sqlite3": "^5.1.6", 
  "markdown-it": "^14.0.0",
  "pug": "^3.0.2"
}
```

### Development Scripts
- `npm start`: Run production server
- `npm run dev`: Run with auto-restart on changes

## Deployment Considerations

### Runtime Requirements
- Node.js 18+ (ES modules support)
- SQLite3 system library
- File system write permissions
- Network port 3000 availability

### Configuration
- Port configurable via environment variables
- Database path configurable
- Static asset caching headers
- Template compilation caching

### Monitoring
- Console logging for search queries
- File system change detection logs
- Database operation error handling
- HTTP request/response logging available
