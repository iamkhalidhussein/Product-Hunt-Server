const jwt = require('jsonwebtoken');
require('dotenv').config();


const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'forbidden access' });
    }
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).send({ message: 'forbidden access' });
        }
        req.decoded = decoded;
        next();
    });
};

const verifyAdmin = async (req, res, next) => {
    const email = req.decoded.email;
    const user = await req.db.userCollection.findOne({ email });
    if (user?.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };
