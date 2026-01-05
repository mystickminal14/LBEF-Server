import { z } from "zod";
export enum EUserRole {
    SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
 
}

export const UsersSchema = z.object({
  fullname: z
    .string( "Full Name is required" )
    .refine(
      (val) => val.trim().split(" ").length >= 2,
      { message: "Please enter your full name" }
    ),

  email: z
    .string( "Email is required" )
    .email("Invalid email format"),

  username: z
    .string("Username is required" )
    .min(5, { message: "Username must be at least 5 characters" }),

  role: z.nativeEnum(EUserRole).default(EUserRole.MANAGER),
  password: z
    .string( "Password is required" )
    .min(8, { message: "Password must be at least 8 characters long" }),
    
});
