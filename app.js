const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { MongoClient } = require('mongodb');
const app = express();
const server = require("http").createServer(app);
const clientsRouter = require('./routes/clients');
const productsRouter = require('./routes/products');
const clientsproducts = require('./routes/clientsproducts');
const PORT = process.env.PORT || 3030;
// MongoDB connection URI
const uri = 'mongodb+srv://billing:pratik@billing.bt47ztc.mongodb.net/?retryWrites=true&w=majority&appName=Billing';
// Connect to MongoDB and store the connection in app.locals
const client = new MongoClient(uri);
client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
        app.locals.db = client.db('Entity');
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public')));
        app.use('/clients', clientsRouter);
        app.use('/products', productsRouter);
        app.use('/clientproducts', clientsproducts);
        module.exports = app;

    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit the application if MongoDB connection fails
    });
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});