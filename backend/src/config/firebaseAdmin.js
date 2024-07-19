require("dotenv").config();
const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.resolve(__dirname, "../../../serviceAccountKey.json"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

const firestore = admin.firestore();
const realtimedb = admin.database();

module.exports = { firestore, realtimedb };