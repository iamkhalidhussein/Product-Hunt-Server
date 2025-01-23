const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyModerator } = require('../middleware/authMiddleware');

router.get('/featured-products', productController.getFeaturedProducts);
router.get('/latest-resources', productController.getLatestResources);
router.post('/submitProduct', productController.postSubmittedProduct);
router.get('/getSubmittedProduct/:email', productController.getSubmittedProduct);
router.delete('/deleteUserProduct/:productId', productController.deleteUserProduct);
router.get('/getallsubmittedproducts/:email', verifyToken, verifyModerator, productController.getAllSubmittedProducts);
router.patch('/approvependingproducts/:email/:id', verifyToken, verifyModerator, productController.approvedPendingProducts)

module.exports = router;
