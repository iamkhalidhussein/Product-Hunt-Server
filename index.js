const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { connectDB } = require('./config/db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/users', userRoutes);
app.use('/payments', paymentRoutes);
app.use('/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Product Hunt Server Here');
});

app.listen(port, () => {
    console.log(`Product Hunt server running on port ${port}`);
});