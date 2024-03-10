const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('clientsproducts');
    const user = await collection.find().toArray();
    if (!user) {
      return res.status(404).send('products not found');
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).send('Internal server error');
  }
});
// GET a user by id
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('clientsproducts');
    const user = await collection.findOne({ _id: new ObjectId(req.params.id) });

    // Check if user is found
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).send('Internal server error');
  }
});


// POST or PUT (upsert) a user by ownerMobile
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('clientsproducts');
    const { _id, ...rest } = req.body;
    const id = _id ? new ObjectId(_id) : new ObjectId();

    // Check if the document with the provided _id already exists
    const existingDocument = await collection.findOne({ _id: id });

    // If the document exists, update it; otherwise, insert a new document
    if (existingDocument) {
      // Update the existing document
      const updateOperation = { $set: rest };
      await collection.updateOne({ _id: id }, updateOperation);
    } else {
      // Insert a new document
      const document = { _id: id, ...rest };
      await collection.insertOne(document);
    }

    // Fetch the inserted/updated document from the collection
    const updatedDocument = await collection.findOne({ _id: id });
    res.json(updatedDocument);
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).send('Internal server error');
  }
});


// PUT (update) a user by _id
router.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('clientsproducts');
    const id = req.params.id;

    // Extract the _id from the request body if provided
    const { _id, ...rest } = req.body;

    // If _id is provided and it's different from the id in the URL, return an error
    if (_id && _id !== id) {
      return res.status(400).send('Cannot update _id');
    }

    // Construct the update operation
    const updateOperation = { $set: rest };

    // Update the document in the collection
    const result = await collection.updateOne({ _id: id }, updateOperation);

    // Check if the document was found and updated
    if (result.matchedCount === 0) {
      return res.status(404).send('Document not found');
    }

    // Fetch and return the updated document from the collection
    const updatedDocument = await collection.findOne({ _id: id });
    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Internal server error');
  }
});

// DELETE a product by _id
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('clientsproducts');
    const query = { _id: new ObjectId(req.params.id) }; // Construct the query using ObjectId
    await collection.deleteOne(query); // Use deleteOne to delete the document
    const remainingProducts = await collection.find().toArray();
    res.json(remainingProducts);
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
