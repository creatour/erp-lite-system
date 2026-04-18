const db = require('./config/db')
;(async () => {
  try {
    const [rows] = await db.query('SELECT id, username, email, password_hash, role_id, created_at FROM users LIMIT 5')
    console.log(JSON.stringify(rows, null, 2))
  } catch (err) {
    console.error('DB ERROR', err.message)
    process.exit(1)
  } finally {
    process.exit()
  }
})()
