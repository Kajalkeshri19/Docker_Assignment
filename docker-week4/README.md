# Week 4 — Docker Compose Multi-Container App

This project demonstrates a multi-container environment with PostgreSQL, Redis, a Node.js API, an Nginx-served frontend, and a Playwright test runner.

Quick start:

1. Copy `.env.example` to `.env` and adjust values.

2. Build and start all Services:

```bash
docker-compose up --build -d
```

3. Check services:

```bash
docker-compose ps
docker-compose logs -f
```

4. Run tests on demand:

```bash
docker-compose run --rm tests npm test
```

5. Stop the services:

```bash
docker-compose down
```

Notes:
- The `tests` service runs on demand (entrypoint sleeps). Use `docker-compose run` to execute the test command.
- Database initialization is performed via `init.sql` mounted into Postgres entrypoint.
