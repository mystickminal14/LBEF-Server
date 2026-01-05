import { z } from "zod";
export enum ETyoe {
  ACADEMIC = "ACADEMIC",
  ADMINISTRATIVE = "ADMINISTRATIVE",
}

export const  NoticeSchema = z.object({
  program_name: z.string("Program Name is required"),
  title: z.string("Title is required"),
  date:  z.string("Date is required"),
    type: z.nativeEnum(ETyoe).default(ETyoe.ADMINISTRATIVE),
  file:z.string().optional()
});
export const noticeTypeSchema = z.enum(["ADMINISTRATIVE", "ACADEMIC"]).optional();
