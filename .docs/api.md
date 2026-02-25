# API Reference

Base URL: `http://localhost:3000/api/v1`

All routes except `POST /auth/login` require a valid `accessToken` cookie (set automatically on login).

Role legend — **A** = admin, **S** = staff  
`*` = required field, `?` = optional field

---

## Auth

| Method | Route           | Roles | Description                                        |
| ------ | --------------- | ----- | -------------------------------------------------- |
| POST   | `/auth/login`   | —     | Login, sets `accessToken` + `refreshToken` cookies |
| POST   | `/auth/logout`  | any   | Clears auth cookies                                |
| POST   | `/auth/refresh` | —     | Rotates access token using refresh token           |
| GET    | `/auth/me`      | any   | Returns the current authenticated user             |

### `POST /auth/login`

```json
{
  "email": "admin@sis.edu", // * string (valid email)
  "password": "Admin@1234" // * string (min 8 chars)
}
```

---

## Users

| Method | Route                    | Roles | Description        |
| ------ | ------------------------ | ----- | ------------------ |
| GET    | `/users`                 | A, S  | List all users     |
| POST   | `/users`                 | A, S  | Create a user      |
| GET    | `/users/:id`             | A, S  | Get user by ID     |
| PATCH  | `/users/:id`             | A, S  | Update a user      |
| DELETE | `/users/:id/soft-delete` | A, S  | Soft delete a user |
| DELETE | `/users/:id/hard-delete` | A     | Hard delete a user |

### `POST /users`

```json
{
  "email": "staff@sis.edu", // * string (valid email)
  "password": "Password1", // * string (min 8 chars)
  "confirmPassword": "Password1", // * string (must match password)
  "role": "staff" // ? "student" | "staff" | "admin" (default: "student")
}
```

### `PATCH /users/:id`

All fields are optional.

```json
{
  "email": "new@sis.edu", // ? string (valid email)
  "password": "NewPass1", // ? string (min 8 chars)
  "role": "admin", // ? "student" | "staff" | "admin"
  "isActive": true, // ? boolean
  "isBlocked": false, // ? boolean
  "isSuspended": false // ? boolean
}
```

---

## Students

| Method | Route                                       | Roles | Description                                                                    |
| ------ | ------------------------------------------- | ----- | ------------------------------------------------------------------------------ |
| GET    | `/students`                                 | A, S  | List students (search, filter by `courseId`, pagination)                       |
| POST   | `/students`                                 | A, S  | Create a student                                                               |
| GET    | `/students/:id`                             | A, S  | Full student profile (info, course, grades, reservations, subject eligibility) |
| PATCH  | `/students/:id`                             | A, S  | Update a student                                                               |
| DELETE | `/students`                                 | A     | Bulk delete students by IDs                                                    |
| GET    | `/students/:id/reservations`                | A, S  | List a student's reservations                                                  |
| POST   | `/students/:id/reservations`                | A, S  | Reserve a subject for the student                                              |
| DELETE | `/students/:id/reservations/:reservationId` | A, S  | Cancel a reservation                                                           |
| GET    | `/students/:id/eligible-subjects`           | A, S  | Returns subjects with eligibility flags                                        |

### `GET /students` — Query Parameters

| Parameter  | Type   | Description                                           |
| ---------- | ------ | ----------------------------------------------------- |
| `page`     | number | Page number (default: `1`)                            |
| `limit`    | number | Items per page (default: `10`)                        |
| `search`   | string | Search by first name, last name, student no, or email |
| `courseId` | string | Filter by course UUID                                 |

**Example:**

```
GET /students?courseId=<uuid>&search=juan&page=1&limit=10
```

---

### `POST /students`

```json
{
  "studentNo": "2024-00001", // * string
  "firstName": "Juan", // * string
  "lastName": "dela Cruz", // * string
  "email": "juan@sis.edu", // ? string (valid email)
  "birthDate": "2000-01-15", // ? string (ISO date)
  "courseId": "<uuid>" // * string (UUID of enrolled course)
}
```

### `PATCH /students/:id`

All fields are optional.

```json
{
  "studentNo": "2024-00001", // ? string
  "firstName": "Juan", // ? string
  "lastName": "dela Cruz", // ? string
  "email": "juan@sis.edu", // ? string (valid email)
  "birthDate": "2000-01-15", // ? string (ISO date)
  "courseId": "<uuid>" // ? string (UUID of enrolled course)
}
```

### `DELETE /students`

