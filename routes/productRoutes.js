const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyModerator } = require('../middleware/authMiddleware');

//public routes (no authentication required)
router.get('/featured-products', productController.getFeaturedProducts);
router.get('/latest-resources', productController.getLatestResources);

//user specific routes (authentication required)
router.get('/getSubmittedProduct/:email', productController.getSubmittedProduct);
router.post('/submitProduct', productController.postSubmittedProduct);

//moderator-only routes (authentication and moderator role required)
router.get('/getallsubmittedproducts/:email', verifyToken, verifyModerator, productController.getAllSubmittedProducts);
router.patch('/approvependingproducts/:email/:id', verifyToken, verifyModerator, productController.approvedPendingProducts)

//product management routes (authentication required)
router.delete('/deleteUserProduct/:productId', productController.deleteUserProduct);

module.exports = router;