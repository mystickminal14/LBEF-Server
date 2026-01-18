import { z } from "zod";

export const ScholarshipScheduleSchema = z.object({
  scheduleYear: z.string().min(1, "Schedule year is required"),
  regisrationOpenDate: z.string().min(1, "Registration open date is required"),
  lastDate: z.string().min(1, "Last date is required"),
  canDate: z.string().min(1, "CAN date is required"),
  admissionDate: z.string().min(1, "Admission date is required"),
  examDate: z.string().min(1, "Exam date is required"),
});
