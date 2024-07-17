const { verifyAdminCredentials } = require('../config/admin');
const path = require('path');
const dotenv = require('dotenv');
const { ref, get, set, update, remove, push } = require('firebase/database');
const { db } = require('../config/firebase');

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

  async showAdminUser(req, res) {
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      const users = [];
      snapshot.forEach((childSnapshot) => {
        users.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      res.render('adminDashboardUser', { users: users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send("An error occurred while fetching users.");
    }
  }

  async addUser(req, res) {
    try {
      const { username, email, password } = req.body;
      const newUserRef = push(ref(db, 'users'));
      const newUserKey = newUserRef.key;

      await set(ref(db, `users/${newUserKey}`), {
        username,
        email,
        createdAt: new Date().toISOString()
      });

      res.status(200).json({ message: "User added successfully", user: { id: newUserKey, username, email } });
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).json({ error: 'An error occurred while adding user.' });
    }
  }
  async deleteUser(req, res) {
    try {
        const userId = req.params.userId;
        await remove(ref(db, `users/${userId}`));
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'An error occurred while deleting user' });
    }
}

async editUser(req, res) {
  try {
      const userId = req.params.userId;
      const updatedUserData = req.body;

      await update(ref(db, `users/${userId}`), updatedUserData);
      res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
      console.error('Error editing user:', error);
      res.status(500).json({ error: 'An error occurred while editing user' });
  }
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
