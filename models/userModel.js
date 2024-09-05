const { client } = require('../config/db');

const userCollection = client.db("productHunt").collection("Users");
const latestResourcesCollection = client.db('latestResources').collection('products');
const featuredProductsCollection = client.db("featuredProducts").collection("Products");
const subscribedUserCollection = client.db("subscribedUsers").collection("users");

module.exports = { userCollection, latestResourcesCollection, featuredProductsCollection, subscribedUserCollection };