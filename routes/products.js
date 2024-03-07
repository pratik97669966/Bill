const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json({ error: 'Internal server error' });
    }
    const collection = db.collection('products');
    const user = await collection.find().toArray();
    if (!user) {
      return res.status(404).json({ error: 'products not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET a user by ownerMobile
router.get('/:itemName', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json({ error: 'Internal server error' });
    }
    const collection = db.collection('products');
    const user = await collection.findOne({ itemName: req.params.itemName });
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST (upsert) a user by ownerMobile
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json({ error: 'Internal server error' });
    }
    const collection = db.collection('products');
    await collection.insertOne(req.body);
    const updatedUser = await collection.find().toArray();
    res.json(updatedUser);
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// PUT (upsert) a user by ownerMobile
router.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json({ error: 'Internal server error' });
    }
    const collection = db.collection('products');
    const existingUser = await collection.findOne({ _id: req.params.id });
    if (existingUser) {
      await collection.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { returnOriginal: false }
      );
    } else {
      await collection.insertOne(req.body);
    }
    const updatedUser = await collection.findOne({ ownerMobile: req.params.ownerMobile });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a product by _id
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json({ error: 'Internal server error' });
    }
    const collection = db.collection('products');
    const query = { _id: new ObjectId(req.params.id) }; // Construct the query using ObjectId
    await collection.deleteOne(query); // Use deleteOne to delete the document
    const remainingProducts = await collection.find().toArray();
    res.json(remainingProducts);
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
