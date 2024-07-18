const express = require('express');
const {setData,updateUserData} = require('../controllers/dataController');

const router = express.Router();

router.post('/data',setData);

router.post('/updateProfile', updateUserData);

module.exports = router;