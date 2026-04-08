import { Router } from "express"
import { getLeaderboard } from "./controllers/leaderboard.controller"
import { postScores } from "./controllers/scores.controller"
import { getUserRank } from "./controllers/users.controller"
import { validateBody } from "./middlewares/validate"
import { postScoreSchema } from "./schemas/score.schema"

const router = Router()

router.get("/health", (_req, res) => {
  res.json({
    status: "ok"
  })
})

router.get("/leaderboard", getLeaderboard)
router.post("/scores", validateBody(postScoreSchema), postScores)
router.get("/users/:id/rank", getUserRank)

export default router
