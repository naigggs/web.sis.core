# Subjects API

Base path: `/api/v1/subjects`

All endpoints require authentication. Read access for `admin`/`staff`; write operations require `admin`.

---

## GET /

List subjects with pagination, search, and course filtering.

**Roles:** `admin`, `staff`

### Query Parameters

| Param      | Type   | Default | Description                        |
| ---------- | ------ | ------- | ---------------------------------- |
| `page`     | number | `1`     | Page number                        |
| `limit`    | number | `10`    | Items per page                     |
| `search`   | string | -       | ILIKE search on `code` and `title` |
| `courseId` | string | -       | Filter by course ID                |

### Success Response (200)

```json
{
  "data": {
    "subjects": [
      {
        "id": "01xyz...",
        "code": "CS101",
        "title": "Introduction to Computing",
        "units": 3,
        "slotLimit": 10,
        "courseId": "01abc...",
        "course": { "id": "01abc...", "code": "BSCS", "name": "..." }
      }
    ]
  },
  "pagination": { ... }
}
```

---

## GET /:id

Get a single subject with its parent course.

**Roles:** `admin`, `staff`

### Success Response (200)

```json
{
  "data": {
    "subject": {
      "id": "01xyz...",
      "code": "CS101",
      "title": "Introduction to Computing",
      "units": 3,
      "slotLimit": 10,
      "courseId": "01abc...",
      "course": { ... }
    }
  }
}
```

### Errors

| Status | Message           |
| ------ | ----------------- |
| 404    | Subject not found |

---

## POST /

Create a new subject.

**Roles:** `admin`

### Request Body

| Field      | Type   | Required | Validation       |
| ---------- | ------ | -------- | ---------------- |
| `code`     | string | Yes      | Min 1 char       |
| `title`    | string | Yes      | Min 1 char       |
| `units`    | number | Yes      | Positive integer |
| `courseId` | string | Yes      | Min 1 char       |

```json
{
  "code": "CS301",
  "title": "Operating Systems",
  "units": 3,
  "courseId": "01abc..."
}
```

### Errors

| Status | Message                                      |
| ------ | -------------------------------------------- |
| 400    | Subject code already exists for this course  |
| 400    | Subject title already exists for this course |

---

## PATCH /:id

Update subject fields.

**Roles:** `admin`

### Request Body

All fields optional:

| Field      | Type   | Validation       |
| ---------- | ------ | ---------------- |
| `code`     | string | Min 1 char       |
| `title`    | string | Min 1 char       |
| `units`    | number | Positive integer |
| `courseId` | string | Min 1 char       |

---

## DELETE /

Bulk delete subjects by IDs.

**Roles:** `admin`

### Request Body

```json
{ "ids": ["01xyz...", "01abc..."] }
```

---

## Prerequisite Management

### GET /:id/prerequisites

List all prerequisites for a subject.

**Roles:** `admin`, `staff`

#### Success Response (200)

```json
{
  "data": {
    "prerequisites": [
      {
        "id": "...",
        "subjectId": "01xyz...",
        "prerequisiteSubjectId": "01abc...",
        "prerequisiteSubject": {
          "id": "01abc...",
          "code": "CS101",
          "title": "Intro to Computing",
          "units": 3
        }
      }
    ]
  }
}
```

---

### POST /:id/prerequisites

Add a prerequisite to a subject.

**Roles:** `admin`

#### Request Body

| Field                   | Type   | Required |
| ----------------------- | ------ | -------- |
| `prerequisiteSubjectId` | string | Yes      |

```json
{ "prerequisiteSubjectId": "01abc..." }
```

#### Validation Rules

1. A subject cannot be its own prerequisite.
2. Both subjects must belong to the **same course**.
3. **No circular dependencies** — BFS traversal detects cycles.
4. No duplicate links.

#### Errors

| Status | Message                                                     |
| ------ | ----------------------------------------------------------- |
| 400    | A subject cannot be its own prerequisite                    |
| 400    | Prerequisite must belong to the same course                 |
| 400    | Adding this prerequisite would create a circular dependency |
| 400    | Prerequisite already added                                  |
| 404    | Subject not found / Prerequisite subject not found          |

---

### DELETE /:id/prerequisites/:prerequisiteSubjectId

Remove a prerequisite link.

**Roles:** `admin`

#### Success Response (200)

```json
{
  "success": true,
  "message": "Prerequisite removed successfully.",
  "data": null
}
```

---

## GET /:id/enrolled-students

Get all students with APPROVED reservations for this subject, including their grades.

**Roles:** `admin`, `staff`

### Success Response (200)

```json
{
  "data": {
    "students": [
      {
        "id": "...",
        "studentNo": "2024-00001",
        "firstName": "Juan",
        "lastName": "Dela Cruz",
        "course": { ... },
        "grade": {
          "prelim": "85.00",
          "midterm": "90.00",
          "finals": "88.00",
          "finalGrade": "87.90",
          "remarks": "PASSED"
        }
      }
    ]
  }
}
```

If a student has no grade recorded yet, `grade` is `null`.
