const pool = require('./dist/config/database').default;

async function debugQuery() {
  try {
    console.log('🔍 Debugging work plans query...');
    
    // Test the exact query from service
    const [workPlanRows] = await pool.query(`
      SELECT 
        wp.id,
        wp.production_date,
        wp.job_code,
        wp.job_name,
        TIME_FORMAT(wp.start_time, '%H:%i') as start_time,
        TIME_FORMAT(wp.end_time, '%H:%i') as end_time,
        wp.status_id,
        wp.machine_id,
        wp.production_room_id,
        wp.notes,
        wp.is_special,
        pr.room_name as location,
        ps.name as status,
        m.machine_name
      FROM work_plans wp
      LEFT JOIN production_rooms pr ON wp.production_room_id = pr.id
      LEFT JOIN production_statuses ps ON wp.status_id = ps.id
      LEFT JOIN machines m ON wp.machine_id = m.id
      WHERE wp.production_date = ?
      ORDER BY wp.start_time;
    `, ['2025-10-17']);
    
    console.log(`\n📊 Query result: ${workPlanRows.length} rows`);
    workPlanRows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, Job: ${row.job_name}, Time: ${row.start_time}-${row.end_time}`);
    });
    
    // Check if there are any NULL values causing issues
    console.log('\n🔍 Checking for potential issues:');
    const nullChecks = workPlanRows.map(row => ({
      id: row.id,
      production_room_id: row.production_room_id,
      status_id: row.status_id,
      machine_id: row.machine_id,
      location: row.location,
      status: row.status,
      machine_name: row.machine_name
    }));
    
    console.log('NULL checks:', nullChecks);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugQuery();