```json
{
  "ids": ["<uuid>", "<uuid>", "<uuid>"] // * string[] (non-empty array of student UUIDs)
}
```

### `POST /students/:id/reservations`

```json
{
  "subjectId": "<uuid>" // * string (UUID of subject to reserve)
}
```

> Subject must belong to the student's enrolled course. All prerequisites must be passed (grade ≥ 75) before reserving.

---

## Courses

| Method | Route          | Roles | Description                |
| ------ | -------------- | ----- | -------------------------- |
| GET    | `/courses`     | A, S  | List all courses           |
| POST   | `/courses`     | A     | Create a course            |
| PATCH  | `/courses/:id` | A     | Update a course            |
| DELETE | `/courses`     | A     | Bulk delete courses by IDs |

### `POST /courses`

```json
{
  "code": "BSCS", // * string
  "name": "Bachelor of Science in Computer Science", // * string
  "description": "4-year CS program" // ? string
}
```

### `PATCH /courses/:id`

All fields are optional.

```json
{
  "code": "BSCS", // ? string
  "name": "BS Computer Science", // ? string
  "description": "Updated desc" // ? string
}
```

### `DELETE /courses`

```json
{
  "ids": ["<uuid>", "<uuid>"] // * string[] (non-empty array of course UUIDs)
}
```

---

## Subjects

| Method | Route                                                | Roles | Description                                              |
| ------ | ---------------------------------------------------- | ----- | -------------------------------------------------------- |
| GET    | `/subjects`                                          | A, S  | List subjects (search, filter by `courseId`, pagination) |
| POST   | `/subjects`                                          | A     | Create a subject                                         |
| PATCH  | `/subjects/:id`                                      | A     | Update a subject                                         |
| DELETE | `/subjects`                                          | A     | Bulk delete subjects by IDs                              |
| GET    | `/subjects/:id/prerequisites`                        | A, S  | List prerequisites for a subject                         |
| POST   | `/subjects/:id/prerequisites`                        | A     | Add a prerequisite to a subject                          |
| DELETE | `/subjects/:id/prerequisites/:prerequisiteSubjectId` | A     | Remove a prerequisite                                    |

### `POST /subjects`

```json
{
  "code": "CS101", // * string
  "title": "Introduction to Programming", // * string
  "units": 3, // * integer (positive)
  "courseId": "<uuid>" // * string (UUID of owning course)
}
```

### `PATCH /subjects/:id`

All fields are optional.

```json
{
  "code": "CS101", // ? string
  "title": "Intro to Programming", // ? string
  "units": 3, // ? integer (positive)
  "courseId": "<uuid>" // ? string (UUID of owning course)
}
```

### `DELETE /subjects`

```json
{
  "ids": ["<uuid>", "<uuid>"] // * string[] (non-empty array of subject UUIDs)
}
```

### `POST /subjects/:id/prerequisites`

```json
{
  "prerequisiteSubjectId": "<uuid>" // * string (UUID of prerequisite subject)
}
```

> Prerequisites must belong to the same course. Self-referencing and circular chains are rejected.

---

## Grades

| Method | Route         | Roles | Description                                                  |
| ------ | ------------- | ----- | ------------------------------------------------------------ |
| GET    | `/grades`     | A, S  | List grades (filter by `courseId`, `subjectId`, `studentId`) |
| POST   | `/grades`     | A, S  | Upsert a grade record                                        |
| PATCH  | `/grades/:id` | A, S  | Update a grade record                                        |

### `POST /grades`

```json
{
  "studentId": "<uuid>", // * string (UUID of student)
  "subjectId": "<uuid>", // * string (UUID of subject)
  "courseId": "<uuid>", // * string (UUID of course)
  "prelim": 85.5, // ? number (0–100)
  "midterm": 90.0, // ? number (0–100)
  "finals": 88.0 // ? number (0–100)
}
```

### `PATCH /grades/:id`

All fields are optional.

```json
{
  "prelim": 85.5, // ? number (0–100)
  "midterm": 90.0, // ? number (0–100)
  "finals": 88.0 // ? number (0–100)
}
```

> `finalGrade` and `remarks` are **computed automatically** — do not send them as input.  
> Formula: `finalGrade = (prelim × 0.30) + (midterm × 0.30) + (finals × 0.40)`  
> `remarks` = `"PASSED"` if `finalGrade ≥ 75`, otherwise `"FAILED"`. Computed only when all three components are present.
