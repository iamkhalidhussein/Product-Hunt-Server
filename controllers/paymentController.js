const stripe = require('../config/stripe');
const { payments } = require('../models/paymentModel');
const { ObjectId } = require('mongodb');
const { default: axios } = require('axios');
require('dotenv').config();

const createPaymentIntent = async (req, res) => {
    const { price } = req.body;
    const amount = parseInt(price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card']
    });

    res.send({
        clientSecret: paymentIntent.client_secret
    });
};

const createPayment = async (req, res) => {
    const paymentInfo = req.body;
    const trxId = new ObjectId().toString();
    console.log('initial data: ',trxId)

    const backendUrl = process.env.SERVER_URL;

    const initiateData = {
        store_id:"resou666a864f1b2b6",
        store_passwd:"resou666a864f1b2b6@ssl",
        total_amount: paymentInfo.ammount,
        currency:paymentInfo.currenccy,
        tran_id:trxId,
        success_url:`${backendUrl}/payments/success-payment`,
        fail_url:`${backendUrl}/payments/failed-payment`,
        cancel_url:`${backendUrl}/payments/cancel-payment`,
        cus_name:"Customer Name",
        cus_email:"cust@yahoo.com",
        cus_add1:"Dhaka",
        cus_add2:"Dhaka",
        cus_city:"Dhaka",
        cus_state:"Dhaka",
        cus_postcode:1000,
        cus_country:"Bangladesh",
        cus_phone:"01711111111",
        cus_fax:"01711111111",
        ship_name:"Customer Name",
        shipping_method: 'NO',
        product_name: 'Laptop',
        product_category: 'Laptop',
        product_profile: 'general',
        ship_add1 :"Dhaka",
        ship_add2:"Dhaka",
        ship_city:"Dhaka",
        ship_state:"Dhaka",
        ship_postcode:1000,
        ship_country:"Bangladesh",
        multi_card_name:"mastercard,visacard,amexcard",
        value_a:"ref001_A",
        value_b:"ref002_B",
        value_c:"ref003_C",
        value_d:"ref004_D"
    }
                
    const responce = await axios({
        method: 'POST',
        url: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
        data: initiateData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        
    const savedData = {
        cus_name: 'Customer',
        paymentId: trxId,
        amount: paymentInfo.ammount,
        status: 'Pending'
    }
    console.log('txn id for saved data', trxId);

    const respon = await payments.insertOne(savedData)
    if(respon) {
        console.log(responce)
        res.send({
            paymentUrl: responce.data.GatewayPageURL
        })
}};

const successPayment = async (req, res) => {
    const successData = req.body;

    if(successData.status !== "VALID") {
        console.log(successData.status);
        throw new Error("Unauthorized payment", successData.status);
    }

    //update the database
    const query = {
        paymentId: successData.tran_id
    }

    const update = {
        $set: {
            status: "Success"
        }
    }

    const updateData = await payments.updateOne(query, update);

    console.log('success data', successData, 'updated data:', updateData);

    const clientUrl = process.env.CLIENT_URL;

    const redirectUrl = `${clientUrl}/payment/success?tran_id=${successData.tran_id}&card_issuer=${successData.card_issuer}&tran_date=${successData.tran_date}&currency_type=${successData.currency_type}&amount=${successData.amount}&status=Success`;

    // Redirect the client
    res.redirect(redirectUrl);
}

const cancelPayment = async (req, res) => {
    console.log('payment cancel', req.body);

    const cancelData = req.body;

    if(cancelData.status !== "CANCELLED") {
        console.log(cancelData.status);
        throw new Error("Unauthorized payment", cancelData.status);
    }

    //update the database
    const query = {
        paymentId: cancelData.tran_id
    }

    const update = {
        $set: {
            status: "Canceled"
        }
    }

    const updateData = await payments.updateOne(query, update);

    console.log('cancel data', cancelData, 'updated data:', updateData);

    const clientUrl = process.env.CLIENT_URL;

    const redirectUrl = `${clientUrl}/payment/cancel?tran_id=${cancelData.tran_id}&card_issuer=${cancelData.card_issuer}&tran_date=${cancelData.tran_date}&currency_type=${cancelData.currency_type}&amount=${cancelData.amount}&error=${cancelData.error}&status=Canceled`;

    // Redirect the client
    res.redirect(redirectUrl);
}

const failedPayment = async (req, res) => {
    console.log('payment failed', req.body);

    const failedData = req.body;

    if(failedData.status !== "FAILED") {    
        console.log(failedData.status);
        throw new Error("Unauthorized payment", failedData.status);
    }

    //update the database
    const query = {
        paymentId: failedData.tran_id
    }

    const update = {
        $set: {
            status: "Failed"
        }
    }

    const updateData = await payments.updateOne(query, update);

    console.log('cancel data', failedData, 'updated data:', updateData);

    const clientUrl = process.env.CLIENT_URL;
    
    const redirectUrl = `${clientUrl}/payment/failed?tran_id=${failedData.tran_id}&card_issuer=${failedData.card_issuer}&tran_date=${failedData.tran_date}&currency_type=${failedData.currency_type}&amount=${failedData.amount}&error=${failedData.error}&status=Failed`;

    // Redirect the client
    res.redirect(redirectUrl);
}

// Define other payment-related controllers...

module.exports = { createPaymentIntent, createPayment, successPayment, cancelPayment, failedPayment,/* other controllers */ };
