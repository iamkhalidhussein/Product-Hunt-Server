const stripe = require('stripe')(process.env.STRIPEZ_SECRET_KEY);

module.exports = stripe;