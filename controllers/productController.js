const { ObjectId } = require('mongodb');
const { featuredProductsCollection, latestResourcesCollection } = require('../models/productModel');

const getFeaturedProducts = async (req, res) => {
    try {
        const result = await featuredProductsCollection.find({ status: "approved" }).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching featured products:", error);
        res.status(500).send("Internal Server Error");
    }
};

const getLatestResources = async (req, res) => {
    const result = await latestResourcesCollection.find().toArray();
    res.send(result);
}

const postSubmittedProduct = async (req, res) => {
    const userData = req.body;
    const result = await featuredProductsCollection.insertOne(userData);
    res.send(result);
}

const getSubmittedProduct = async (req, res) => {
    const email = req.params.email;
    const query = {creatorEmail: email};
    const result = await featuredProductsCollection.find(query).toArray();
    res.send(result);
}

const getAllSubmittedProducts = async (req, res) => {
    const result = await featuredProductsCollection.find({ status: "pending" }).toArray();
    res.send(result);
};

const deleteUserProduct = async (req, res) => {
    const productId = req.params.productId;
    const query = { _id: new ObjectId(productId)};
    const result = await featuredProductsCollection.deleteOne(query);
    res.send(result);
}

module.exports = { getFeaturedProducts, getLatestResources, postSubmittedProduct, getSubmittedProduct, deleteUserProduct, getAllSubmittedProducts };