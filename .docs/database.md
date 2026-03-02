# Database

## Overview

SIS Core uses **PostgreSQL** as its database, managed through **Drizzle ORM** for type-safe queries and migrations.

## Tables

### `users`

| Column        | Type      | Constraints                 | Description                          |
| ------------- | --------- | --------------------------- | ------------------------------------ |
| `id`          | text      | PK, UUIDv7                  | Primary key                          |
| `email`       | text      | UNIQUE                      | Login email (nullable for students)  |
| `password`    | text      |                             | Bcrypt-hashed password               |
| `role`        | enum      | NOT NULL, default `student` | `student`, `staff`, `admin`          |
| `student_id`  | text      | FK -> students.id           | Links user to student profile        |
| `isActive`    | boolean   | default `true`              | Soft-delete flag                     |
| `isBlocked`   | boolean   | default `false`             | Block flag                           |
| `isSuspended` | boolean   | default `false`             | Suspension flag                      |
| `createdAt`   | timestamp | NOT NULL                    | Created timestamp                    |
| `updatedAt`   | timestamp | NOT NULL                    | Last updated timestamp               |

### `courses`

| Column        | Type      | Constraints      | Description               |
| ------------- | --------- | ---------------- | ------------------------- |
| `id`          | text      | PK, UUIDv7       | Primary key               |
| `code`        | text      | UNIQUE, NOT NULL | Course code (e.g. "BSCS") |
| `name`        | text      | NOT NULL         | Full course name          |
| `description` | text      |                  | Optional description      |
| `created_at`  | timestamp | NOT NULL         | Created timestamp         |
| `updated_at`  | timestamp | NOT NULL         | Last updated              |

### `students`

| Column       | Type      | Constraints                | Description        |
| ------------ | --------- | -------------------------- | ------------------ |
| `id`         | text      | PK, UUIDv7                 | Primary key        |
| `student_no` | text      | UNIQUE, NOT NULL           | Student number     |
| `first_name` | text      | NOT NULL                   | First name         |
| `last_name`  | text      | NOT NULL                   | Last name          |
| `email`      | text      | UNIQUE                     | Student email      |
| `birth_date` | date      |                            | Birth date         |
| `course_id`  | text      | FK -> courses.id, NOT NULL | Enrolled course    |
| `created_at` | timestamp | NOT NULL                   | Created timestamp  |
| `updated_at` | timestamp | NOT NULL                   | Last updated       |

### `subjects`

| Column       | Type      | Constraints                   | Description                       |
| ------------ | --------- | ----------------------------- | --------------------------------- |
| `id`         | text      | PK, UUIDv7                    | Primary key                       |
| `code`       | text      | NOT NULL                      | Subject code (unique per course)  |
| `title`      | text      | NOT NULL                      | Subject title (unique per course) |
| `units`      | integer   | NOT NULL                      | Credit units                      |
| `slot_limit` | integer   | NOT NULL, default `10`        | Max enrollment slots              |
| `course_id`  | text      | FK -> courses.id, NOT NULL    | Parent course                     |
| `created_at` | timestamp | NOT NULL                      | Created timestamp                 |
| `updated_at` | timestamp | NOT NULL                      | Last updated                      |

**Unique constraints:** `(course_id, code)`, `(course_id, title)`

### `subject_prerequisites`

| Column                    | Type      | Constraints                 | Description             |
| ------------------------- | --------- | --------------------------- | ----------------------- |
| `id`                      | text      | PK, UUIDv7                  | Primary key             |
| `subject_id`              | text      | FK -> subjects.id, NOT NULL | The subject             |
| `prerequisite_subject_id` | text      | FK -> subjects.id, NOT NULL | Required prerequisite   |
| `created_at`              | timestamp | NOT NULL                    | Created timestamp       |

**Unique constraint:** `(subject_id, prerequisite_subject_id)`

### `subject_reservations`

