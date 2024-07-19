require("dotenv").config();
var admin = require("firebase-admin");
const path = require("path");  // Import the path module

const serviceAccount = require(path.resolve(__dirname, "../../../serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});


const admindb = admin.firestore();
const realtimedb = admin.database();


module.exports = {realtimedb, admindb };
