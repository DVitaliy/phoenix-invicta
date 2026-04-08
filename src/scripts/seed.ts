import mariadb from "mariadb"
import process, { env, loadEnvFile } from "node:process"

loadEnvFile()

const pool = mariadb.createPool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PWD,
  connectionLimit: 5,
  database: env.DB_NAME,
  trace: true
})

const USERS_COUNT = 100_000
const SCORES_COUNT = 500_000
const BATCH_SIZE = 2_000

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const getRandomDate = () => {
  const now = Date.now()
  const pastDays = 180
  const randomTimestamp = now - getRandomInt(0, pastDays * 24 * 60 * 60 * 1000)
  return new Date(randomTimestamp).toISOString().slice(0, 19).replace("T", " ")
}

const seedUsers = async () => {
  const conn = await pool.getConnection()

  try {
    for (let start = 1; start <= USERS_COUNT; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, USERS_COUNT)
      const usersCountInBatch = end - start + 1

      const placeholders = Array.from({ length: usersCountInBatch }, () => "(?)").join(", ")
      const values = Array.from({ length: usersCountInBatch }, (_, index) => `user_${start + index}`)

      await conn.query(`INSERT INTO users (username) VALUES ${placeholders}`, values)

      console.log(`Users: ${end}/${USERS_COUNT}`)
    }
  } finally {
    conn.release()
  }
}

const seedScores = async () => {
  const conn = await pool.getConnection()

  try {
    for (let inserted = 0; inserted < SCORES_COUNT; inserted += BATCH_SIZE) {
      const currentBatchSize = Math.min(BATCH_SIZE, SCORES_COUNT - inserted)

      const rows = Array.from({ length: currentBatchSize }, () => ({
        userId: getRandomInt(1, USERS_COUNT),
        value: getRandomInt(1, 500),
        createdAt: getRandomDate()
      }))

      const placeholders = rows.map(() => "(?, ?, ?)").join(", ")
      const values = rows.flatMap((row) => [row.userId, row.value, row.createdAt])

      await conn.query(`INSERT INTO scores (user_id, value, created_at) VALUES ${placeholders}`, values)

      console.log(`Scores: ${inserted + currentBatchSize}/${SCORES_COUNT}`)
    }
  } finally {
    conn.release()
  }
}

const clearTables = async () => {
  const conn = await pool.getConnection()

  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0")
    await conn.query("TRUNCATE TABLE scores")
    await conn.query("TRUNCATE TABLE users")
    await conn.query("SET FOREIGN_KEY_CHECKS = 1")
  } finally {
    conn.release()
  }
}

const seed = async () => {
  try {
    console.log("Clearing tables...")
    await clearTables()

    console.log("Seeding users...")
    await seedUsers()

    console.log("Seeding scores...")
    await seedScores()

    console.log("Seeding completed")
  } catch (error: unknown) {
    console.error("Seed failed:", error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

seed()
