const { verifyAdminCredentials } = require('../config/admin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

class AdminController {

  showAdminLogin(req, res) {
    res.render('adminLogin'); // Render the admin login EJS template
  }


  async loginAdmin(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(422).json({
        error: "Username and password are required",
      });
    }
  
    try {
      const isValid = await verifyAdminCredentials(username, password);
      if (isValid) {
        req.session.admin = { username }; // Store admin info in session
        res.status(200).json({ message: "Admin logged in successfully" });
      } else {
        res.status(401).json({ error: "Invalid username or password" });
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      res.status(500).json({ error: 'An error occurred while logging in' });
    }
  }
  
  showAdminDashboard(req, res) {
    res.render('adminDash');
  }

  adminLogout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout admin' });
      }
      res.redirect('/admin/login');
    });
  }
}

module.exports = new AdminController();
