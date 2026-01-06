import { z } from "zod";

export const JournalSchema = z.object({
  year: z.string().min(1, "Year is required"),
  month: z.string().min(1, "Month is required"),
  issue: z.string().min(1, "Issue is required"),
  volume: z.string().min(1, "Volume is required"),
});

export const CreateJournalDetailsSchema = z.object({
  journalId: z.number(),
  title: z.string().min(1),
  authors: z.array(z.string()).min(1),
  pages: z.string(),
  subject: z.string(),
  country: z.string(),
  abstract: z.string(),
  availableOnline: z.coerce.date(),
  keywords: z.array(z.string()).min(1),
  link: z.string().optional(),
});

export const EditJournalDetailsSchema = z.object({
  title: z.string().optional(),
  authors: z.array(z.string()).optional(),
  pages: z.string().optional(),
  subject: z.string().optional(),
  country: z.string().optional(),
  abstract: z.string().optional(),
  availableOnline: z.coerce.date().optional(),
  keywords: z.array(z.string()).optional(),
  link: z.string().optional(),
});
