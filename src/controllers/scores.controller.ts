import { Request, Response, NextFunction } from "express"
import { PostScoreInput } from "../schemas/score.schema"
import { pool } from "../db/pool"

export const postScores = async (req: Request<unknown, unknown, PostScoreInput>, res: Response, next: NextFunction) => {
  const { user_id, value } = req.body
  let conn

  try {
    conn = await pool.getConnection()

    const users = await conn.query<Array<{ username: string }>>("SELECT username FROM users WHERE id = ? LIMIT 1", [user_id])

    if (users.length === 0) {
      res.status(404).json({
        message: "User not found"
      })
      return
    }

    const insertResult = await conn.query("INSERT INTO scores (user_id, value) VALUES (?, ?)", [user_id, value])

    res.status(201).json({
      id: Number(insertResult.insertId),
      user_id,
      value
    })
  } catch (error: unknown) {
    next(error)
  } finally {
    conn?.release()
  }
}
