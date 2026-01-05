import { z } from "zod";

export const AlumniSchema = z.object({
  name: z.string("Full Name is required"),
  position: z.string().optional(),
  batch: z.string("Batch is required"),
  course: z.string("Course is required"),
  story: z.string("Story is required"),
  image: z.string().optional(),
 link: z.string().optional(),

});
