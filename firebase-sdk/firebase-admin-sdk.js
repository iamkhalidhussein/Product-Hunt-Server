const admin = require('firebase-admin');
const serviceAccount = require('./resource-fyi-firebase-adminsdk-9itrx-3192faa0c4.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;