| Column        | Type      | Constraints                   | Description       |
| ------------- | --------- | ----------------------------- | ----------------- |
| `id`          | text      | PK, UUIDv7                    | Primary key       |
| `status`      | enum      | NOT NULL, default `RESERVED`  | See statuses below|
| `reserved_at` | timestamp | NOT NULL                      | Reservation time  |
| `student_id`  | text      | FK -> students.id, NOT NULL   | Reserving student |
| `subject_id`  | text      | FK -> subjects.id, NOT NULL   | Reserved subject  |

**Unique constraint:** `(student_id, subject_id)`

Status values: `RESERVED`, `CANCELLED`, `APPROVED`, `DENIED`

### `grades`

| Column               | Type         | Constraints                 | Description           |
| -------------------- | ------------ | --------------------------- | --------------------- |
| `id`                 | text         | PK, UUIDv7                  | Primary key           |
| `prelim`             | numeric(5,2) |                             | Prelim grade (0-100)  |
| `midterm`            | numeric(5,2) |                             | Midterm grade (0-100) |
| `finals`             | numeric(5,2) |                             | Finals grade (0-100)  |
| `final_grade`        | numeric(5,2) |                             | Computed final grade  |
| `remarks`            | enum         |                             | `PASSED` or `FAILED`  |
| `student_id`         | text         | FK -> students.id, NOT NULL | Graded student        |
| `subject_id`         | text         | FK -> subjects.id, NOT NULL | Graded subject        |
| `course_id`          | text         | FK -> courses.id, NOT NULL  | Related course        |
| `encoded_by_user_id` | text         | FK -> users.id, NOT NULL    | Staff who encoded     |
| `created_at`         | timestamp    | NOT NULL                    | Created timestamp     |
| `updated_at`         | timestamp    | NOT NULL                    | Last updated          |

**Unique constraint:** `(student_id, subject_id, course_id)`

## Enums

| Enum Name                    | Values                                        |
| ---------------------------- | --------------------------------------------- |
| `user_role`                  | `student`, `staff`, `admin`                   |
| `subject_reservation_status` | `RESERVED`, `CANCELLED`, `APPROVED`, `DENIED` |
| `grade_remarks`              | `PASSED`, `FAILED`                            |

## Database Commands

| Command                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `bun run db:generate`      | Generate migration SQL from schema changes     |
| `bun run db:migrate`       | Apply pending migrations                       |
| `bun run db:push`          | Push schema directly (skips migration files)   |
| `bun run db:studio`        | Open Drizzle Studio UI                         |
| `bun run db:reset`         | **DANGER:** Drop all tables + clear migrations |
| `bun run db:seed`          | Run the full system seed                       |
| `bun run db:seed:students` | Seed students only                             |

## Seed Data

Running `bun run db:seed` creates:

1. **Admin user** -- `admin@sis.edu` / `Admin@1234`
2. **5 courses** -- BSCS, BSIT, BSECE, BSME, BSBA
3. **15 subjects** -- distributed across courses
4. **7 prerequisite links** -- e.g. CS201 requires CS102
5. **50 students** -- with auto-generated user accounts (password = birth date)
6. **Grade records** -- for the first 20 students on introductory subjects
7. **Reservations** -- for the first 15 students

### Student Login

Each student's password is their `birthDate` (e.g. `2000-01-01`). Email pattern: `firstname.lastname<N>@student.edu`.

## Schema Files

All Drizzle table definitions live in `src/db/schema/`:

| File                      | Table                   |
| ------------------------- | ----------------------- |
| `user.ts`                 | `users`                 |
| `course.ts`               | `courses`               |
| `student.ts`              | `students`              |
| `subject.ts`              | `subjects`              |
| `grade.ts`                | `grades`                |
| `subject-prerequisite.ts` | `subject_prerequisites` |
| `subject-reservation.ts`  | `subject_reservations`  |
| `relations.ts`            | All Drizzle relations   |
| `_index.ts`               | Barrel export           |

> **Important:** All Drizzle relations are defined in a single `relations.ts` file to avoid circular imports.
