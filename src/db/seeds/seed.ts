/**
 * =============================================================================
 * FULL SYSTEM SEED
 * =============================================================================
 *
 * Seeded Admin Credentials:
 *   Email:    admin@sis.edu
 *   Password: Admin@1234
 *
 * Run: bun run db:seed
 * =============================================================================
 */

import { db } from "../../config/database"
import { user } from "../schema/user"
import { course } from "../schema/course"
import { subject } from "../schema/subject"
import { subjectPrerequisite } from "../schema/subject-prerequisite"
import { student } from "../schema/student"
import { subjectReservation } from "../schema/subject-reservation"
import { grade } from "../schema/grade"
import { eq } from "drizzle-orm"

const ADMIN_EMAIL = "admin@sis.edu"
const ADMIN_PASSWORD = "Admin@1234"

// ─── 1. Admin User ────────────────────────────────────────────────────────────

async function seedAdmin() {
  console.log("\n👤 Seeding admin user...")

  const existing = await db.query.user.findFirst({
    where: eq(user.email, ADMIN_EMAIL),
  })

  if (existing) {
    console.log("   Admin already exists, skipping.")
    return existing
  }

  const hashedPassword = await Bun.password.hash(ADMIN_PASSWORD)
  const [admin] = await db
    .insert(user)
    .values({ email: ADMIN_EMAIL, password: hashedPassword, role: "admin" })
    .returning()

  console.log(`   ✅ Admin created: ${admin.email}`)
  return admin
}

// ─── 2. Courses ───────────────────────────────────────────────────────────────

const COURSE_DATA = [
  {
    code: "BSCS",
    name: "Bachelor of Science in Computer Science",
    description: "Core computing and software engineering curriculum.",
  },
  {
    code: "BSIT",
    name: "Bachelor of Science in Information Technology",
    description: "Practical IT systems and networking curriculum.",
  },
  {
    code: "BSECE",
    name: "Bachelor of Science in Electronics Engineering",
    description: "Electronics and communications engineering curriculum.",
  },
  {
    code: "BSME",
    name: "Bachelor of Science in Mechanical Engineering",
    description: "Mechanical systems and thermodynamics curriculum.",
  },
  {
    code: "BSBA",
    name: "Bachelor of Science in Business Administration",
    description: "Business management and entrepreneurship curriculum.",
  },
]

async function seedCourses() {
  console.log("\n📚 Seeding courses...")

  const seeded = await db
    .insert(course)
    .values(COURSE_DATA)
    .onConflictDoNothing()
    .returning()

  const all =
    seeded.length === COURSE_DATA.length
      ? seeded
      : await db.query.course.findMany()

  console.log(`   ✅ ${all.length} courses ready.`)
  return all
}

// ─── 3. Subjects ──────────────────────────────────────────────────────────────

function buildSubjects(courses: { id: string; code: string }[]) {
  const byCourse = Object.fromEntries(courses.map((c) => [c.code, c.id]))

  return [
    // BSCS
    {
      code: "CS101",
      title: "Introduction to Computing",
      units: 3,
      courseId: byCourse["BSCS"],
    },
    {
      code: "CS102",
      title: "Programming Fundamentals",
      units: 3,
      courseId: byCourse["BSCS"],
    },
    {
      code: "CS201",
      title: "Data Structures and Algorithms",
      units: 3,
      courseId: byCourse["BSCS"],
    },
    {
      code: "CS202",
      title: "Discrete Mathematics",
      units: 3,
      courseId: byCourse["BSCS"],
    },
    // BSIT
    {
      code: "IT101",
      title: "Introduction to Information Technology",
      units: 3,
      courseId: byCourse["BSIT"],
    },
    {
      code: "IT102",
      title: "Computer Hardware and Software",
      units: 3,
      courseId: byCourse["BSIT"],
    },
    {
      code: "IT201",
      title: "Database Management Systems",
      units: 3,
      courseId: byCourse["BSIT"],
    },
    // BSECE
    {
      code: "ECE101",
      title: "Circuit Theory",
      units: 4,
      courseId: byCourse["BSECE"],
    },
    {
      code: "ECE102",
      title: "Electronics 1",
      units: 4,
      courseId: byCourse["BSECE"],
    },
    {
      code: "ECE201",
      title: "Electronics 2",
      units: 4,
      courseId: byCourse["BSECE"],
    },
    // BSME
    {
      code: "ME101",
      title: "Engineering Mechanics",
      units: 3,
      courseId: byCourse["BSME"],
    },
    {
      code: "ME201",
      title: "Thermodynamics 1",
      units: 3,
      courseId: byCourse["BSME"],
    },
    // BSBA
    {
      code: "BA101",
      title: "Principles of Management",
      units: 3,
      courseId: byCourse["BSBA"],
    },
    {
      code: "BA102",
      title: "Accounting Fundamentals",
      units: 3,
      courseId: byCourse["BSBA"],
    },
    {
      code: "BA201",
      title: "Financial Management",
      units: 3,
      courseId: byCourse["BSBA"],
    },
  ]
}

