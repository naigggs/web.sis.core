# SIS Core

Student Information System — REST API built with **Bun**, **Hono**, **Drizzle ORM**, and **PostgreSQL**.

## Tech Stack

| Layer      | Technology            |
| ---------- | --------------------- |
| Runtime    | Bun                   |
| Framework  | Hono                  |
| Language   | TypeScript            |
| ORM        | Drizzle ORM           |
| Database   | PostgreSQL            |
| Validation | Zod                   |
| Auth       | JWT (HS256) + Cookies |

## Documentation

| Topic                 | Link                                                   |
| --------------------- | ------------------------------------------------------ |
| Setup & environment   | [.docs/setup.md](.docs/setup.md)                       |
| Database & migrations | [.docs/database.md](.docs/database.md)                 |
| API reference (index) | [.docs/api.md](.docs/api.md)                           |
| Business rules        | [.docs/business-rules.md](.docs/business-rules.md)     |
| Auth API              | [.docs/api/auth.md](.docs/api/auth.md)                 |
| Users API             | [.docs/api/users.md](.docs/api/users.md)               |
| Courses API           | [.docs/api/courses.md](.docs/api/courses.md)           |
| Students API          | [.docs/api/students.md](.docs/api/students.md)         |
| Subjects API          | [.docs/api/subjects.md](.docs/api/subjects.md)         |
| Grades API            | [.docs/api/grades.md](.docs/api/grades.md)             |
| Reservations API      | [.docs/api/reservations.md](.docs/api/reservations.md) |

## Quick Start

```sh
# 1. Install dependencies
bun install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Run migrations
bun run db:migrate

# 4. Seed the database (creates admin, courses, subjects, students)
bun run db:seed

# 5. Start the dev server
bun run dev
```

Server runs at `http://localhost:<PORT>` (default `8080`).

## Default Credentials

| Role    | Email             | Password                          |
| ------- | ----------------- | --------------------------------- |
| Admin   | `admin@sis.edu`   | `Admin@1234`                      |
| Student | `<student email>` | `<birthDate>` (e.g. `2000-01-01`) |

See [.docs/database.md](.docs/database.md) for full seed details.

## Project Structure

```
src/
├── app.ts                 # Hono app definition, global middleware
├── index.ts               # Server entry point
├── config/                # Env, CORS, database config
├── db/
│   ├── enums/             # PostgreSQL enum definitions
│   ├── migrations/        # Generated SQL migrations
│   ├── schema/            # Drizzle table definitions + relations
│   └── seeds/             # Seed scripts
├── domain/                # Feature modules (DDD)
│   ├── auth/              # Authentication (login, logout, refresh, me)
│   ├── user/              # User management (CRUD)
│   ├── course/            # Course management
│   ├── student/           # Student management + CSV import/export
│   ├── subject/           # Subject management + prerequisites
│   ├── grade/             # Grade encoding (prelim/midterm/finals)
│   └── reservation/       # Subject reservation system
├── routes/v1/             # API v1 route aggregation
├── shared/
│   ├── middlewares/        # Auth + role-based access control
│   └── utils/             # Response envelope, status codes
├── cli/                   # CLI tools (admin creation, JWT secret gen)
└── scripts/               # DB reset script
```

## Architecture

Each domain follows the **5-layer pattern**:

```
Route → Controller → Service → Repository → Database
```

- **Route** — HTTP path + middleware binding
- **Controller** — Parse input (Zod), call service, format response
- **Service** — Business logic, validation rules
- **Repository** — Drizzle ORM queries
- **Schema/DTO** — Zod schemas for validation + TypeScript types

## Available Scripts

| Script                             | Description                              |
| ---------------------------------- | ---------------------------------------- |
| `bun run dev`                      | Start dev server (watch mode)            |
| `bun run build`                    | Build to `dist/`                         |
| `bun run start`                    | Run production build                     |
| `bun run db:generate`              | Generate Drizzle migrations              |
| `bun run db:migrate`               | Apply migrations                         |
| `bun run db:push`                  | Push schema directly (no migration file) |
| `bun run db:studio`                | Open Drizzle Studio                      |
| `bun run db:reset`                 | Drop all tables + clear migration files  |
| `bun run db:seed`                  | Full system seed                         |
| `bun run db:seed:students`         | Seed students only                       |
| `bun run cli:create-admin`         | Interactive admin user creation          |
| `bun run cli:generate-jwt-secrets` | Generate JWT secret keys                 |
