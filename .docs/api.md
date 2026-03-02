# API Reference

Base URL: `/api/v1`

## Feature Modules

| Module       | Base Path          | Documentation                                |
| ------------ | ------------------ | -------------------------------------------- |
| Auth         | `/api/v1/auth`     | [api/auth.md](api/auth.md)                   |
| Users        | `/api/v1/users`    | [api/users.md](api/users.md)                 |
| Courses      | `/api/v1/courses`  | [api/courses.md](api/courses.md)             |
| Students     | `/api/v1/students` | [api/students.md](api/students.md)           |
| Subjects     | `/api/v1/subjects` | [api/subjects.md](api/subjects.md)           |
| Grades       | `/api/v1/grades`   | [api/grades.md](api/grades.md)               |
| Reservations | (nested under students) | [api/reservations.md](api/reservations.md) |

## Authentication

All endpoints except `POST /auth/login` and `POST /auth/refresh` require a valid JWT access token.

Tokens are set as **httpOnly cookies** (`accessToken`, `refreshToken`) by the login/refresh endpoints. The server reads the `accessToken` cookie on every request.

## Role-Based Access Control

Three roles exist: `student`, `staff`, `admin`. Each endpoint specifies which roles are allowed. Unauthorized access returns `403 Forbidden`.

| Role    | Typical Access                                              |
| ------- | ----------------------------------------------------------- |
| admin   | Full CRUD on all resources, user management, hard delete    |
| staff   | Read access, student/grade/reservation management           |
| student | View own profile, own reservations, own eligible subjects   |

## Standard Response Envelope

Every response follows this structure:

```json
{
  "success": true,
  "message": "Descriptive message.",
  "data": {},
  "errors": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "metadata": {
    "requestId": "uuid",
    "version": "1.0.0",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "serverTime": "2025-01-01T00:00:00.000Z"
  }
}
```

- `data` -- Contains the response payload (or `null` on error).
- `errors` -- Array of error messages (empty on success).
- `pagination` -- Present only on list endpoints, `null` otherwise.
- `metadata` -- Always present. `requestId` echoes the `x-request-id` header if provided.

## HTTP Status Codes

| Code | Usage                                |
| ---- | ------------------------------------ |
| 200  | Successful read/update/delete        |
| 201  | Successful create                    |
| 400  | Validation error or bad request      |
| 401  | Missing/invalid/expired token        |
| 403  | Insufficient role permissions        |
| 404  | Resource not found                   |
| 500  | Unexpected server error              |

## Pagination

All list endpoints support pagination via query parameters:

| Parameter | Type   | Default | Description    |
| --------- | ------ | ------- | -------------- |
| `page`    | number | `1`     | Page number    |
| `limit`   | number | `10`    | Items per page |
