require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.PGHOST || 'db',
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
});

app.get('/', async (req, res) => {
  res.json({ message: 'Week4 API: hello', api: true });
});

app.get('/items', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, created_at FROM items ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', async (req, res) => {
  try {
    // Check Postgres
    await pool.query('SELECT 1');
    // Check Redis
    const pong = await redis.ping();
    if (pong !== 'PONG') throw new Error('redis-ping-failed');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
