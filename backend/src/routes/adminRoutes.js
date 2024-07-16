const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const dashboardController = require('../controllers/dashboardController');

// GET route for admin login page
router.get('/admin/login', adminController.showAdminLogin);
router.get('/admin/dashboard', adminController.showAdminDashboard);
router.get('/api/usersCount', dashboardController.getUsersCount);

router.post('/admin/login', adminController.loginAdmin);
router.get('/admin/logout', adminController.adminLogout);

module.exports = router;