async function seedSubjects(courses: { id: string; code: string }[]) {
  console.log("\n📖 Seeding subjects...")

  const subjectData = buildSubjects(courses)

  const seeded = await db
    .insert(subject)
    .values(subjectData)
    .onConflictDoNothing()
    .returning()

  // Fetch all so we always have complete data even on re-runs
  const all = await db.query.subject.findMany()
  console.log(`   ✅ ${all.length} subjects ready.`)
  return all
}

// ─── 4. Prerequisite Links ────────────────────────────────────────────────────

function buildPrerequisites(subjects: { id: string; code: string }[]) {
  const byCode = Object.fromEntries(subjects.map((s) => [s.code, s.id]))

  // (course) subject → requires prerequisite
  return [
    { subjectId: byCode["CS201"], prerequisiteSubjectId: byCode["CS102"] }, // DSA requires Programming Fundamentals
    { subjectId: byCode["CS202"], prerequisiteSubjectId: byCode["CS101"] }, // Discrete Math requires Intro to Computing
    { subjectId: byCode["IT201"], prerequisiteSubjectId: byCode["IT102"] }, // DBMS requires Hardware & Software
    { subjectId: byCode["ECE102"], prerequisiteSubjectId: byCode["ECE101"] }, // Electronics 1 requires Circuit Theory
    { subjectId: byCode["ECE201"], prerequisiteSubjectId: byCode["ECE102"] }, // Electronics 2 requires Electronics 1
    { subjectId: byCode["ME201"], prerequisiteSubjectId: byCode["ME101"] }, // Thermodynamics 1 requires Engineering Mechanics
    { subjectId: byCode["BA201"], prerequisiteSubjectId: byCode["BA102"] }, // Financial Mgmt requires Accounting
  ]
}

async function seedPrerequisites(subjects: { id: string; code: string }[]) {
  console.log("\n🔗 Seeding prerequisite links...")

  const links = buildPrerequisites(subjects)

  await db.insert(subjectPrerequisite).values(links).onConflictDoNothing()

  console.log(`   ✅ ${links.length} prerequisite links ready.`)
}

// ─── 5. Students ──────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "James",
  "Maria",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Barbara",
  "David",
  "Susan",
  "Joseph",
  "Jessica",
  "Charles",
  "Sarah",
  "Thomas",
  "Karen",
  "Daniel",
  "Lisa",
  "Matthew",
  "Nancy",
  "Anthony",
  "Betty",
  "Mark",
  "Margaret",
  "Donald",
  "Sandra",
  "Steven",
  "Ashley",
  "Paul",
  "Dorothy",
  "Andrew",
  "Kimberly",
  "Kenneth",
  "Emily",
  "Joshua",
  "Donna",
  "Kevin",
  "Michelle",
]

const LAST_NAMES = [
  "Santos",
  "Reyes",
  "Cruz",
  "Bautista",
  "Ocampo",
  "Garcia",
  "Mendoza",
  "Torres",
  "Castillo",
  "Ramos",
  "Aquino",
  "Dela Cruz",
  "Villanueva",
  "Soriano",
  "Gonzales",
  "Aguilar",
  "Luna",
  "Flores",
  "Rivera",
  "Navarro",
]

