import { z } from "zod";

export const RecognitionSchema = z.object({
  name: z.string("Full Name is required"),
  description: z.string("Description is required"),
  image: z.string().optional(),
});
