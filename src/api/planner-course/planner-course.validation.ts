import { z } from "zod";

export const PlannerCourseSchema = z.object({
  name: z.string("Course Name is required"),
});
