

import { z } from "zod";

export enum EShift {
  BACHELOR = "BACHELOR",
  MASTER = "MASTER",
}

export const DegreeSchema = z
  .object({
    document: z.string("Document Title is required" ),
    type: z.nativeEnum(EShift).default(EShift.BACHELOR),
    
  })
  export const documentTypeSchema = z.nativeEnum(EShift).optional(); // optional query
