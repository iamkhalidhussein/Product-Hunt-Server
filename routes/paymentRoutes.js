const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/create-payment', paymentController.createPayment);
router.post('/success-payment', paymentController.successPayment);
router.post('/cancel-payment', paymentController.cancelPayment);
router.post('/failed-payment', paymentController.failedPayment);
// Define other payment-related routes...

module.exports = router;
