

import { z } from "zod";

export enum EShift {
  MORNING = "MORNING",
  BOTH = "BOTH",
  EVENING = "EVENING",
}

export const CourseSchema = z
  .object({
    title: z.string("Course Title is required" ),
    prefix: z.string("Prefix is required" ),
    degree: z.string("Degree Title is required" ),
    details: z.string("Course caption is required" ),
    order: z.number().optional(),
    fullForm: z.string().optional(),
    intake: z.string("Intake Date is required" ),
    brochure: z.string().optional(),
    feeStructure: z.string().optional(),
    slug: z.string().optional(),
    shift: z.nativeEnum(EShift).default(EShift.MORNING),
    credit: z.string("Credit score is required" ),
        duration: z.string().optional(),
    categoryId: z.number("Category ID is required" ),
    semester: z.string().optional(),
  })