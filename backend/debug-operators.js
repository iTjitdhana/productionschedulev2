const pool = require('./dist/config/database').default;

async function debugOperators() {
  try {
    console.log('🔍 Debugging operators query...');
    
    // Get work plan IDs first
    const [workPlanRows] = await pool.query(`
      SELECT id FROM work_plans WHERE production_date = ? ORDER BY start_time;
    `, ['2025-10-17']);
    
    const workPlanIds = workPlanRows.map(row => row.id);
    console.log(`📊 Work plan IDs: [${workPlanIds.join(', ')}]`);
    
    // Query operators
    const [operatorRows] = await pool.query(`
      SELECT 
        wpo.work_plan_id,
        wpo.user_id,
        wpo.id_code,
        wpo.role,
        u.name as user_name,
        u.position,
        u.department
      FROM work_plan_operators wpo
      LEFT JOIN users u ON wpo.id_code = u.id_code
      WHERE wpo.work_plan_id IN (?)
      ORDER BY wpo.work_plan_id, wpo.id;
    `, [workPlanIds]);
    
    console.log(`\n👥 Operator assignments: ${operatorRows.length} records`);
    operatorRows.forEach((row, index) => {
      console.log(`${index + 1}. Plan ID: ${row.work_plan_id}, ID Code: ${row.id_code}, Name: ${row.user_name || 'NULL'}`);
    });
    
    // Group by work plan
    const operatorsByPlan = new Map();
    operatorRows.forEach(row => {
      if (!operatorsByPlan.has(row.work_plan_id)) {
        operatorsByPlan.set(row.work_plan_id, []);
      }
      operatorsByPlan.get(row.work_plan_id).push(row);
    });
    
    console.log('\n📋 Operators grouped by work plan:');
    operatorsByPlan.forEach((operators, planId) => {
      console.log(`Plan ${planId}: ${operators.length} operators`);
      operators.forEach(op => {
        console.log(`  - ${op.id_code} (${op.user_name || 'No name'})`);
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugOperators();
