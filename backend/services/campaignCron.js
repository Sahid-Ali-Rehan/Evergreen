const cron = require('node-cron');
const axios = require('axios');

// Run every hour to check campaign status
cron.schedule('0 * * * *', async () => {
  try {
    await axios.post('http://localhost:5000/api/campaigns/check-status');
    console.log('Campaign status check completed at', new Date().toISOString());
  } catch (error) {
    console.error('Error in campaign cron job:', error.message);
  }
});