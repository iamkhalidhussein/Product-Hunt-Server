const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/featured-products', productController.getFeaturedProducts);
router.get('/latest-resources', productController.getLatestResources);
// Define other product-related routes...

module.exports = router;
