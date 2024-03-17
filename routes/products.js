const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('products');

    const products = await collection.find({}, { projection: { logs: 0 } }).toArray();
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).send('Internal server error');
  }
});

// GET a product by item name
router.get('/:itemName', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('products');
    const product = await collection.findOne({ itemName: req.params.itemName });
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).send('Internal server error');
  }
});

// POST (upsert) a product
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('products');
    await collection.insertOne(req.body);
    const updatedProducts = await collection.find({}, { projection: { logs: 0 } }).toArray();
    res.json(updatedProducts);
  } catch (error) {
    console.error('Error creating or updating product:', error);
    res.status(500).send('Internal server error');
  }
});

// PUT (upsert) a product by id
router.put('/update-name-price/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('MongoDB connection not established');
    }

    // Extracting new product data from the request body
    const { itemName, itemPrice } = req.body;

    // Create a log entry for the product update
    const logEntry = {
      title: 'NAME_PRICE_UPDATE',
      description: `Updated product name to ${itemName} and price to ${itemPrice}`,
      createdAt: new Date(),
      value: ''
    };

    const collection = db.collection('products');
    const query = { _id: new ObjectId(req.params.id) };
    const updateData = { $set: { itemName: itemName, itemPrice: itemPrice }, $push: { logs: logEntry } };

    // Perform the update operation, with upsert set to true to insert if the product does not exist
    await collection.updateOne(query, updateData, { upsert: true });

    // Fetch updated products excluding logs field
    const updatedProducts = await collection.find({}, { projection: { logs: 0 } }).toArray();
    res.json(updatedProducts);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Error updating product: ' + error);
  }
});

// PUT (upsert) a product by id
router.put('/add-inventory/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('MongoDB connection not established');
    }

    // Extracting new product data and logs from the request body
    const { itemQuantity, inventoryAddQuantity } = req.body;

    // Create a log entry for the inventory update
    const logEntry = {
      title: 'INVENTORY_UPDATE',
      description: `Added ${inventoryAddQuantity} items to inventory`,
      createdAt: new Date(),
      value: inventoryAddQuantity
    };

    const collection = db.collection('products');
    const query = { _id: new ObjectId(req.params.id) };
    const updateData = { $set: { itemQuantity: itemQuantity }, $push: { logs: logEntry } };

    // Perform the update operation, with upsert set to true to insert if the product does not exist
    await collection.updateOne(query, updateData, { upsert: true });

    // Fetch updated products excluding logs field
    const updatedProducts = await collection.find({}, { projection: { logs: 0 } }).toArray();
    res.json(updatedProducts);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Error updating product: ' + error);
  }
});

// DELETE a product by id
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('products');
    const query = { _id: new ObjectId(req.params.id) };
    await collection.deleteOne(query);
    const remainingProducts = await collection.find({}, { projection: { logs: 0 } }).toArray();
    res.json(remainingProducts);
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).send('Internal server error');
  }
});

// GET all logs for a product by id
router.get('/:id/logs', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('products');
    const query = { _id: new ObjectId(req.params.id) };

    const product = await collection.findOne(query);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    const logs = product.logs || [];
    res.json(logs);
  } catch (error) {
    console.error('Error retrieving logs:', error);
    res.status(500).send('Internal server error');
  }
});


module.exports = router;
