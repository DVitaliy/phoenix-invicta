import { z } from "zod"

export const postScoreSchema = z.strictObject({
  user_id: z.number().int().positive(),
  value: z.number().int().positive()
})

export type PostScoreInput = z.infer<typeof postScoreSchema>
