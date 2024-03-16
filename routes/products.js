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
      return res.status(500).send('Internal server error');
    }

    // Extracting new name from the request body
    const { newName } = req.body;

    // Create a log entry for the name change
    const logEntry = {
      title: 'NAME_PRICE_UPDATE',
      description: "",
      value: ""
    };


    const collection = db.collection('products');
    const query = { _id: new ObjectId(req.params.id) };
    const existingProduct = await collection.findOne(query);

    if (existingProduct) {
      // Push the log entry into logs array of the existing product
      await collection.findOneAndUpdate(
        query,
        { $push: { logs: logEntry }, $set: { itemName: newName } },
        { returnOriginal: false }
      );
    } else {
      // If the product does not exist, insert it with the provided _id and logs array
      await collection.insertOne({
        _id: new ObjectId(req.params.id),
        itemName: newName,
        logs: [logEntry]
      });
    }

    // Fetch updated products excluding logs field
    const updatedProducts = await collection.find({}, { projection: { logs: 0 } }).toArray();
    res.json(updatedProducts);
  } catch (error) {
    console.error('Error updating product name:', error);
    res.status(500).send('Internal server error');
  }
});

// PUT (upsert) a product by id
router.put('/add-inventory/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }

    // Extracting inventoryAddQuantity from the request body
    const { inventoryAddQuantity } = req.body;

    // Create a log entry based on inventoryAddQuantity
    const logEntry = {
      title: 'INVENTORY_UPDATE',
      description: "",
      value: inventoryAddQuantity
    };

    const collection = db.collection('products');
    const query = { _id: new ObjectId(req.params.id) };
    const existingProduct = await collection.findOne(query);

    if (existingProduct) {
      // Push the log entry into logs array of the existing product
      await collection.findOneAndUpdate(
        query,
        { $push: { logs: logEntry } },
        { returnOriginal: false }
      );
    } else {
      // If the product does not exist, insert it with the provided _id and logs array
      await collection.insertOne({
        _id: new ObjectId(req.params.id),
        logs: [logEntry]
      });
    }

    // Fetch updated products excluding logs field
    const updatedProducts = await collection.find({}, { projection: { logs: 0 } }).toArray();
    res.json(updatedProducts);
  } catch (error) {
    console.error('Error creating or updating product:', error);
    res.status(500).send('Internal server error');
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
