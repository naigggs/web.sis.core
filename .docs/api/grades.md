# Grades API

Base path: `/api/v1/grades`

All endpoints require authentication with `admin` or `staff` role.

---

## GET /

List grades with pagination and optional filters.

**Roles:** `admin`, `staff`

### Query Parameters

| Param       | Type   | Default | Description       |
| ----------- | ------ | ------- | ----------------- |
| `page`      | number | `1`     | Page number       |
| `limit`     | number | `10`    | Items per page    |
| `courseId`  | string | -       | Filter by course  |
| `subjectId` | string | -       | Filter by subject |
| `studentId` | string | -       | Filter by student |

Filters can be combined (e.g. `?courseId=...&studentId=...`).

### Success Response (200)

```json
{
  "data": {
    "grades": [
      {
        "id": "...",
        "prelim": "85.00",
        "midterm": "90.00",
        "finals": "88.00",
        "finalGrade": "87.90",
        "remarks": "PASSED",
        "studentId": "...",
        "subjectId": "...",
        "courseId": "...",
        "encodedByUserId": "...",
        "student": { "id": "...", "studentNo": "2024-00001", "firstName": "Juan", "lastName": "Dela Cruz" },
        "subject": { "id": "...", "code": "CS101", "title": "..." },
        "course": { "id": "...", "code": "BSCS", "name": "..." },
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  },
  "pagination": { ... }
}
```

---

## POST /

Create or update (upsert) a grade record.

**Roles:** `admin`, `staff`

If a grade for the same `(studentId, subjectId, courseId)` already exists, it is updated instead of creating a duplicate.

### Request Body

| Field       | Type   | Required | Validation |
| ----------- | ------ | -------- | ---------- |
| `studentId` | string | Yes      | Min 1 char |
| `subjectId` | string | Yes      | Min 1 char |
| `courseId`  | string | Yes      | Min 1 char |
| `prelim`    | number | No       | 0–100      |
| `midterm`   | number | No       | 0–100      |
| `finals`    | number | No       | 0–100      |

```json
{
  "studentId": "01abc...",
  "subjectId": "01xyz...",
  "courseId": "01def...",
  "prelim": 85,
  "midterm": 90,
  "finals": 88
}
```

### Auto-Computation

When **all three** components are provided:

```
finalGrade = round(prelim × 0.3 + midterm × 0.3 + finals × 0.4, 2)
remarks    = finalGrade >= 75 ? "PASSED" : "FAILED"
```

If any component is `null`/`undefined`, `finalGrade` and `remarks` remain `null`.

### Prerequisite for Grading

The student **must** have an **APPROVED** reservation for the subject before a grade can be encoded. Otherwise, the endpoint returns an error.

### Success Response (201)

```json
{
  "success": true,
  "message": "Grade saved successfully.",
  "data": {
    "grade": {
      "id": "...",
      "prelim": "85.00",
      "midterm": "90.00",
      "finals": "88.00",
      "finalGrade": "87.90",
      "remarks": "PASSED",
      "studentId": "...",
      "subjectId": "...",
      "courseId": "...",
      "encodedByUserId": "..."
    }
  }
}
```

### Errors

| Status | Message                                                        |
| ------ | -------------------------------------------------------------- |
| 404    | Student not found                                              |
| 404    | Subject not found                                              |
| 404    | Course not found                                               |
| 400    | Student does not have an approved reservation for this subject |

---

## PATCH /:id

Update an existing grade's component values.

**Roles:** `admin`, `staff`

### Path Parameters

| Param | Description |
| ----- | ----------- |
| `id`  | Grade ID    |

### Request Body

All fields optional:

| Field     | Type   | Validation |
| --------- | ------ | ---------- |
| `prelim`  | number | 0–100      |
| `midterm` | number | 0–100      |
| `finals`  | number | 0–100      |

```json
{
  "finals": 92
}
```

The system merges the updated value with existing stored values, then recomputes `finalGrade` and `remarks` if all three components are present.

### Success Response (200)

```json
{
  "success": true,
  "message": "Grade updated successfully.",
  "data": { "grade": { ... } }
}
```

### Errors

| Status | Message         |
| ------ | --------------- |
| 404    | Grade not found |

---

## Grade Computation Summary

| Component | Weight |
| --------- | ------ |
| Prelim    | 30%    |
| Midterm   | 30%    |
| Finals    | 40%    |

- **PASSED**: `finalGrade >= 75`
- **FAILED**: `finalGrade < 75`
- Formula: `finalGrade = prelim × 0.3 + midterm × 0.3 + finals × 0.4`

The `encodedByUserId` is automatically set from the authenticated user's JWT `sub` claim.
