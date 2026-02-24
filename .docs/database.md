# Database

## Migrations

Migration files are located in `src/db/migrations/`.

```sh
# Generate a new migration after schema changes
bun run db:generate

# Apply all pending migrations
bun run db:migrate

# Push schema directly (skips migration files — dev only)
bun run db:push

# Open Drizzle Studio (GUI)
bun run db:studio
```

## Seed Data

The full system seed populates the database with all required data in one run.

```sh
bun run db:seed
```

### What gets seeded

| Entity             | Count   | Details                                                |
| ------------------ | ------- | ------------------------------------------------------ |
| Admin user         | 1       | See credentials below                                  |
| Courses            | 5       | BSCS, BSIT, BSECE, BSME, BSBA                          |
| Subjects           | 15      | 3 per course                                           |
| Prerequisite links | 7       | Across all courses                                     |
| Students           | 50      | Distributed across courses                             |
| Grade records      | ~varies | Passing grades for first 20 students on intro subjects |
| Reservations       | ~varies | 2 subjects per student for first 15 students           |

The seed is **idempotent** — safe to run multiple times.

## Admin Credentials

```
Email:    admin@sis.edu
Password: Admin@1234
```

## Creating Additional Admin Users

```sh
bun run cli:create-admin
```

Follow the interactive prompts.

## Resetting the Database

```sh
bun run db:reset
```

> ⚠️ This drops all data. Development only.
