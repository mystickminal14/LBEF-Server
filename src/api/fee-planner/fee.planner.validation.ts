import { z } from "zod";

export const CreateParentSchema = z.object({
  session: z.string("Session is required").min(1, "Session cannot be empty"),
  year: z.string("Year is required").min(1, "Year cannot be empty"),

});

export const CreateFileSchema = z.object({
  parentId: z.number("Parent ID is required"),

  course: z.string().min(1, "course is required"),

  semester: z
    .string("semester is required")
    .trim()
    .min(1, "Intake cannot be empty"),
  file: z.string("File is required").trim().min(1, "File path cannot be empty"),
});

export const BulkCreateFilesSchema = z.object({
  parentId: z.number(),
  records: z
    .array(
      z.object({
        semester: z.string().min(1, "Semester is required"),
        course: z.string().min(1, "course is required"),
      })
    )
    .min(1, "At least one record is required"),
});
