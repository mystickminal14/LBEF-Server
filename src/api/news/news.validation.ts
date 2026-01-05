import { z } from "zod";

export const NewsSchema = z.object({
  title: z.string().min(1, "News Title is required"),
  content: z.string().min(1, "News Content is required"),
  image: z.string().optional(),
  source: z.string().min(1, "News Source is required"),
  link: z.string().url("News link must be a valid URL"),
  publishedOn: z.string().optional(),  
  publishedOnBS:z.string().optional(), 
});

