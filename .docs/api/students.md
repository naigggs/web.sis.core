# Students API

Base path: `/api/v1/students`

All endpoints require authentication. Admin/staff routes manage students; student-role routes use `/me` prefix for self-service.

---

## Admin/Staff Routes

### GET /

List students with pagination, search, and course filtering.

**Roles:** `admin`, `staff`

#### Query Parameters

| Param      | Type   | Default | Description                                                   |
| ---------- | ------ | ------- | ------------------------------------------------------------- |
| `page`     | number | `1`     | Page number                                                   |
| `limit`    | number | `10`    | Items per page                                                |
| `search`   | string | -       | ILIKE search on `firstName`, `lastName`, `studentNo`, `email` |
| `courseId` | string | -       | Filter by course ID                                           |

#### Success Response (200)

Returns `students` array (each includes nested `course` object) with pagination.

---

### POST /

Create a new student and auto-create a linked user account.

**Roles:** `admin`, `staff`

#### Request Body

| Field       | Type   | Required | Validation  |
| ----------- | ------ | -------- | ----------- |
| `studentNo` | string | Yes      | Min 1 char  |
| `firstName` | string | Yes      | Min 1 char  |
| `lastName`  | string | Yes      | Min 1 char  |
| `email`     | string | No       | Valid email |
| `birthDate` | string | No       | Date string |
| `courseId`  | string | Yes      | Min 1 char  |

```json
{
  "studentNo": "2024-00001",
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "email": "juan@student.edu",
  "birthDate": "2000-05-15",
  "courseId": "01abc..."
}
```

> **Auto-created user account:** Password defaults to `birthDate` (e.g. `2000-05-15`), or `studentNo` if no birth date. Role is `student`. The user's `studentId` links back to this student.

#### Success Response (201)

```json
{
  "success": true,
  "message": "Student created successfully.",
  "data": { "student": { ... } }
}
```

#### Errors

| Status | Message                       |
| ------ | ----------------------------- |
| 400    | Student number already exists |
| 400    | Email already in use          |

---

### GET /:id

Get detailed student profile including grades, reservations, and subject eligibility status.

**Roles:** `admin`, `staff`

#### Success Response (200)

```json
{
  "data": {
    "student": {
      "id": "...",
      "studentNo": "2024-00001",
      "firstName": "Juan",
      "lastName": "Dela Cruz",
      "email": "juan@student.edu",
      "birthDate": "2000-05-15",
      "courseId": "01abc...",
      "course": { "id": "...", "code": "BSCS", "name": "..." },
      "grades": [
        {
          "id": "...",
          "prelim": "85.00",
          "midterm": "90.00",
          "finals": "88.00",
          "finalGrade": "87.90",
          "remarks": "PASSED",
          "subjectId": "...",
          "subject": { ... },
          "course": { ... }
        }
      ],
      "reservations": [
        {
          "id": "...",
          "status": "APPROVED",
          "subjectId": "...",
          "subject": { ... }
        }
      ],
      "subjectStatus": [
        {
          "id": "...",
          "code": "CS201",
          "title": "Advanced Programming",
          "units": 3,
          "eligible": false,
          "alreadyReserved": false,
          "missingPrerequisites": [
            { "id": "...", "code": "CS102", "title": "Data Structures" }
          ]
        }
      ]
    }
  }
}
```

---

### PATCH /:id

Update student fields.

**Roles:** `admin`, `staff`

#### Request Body

All fields optional:

| Field       | Type   | Validation  |
| ----------- | ------ | ----------- |
| `studentNo` | string | Min 1 char  |
| `firstName` | string | Min 1 char  |
| `lastName`  | string | Min 1 char  |
| `email`     | string | Valid email |
| `birthDate` | string |             |
| `courseId`  | string | Min 1 char  |

---

### DELETE /

Bulk delete students and all related records (grades, reservations, user accounts).

**Roles:** `admin`

#### Request Body

```json
{ "ids": ["01abc...", "01def..."] }
```

> **Cascade order:** grades → reservations → user accounts → students.

---

### GET /export

Export all students as a CSV file.

**Roles:** `admin`, `staff`

#### Response

- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="students.csv"`

CSV columns: `studentNo, firstName, lastName, email, birthDate, courseId`

---

### POST /import

Import students from a CSV file.

**Roles:** `admin`, `staff`

#### Request

Multipart form data with a field named `file` containing the CSV.

**Expected CSV header:**

```
studentNo,firstName,lastName,email,birthDate,courseId
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Import complete: 45 imported, 5 failed.",
  "data": {
    "imported": 45,
    "failed": [
      {
        "row": 12,
        "studentNo": "2024-00012",
        "error": "Student number already exists"
      }
    ]
  }
}
```

---

### GET /:id/eligible-subjects

Get all course subjects with eligibility status for a specific student.

**Roles:** `admin`, `staff`

See Business Rules → "Eligible Subjects" for the eligibility logic.

---

## Student Self-Service Routes (`/me`)

These routes are for users with `student` role. The system resolves the student ID from the JWT's `studentId` claim.

### GET /me

Get own student profile (same detailed format as `GET /:id`).

**Roles:** `student`

---

### GET /me/reservations

List own subject reservations.

**Roles:** `student`

---

### POST /me/reservations

Reserve a subject.

**Roles:** `student`

#### Request Body

```json
{ "subjectId": "01xyz..." }
```

See [reservations.md](reservations.md) for full validation rules.

---

### DELETE /me/reservations/:reservationId

Cancel own reservation (deletes the record).

**Roles:** `student`

---

### GET /me/eligible-subjects

View eligible subjects for self-enrollment.

**Roles:** `student`

---

## Admin/Staff Reservation Sub-routes

These are nested under `/students/:id/reservations`. See [reservations.md](reservations.md) for details.

| Method | Path                               | Description        |
| ------ | ---------------------------------- | ------------------ |
| GET    | `/:id/reservations`                | List reservations  |
| POST   | `/:id/reservations`                | Reserve a subject  |
| DELETE | `/:id/reservations/:reservationId` | Cancel reservation |
| PATCH  | `/:id/reservations/:reservationId` | Update status      |
