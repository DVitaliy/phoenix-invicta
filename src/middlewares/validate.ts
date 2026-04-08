import type { NextFunction, Request, Response } from "express"
import type { ZodType } from "zod"
import { z } from "zod"

export const validateBody =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      res.status(400).json({
        message: "Validation error",
        errors: z.flattenError(result.error)
      })
      return
    }

    req.body = result.data
    next()
  }
