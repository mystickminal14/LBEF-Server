import { z } from "zod";

export const EStudyModeEnum = z.enum(["MORNING", "DAY", "EVENING", "WEEKEND"]);

export const EPrefixEnum = z.enum(["MR", "MS"]);

export const AlumniFormSchema = z.object({
  collegeRollNo: z.string().min(1, "College roll number is required"),
  uniRollNo: z.string().min(1, "University roll number is required"),
  prefix: EPrefixEnum,
  fullName: z.string().min(1, "Full name is required"),
  degree: z.string().min(1, "Degree is required"),
  yearOfPassing: z.string(),
  mode: EStudyModeEnum,
  email: z.string().email("Invalid email address"),
  presentEmployer: z.string().optional(),

  mobileNo: z.string(),

  designation: z.string().optional(),
  presentCountry: z.string().optional(),
});
