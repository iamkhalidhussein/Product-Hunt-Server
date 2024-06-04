const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', async(req, res) => {
    res.send('Product Hunt Server Here')
})

app.listen(port, () => {
    console.log(`product hunt server running on port ${port}`);
})