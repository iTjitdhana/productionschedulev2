const pool = require('./dist/config/database').default;

async function checkData() {
  try {
    console.log('Checking work plans for 2025-10-17...');
    
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM work_plans WHERE production_date = ?', ['2025-10-17']);
    console.log('Work plans for 2025-10-17:', rows[0].count);
    
    const [allRows] = await pool.query('SELECT id, job_name, production_date FROM work_plans ORDER BY production_date DESC LIMIT 10');
    console.log('\nRecent work plans:');
    allRows.forEach(row => {
      console.log(`ID: ${row.id}, Job: ${row.job_name}, Date: ${row.production_date}`);
    });
    
    // Check specific date
    const [todayRows] = await pool.query('SELECT * FROM work_plans WHERE production_date = ?', ['2025-10-17']);
    console.log(`\nToday's work plans (2025-10-17): ${todayRows.length} records`);
    todayRows.forEach(row => {
      console.log(`- ID: ${row.id}, Job: ${row.job_name}, Time: ${row.start_time}-${row.end_time}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
