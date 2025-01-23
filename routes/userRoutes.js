const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

//authentication routes
router.post('/jwt', userController.jwtController);

//user profile routes
router.get('/userprofileinfo/:email', verifyToken, userController.getUserProfileInfo)
router.post('/userprofileinfo/:email', verifyToken, userController.postUserProfileInfo)
router.patch('/updateuserprofileinfo/:email', userController.updateUserProfileInfo)

//admin routes
router.get('/admin/:email', verifyToken, userController.getAdminStatus);

//moderator routes
router.get('/moderator/:email', verifyToken,userController.getModeratorStatus);

//payment info routes
router.get('/paymentinfo/:email', userController.getPaymentInfo);

//upvote routes
router.patch('/:useremail/:cartId', userController.doUpvote);
router.patch('/userrs/:useremail/:cartId', userController.doUpvoteFeatured);

//general user routes (admin-only)
router.get('/', verifyToken, verifyAdmin, userController.getUsers);

module.exports = router;