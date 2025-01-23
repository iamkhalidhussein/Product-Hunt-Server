const { client } = require('../config/db');

const latestResourcesCollection = client.db('latestResources').collection('products');
const featuredProductsCollection = client.db("featuredProducts").collection("Products");
const subscribedUserCollection = client.db("subscribedUsers").collection("users");
const userProfileInfoCollection = client.db("Resource-fyi").collection("UserProfileInfo");

module.exports = { latestResourcesCollection, featuredProductsCollection, subscribedUserCollection, userProfileInfoCollection };