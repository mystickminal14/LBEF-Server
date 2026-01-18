import { z } from "zod";

export const CreateAcademicYearSchema = z.object({
  year: z.string().min(1, "Year cannot be empty"),
  session: z.string().min(1, "Session cannot be empty"),
});

export const CreateAcademicPlannerSchema = z.object({
  academicYearId: z.string("Academic Year ID is required"),
  plannerCourseId: z.string("Planner course ID is required"),

  semester: z.string().trim().min(1, "Semester cannot be empty"),
  intake: z.string().trim().min(1, "Intake cannot be empty"),
});
