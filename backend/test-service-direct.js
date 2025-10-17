const { fetchWorkPlans } = require('./dist/services/workplan.service');

async function test() {
  try {
    console.log('🔍 Testing service directly...');
    const result = await fetchWorkPlans('2025-10-17');
    console.log(`📊 Service result: ${result.length} work plans`);
    result.forEach((wp, i) => {
      console.log(`${i+1}. ${wp.job_name} (${wp.start_time}-${wp.end_time})`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
  process.exit(0);
}

test();
