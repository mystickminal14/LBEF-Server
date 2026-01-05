import { z } from "zod";

export const ContactListSchema = z.object({
  name: z.string("Full Name is required"),
  purpose: z.string("Purpose is required"),
  department: z.string("Department is required"),
  email: z.string("Email is required"),
});
