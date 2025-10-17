const pool = require('./dist/config/database').default;

async function checkTestData() {
  try {
    const [rows] = await pool.query('SELECT id, job_name FROM work_plans WHERE production_date = ? AND job_name LIKE ?', ['2025-10-17', '%ทดสอบ%']);
    console.log('Test work plans:', rows);
    
    // Check all work plans for today
    const [allRows] = await pool.query('SELECT id, job_name FROM work_plans WHERE production_date = ? ORDER BY start_time', ['2025-10-17']);
    console.log('\nAll work plans for 2025-10-17:');
    allRows.forEach(row => console.log(`ID: ${row.id}, Job: ${row.job_name}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTestData();
