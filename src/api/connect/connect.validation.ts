
import { z } from "zod";

export const uploadSchema = z.object({
  duration: z.string().optional(),
  issue: z.string().optional(),
  volume: z.string().optional(),
});
