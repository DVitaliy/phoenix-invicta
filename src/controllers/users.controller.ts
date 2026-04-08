import type { NextFunction, Request, Response } from "express"
import { pool } from "../db/pool"

type RankRow = {
  user_id: number | string
  username: string
  rank: number | string
  total_score: number | string
}

export const getUserRank = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  const userId = Number(req.params.id)

  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({
      message: "Invalid user id"
    })
    return
  }

  let conn

  try {
    conn = await pool.getConnection()

    const rows = await conn.query<RankRow[]>(
      `
      WITH user_totals AS (
        SELECT
          s.user_id,
          SUM(s.value) AS total_score
        FROM scores s
        GROUP BY s.user_id
      )
      SELECT
        target.user_id,
        u.username,
        COUNT(higher.user_id) + 1 AS rank,
        target.total_score
      FROM user_totals AS target
      INNER JOIN users u ON u.id = target.user_id
      LEFT JOIN user_totals AS higher ON higher.total_score > target.total_score
      WHERE target.user_id = ?
      GROUP BY target.user_id, u.username, target.total_score
    `,
      [userId]
    )

    if (rows.length === 0) {
      res.status(404).json({
        message: "User not found or has no scores"
      })
      return
    }

    const row = rows[0]

    res.json({
      user_id: Number(row.user_id),
      username: row.username,
      rank: Number(row.rank),
      total_score: Number(row.total_score)
    })
  } catch (error: unknown) {
    next(error)
  } finally {
    conn?.release()
  }
}
