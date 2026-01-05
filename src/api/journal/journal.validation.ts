import { z } from "zod";
export const CreatePrentIssueSchema = z.object({
  issue: z.string("Issue is required").min(1, "Issue is required"),
  year: z.string("Year is required"),

});

export const CreateJournalIssueSchema = z.object({
  volume: z.string("Volume is required").min(1, "Volume is required"),
  month: z.string("Month is required"),
  parentId: z.number("Parent ID is required"),
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
