const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, verifyAdmin, userController.getUsers);
router.patch('/:useremail/:cartId', userController.doUpvote);
router.patch('/userrs/:useremail/:cartId', userController.doUpvoteFeatured);
router.get('/paymentinfo/:email', userController.getPaymentInfo);
router.get('/admin/:email', verifyToken, userController.getAdminStatus);
router.get('/moderator/:email', verifyToken,userController.getModeratorStatus);
router.post('/jwt', userController.jwtController)
// Define other user-related routes...

module.exports = router;
