CREATE TYPE "public"."user_role" AS ENUM('student', 'staff', 'admin');--> statement-breakpoint
CREATE TYPE "public"."subject_reservation_status" AS ENUM('RESERVED', 'CANCELLED', 'APPROVED', 'DENIED');--> statement-breakpoint
CREATE TYPE "public"."grade_remarks" AS ENUM('PASSED', 'FAILED');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"password" text,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"student_id" text,
	"isActive" boolean DEFAULT true,
	"isBlocked" boolean DEFAULT false,
	"isSuspended" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"student_no" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"birth_date" date,
	"course_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_student_no_unique" UNIQUE("student_no"),
	CONSTRAINT "students_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"units" integer NOT NULL,
	"slot_limit" integer DEFAULT 10 NOT NULL,
	"course_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_course_id_code_unique" UNIQUE("course_id","code"),
	CONSTRAINT "subjects_course_id_title_unique" UNIQUE("course_id","title")
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" text PRIMARY KEY NOT NULL,
	"prelim" numeric(5, 2),
	"midterm" numeric(5, 2),
	"finals" numeric(5, 2),
	"final_grade" numeric(5, 2),
	"remarks" "grade_remarks",
	"student_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"course_id" text NOT NULL,
	"encoded_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "grades_student_id_subject_id_course_id_unique" UNIQUE("student_id","subject_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "subject_reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"status" "subject_reservation_status" DEFAULT 'RESERVED' NOT NULL,
	"reserved_at" timestamp DEFAULT now() NOT NULL,
	"student_id" text NOT NULL,
	"subject_id" text NOT NULL,
	CONSTRAINT "subject_reservations_student_id_subject_id_unique" UNIQUE("student_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "subject_prerequisites" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"prerequisite_subject_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subject_prerequisites_subject_id_prerequisite_subject_id_unique" UNIQUE("subject_id","prerequisite_subject_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_encoded_by_user_id_users_id_fk" FOREIGN KEY ("encoded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_reservations" ADD CONSTRAINT "subject_reservations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_reservations" ADD CONSTRAINT "subject_reservations_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_prerequisites" ADD CONSTRAINT "subject_prerequisites_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_prerequisites" ADD CONSTRAINT "subject_prerequisites_prerequisite_subject_id_subjects_id_fk" FOREIGN KEY ("prerequisite_subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;