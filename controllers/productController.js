const { featuredProductsCollection, latestResourcesCollection } = require('../models/productModel');

const getFeaturedProducts = async (req, res) => {
    const result = await featuredProductsCollection.find().toArray();
    res.send(result);
};

const getLatestResources = async (req, res) => {
    const result = await latestResourcesCollection.find().toArray();
    res.send(result);
}

// Define other product-related controllers...

module.exports = { getFeaturedProducts, getLatestResources,/* other controllers */ };
