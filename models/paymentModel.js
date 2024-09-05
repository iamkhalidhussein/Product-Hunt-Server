const { client } = require('../config/db');

const payments = client.db('Payments').collection('userPayments');

module.exports = { payments };
