import app from "./app"
import { env, loadEnvFile } from "node:process"
loadEnvFile()

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`)
})
