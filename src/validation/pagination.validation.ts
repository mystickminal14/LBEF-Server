import { z } from "zod";

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 1))
    .refine(
      (val) => Number.isSafeInteger(val) && val >= 1,
      "Page must be a positive integer"
    ),

  limit: z
    .string()
    .optional()
    .transform((val) => Number(val ?? 10))
    .refine(
      (val) =>
        Number.isSafeInteger(val) && val >= 1 && val <= 50,
      "Limit must be between 1 and 50"
    ),
});
