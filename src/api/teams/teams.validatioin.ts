import { z } from "zod";
export const TeamDepartment = z
  .object({
    name: z.string("Department Name is required" ),
    order: z.number().optional(),

  })


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
  order: z.number().optional(),
  
  position: z.string( "Position is required" ),
  departmentId: z.number( "Department name is required" ),
});


