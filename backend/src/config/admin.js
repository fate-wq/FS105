const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
console.log("Test",process.env.ADMINS);
const admins = JSON.parse(process.env.ADMINS);

function adminAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  } else {
    res.redirect('/admin/login');
  }
}

async function verifyAdminCredentials(username, password) {
  const admin = admins.find(admin => admin.username === username);
  if (!admin) {
    return false;
  }
  const isPasswordValid = await bcrypt.compare(password, admin.password);
  return isPasswordValid;
}

module.exports = { adminAuth, verifyAdminCredentials };
