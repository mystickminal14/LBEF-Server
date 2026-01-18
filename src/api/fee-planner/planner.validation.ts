import { z } from "zod";

export const CreateFeeYearSchema = z.object({
  year: z.string().min(1, "Year cannot be empty"),
  session: z.string().min(1, "Session cannot be empty"),
});

export const CreateFeePlannerSchema = z.object({
  feeYearId: z.string("Fee Year ID is required"),
  course: z.string("Course is required"),
  semester: z.string().trim().min(1, "Semester cannot be empty"),
});
