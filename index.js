const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPEZ_SECRET_KEY);
const cors = require('cors');
const jwt = require('jsonwebtoken');

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());


//mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { default: axios } = require('axios');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rpbygkt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const userCollection = client.db("productHunt").collection("Users");
        const subscribedUserCollection = client.db("subscribedUsers").collection("users");
        const featuredProductsCollection = client.db("featuredProducts").collection("Products");
        const latestResourcesCollection = client.db('latestResources').collection('products');
        const userInfoCollection = client.db("userInfo").collection("users");
        const payments = client.db('Payments').collection('userPayments');

        //jwt related apis
        app.post('/jwt', async(req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            res.send({token});
        })

        //middlewares
        const verifyToken = (req, res, next) => {
            console.log('inside verify token', req.headers.authorization)
            if(!req.headers.authorization) {
                return res.status(401).send({message: 'forbidden access'});
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
                if(error) {
                    return res.status(401).send({message: 'forbidden access'});
                }
                req.decoded = decoded;
                next();
            })
        }

        const verifyAdmin = async(req, res, next) => {
            const email = req.decoded.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            if(!isAdmin) {
                return res.status(403).send({message: 'fobidden access'});
            }
            next();
        }

        //users related apis
        app.get('/users', verifyToken, verifyAdmin, async(req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.get('/users/admin/:email', verifyToken, async(req, res) => {
            const email = req.params.email;
            if(email !== req.decoded.email) {
                return req.status(403).send({message: 'unauthorized access'})
            }
            const query = {email: email};
            const user = await userCollection.findOne(query);
            let admin = false;
            if(user) {
                admin = user?.role === 'admin'
            }
            res.send({admin});
        })
        
        app.get('/users/moderator/:email', verifyToken, async(req, res) => {
            const email = req.params.email;
            if(email !== req.decoded.email) {
                return req.status(403).send({message: 'unauthorized access'})
            }
            const query = {email: email};
            const user = await userCollection.findOne(query);
            let moderator = false;
            if(user) {
                moderator = user?.moderator === true
            }
            res.send({moderator});
        })

        app.post('/users', async(req, res) => {
            const user = req.body;
            //checking user existance in DB
            const query = {email: user.email};
            const userExistence = await userCollection.findOne(query);
            if(userExistence) {
                return res.send({message: 'user already exist', insertedId: null})
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.patch('/users/admin/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const updatedDoc = {
                $set: {
                    role: 'admin',
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })
        app.patch('/users/moderator/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const updatedDoc = {
                $set: {
                    moderator: true
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.patch('/userrs/:useremail/:cartId', async (req, res) => {
            const cartId = req.params.cartId;
            const userEmail = req.params.useremail;
            console.log(cartId, userEmail)
            const filter = { _id: new ObjectId(cartId), email: userEmail };
            const creatorFilter = { _id: new ObjectId(cartId), creatorEmail: userEmail };
            const creator = await featuredProductsCollection.findOne(creatorFilter);
            if(creator) {
                console.log('can not vote your own product');
                res.send(true)
                return;
            }
            // Check if the user has already upvoted within the specified cart
            const currentUser = await featuredProductsCollection.findOne(filter);
            
            console.log('current user ln: 149',currentUser?.email)
            if (currentUser) {
                // User has already upvoted, decrement the upvote count and mark as not upvoted
                const updatedDoc = {
                    $set: {
                        upvote: currentUser.previousUpvote,
                        upvoted: false + ' ' + userEmail,
                        email: null
                    }
                };
                const result = await featuredProductsCollection.updateOne(filter, updatedDoc);
                res.send(result);
            } else {
                // User has not upvoted, increment the upvote count and mark as upvoted
                const featuredProducts = await featuredProductsCollection.findOne({ _id: new ObjectId(cartId) });
                console.log('featured products:',featuredProducts)
                console.log('featured products upvote: ',featuredProducts.upvote)
                console.log('featured products upvote: ',featuredProducts.upvote)
                const updatedDoc = {
                    $set: {
                        upvote: featuredProducts.upvote + 1,
                        upvoted: true + ' ' + userEmail,
                        previousUpvote: featuredProducts.upvote,
                        email: userEmail
                    }
                };
                    const result = await featuredProductsCollection.updateOne({ _id: new ObjectId(cartId) }, updatedDoc);
                res.send(result);
            }
        });

        app.patch('/users/:useremail/:cartId', async (req, res) => {
            const cartId = req.params.cartId;
            const userEmail = req.params.useremail;
            const filter = { _id: new ObjectId(cartId), email: userEmail };
        
            // Check if the user has already upvoted within the specified cart
            const currentUser = await latestResourcesCollection.findOne(filter);
        
            if (currentUser) {
                // User has already upvoted, decrement the upvote count and mark as not upvoted
                const updatedDoc = {
                    $set: {
                        upvote: currentUser.previousUpvote,
                        upvoted: false + ' ' + userEmail,
                        email: null
                    }
                };
                const result = await latestResourcesCollection.updateOne(filter, updatedDoc);
                res.send(result);
            } else {
                // User has not upvoted, increment the upvote count and mark as upvoted
                const latestResource = await latestResourcesCollection.findOne({ _id: new ObjectId(cartId) });
                const updatedDoc = {
                    $set: {
                        upvote: latestResource.upvote + 1,
                        upvoted: true + ' ' + userEmail,
                        previousUpvote: latestResource.upvote,
                        email: userEmail
                    }
                };
                const result = await latestResourcesCollection.updateOne({ _id: new ObjectId(cartId) }, updatedDoc);
                res.send(result);
            }
        });

        app.delete('/users/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        //getting data from db for featured products
        app.get('/featured-products', async(req, res) => {
            const result = await featuredProductsCollection.find().toArray();
            res.send(result);
        })

        //getting data from db for latest resources
        app.get('/latest-resources', async(req, res) => {
            const result = await latestResourcesCollection.find().toArray();
            res.send(result);
        })


        //payment intent
        app.post('/create-payment-intent', async(req, res) => {
            console.log(req.body)
            const {price} = req.body;
            const amount = parseInt(price * 100);
            console.log(amount,'amount inside the intent');

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })

            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })

        app.get('/users/paymentinfo/:email', async(req, res) => {
            const email = req.params.email;
            const filter = {email: email};
            const result = await subscribedUserCollection.findOne(filter);
            res.send(result);
        })

        app.post('/users/payment/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email}
            const result = await subscribedUserCollection.insertOne(query);
            res.send(result);
        })

        //user product post
        app.post('/users/submitProduct', async(req, res) => {
            const userData = req.body;
            console.log(userData)
            const result = await featuredProductsCollection.insertOne(userData);
            res.send(result);
        })

        //get user posted products
        app.get('/users/getSubmittedProduct/:email', async(req, res) => {
            const email = req.params.email;
            const query = {creatorEmail: email};
            const result = await featuredProductsCollection.find(query).toArray();
            res.send(result);
        })





        //ssl commerz integration
        app.post('/create-payment', async(req, res) => {
            const paymentInfo = req.body;
            const trxId = new ObjectId().toString();
            console.log('initial data: ',trxId)

            const initiateData = {
                store_id:"resou666a864f1b2b6",
                store_passwd:"resou666a864f1b2b6@ssl",
                total_amount: paymentInfo.ammount,
                currency:paymentInfo.currenccy,
                tran_id:trxId,
                success_url:"http://localhost:5000/success-payment",
                fail_url:"http://localhost:5000/failed",
                cancel_url:"http://localhost:5000/cancel",
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
            }

        })

        app.post('/success-payment', async(req, res) => {
            const successData = req.body;

            if(successData.status !== "VALID") {
                throw new Error("Unauthorized payment");
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

            res.redirect('http://localhost:5173/success')
        })

        app.post('/failed', async(req, res) => {
            res.redirect('http://localhost:5173/failed')
        })

        app.post('/cancel', async(req, res) => {
            res.redirect('http://localhost:5173/cancel')
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
// mongodb



app.get('/', async(req, res) => {
    res.send('Product Hunt Server Here')
})

app.listen(port, () => {
    console.log(`product hunt server running on port ${port}`);
})