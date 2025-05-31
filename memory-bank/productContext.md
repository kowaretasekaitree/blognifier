# Product Context: JustDoIt Blog Platform

## Purpose & Vision
A lightweight, file-based blog platform that automatically indexes markdown posts and provides fast full-text search capabilities. Designed for developers who want a simple yet powerful blogging solution without complex CMS overhead.

## Problems It Solves

### Content Management Simplicity
- **Problem**: Traditional CMSs are complex and database-heavy
- **Solution**: File-based approach using markdown files in a directory
- **Benefit**: Easy content creation, version control friendly, portable

### Search Performance
- **Problem**: Basic text search is slow and lacks relevance ranking
- **Solution**: SQLite FTS5 with BM25 ranking and snippet highlighting
- **Benefit**: Fast, relevant search results with context previews

### Content Freshness
- **Problem**: Manual cache invalidation and content updates
- **Solution**: Automatic directory monitoring and incremental updates
- **Benefit**: Always up-to-date content without manual intervention

## How It Works

### Content Flow
1. **Creation**: Write markdown files in `/posts` directory
2. **Detection**: File system monitoring detects changes
3. **Processing**: Markdown parsed and indexed in SQLite FTS5
4. **Serving**: Dynamic HTML generation via Pug templates

### User Experience

#### Blog Reading
- Clean, paginated post listing on homepage
- Individual post pages with rendered markdown
- Responsive design with multiple CSS theme options
- Fast navigation with proper pagination controls

#### Search Experience
- Prominent search bar on all pages
- Real-time full-text search across all posts
- Highlighted search terms in results
- Paginated search results with relevance ranking
- Empty state handling for no results

#### Performance Characteristics
- Sub-second page loads
- Instant search results
- Minimal server resources
- Efficient caching through SQLite WAL mode

## Target Users
- **Developers**: Want simple, hackable blogging platform
- **Writers**: Need fast, distraction-free publishing
- **Technical Bloggers**: Require code syntax highlighting and markdown support

## Key Differentiators
1. **Zero Configuration**: Works out of the box
2. **File-Based**: No complex database setup
3. **Fast Search**: Enterprise-grade FTS5 search
4. **Auto-Sync**: Automatic content detection
5. **Lightweight**: Minimal dependencies and resource usage

## Success Metrics
- Page load times under 200ms
- Search response times under 100ms
- Zero manual content management overhead
- 100% uptime with minimal server resources
