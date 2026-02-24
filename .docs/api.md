# API Reference

Base URL: `http://localhost:3000/api/v1`

All routes except `POST /auth/login` require a valid `accessToken` cookie (set automatically on login).

Role legend — **A** = admin, **S** = staff

---

## Auth

| Method | Route           | Roles | Description                                        |
| ------ | --------------- | ----- | -------------------------------------------------- |
| POST   | `/auth/login`   | —     | Login, sets `accessToken` + `refreshToken` cookies |
| POST   | `/auth/logout`  | any   | Clears auth cookies                                |
| POST   | `/auth/refresh` | —     | Rotates access token using refresh token           |
| GET    | `/auth/me`      | any   | Returns the current authenticated user             |

---

## Students

| Method | Route                                       | Roles | Description                                                                    |
| ------ | ------------------------------------------- | ----- | ------------------------------------------------------------------------------ |
| GET    | `/students`                                 | A, S  | List students (search, filter by `courseId`, pagination)                       |
| POST   | `/students`                                 | A, S  | Create a student                                                               |
| GET    | `/students/:id`                             | A, S  | Full student profile (info, course, grades, reservations, subject eligibility) |
| PATCH  | `/students/:id`                             | A, S  | Update a student                                                               |
| DELETE | `/students/:id`                             | A     | Delete a student                                                               |
| GET    | `/students/:id/reservations`                | A, S  | List a student's reservations                                                  |
| POST   | `/students/:id/reservations`                | A, S  | Reserve a subject                                                              |
| DELETE | `/students/:id/reservations/:reservationId` | A, S  | Cancel a reservation                                                           |
| GET    | `/students/:id/eligible-subjects`           | A, S  | Returns subjects with eligibility flags                                        |

---

## Courses

| Method | Route          | Roles | Description      |
| ------ | -------------- | ----- | ---------------- |
| GET    | `/courses`     | A, S  | List all courses |
| POST   | `/courses`     | A     | Create a course  |
| PATCH  | `/courses/:id` | A     | Update a course  |
| DELETE | `/courses/:id` | A     | Delete a course  |

---

## Subjects

| Method | Route                                                | Roles | Description                                                  |
| ------ | ---------------------------------------------------- | ----- | ------------------------------------------------------------ |
| GET    | `/subjects`                                          | A, S  | List subjects (search, filter by `courseId`, pagination)     |
| POST   | `/subjects`                                          | A     | Create a subject                                             |
| PATCH  | `/subjects/:id`                                      | A     | Update a subject                                             |
| DELETE | `/subjects/:id`                                      | A     | Delete a subject                                             |
| GET    | `/subjects/:id/prerequisites`                        | A, S  | List prerequisites for a subject                             |
| POST   | `/subjects/:id/prerequisites`                        | A     | Add a prerequisite (`{ "prerequisiteSubjectId": "<uuid>" }`) |
| DELETE | `/subjects/:id/prerequisites/:prerequisiteSubjectId` | A     | Remove a prerequisite                                        |

---

## Grades

| Method | Route         | Roles | Description                                                  |
| ------ | ------------- | ----- | ------------------------------------------------------------ |
| GET    | `/grades`     | A, S  | List grades (filter by `courseId`, `subjectId`, `studentId`) |
| POST   | `/grades`     | A, S  | Upsert a grade record (`prelim`, `midterm`, `finals`)        |
| PATCH  | `/grades/:id` | A, S  | Update a grade record                                        |

> `finalGrade` and `remarks` are **computed automatically** — they are not accepted as input.
