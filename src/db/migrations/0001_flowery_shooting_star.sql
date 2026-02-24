ALTER TABLE "subjects" ADD CONSTRAINT "subjects_course_id_code_unique" UNIQUE("course_id","code");--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_course_id_title_unique" UNIQUE("course_id","title");--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_student_id_subject_id_course_id_unique" UNIQUE("student_id","subject_id","course_id");--> statement-breakpoint
ALTER TABLE "subject_reservations" ADD CONSTRAINT "subject_reservations_student_id_subject_id_unique" UNIQUE("student_id","subject_id");--> statement-breakpoint
ALTER TABLE "subject_prerequisites" ADD CONSTRAINT "subject_prerequisites_subject_id_prerequisite_subject_id_unique" UNIQUE("subject_id","prerequisite_subject_id");