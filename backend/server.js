const app = require('./app');

const express = require('express');
require('./services/campaignCron');
const PORT = process.env.PORT || 5000;
app.use('/uploads/campaign-banners', express.static('uploads/campaign-banners'));




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
