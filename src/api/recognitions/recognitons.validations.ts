import { z } from "zod";

export enum EDepartment {
  RECOGNITION="RECOGNITION",
  PERMISSION="PERMISSION"
}

export const RecognitionSchema = z.object({
  name: z.string("Full Name is required"),
  description: z.string("Description is required"),
  image: z.string().optional(),
    type: z.nativeEnum(EDepartment).default(EDepartment.RECOGNITION),
  
});
