import { z } from "zod";

export const CreateFeeYearSchema = z.object({
  year: z.string().min(1, "Year cannot be empty"),
  session: z.string().optional(),
  plannerCourseId: z.number("Planner course ID is required"),
});
export const CreateFeePlannerSchema = z.object({
  feeYearId: z.number("Fee Year ID is required"),

  semester: z.string().trim().min(1, "Semester cannot be empty"),
  file: z.string().trim().min(1, "File path cannot be empty"),
});