async function seedStudents(courses: { id: string }[]) {
  console.log("\n🎓 Seeding 50 students...")

  const year = new Date().getFullYear()
  const students = Array.from({ length: 50 }, (_, i) => {
    const index = i + 1
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length]
    const lastName = LAST_NAMES[i % LAST_NAMES.length]
    const courseId = courses[i % courses.length].id
    const studentNo = `${year}-${String(index).padStart(5, "0")}`
    const birthYear = 2000 + (i % 6)
    const birthDate = `${birthYear}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`

    return {
      studentNo,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, "")}${index}@student.edu`,
      birthDate,
      courseId,
    }
  })

  const inserted = await db
    .insert(student)
    .values(students)
    .onConflictDoNothing()
    .returning()

  const all = await db.query.student.findMany({ limit: 50 })
  console.log(`   ✅ ${all.length} students ready.`)
  return all
}

// ─── 6. Grades (for prerequisite logic to be testable) ───────────────────────

async function seedGrades(
  students: { id: string; courseId: string }[],
  subjects: { id: string; code: string; courseId: string }[],
  encodedByUserId: string,
) {
  console.log("\n📊 Seeding grade records...")

  // Seed passing grades for "intro" subjects for the first 20 students
  // so they become eligible for prerequisite-gated subjects
  const introSubjectCodes = new Set([
    "CS101",
    "CS102",
    "IT101",
    "IT102",
    "ECE101",
    "ECE102",
    "ME101",
    "BA101",
    "BA102",
  ])
  const subjectMap = new Map(subjects.map((s) => [s.id, s]))

  const gradeRecords: {
    studentId: string
    subjectId: string
    courseId: string
    encodedByUserId: string
    prelim: string
    midterm: string
    finals: string
    finalGrade: string
    remarks: "PASSED" | "FAILED"
  }[] = []

  for (const s of students.slice(0, 20)) {
    const courseSubjects = subjects.filter(
      (sub) => sub.courseId === s.courseId && introSubjectCodes.has(sub.code),
    )

    for (const sub of courseSubjects) {
      gradeRecords.push({
        studentId: s.id,
        subjectId: sub.id,
        courseId: s.courseId,
        encodedByUserId,
        prelim: "82.00",
        midterm: "85.00",
        finals: "88.00",
        finalGrade: "85.00",
        remarks: "PASSED",
      })
    }
  }

  if (gradeRecords.length > 0) {
    await db.insert(grade).values(gradeRecords).onConflictDoNothing()
  }

  console.log(`   ✅ ${gradeRecords.length} grade records seeded.`)
}

// ─── 7. Reservations ─────────────────────────────────────────────────────────

async function seedReservations(
  students: { id: string; courseId: string }[],
  subjects: { id: string; code: string; courseId: string }[],
) {
  console.log("\n📝 Seeding reservations...")

  // Reserve 2–3 subjects per student for first 15 students
  // (only non-prerequisite-gated subjects to keep it simple)
  const safeSubjectCodes = new Set([
    "CS101",
    "CS102",
    "IT101",
    "IT102",
    "ECE101",
    "ME101",
    "BA101",
    "BA102",
  ])

  const reservations: { studentId: string; subjectId: string }[] = []

  for (const s of students.slice(0, 15)) {
    const eligible = subjects.filter(
      (sub) => sub.courseId === s.courseId && safeSubjectCodes.has(sub.code),
    )

    for (const sub of eligible.slice(0, 2)) {
      reservations.push({ studentId: s.id, subjectId: sub.id })
    }
  }

  if (reservations.length > 0) {
    await db
      .insert(subjectReservation)
      .values(reservations)
      .onConflictDoNothing()
  }

  console.log(`   ✅ ${reservations.length} reservations seeded.`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting full system seed...")

  const admin = await seedAdmin()
  const courses = await seedCourses()
  const subjects = await seedSubjects(courses)
  await seedPrerequisites(subjects)
  const students = await seedStudents(courses)
  await seedGrades(students, subjects, admin.id)
  await seedReservations(students, subjects)

  console.log("\n✅ Seed complete!")
  console.log("\n📋 Admin Credentials:")
  console.log("   Email:    admin@sis.edu")
  console.log("   Password: Admin@1234")
  process.exit(0)
}

main().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
