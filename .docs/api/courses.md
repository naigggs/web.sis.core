# Courses API

Base path: `/api/v1/courses`

All endpoints require authentication. Read access for `admin`/`staff`; write operations require `admin`.

---

## GET /

List all courses with pagination and search.

**Roles:** `admin`, `staff`

### Query Parameters

| Param    | Type   | Default | Description                       |
| -------- | ------ | ------- | --------------------------------- |
| `page`   | number | `1`     | Page number                       |
| `limit`  | number | `10`    | Items per page                    |
| `search` | string | -       | ILIKE search on `code` and `name` |

### Success Response (200)

```json
{
  "success": true,
  "message": "Courses retrieved successfully.",
  "data": {
    "courses": [
      {
        "id": "01abc...",
        "code": "BSCS",
        "name": "Bachelor of Science in Computer Science",
        "description": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  },
  "pagination": { ... }
}
```

---

## GET /:id

Get a single course with its subjects.

**Roles:** `admin`, `staff`

### Success Response (200)

```json
{
  "success": true,
  "message": "Course retrieved successfully.",
  "data": {
    "course": {
      "id": "01abc...",
      "code": "BSCS",
      "name": "Bachelor of Science in Computer Science",
      "description": "...",
      "subjects": [
        {
          "id": "01xyz...",
          "code": "CS101",
          "title": "Introduction to Computing",
          "units": 3,
          "slotLimit": 10,
          "courseId": "01abc..."
        }
      ]
    }
  }
}
```

### Errors

| Status | Message          |
| ------ | ---------------- |
| 404    | Course not found |

---

## POST /

Create a new course.

**Roles:** `admin`

### Request Body

| Field         | Type   | Required | Validation |
| ------------- | ------ | -------- | ---------- |
| `code`        | string | Yes      | Min 1 char |
| `name`        | string | Yes      | Min 1 char |
| `description` | string | No       |            |

```json
{
  "code": "BSCS",
  "name": "Bachelor of Science in Computer Science",
  "description": "A 4-year degree program."
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Course created successfully.",
  "data": { "course": { ... } }
}
```

### Errors

| Status | Message                    |
| ------ | -------------------------- |
| 400    | Course code already exists |

---

## POST /:id/subjects

Add multiple subjects to a course in a single request.

**Roles:** `admin`

### Request Body

| Field                  | Type   | Required | Validation                    |
| ---------------------- | ------ | -------- | ----------------------------- |
| `subjects`             | array  | Yes      | Min 1 item                    |
| `subjects[].code`      | string | Yes      | Min 1 char                    |
| `subjects[].title`     | string | Yes      | Min 1 char                    |
| `subjects[].units`     | number | Yes      | Positive integer              |
| `subjects[].slotLimit` | number | No       | Positive integer (default 10) |

```json
{
  "subjects": [
    { "code": "CS101", "title": "Intro to Computing", "units": 3 },
    { "code": "CS102", "title": "Data Structures", "units": 3, "slotLimit": 40 }
  ]
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "2 subject(s) added to course successfully.",
  "data": {
    "subjects": [ ... ]
  }
}
```

### Errors

| Status | Message          |
| ------ | ---------------- |
| 404    | Course not found |

---

## PATCH /:id

Update course fields.

**Roles:** `admin`

### Request Body

All fields are optional:

| Field         | Type   | Validation |
| ------------- | ------ | ---------- |
| `code`        | string | Min 1 char |
| `name`        | string | Min 1 char |
| `description` | string |            |

### Success Response (200)

```json
{
  "success": true,
  "message": "Course updated successfully.",
  "data": { "course": { ... } }
}
```

### Errors

| Status | Message                    |
| ------ | -------------------------- |
| 404    | Course not found           |
| 400    | Course code already exists |

---

## DELETE /

Bulk delete courses by IDs.

**Roles:** `admin`

### Request Body

```json
{
  "ids": ["01abc...", "01def..."]
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "2 course(s) deleted successfully.",
  "data": { "deleted": [ ... ] }
}
```

### Errors

| Status | Message                       |
| ------ | ----------------------------- |
| 400    | ids must be a non-empty array |
