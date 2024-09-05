const axios = require('axios');
const { payments } = require('../models/paymentModel');

const createPayment = async (paymentInfo) => {
    const trxId = new ObjectId().toString();

    const initiateData = {
        // your SSL Commerz data
    };

    const response = await axios({
        method: 'POST',
        url: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
        data: initiateData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const savedData = {
        cus_name: 'Customer',
        paymentId: trxId,
        amount: paymentInfo.amount,
        status: 'Pending'
    };

    await payments.insertOne(savedData);
    return response.data.GatewayPageURL;
};

module.exports = { createPayment };
