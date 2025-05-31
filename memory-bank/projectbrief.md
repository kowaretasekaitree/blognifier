# Project Brief: JustDoIt Node.js Blog Platform

## Core Objective
Maintain and enhance a lightweight, file-based blog platform with full-text search capabilities running on Node.js.

## Current State
- **Runtime**: Pure Node.js with Express.js
- **Architecture**: File-based blog with SQLite database and full-text search
- **Status**: Fully functional and production-ready

## Key Requirements

### Functional Requirements
1. **Blog Platform**: Display markdown posts with pagination
2. **Full-Text Search**: FTS5-powered search with highlighting and pagination
3. **File Monitoring**: Automatic rescanning when posts directory changes
4. **Static Assets**: Serve CSS files and post images
5. **Template Rendering**: Pug-based HTML generation

### Technical Requirements
1. **Database**: SQLite with WAL mode and FTS5 virtual tables
2. **Markdown Processing**: Convert .md files to HTML
3. **URL Routing**: Handle multiple route patterns with Express.js
4. **File System**: Monitor directory changes for auto-refresh
5. **HTTP Server**: Express.js-based server on port 3000

### Performance Requirements
- Maintain sub-200ms page loads
- Sub-100ms search response times
- Efficient file system monitoring
- Optimized database queries with proper indexing
- Minimal memory footprint

## Success Criteria
1. All routes work correctly and efficiently
2. Search functionality provides relevant results with highlighting
3. File monitoring triggers proper rescans automatically
4. Template rendering produces clean, responsive HTML
5. Database operations maintain high performance
6. System remains stable under normal usage loads

## Constraints
- Use pure Node.js with minimal dependencies
- Preserve existing file structure and templates
- Maintain SQLite database schema and performance
- Keep existing CSS and template files functional
- Ensure cross-platform compatibility
