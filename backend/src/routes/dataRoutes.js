const express = require('express');
const {setData,updateUserData,populateUserData} = require('../controllers/dataController');

const router = express.Router();

router.post('/data',setData);

router.post('/updateProfile', updateUserData);

router.post('/populateData',populateUserData)


module.exports = router;