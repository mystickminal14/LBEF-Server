import { z } from "zod";
import { EContentCategory } from "@prisma/client";

export const CourseDetailBlockSchema: z.ZodType<any> = z.object({
  title: z.string().optional(),
  content: z.union([z.string(), z.array(z.string())]).optional(),
  type: z.enum(["HEADING", "SUBHEADING", "PARAGRAPH", "LIST"]),
  order: z.number().optional().default(0),
  category: z.nativeEnum(EContentCategory), // ✅ Added category
  children: z.array(
    z.lazy<z.infer<typeof CourseDetailBlockSchema>>(() => CourseDetailBlockSchema)
  ).optional(),
});

export const CourseDetailArraySchema = z.array(CourseDetailBlockSchema);