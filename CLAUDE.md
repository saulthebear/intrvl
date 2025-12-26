# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Intrvl** is a full-stack interval timer web application built with Node.js, Express, PostgreSQL, and EJS templating. Users can create custom timers with named sections, make timers public/private, manage favorites, and use Text-to-Speech announcements.

## Development Commands

### Running the Application

```bash
# Development mode (with nodemon and browser-sync)
npm run start:dev

# Production mode
npm run start:prod

# Watch Tailwind CSS compilation
npm run tailwind:watch
```

Development mode runs nodemon on port 3333 with browser-sync on 3334 for live reload.

### Database Management

```bash
# Reset database (drop, create, migrate)
npm run db:reset

# Create test database
npm run db:create:test

# Run migrations manually
sequelize db:migrate

# Create migration
sequelize migration:generate --name migration-name

# Create model
sequelize model:generate --name ModelName --attributes field:type
```

The database configuration is in `config/config.js` and uses different databases for development (`intrvl_dev`), test (`intrvl_test`), and production (configured via environment variables).

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests use Mocha and Chai, located in the `test/` directory. The `pretest` script automatically resets the test database before each run.

### Docker Deployment

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

The Docker setup uses a multi-stage build and is configured for deployment behind Traefik reverse proxy with subdirectory support via `BASE_PATH`.

## Architecture

### MVC Structure

- **Models** (`models/`): Sequelize ORM models
  - `User.js` - Password hashing with bcrypt, encrypted ID cookies with crypto-js
  - `Timer.js` - Main timer entity with sections, tags, and favorites
  - `TimerSection.js` - Individual timer segments
  - `Tag.js` - Categorization system
  - `Favorite.js` - Join table for user favorites
  - `TimerTag.js` - Join table for timer-tag associations

- **Views** (`views/`): EJS templates with `express-ejs-layouts`
  - Uses `layout.ejs` as default layout
  - Organized into subdirectories: `auth/`, `timers/`, `users/`, `tags/`, `sections/`, `partials/`

- **Controllers** (`controllers/`): Express routers
  - `auth.js` - Login/logout
  - `users.js` - User CRUD operations
  - `timers.js` - Timer CRUD, timer execution
  - `tags.js` - Tag CRUD
  - `favorites.js` - Adding/removing favorites

### Middleware Chain

Middleware is applied in this order (see `server.js`):

1. `rowdy-logger` - Route debugging
2. `express-session` - Session management for flash messages
3. `connect-flash` - Flash messages
4. `express-ejs-layouts` - Layout system
5. `express.urlencoded()` - Body parsing
6. `cookie-parser` - Cookie parsing
7. `method-override` - HTTP method override for PUT/DELETE
8. `morgan` - HTTP request logging
9. `express.static("public")` - Static file serving
10. **Custom middleware:**
    - `basePathMiddleware` - Handles subdirectory deployment by prepending `BASE_PATH` to redirects
    - `setMessages` - Flash messages available in views
    - `setUser` - Sets `res.locals.user` from encrypted cookie
    - `setViewHelpers` - Helper functions for views

### Authentication System

Authentication uses **encrypted cookie-based sessions**, not traditional sessions:

1. User logs in with username/password
2. Password verified against bcrypt hash
3. User ID encrypted with `crypto-js.AES` using `ENC_KEY`
4. Encrypted ID stored in cookie
5. `setUser` middleware decrypts cookie and loads user on each request
6. `requireLogin` helper restricts routes to authenticated users

**Key files:**
- `helpers/authMiddleware.js` - `setUser` and `requireLogin` middleware
- `helpers/login.js` - Login logic
- `models/User.js` - Password hashing and ID encryption methods

### Database Relationships

```
User
  ├─ hasMany Timer
  ├─ hasMany Tag
  └─ hasMany Favorite (through Timer)

Timer
  ├─ belongsTo User
  ├─ hasMany TimerSection
  ├─ hasMany Favorite
  └─ belongsToMany Tag (through TimerTag)

Tag
  ├─ belongsTo User
  └─ belongsToMany Timer (through TimerTag)
```

All associations use `{ onDelete: "CASCADE", hooks: true }` to cascade deletes.

### Frontend Architecture

- **Static Assets:** `public/` directory
  - `public/src/js/` - Client-side JavaScript modules
    - `Engine.js` - Fixed time-step engine for timer execution (from previous project)
    - `timer.js` - Timer component and UI interactions
    - `messages.js` - Flash message display
    - `editUser.js` - User profile editing
  - `public/src/input.css` - Tailwind source
  - `public/dist/output.css` - Compiled Tailwind (built by npm script or Dockerfile)

- **Styling:** TailwindCSS + Flowbite component library
- **Text-to-Speech:** Web Speech API (`SpeechSynthesis`) with optional Google Cloud TTS fallback

### Subdirectory Deployment

The app supports deployment under a subdirectory (e.g., `/intrvl`) via:

1. **`BASE_PATH` environment variable** - Set to subdirectory path (e.g., `/intrvl`)
2. **`basePathMiddleware`** - Automatically prepends `BASE_PATH` to all `res.redirect()` calls
3. **`res.locals.basePath`** - Available in EJS templates for URL generation
4. **Traefik configuration** - `docker-compose.yml` includes stripprefix middleware
5. **Base tag in layout** - `views/layout.ejs` includes `<base>` tag for relative paths

When deployed at root, leave `BASE_PATH` empty or unset.

## Environment Configuration

Required environment variables (see `.env.example`):

- `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database credentials (individual vars, no URL encoding needed)
- `DB_HOST`, `DB_PORT` - Database connection (defaults: `postgres`, `5432` in Docker)
- `ENC_KEY` - Session encryption key (generate with `openssl rand -base64 48`)
- `NODE_ENV` - `development`, `test`, or `production`
- `PORT` - Server port (default: 3333)
- `BASE_PATH` - Subdirectory path for deployment (optional, e.g., `/intrvl`)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud service account JSON (optional, for TTS)

## Logging

Winston logger configured in `helpers/logger.js`:

- **Development:** All levels to console, errors to `logs/error.log`
- **Production:** Info and above to `logs/combined.log`, errors to `logs/error.log`
- **Test:** Silent (no output)

Chalk is used for colored console output in development.

## Common Patterns

### Creating Protected Routes

```javascript
const { requireLogin } = require("../helpers/authMiddleware")

router.get("/protected", requireLogin, (req, res) => {
  // res.locals.user is guaranteed to exist here
})
```

### Flash Messages

```javascript
req.flash("success", "Timer created!")
req.flash("error", "Invalid credentials")
res.redirect("/timers")
```

Messages are automatically displayed via `partials/messages.ejs` included in layout.

### Database Queries with Includes

```javascript
const timer = await db.Timer.findByPk(timerId, {
  include: [
    { model: db.TimerSection, order: [["order", "ASC"]] },
    { model: db.Tag },
    { model: db.User }
  ]
})
```

## Testing Notes

- Test environment uses `intrvl_test` database
- `pretest` script automatically resets database
- Tests use Mocha, Chai, Supertest, and Faker
- Currently limited model tests (originally planned TDD, but integration testing complexity delayed full coverage)
- Helper: `test/clearDb.js` to clear all tables

## Known Deployment Configurations

- Originally deployed to Heroku
- Current setup targets VPS deployment with Docker and Traefik reverse proxy
- Configured for subdirectory deployment at `projects.stefanvosloo.com/intrvl`
