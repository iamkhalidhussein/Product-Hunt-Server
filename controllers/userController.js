const { userCollection, latestResourcesCollection, featuredProductsCollection, subscribedUserCollection } = require('../models/userModel');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const getUsers = async (req, res) => {
    const result = await userCollection.find().toArray();
    res.send(result);
};

const doUpvote = async (req, res) => {
    const cartId = req.params.cartId;
    const userEmail = req.params.useremail;
    const filter = { _id: new ObjectId(cartId), email: userEmail };

    // Check if the user has already upvoted within the specified cart
    const currentUser = await latestResourcesCollection.findOne(filter);

    if (currentUser) {
        // User has already upvoted, decrement the upvote count and mark as not upvoted
        const updatedDoc = {
            $set: {
                upvote: currentUser.previousUpvote,
                upvoted: false + ' ' + userEmail,
                email: null
            }
        };
        const result = await latestResourcesCollection.updateOne(filter, updatedDoc);
        res.send(result);
    } else {
        // User has not upvoted, increment the upvote count and mark as upvoted
        const latestResource = await latestResourcesCollection.findOne({ _id: new ObjectId(cartId) });
        const updatedDoc = {
            $set: {
                upvote: latestResource.upvote + 1,
                upvoted: true + ' ' + userEmail,
                previousUpvote: latestResource.upvote,
                email: userEmail
            }
        };
        const result = await latestResourcesCollection.updateOne({ _id: new ObjectId(cartId) }, updatedDoc);
        res.send(result);
    }
}

const doUpvoteFeatured = async (req, res) => {
    const cartId = req.params.cartId;
    const userEmail = req.params.useremail;
    console.log(cartId, userEmail)
    const filter = { _id: new ObjectId(cartId), email: userEmail };
    const creatorFilter = { _id: new ObjectId(cartId), creatorEmail: userEmail };
    const creator = await featuredProductsCollection.findOne(creatorFilter);
    if(creator) {
        console.log('can not vote your own product');
        res.send(true)
        return;
    }
    // Check if the user has already upvoted within the specified cart
    const currentUser = await featuredProductsCollection.findOne(filter);
    
    console.log('current user ln: 149',currentUser?.email)
    if (currentUser) {
        // User has already upvoted, decrement the upvote count and mark as not upvoted
        const updatedDoc = {
            $set: {
                upvote: currentUser.previousUpvote,
                upvoted: false + ' ' + userEmail,
                email: null
            }
        };
        const result = await featuredProductsCollection.updateOne(filter, updatedDoc);
        res.send(result);
    } else {
        // User has not upvoted, increment the upvote count and mark as upvoted
        const featuredProducts = await featuredProductsCollection.findOne({ _id: new ObjectId(cartId) });
        console.log('featured products:',featuredProducts)
        console.log('featured products upvote: ',featuredProducts.upvote)
        console.log('featured products upvote: ',featuredProducts.upvote)
        const updatedDoc = {
            $set: {
                upvote: featuredProducts.upvote + 1,
                upvoted: true + ' ' + userEmail,
                previousUpvote: featuredProducts.upvote,
                email: userEmail
            }
        };
            const result = await featuredProductsCollection.updateOne({ _id: new ObjectId(cartId) }, updatedDoc);
        res.send(result);
    }
}

const getPaymentInfo = async (req, res) => {
    const email = req.params.email;
    const filter = {email: email};
    const result = await subscribedUserCollection.findOne(filter);
    res.send(result);
}

const getAdminStatus = async (req, res) => {
    const email = req.params.email;
    if(email !== req.decoded.email) {
        return req.status(403).send({message: 'unauthorized access'})
    }
    const query = {email: email};
    const user = await userCollection.findOne(query);
    let admin = false;
    if(user) {
        admin = user?.role === 'admin'
    }
    res.send({admin});
}

const getModeratorStatus = async (req, res) => {
    const email = req.params.email;
    if(email !== req.decoded.email) {
        return req.status(403).send({message: 'unauthorized access'})
    }
    const query = {email: email};
    const user = await userCollection.findOne(query);
    let moderator = false;
    if(user) {
        moderator = user?.moderator === true
    }
    res.send({moderator});
}

const jwtController = async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
    res.send({token});
}
// Define other user-related controllers...

module.exports = { getUsers, doUpvote, doUpvoteFeatured, getPaymentInfo, getAdminStatus, getModeratorStatus, jwtController,/* other controllers */ };
