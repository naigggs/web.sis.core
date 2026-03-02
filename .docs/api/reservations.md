# Reservations API

Subject reservations are managed through **student routes**, not a standalone base path.

---

## Routes Overview

### Admin/Staff Routes (under `/api/v1/students/:id`)

| Method | Path                                        | Description                   | Roles        |
| ------ | ------------------------------------------- | ----------------------------- | ------------ |
| GET    | `/students/:id/reservations`                | List student's reservations   | admin, staff |
| POST   | `/students/:id/reservations`                | Reserve a subject for student | admin, staff |
| DELETE | `/students/:id/reservations/:reservationId` | Cancel reservation            | admin, staff |
| PATCH  | `/students/:id/reservations/:reservationId` | Approve or deny               | admin, staff |

### Student Self-Service Routes (under `/api/v1/students/me`)

| Method | Path                                       | Description            | Roles   |
| ------ | ------------------------------------------ | ---------------------- | ------- |
| GET    | `/students/me/reservations`                | List own reservations  | student |
| POST   | `/students/me/reservations`                | Reserve a subject      | student |
| DELETE | `/students/me/reservations/:reservationId` | Cancel own reservation | student |

---

## Status Lifecycle

```
RESERVED  ──→  APPROVED  (admin/staff approves)
    │      ──→  DENIED    (admin/staff denies)
    └──────→  (deleted)   (student or admin cancels)
```

There is no `CANCELLED` status set — cancellation **deletes** the record.

Active statuses for slot counting: `RESERVED` + `APPROVED`.

---

## GET /students/:id/reservations

List all reservations for a specific student.

**Roles:** `admin`, `staff` (or `student` via `/me/reservations`)

### Success Response (200)

```json
{
  "data": {
    "reservations": [
      {
        "id": "...",
        "status": "APPROVED",
        "reservedAt": "2025-03-01T00:00:00.000Z",
        "studentId": "...",
        "subjectId": "...",
        "subject": {
          "id": "...",
          "code": "CS101",
          "title": "Introduction to Computing",
          "units": 3,
          "slotLimit": 10
        }
      }
    ]
  }
}
```

---

## POST /students/:id/reservations

Reserve a subject for the specified student.

**Roles:** `admin`, `staff` (or `student` via `POST /me/reservations`)

### Request Body

| Field       | Type   | Required |
| ----------- | ------ | -------- |
| `subjectId` | string | Yes      |

```json
{ "subjectId": "01xyz..." }
```

### Validation Rules

1. **Course match** — The subject must belong to the student's enrolled course.
2. **No duplicate** — The student cannot reserve the same subject twice.
3. **Slot limit** — Active reservations (`RESERVED` + `APPROVED`) must not exceed the subject's `slotLimit`.
4. **Prerequisite enforcement** — All prerequisite subjects must have a passing grade (`finalGrade >= 75` or `remarks = PASSED`).

### Success Response (201)

```json
{
  "success": true,
  "message": "Subject reserved successfully.",
  "data": {
    "reservation": {
      "id": "...",
      "status": "RESERVED",
      "reservedAt": "...",
      "studentId": "...",
      "subjectId": "..."
    }
  }
}
```

### Errors

| Status | Message                                                  |
| ------ | -------------------------------------------------------- |
| 400    | Subject does not belong to the student's enrolled course |
| 400    | Subject already reserved                                 |
| 400    | Subject is full. Maximum of N reservations allowed.      |
| 400    | Missing prerequisites: [CS101, CS102]                    |
| 404    | Student not found / Subject not found                    |

---

## DELETE /students/:id/reservations/:reservationId

Cancel (delete) a reservation.

**Roles:** `admin`, `staff` (or `student` via `DELETE /me/reservations/:reservationId`)

### Validation

- The reservation must belong to the specified student.

### Success Response (200)

```json
{
  "success": true,
  "message": "Reservation cancelled successfully.",
  "data": null
}
```

---

## PATCH /students/:id/reservations/:reservationId

Update reservation status (approve or deny).

**Roles:** `admin`, `staff`

> This endpoint is **not available** via `/me` routes — students cannot approve/deny their own reservations.

### Request Body

| Field    | Type   | Required | Values                 |
| -------- | ------ | -------- | ---------------------- |
| `status` | string | Yes      | `APPROVED` or `DENIED` |

```json
{ "status": "APPROVED" }
```

### Validation Rules

1. **CANCELLED** reservations cannot be updated.
2. A reservation cannot be set to its **current** status.
3. On **APPROVED**: the subject's approved count must not exceed `slotLimit`.

### Success Response (200)

```json
{
  "success": true,
  "message": "Reservation approved.",
  "data": {
    "reservation": {
      "id": "...",
      "status": "APPROVED",
      "reservedAt": "...",
      "studentId": "...",
      "subjectId": "..."
    }
  }
}
```

### Errors

| Status | Message                                                          |
| ------ | ---------------------------------------------------------------- |
| 400    | status must be APPROVED or DENIED                                |
| 400    | Cannot update a cancelled reservation                            |
| 400    | Reservation is already APPROVED/DENIED                           |
| 400    | Cannot approve: subject "CS101" has reached its slot limit of N. |
| 404    | Reservation not found                                            |
