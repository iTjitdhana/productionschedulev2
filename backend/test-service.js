const pool = require('./dist/config/database').default;

async function testService() {
  try {
    console.log('🔍 Testing service logic...');
    
    const date = '2025-10-17';
    
    // Step 1: Query work plans
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
    `, [date]);

    console.log(`📊 Found ${workPlanRows.length} work plans`);
    
    if (workPlanRows.length === 0) {
      console.log('❌ No work plans found');
      return;
    }

    // Step 2: Get work plan IDs
    const workPlanIds = workPlanRows.map(row => row.id);
    console.log(`📋 Work plan IDs: [${workPlanIds.join(', ')}]`);

    // Step 3: Query operators
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

    console.log(`👥 Found ${operatorRows.length} operator assignments`);

    // Step 4: Group operators by work plan
    const operatorsByPlan = new Map();
    operatorRows.forEach(row => {
      if (!operatorsByPlan.has(row.work_plan_id)) {
        operatorsByPlan.set(row.work_plan_id, []);
      }
      
      const displayName = row.user_name || row.id_code;
      
      operatorsByPlan.get(row.work_plan_id).push({
        id_code: row.id_code,
        name: displayName,
        avatar: '',
        position: row.position,
        department: row.department,
        role: row.role,
      });
    });

    // Step 5: Build final result
    const result = workPlanRows.map((row) => {
      return {
        id: row.id,
        production_date: row.production_date,
        job_code: row.job_code,
        job_name: row.job_name,
        start_time: row.start_time,
        end_time: row.end_time,
        status_id: row.status_id,
        machine_id: row.machine_id,
        production_room_id: row.production_room_id,
        notes: row.notes,
        is_special: Boolean(row.is_special),
        location: row.location || 'ไม่ระบุห้อง',
        status: row.status || 'ไม่ระบุสถานะ',
        machine_name: row.machine_name,
        assignees: operatorsByPlan.get(row.id) || [],
        hasSteps: false,  // Simplified for now
        steps: [],        // Simplified for now
      };
    });

    console.log(`\n✅ Final result: ${result.length} work plans`);
    result.forEach((wp, index) => {
      console.log(`${index + 1}. ${wp.job_name} (${wp.start_time}-${wp.end_time}) - ${wp.assignees.length} operators`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testService();
