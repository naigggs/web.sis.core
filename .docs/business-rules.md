# Business Rules

## Grading

### Final Grade Calculation

`finalGrade` and `remarks` are **always computed by the server** and cannot be supplied by the client.

| Component | Weight |
| --------- | ------ |
| Prelim    | 30%    |
| Midterm   | 30%    |
| Finals    | 40%    |

```
finalGrade = (prelim × 0.30) + (midterm × 0.30) + (finals × 0.40)
```

`finalGrade` and `remarks` are only written when **all three** components (`prelim`, `midterm`, `finals`) are present. Partial updates that leave any component missing will not overwrite an existing final grade.

### Remarks

| Condition          | Remarks  |
| ------------------ | -------- |
| `finalGrade >= 75` | `PASSED` |
| `finalGrade < 75`  | `FAILED` |

---

## Prerequisites

### Satisfaction Rule

A prerequisite subject is considered **satisfied (passed)** when the student has a grade record for that subject where **either**:

- `final_grade >= 75`, **or**
- `remarks = 'PASSED'` (case-insensitive)

### Integrity Rules

| Rule                                             | Enforcement                        |
| ------------------------------------------------ | ---------------------------------- |
| A subject cannot be its own prerequisite         | Application logic (service layer)  |
| Prerequisites must belong to the same course     | Application logic (service layer)  |
| Circular prerequisites are prevented (A → B → A) | BFS traversal in application logic |

---

## Subject Reservation

### Validation on Reserve

When a student reserves a subject, the system checks **in order**:

1. **Subject belongs to student's course** — `subject.course_id == student.course_id`  
   Error: `400 Subject does not belong to the student's enrolled course`

2. **Not already reserved** — unique `(student_id, subject_id)`  
   Error: `400 Subject already reserved`

3. **All prerequisites satisfied** — each prerequisite must have `final_grade >= 75` or `remarks = 'PASSED'`  
   Error:
   ```
   400 Missing prerequisites: [CS101, CS102]
   ```
   The error lists subject **codes** (not IDs) for readability.
