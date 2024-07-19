const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const dashboardController = require('../controllers/dashboardController');

// GET route for admin login page
router.get('/admin/login', adminController.showAdminLogin);
router.get('/admin/dashboard', adminController.showAdminDashboard);
router.get('/admin/showUEN',adminController.showAdminVerification);
router.get('/api/usersCount', dashboardController.getUsersCount);
router.post('/admin/verifyEmployer/:id', adminController.verifyEmployer);
router.post('/admin/rejectEmployer/:id', adminController.rejectEmployer);


router.post('/admin/login', adminController.loginAdmin);
router.get('/admin/logout', adminController.adminLogout);
router.get('/admin/allJobSeeker', adminController.showAdminUser);
router.post('/admin/addUser', adminController.addUser); // Changed to addUser
router.delete('/admin/deleteUser/:userId', adminController.deleteUser); // Use DELETE method for deleteUser
router.put('/admin/editUser/:userId', adminController.editUser);
router.get('/api/timeSpent', dashboardController.getAverageTimeSpent);

module.exports = router;
