import type { NextFunction, Request, Response } from "express"
import { performance } from "node:perf_hooks"
import { pool } from "../db/pool"

type LeaderboardRow = {
  rank: number
  user_id?: number
  username: string
  total_score: number | string
  average_score: number | string
  last_activity: Date | string
}

export const getLeaderboard = async (_req: Request, res: Response, next: NextFunction) => {
  let conn

  try {
    conn = await pool.getConnection()

    const start = performance.now()
    const rows = await conn.query<LeaderboardRow[]>(`
      SELECT
        ranked.rank,
        ranked.username,
        ranked.total_score,
        ranked.average_score,
        ranked.last_activity
      FROM (
        SELECT
          RANK() OVER (ORDER BY SUM(s.value) DESC) AS rank,
          u.username,
          SUM(s.value) AS total_score,
          AVG(s.value) AS average_score,
          MAX(s.created_at) AS last_activity
        FROM users u
        INNER JOIN scores s ON s.user_id = u.id
        GROUP BY u.id, u.username
      ) AS ranked
      ORDER BY ranked.rank ASC
      LIMIT 100
    `)

    const end = performance.now()
    console.log(`Rows: ${rows.length}`)
    console.log(`Execution time: ${(end - start).toFixed(2)} ms`)

    res.json(
      rows.map((row) => ({
        rank: Number(row.rank),
        username: row.username,
        total_score: Number(row.total_score),
        average_score: Number(row.average_score),
        last_activity: new Date(row.last_activity).toISOString()
      }))
    )
  } catch (error: unknown) {
    next(error)
  } finally {
    conn?.release()
  }
}
