const stripe = require('../config/stripe');
const { payments } = require('../models/paymentModel');
const { subscribedUserCollection } = require('../models/userModel');
const { ObjectId } = require('mongodb');
const { default: axios } = require('axios');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const stripePayment = async (req, res) => {
    const payment = req.body;
    const paymentResult = await subscribedUserCollection.insertOne(payment);
    res.send({paymentResult});
}

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
    const { email } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Express Submission',
                        },
                        unit_amount: 50 * 100 
                    },
                    quantity: req.quantity || 1
                }
            ],
            mode: 'payment',
            success_url: `${req.headers.origin}/paymentsuccess?amount=${50}&tran_id=${uuidv4()}`,
            cancel_url: `${req.headers.origin}/paymentcancel`
        });


        const savedPaymentData = {
            email: email?.email,
            paymentId: uuidv4(),
            amount: 50,
            status: 'Paid',
            date: new Date().toLocaleDateString()
        };

        await subscribedUserCollection.insertOne(savedPaymentData);
        await payments.insertOne(savedPaymentData);

        res.json({ id: session.id })

    } catch (error) {
        console.error('error creating payment checkout session', error);
        res.status(500).json({ error: 'error creating checkout session' })
    }

};

const successPayment = async (req, res) => {
    const successData = req.body;

    if(successData.status !== "VALID") {
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

    const clientUrl = process.env.CLIENT_URL;

    const redirectUrl = `${clientUrl}/payment/success?tran_id=${successData.tran_id}&card_issuer=${successData.card_issuer}&tran_date=${successData.tran_date}&currency_type=${successData.currency_type}&amount=${successData.amount}&status=Success`;

    // Redirect the client
    res.redirect(redirectUrl);
}

const cancelPayment = async (req, res) => {

    const cancelData = req.body;

    if(cancelData.status !== "CANCELLED") {
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

    const clientUrl = process.env.CLIENT_URL;

    const redirectUrl = `${clientUrl}/payment/cancel?tran_id=${cancelData.tran_id}&card_issuer=${cancelData.card_issuer}&tran_date=${cancelData.tran_date}&currency_type=${cancelData.currency_type}&amount=${cancelData.amount}&error=${cancelData.error}&status=Canceled`;

    // Redirect the client
    res.redirect(redirectUrl);
}

const failedPayment = async (req, res) => {

    const failedData = req.body;

    if(failedData.status !== "FAILED") {    
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

    const clientUrl = process.env.CLIENT_URL;
    
    const redirectUrl = `${clientUrl}/payment/failed?tran_id=${failedData.tran_id}&card_issuer=${failedData.card_issuer}&tran_date=${failedData.tran_date}&currency_type=${failedData.currency_type}&amount=${failedData.amount}&error=${failedData.error}&status=Failed`;

    // Redirect the client
    res.redirect(redirectUrl);
}

// Define other payment-related controllers...

module.exports = { createPaymentIntent, createPayment, successPayment, cancelPayment, failedPayment, stripePayment };
