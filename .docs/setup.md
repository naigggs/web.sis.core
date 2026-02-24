# Setup Instructions

## Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- PostgreSQL 14 or higher

## Installation

```sh
bun install
```

## Environment Variables

Create a `.env` file in the project root. All variables are required unless marked optional.

```env
# ─── Application ──────────────────────────────────────────────────────────────
PORT=3000
ENVIRONMENT=development        # development | production | test
VERSION=1.0.0

# ─── Database ─────────────────────────────────────────────────────────────────
DB_NAME=sis_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres

# ─── JWT ──────────────────────────────────────────────────────────────────────
# Generate with: bun run cli:generate-jwt-secrets
JWT_ACCESS_SECRET_KEY=your_access_secret_here
JWT_REFRESH_SECRET_KEY=your_refresh_secret_here
JWT_ACCESS_TOKEN_LIFETIME=900        # seconds (15 minutes)
JWT_REFRESH_TOKEN_LIFETIME=604800    # seconds (7 days)

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,x-request-id
CORS_EXPOSE_HEADERS=
CORS_ALLOW_CREDENTIALS=true
```

### Generating JWT Secrets

```sh
bun run cli:generate-jwt-secrets
```

Copy the printed secrets into your `.env` file.

## Running the Server

```sh
# Development (watch mode)
bun run dev

# Production build
bun run build
```

Server starts at `http://localhost:3000`.
