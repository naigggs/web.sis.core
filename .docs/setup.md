# Setup & Environment

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- PostgreSQL (v15+)

## Installation

```sh
git clone <repo-url> && cd sis-core
bun install
```

## Environment Variables

Create a `.env` file in the project root. All variables are validated at startup using Zod — the server will crash with a clear error if any are missing or invalid.

### Application

| Variable      | Type   | Example       | Description                              |
| ------------- | ------ | ------------- | ---------------------------------------- |
| `PORT`        | number | `8080`        | Port the server listens on               |
| `ENVIRONMENT` | enum   | `development` | `development`, `production`, or `test`   |
| `VERSION`     | string | `1.0.0`       | Included in every API response metadata  |

### Database

| Variable  | Type   | Example     | Description                 |
| --------- | ------ | ----------- | --------------------------- |
| `DB_NAME` | string | `sis_db`    | PostgreSQL database name    |
| `DB_HOST` | string | `localhost` | Database host               |
| `DB_PORT` | number | `5432`      | Database port               |
| `DB_USER` | string | `postgres`  | Database username           |
| `DB_PASS` | string | `password`  | Database password           |

> In production (`ENVIRONMENT=production`), SSL is automatically required for the DB connection.

### JWT

| Variable                     | Type   | Example                   | Description                         |
| ---------------------------- | ------ | ------------------------- | ----------------------------------- |
| `JWT_ACCESS_SECRET_KEY`      | string | *(generated 512-bit hex)* | Secret for signing access tokens    |
| `JWT_REFRESH_SECRET_KEY`     | string | *(generated 512-bit hex)* | Secret for signing refresh tokens   |
| `JWT_ACCESS_TOKEN_LIFETIME`  | number | `900`                     | Access token TTL in **seconds**     |
| `JWT_REFRESH_TOKEN_LIFETIME` | number | `604800`                  | Refresh token TTL in **seconds**    |

Generate secrets with:

```sh
bun run cli:generate-jwt-secrets
```

### CORS

| Variable                 | Type   | Example                                         | Description                  |
| ------------------------ | ------ | ----------------------------------------------- | ---------------------------- |
| `CORS_ALLOWED_ORIGINS`   | string | `http://localhost:3000,https://app.example.com`  | Comma-separated origins      |
| `CORS_ALLOWED_METHODS`   | string | `GET,POST,PATCH,DELETE,OPTIONS`                  | Comma-separated methods      |
| `CORS_ALLOWED_HEADERS`   | string | `Content-Type,Authorization`                     | Comma-separated headers      |
| `CORS_EXPOSE_HEADERS`    | string | *(empty)*                                        | Headers exposed to browser   |
| `CORS_ALLOW_CREDENTIALS` | string | `true`                                           | `true` or `false`            |

## Example `.env`

```env
PORT=8080
ENVIRONMENT=development
VERSION=1.0.0

DB_NAME=sis_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password

JWT_ACCESS_SECRET_KEY=<generated>
JWT_REFRESH_SECRET_KEY=<generated>
JWT_ACCESS_TOKEN_LIFETIME=900
JWT_REFRESH_TOKEN_LIFETIME=604800

CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_ALLOWED_METHODS=GET,POST,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization
CORS_EXPOSE_HEADERS=
CORS_ALLOW_CREDENTIALS=true
```

## Running the Server

```sh
# Development (watch mode)
bun run dev

# Production build
bun run build
bun run start
```

## Deployment (Railway)

The project includes a `start` script (`bun run dist/index.js`) that Railway detects automatically.

1. Push to your connected GitHub repository.
2. Railway runs `bun run build`, then `bun run start`.
3. Set all environment variables in the Railway dashboard.
4. Ensure `ENVIRONMENT=production` and `CORS_ALLOWED_ORIGINS` includes your frontend domain.

## CLI Tools

### Create Admin User

Interactive CLI that prompts for email and password:

```sh
bun run cli:create-admin
```

### Generate JWT Secrets

Outputs two 512-bit hex secrets for your `.env`:

```sh
bun run cli:generate-jwt-secrets
```
