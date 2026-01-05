import { z } from "zod";
export enum EIntakeStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export const IntakeSchema = z.object({
  intake: z.string("Intake type is required"),
  lastdate: z.string("Last Date is required"),
  duration: z.string("Duration of intake is required"),
  status: z.nativeEnum(EIntakeStatus).default(EIntakeStatus.OPEN),
});
