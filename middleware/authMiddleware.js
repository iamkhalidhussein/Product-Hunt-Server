const jwt = require('jsonwebtoken');
require('dotenv').config();
const { userProfileInfoCollection } = require('../models/userModel');
const firebaseAdmin = require('../firebase-sdk/firebase-admin-sdk');

const verifyToken = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'forbidden access' });
    }
    
    const token = req.headers.authorization.split(' ')[1];
    const isfirebaseToken = req.headers.firebase;

    if(token && !isfirebaseToken) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
            if (error) {
                return res.status(401).send({ message: 'forbidden access' });
            }
            req.decoded = decoded;
            next();
        });
    } else if(isfirebaseToken) {
        try {
            const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
            req.user = decodedToken;
            next();
        } catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).send({ message: 'Unauthorized: Invalid token' });
        }
    }
    
};

const verifyAdmin = async (req, res, next) => {
    const email = req.decoded.email;
    const user = await userProfileInfoCollection.findOne({ email });
    if (user?.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' });
    }
    next();
};

const verifyModerator = async (req, res, next) => {
    const email = req.params.email;
    const query = {email: email};
    const user = await userProfileInfoCollection.findOne(query);
    if(user?.moderator !== 'true') {
        return res.status(403).send({ message: 'forbidden access' });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin, verifyModerator };
