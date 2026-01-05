import { z } from "zod";
export enum EDepartment {
  ADMINISTRATION = "ADMINISTRATION",
  COMPUTING = "COMPUTING",
  MANAGEMENT = "MANAGEMENT",
}

export const TeamsValidation = z.object({
  name: z.string("Full Name is required"),
  image: z.string().optional(),
  position: z.string("Email is required"),
  department: z.nativeEnum(EDepartment).default(EDepartment.MANAGEMENT),
});

export const departmentSchema = z.enum(["MANAGEMENT", "ADMINISTRATION", "COMPUTING"]).optional();
