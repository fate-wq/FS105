const express = require('express');
const {setData} = require('../controllers/dataController');

const router = express.Router();

router.post('/data',setData);

module.exports = router;