# sis-core

Mini School Information System — REST API built with Bun, Hono, Drizzle ORM, and PostgreSQL.

## Documentation

| Topic                                                 | Link                                               |
| ----------------------------------------------------- | -------------------------------------------------- |
| Setup & environment variables                         | [.docs/setup.md](.docs/setup.md)                   |
| Database, migrations & seed data                      | [.docs/database.md](.docs/database.md)             |
| API reference                                         | [.docs/api.md](.docs/api.md)                       |
| Business rules (grading, prerequisites, reservations) | [.docs/business-rules.md](.docs/business-rules.md) |

## Quick Start

```sh
# 1. Install dependencies
bun install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Run migrations
bun run db:migrate

# 4. Seed the database
bun run db:seed

# 5. Start the dev server
bun run dev
```

Server runs at `http://localhost:3000`.

## Admin Credentials

```
Email:    admin@sis.edu
Password: Admin@1234
```

See [.docs/database.md](.docs/database.md) for full seed details.
