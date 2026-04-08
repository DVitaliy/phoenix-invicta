import mariadb from "mariadb"
import type { Pool, PoolConfig, PoolConnection } from "mariadb"
import { env, loadEnvFile } from "node:process"
// import fs from "node:fs"
// import path from "node:path"

loadEnvFile()

// const serverCert = [fs.readFileSync(path.join(process.cwd(), "src/db/cert.pem"), "utf8")]

const config: PoolConfig = {
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PWD,
  connectionLimit: 5,
  database: env.DB_NAME,
  trace: true
  //   ssl: {
  //     ca: serverCert
  //   }
}
export type { Pool, PoolConnection }
export const pool = mariadb.createPool(config)
