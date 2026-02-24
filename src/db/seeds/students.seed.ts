import { db } from "../../config/database"
import { course } from "../schema/course"
import { student } from "../schema/student"

const COURSES = [
  { code: "BSCS", name: "Bachelor of Science in Computer Science" },
  { code: "BSIT", name: "Bachelor of Science in Information Technology" },
  { code: "BSECE", name: "Bachelor of Science in Electronics Engineering" },
  { code: "BSME", name: "Bachelor of Science in Mechanical Engineering" },
  { code: "BSBA", name: "Bachelor of Science in Business Administration" },
]

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

async function seed() {
  console.log("🌱 Seeding students...")

  // Upsert courses so the FK constraint is satisfied
  const seededCourses = await db
    .insert(course)
    .values(COURSES)
    .onConflictDoNothing()
    .returning()

  // If some already existed, fetch them
  const allCourses =
    seededCourses.length === COURSES.length
      ? seededCourses
      : await db.query.course.findMany()

  const students = Array.from({ length: 50 }, (_, i) => {
    const index = i + 1
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length]
    const lastName = LAST_NAMES[i % LAST_NAMES.length]
    const courseId = allCourses[i % allCourses.length].id
    const year = new Date().getFullYear()
    const studentNo = `${year}-${String(index).padStart(5, "0")}`
    const birthYear = 2000 + (i % 6)
    const birthDate = `${birthYear}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`

    return {
      studentNo,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(" ", "")}${index}@student.edu`,
      birthDate,
      courseId,
    }
  })

  const inserted = await db
    .insert(student)
    .values(students)
    .onConflictDoNothing()
    .returning()

  console.log(`✅ Seeded ${inserted.length} students successfully.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err)
  process.exit(1)
})
