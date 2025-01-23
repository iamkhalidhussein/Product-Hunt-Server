const { ObjectId } = require('mongodb');
const { featuredProductsCollection, latestResourcesCollection } = require('../models/productModel');

//fetch all approved featured products
const getFeaturedProducts = async (req, res) => {
    try {
        const result = await featuredProductsCollection.find({ status: "approved" }).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching featured products:", error);
        res.status(500).send("Internal Server Error");
    }
};

//fetch all latest resources
const getLatestResources = async (req, res) => {
    try {
        const result = await latestResourcesCollection.find().toArray();
        res.send(result);
    } catch (error) {
        console.error('Error fetching latest resources:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

//submit a new product
const postSubmittedProduct = async (req, res) => {
    try {
        const userData = req.body;
        const result = await featuredProductsCollection.insertOne(userData);
        res.send(result);
    } catch (error) {
        console.error('Error submitting product:', error);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

//fetch submitted products by user email
const getSubmittedProduct = async (req, res) => {
    try {
        const email = req.params.email;
        const query = {creatorEmail: email};
        const result = await featuredProductsCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        console.error('Error fetching submitted products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// fetch all pending submitted products (for moderators)
const getAllSubmittedProducts = async (req, res) => {
    try {
        const result = await featuredProductsCollection.find({ status: "pending" }).toArray();
        res.send(result);
    } catch (error) {
        console.error('Error fetching all submitted products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// delete a user's product by product ID
const deleteUserProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const query = { _id: new ObjectId(productId)};
        const result = await featuredProductsCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// approve a pending product by product ID via moderator
const approvedPendingProducts = async (req, res) => {
    const productId = req.params.id;
    const query = { _id: new ObjectId(productId) };
    const updatedData = { $set: { status: 'approved' } };

    try {
        const result = await featuredProductsCollection.updateOne(query, updatedData);
        if(result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product approved successfully', result });
    } catch (error) {
        console.error('Error approving product:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

module.exports = { 
    getFeaturedProducts, 
    getLatestResources, 
    postSubmittedProduct, 
    getSubmittedProduct, 
    deleteUserProduct, 
    getAllSubmittedProducts, 
    approvedPendingProducts 
};