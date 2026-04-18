require('dotenv').config()
const db = require('./config/db')

async function dumpSchema() {
  try {
    // Get all tables
    const [tables] = await db.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`, [process.env.DB_NAME || 'erp_db'])
    
    let schema = ''
    
    for (const table of tables) {
      const [createTable] = await db.query(`SHOW CREATE TABLE ${table.TABLE_NAME}`)
      schema += createTable[0]['Create Table'] + ';\n\n'
    }
    
    console.log(schema)
    process.exit(0)
  } catch (error) {
    console.error('Error dumping schema:', error)
    process.exit(1)
  }
}

dumpSchema()
