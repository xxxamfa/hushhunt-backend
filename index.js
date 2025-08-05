// index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 載入路由
const itemRoutes = require('./routes/items');
const bidRoutes = require('./routes/bids');

app.use('/api/items', itemRoutes);
app.use('/api/bids', bidRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 HushHunt backend running on port ${PORT}`);
});
