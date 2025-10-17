const pool = require('./dist/config/database').default;

async function checkAllData() {
  try {
    // Check if there's any test data with ID 1
    const [testRows] = await pool.query('SELECT * FROM work_plans WHERE id = 1');
    console.log('Work plan with ID 1:', testRows);
    
    // Check all work plans for today
    const [todayRows] = await pool.query('SELECT id, job_name FROM work_plans WHERE production_date = ? ORDER BY id', ['2025-10-17']);
    console.log('\nAll work plans for 2025-10-17:');
    todayRows.forEach(row => console.log(`ID: ${row.id}, Job: ${row.job_name}`));
    
    // Check if there are any test work plans
    const [testWorkPlans] = await pool.query('SELECT * FROM work_plans WHERE job_name LIKE ?', ['%ทดสอบ%']);
    console.log('\nTest work plans:', testWorkPlans);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllData();
