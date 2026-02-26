import { relations } from "drizzle-orm"

import { user } from "./user"
import { course } from "./course"
import { student } from "./student"
import { subject } from "./subject"
import { grade } from "./grade"
import { subjectReservation } from "./subject-reservation"
import { subjectPrerequisite } from "./subject-prerequisite"

// ─── User Relations ───────────────────────────────────────────────────────────
export const userRelations = relations(user, ({ one, many }) => ({
  encodedGrades: many(grade),
  student: one(student, {
    fields: [user.studentId],
    references: [student.id],
  }),
}))

// ─── Course Relations ─────────────────────────────────────────────────────────
export const courseRelations = relations(course, ({ many }) => ({
  students: many(student),
  subjects: many(subject),
  grades: many(grade),
}))

// ─── Student Relations ────────────────────────────────────────────────────────
export const studentRelations = relations(student, ({ one, many }) => ({
  course: one(course, {
    fields: [student.courseId],
    references: [course.id],
  }),
  linkedUser: one(user, {
    fields: [student.id],
    references: [user.studentId],
  }),
  grades: many(grade),
  subjectReservations: many(subjectReservation),
}))

// ─── Subject Relations ────────────────────────────────────────────────────────
export const subjectRelations = relations(subject, ({ one, many }) => ({
  course: one(course, {
    fields: [subject.courseId],
    references: [course.id],
  }),
  grades: many(grade),
  subjectReservations: many(subjectReservation),
  prerequisites: many(subjectPrerequisite, {
    relationName: "subjectPrerequisites",
  }),
  prerequisiteFor: many(subjectPrerequisite, {
    relationName: "prerequisiteFor",
  }),
}))

// ─── Grade Relations ──────────────────────────────────────────────────────────
export const gradeRelations = relations(grade, ({ one }) => ({
  student: one(student, {
    fields: [grade.studentId],
    references: [student.id],
  }),
  subject: one(subject, {
    fields: [grade.subjectId],
    references: [subject.id],
  }),
  course: one(course, {
    fields: [grade.courseId],
    references: [course.id],
  }),
  encodedBy: one(user, {
    fields: [grade.encodedByUserId],
    references: [user.id],
  }),
}))

// ─── Subject Reservation Relations ───────────────────────────────────────────
export const subjectReservationRelations = relations(
  subjectReservation,
  ({ one }) => ({
    student: one(student, {
      fields: [subjectReservation.studentId],
      references: [student.id],
    }),
    subject: one(subject, {
      fields: [subjectReservation.subjectId],
      references: [subject.id],
    }),
  }),
)

// ─── Subject Prerequisite Relations ──────────────────────────────────────────
export const subjectPrerequisiteRelations = relations(
  subjectPrerequisite,
  ({ one }) => ({
    subject: one(subject, {
      fields: [subjectPrerequisite.subjectId],
      references: [subject.id],
      relationName: "subjectPrerequisites",
    }),
    prerequisiteSubject: one(subject, {
      fields: [subjectPrerequisite.prerequisiteSubjectId],
      references: [subject.id],
      relationName: "prerequisiteFor",
    }),
  }),
)
