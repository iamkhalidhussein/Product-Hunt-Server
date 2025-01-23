const admin = require('firebase-admin');
const serviceAccount = require(process.env.Firebase-AdminSDK);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;