var admin = require("firebase-admin");
const path = require("path");  // Import the path module

const serviceAccount = require(path.resolve(__dirname, "../../../serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();

module.exports = { db };
