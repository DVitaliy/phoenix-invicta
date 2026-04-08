# Phoenix Invicta

This project is a Node.js and TypeScript backend application that uses MariaDB as its database.

## Requirements

- Node.js 25 (version 25 uses its built-in `process.loadEnvFile()` API to load `.env` variables without third-party libraries)
- pnpm
- Docker and Docker Compose

## Local Setup

1. Clone the repository.
2. Copy [.env.example](.env.example) to `.env`.
3. Install dependencies:

```bash
pnpm install
```

## Database Setup

Start the database containers:

```bash
pnpm db:up
```

Initialize the database:

```bash
pnpm db:init
```

This step creates the database and imports the prepared SQL schema from [sql/schema.sql](sql/schema.sql).

Seed the database with test data:

```bash
pnpm db:seed
```

## Run the Project

Development mode:

```bash
pnpm dev
```

Production mode:

```bash
pnpm prod
```

## API Endpoints

After the application starts, the following endpoints are available:

- `POST /scores` accepts a new score event from a user.

Request body example:

```json
{ "user_id": 1, "value": 150 }
```

- `GET /leaderboard` returns the top 100 users by total score.

Response example:

```json
[
  {
    "rank": 1,
    "username": "alice",
    "total_score": 15420,
    "average_score": 154.2,
    "last_activity": "2025-03-28T14:22:00Z"
  }
]
```

- `GET /users/:id/rank` returns the current rank of a specific user in the global leaderboard.

Response example:

```json
{ "user_id": 1, "username": "alice", "rank": 42, "total_score": 15420 }
```

- `GET /health` is an additional health check endpoint that returns the application status.

## Available Scripts

- `pnpm dev` runs the server in development mode with automatic reload.
- `pnpm prod` builds the project and starts the compiled server.
- `pnpm db:up` starts the MariaDB and Adminer containers.
- `pnpm db:init` creates the database and applies the schema from `sql/schema.sql`.
- `pnpm db:seed` fills the database with test data.

## Technical Decisions

The implementation follows the constraints defined in the assignment: TypeScript, Node.js, Express, and MariaDB, with the project prepared for submission as a GitHub repository with a README. Given the estimated time limit of 2 to 3 hours, the focus was on a straightforward solution that is easy to run locally.

Database queries are written directly without using an ORM. This keeps the data access layer explicit and avoids adding extra abstraction for a relatively small project.

Docker Compose is used to run the database locally. This makes the setup more consistent and reduces the amount of manual environment configuration required to start the project.

For request validation, `zod` is used for one endpoint, which keeps the validation logic explicit without adding extra complexity across the whole project.

## What I Would Improve With More Time

Measurements show that the current GET queries perform aggregation over all relevant rows on each request.

With more time, I would add caching for these aggregated reads to reduce repeated database work and improve response times without changing the existing schema.
