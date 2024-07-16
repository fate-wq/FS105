const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load the .env file from the parent directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function hashPasswords(admins) {
  const hashedAdmins = [];
  for (const admin of admins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    hashedAdmins.push({ username: admin.username, password: hashedPassword });
  }
  return hashedAdmins;
}

async function main() {
  const admins = JSON.parse(process.env.ADMINS);
  const hashedAdmins = await hashPasswords(admins);
  console.log(JSON.stringify(hashedAdmins, null, 2));
}

main();
