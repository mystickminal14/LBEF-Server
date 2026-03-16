
import { z } from "zod";

export const uploadSchema = z.object({
  duration: z.string().optional(),
 issue: z.coerce.number().int().optional(),
  volume: z.coerce.number().int().optional()
});
