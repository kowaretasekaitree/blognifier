# Blognifier 🚀

Zero-config markdown blog server with full-text search. Serve any directory of `.md` files as a beautiful blog with search capabilities.

## Quick Start

```bash
# Serve current directory
npx blognifier

# Serve a specific directory
npx blognifier ./my-posts

# Custom port
npx blognifier ./my-posts --port 8080

# Custom templates and CSS
npx blognifier ./my-posts --templates ./my-templates --css ./my-styles
```

## Features

- **Zero Configuration**: Works out of the box with any directory containing `.md` files
- **Full-Text Search**: Powered by SQLite FTS5 with BM25 ranking and result highlighting
- **Fast Performance**: Sub-200ms page loads, sub-100ms search responses
- **Auto-Refresh**: Automatically detects changes to markdown files
- **Multiple Themes**: Includes several beautiful CSS themes
- **Responsive Design**: Works great on desktop and mobile
- **Static Assets**: Serves images and other files from your posts directory

## Installation

### Global Installation
```bash
npm install -g blognifier
blognifier ./my-posts
```

### One-time Usage (Recommended)
```bash
npx blognifier ./my-posts
```

## Usage

### Basic Usage
```bash
# Serve current directory on port 3000
blognifier

# Serve specific directory
blognifier ./posts

# Custom port
blognifier ./posts --port 8080
```

### Advanced Options
```bash
blognifier [posts-dir] [options]

Arguments:
  posts-dir                 Directory containing markdown posts (default: ".")

Options:
  -p, --port <port>         Port to serve on (default: "3000")
  -t, --templates <dir>     Custom templates directory
  -c, --css <dir>          Custom CSS directory
  --cache-dir <dir>        Custom cache directory (overrides default)
  -h, --help               Display help for command
```

## File Organization

### Posts Directory
Your posts directory should contain `.md` files:
```
my-blog/
├── Hello World.md
├── My Second Post.md
├── image.png
└── another-image.jpg
```

### URLs
- Homepage: `http://localhost:3000/`
- Individual posts: `http://localhost:3000/posts/Hello-World.md`
- Search: `http://localhost:3000/search?q=your+query`
- Static files: `http://localhost:3000/posts/image.png`

## Customization

### Custom Templates
Create your own Pug templates by copying and modifying the default templates:

```bash
# Copy default templates
cp -r node_modules/blognifier/templates ./my-templates

# Use custom templates
blognifier ./posts --templates ./my-templates
```

Template files:
- `main.pug` - Homepage layout
- `post.pug` - Individual post layout
- `search.pug` - Search results layout
- `searchbar.pug` - Search bar component
- `style.pug` - CSS inclusion helper

### Custom CSS
Use your own CSS by copying and modifying the default styles:

```bash
# Copy default CSS
cp -r node_modules/blognifier/css ./my-styles

# Use custom CSS
blognifier ./posts --css ./my-styles
```

Available default themes:
- `style.css` - Clean, modern default
- `mvp.css` - MVP.css framework
- `sakura.css` - Sakura theme
- `simple.css` - Simple.css framework
- `tacit-css-1.9.1.min.css` - Tacit CSS
- `water.css` - Water.css theme

## Database & Caching

Blognifier automatically creates a SQLite database to index your posts for fast search. The database is stored in:

```
$HOME/.cache/blognifier/[posts-directory-hash]/blog.sqlite
```

This ensures:
- Each posts directory gets its own database
- No conflicts between different blog directories
- Easy cleanup (just delete the cache directory)
- Fast startup (database persists between runs)

## Search Features

- **Full-text search** across all markdown content
- **BM25 ranking** for relevant results
- **Result highlighting** with search term emphasis
- **Pagination** for large result sets
- **Real-time indexing** when files change

## Performance

- **Fast startup**: Only scans files when directory changes
- **Efficient search**: SQLite FTS5 with optimized queries
- **Low memory**: Minimal footprint, suitable for development and production
- **Auto-refresh**: Detects file changes without restart

## Development

### Local Development
```bash
git clone <repository>
cd blognifier
npm install
npm run dev
```

### Testing
```bash
# Test CLI help
npm test

# Test with sample posts
npm start ./posts
```

## Requirements

- Node.js 18+
- SQLite3 (included with Node.js)

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
