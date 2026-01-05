import { z } from "zod";


export const AchievementSchema = z.object({
  achivement: z
    .string( "Achievement  is required" )
  
});
