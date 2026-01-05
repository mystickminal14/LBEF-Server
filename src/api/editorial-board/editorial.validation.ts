import { z } from "zod";

export enum EHonoraryPosition {
  CHIEF_PATRON = "CHIEF_PATRON",
  PATRON = "PATRON",
  EDITOR_IN_CHIEF = "EDITOR_IN_CHIEF",
  ASSOCIATE_EDITOR = "ASSOCIATE_EDITOR",
  MANAGING_EDITOR = "MANAGING_EDITOR",
  EDITORIAL_BOARD_MEMBER = "EDITORIAL_BOARD_MEMBER",
  ADVISOR = "ADVISOR",
}

export const EditorialValidation = z.object({
  name: z.string("Full Name is required"),
  designation: z.string("Designation is required"),
  honoraryPosition: z.nativeEnum(EHonoraryPosition),
  department: z.string("Department is required"),
  institution: z.string("Institution is required"),
  country: z.string("Country is required"),
});

export const honoraryPositionSchema = z
  .enum([
    "CHIEF_PATRON",
    "PATRON",
    "EDITOR_IN_CHIEF",
    "ASSOCIATE_EDITOR",
    "MANAGING_EDITOR",
    "EDITORIAL_BOARD_MEMBER",
    "ADVISOR",
  ])
  .optional();
