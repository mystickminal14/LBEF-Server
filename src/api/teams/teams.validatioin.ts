import { z } from "zod";
export enum EDepartment {
  ADMINISTRATION = "ADMINISTRATION",
  COMPUTING = "COMPUTING",
  MANAGEMENT = "MANAGEMENT",
}

export const TeamsValidation = z.object({
  name: z.string( "Full Name is required" ),
  bio: z.string().optional(),
  image: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  portrait: z.string().optional(),
  facebook: z.string().optional(),
  insta: z.string().optional(),
  linkedIn: z.string().optional(),
  position: z.string( "Position is required" ),
  department: z.nativeEnum(EDepartment).default(EDepartment.MANAGEMENT),
});


export const departmentSchema = z.enum(["MANAGEMENT", "ADMINISTRATION", "COMPUTING"]).optional();
