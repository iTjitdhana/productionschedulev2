const pool = require('./dist/config/database').default;

async function checkAllTest() {
  try {
    const [rows] = await pool.query('SELECT id, job_name, production_date FROM work_plans WHERE job_name LIKE ? ORDER BY production_date DESC LIMIT 5', ['%ทดสอบ%']);
    console.log('Test work plans in database:', rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllTest();
