# Business Rules

## Student Accounts

- When a student is created, a linked **user account** is automatically created with `role: "student"`.
- Default password is the student's `birthDate` (e.g. `2000-01-01`). Falls back to `studentNo` if no birth date.
- The user record stores a `studentId` foreign key linking it to the student profile.

## Subjects & Prerequisites

### Subject Uniqueness

- Subject `code` is unique **within a course** (not globally).
- Subject `title` is unique **within a course**.

### Prerequisite Rules

1. A subject **cannot be its own prerequisite**.
2. Both the subject and prerequisite must belong to the **same course**.
3. **Circular dependencies are prevented** -- the system runs a BFS traversal before adding a link to detect cycles.
4. Duplicate prerequisite links are rejected.

## Subject Reservations

### Reservation Flow

```
Student reserves subject -> status: RESERVED
    |
    +-- Admin/Staff approves -> status: APPROVED (student enrolled)
    +-- Admin/Staff denies   -> status: DENIED
    +-- Student cancels      -> reservation deleted
```

### Reservation Validation

Before a student can reserve a subject:

1. **Course match** -- The subject must belong to the student's enrolled course.
2. **No duplicate** -- The student cannot reserve the same subject twice.
3. **Slot limit** -- Active reservations (RESERVED + APPROVED) must not exceed the subject's `slotLimit`.
4. **Prerequisite check** -- All prerequisite subjects must have a passing grade (finalGrade >= 75 or remarks = PASSED).

### Status Update Rules

- CANCELLED reservations cannot be updated.
- A reservation cannot be set to its current status.
- Approval additionally checks the slot limit (only counts APPROVED reservations).

## Grading

### Grade Components

| Component | Weight |
| --------- | ------ |
| Prelim    | 30%    |
| Midterm   | 30%    |
| Finals    | 40%    |

### Auto-computation

When all three components (prelim, midterm, finals) are provided:

```
finalGrade = round(prelim * 0.3 + midterm * 0.3 + finals * 0.4, 2)
remarks    = finalGrade >= 75 ? "PASSED" : "FAILED"
```

If any component is missing, `finalGrade` and `remarks` remain `null`.

### Grade Encoding Rules

1. The student must have an **APPROVED** reservation for the subject before a grade can be encoded.
2. Grades use **upsert** (insert-or-update) on the composite key `(studentId, subjectId, courseId)`.
3. The `encodedByUserId` tracks which staff/admin encoded the grade.
4. Grade values are clamped to `0-100`.

## Eligible Subjects

The "eligible subjects" endpoint computes which subjects a student can reserve:

For each subject in the student's course:
- **eligible** = all prerequisite subjects have a PASSED grade.
- **alreadyReserved** = the student has an existing reservation.
- **missingPrerequisites** = list of prerequisite subjects not yet passed.

## CSV Import/Export (Students)

### Export

`GET /students/export` returns a CSV file with columns: `studentNo, firstName, lastName, email, birthDate, courseId`.

### Import

`POST /students/import` accepts a multipart form field named `file` with a CSV matching the same header format. Each row is validated individually:

- If `studentNo`, `firstName`, `lastName`, or `courseId` is empty -- row skipped.
- If `studentNo` or `email` already exists -- row skipped.
- Successfully imported students get auto-created user accounts.

The response includes `imported` count and a `failed` array with row number, studentNo, and error message.

## Deletion Cascading

When students are bulk-deleted:

1. Related **grades** are deleted first.
2. Related **reservations** are deleted.
3. Related **user accounts** (by `studentId`) are deleted.
4. Finally, the **student** records are deleted.

This explicit cascade order satisfies foreign key constraints.
