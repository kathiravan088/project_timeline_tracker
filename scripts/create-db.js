const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL not set in environment')
  }

  const url = new URL(dbUrl)
  const user = url.username
  const password = url.password
  const host = url.hostname
  const port = url.port || 3306

  console.log('Connecting to MySQL at', host + ':' + port)

  const conn = await mysql.createConnection({ host, port, user, password })
  try {
    await conn.query('CREATE DATABASE IF NOT EXISTS `project_tracker`;')
    console.log('Database `project_tracker` ensured')
  } finally {
    await conn.end()
  }
}

main().catch((e) => {
  console.error('Failed to create database:', e.message)
  process.exit(1)
})
