const { client } = require('../config/db');

const featuredProductsCollection = client.db("featuredProducts").collection("Products");
const latestResourcesCollection = client.db('latestResources').collection('products');

module.exports = { featuredProductsCollection, latestResourcesCollection };