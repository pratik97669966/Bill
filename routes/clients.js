const express = require('express');
const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json({ error: 'Internal server error' });
    }
    const collection = db.collection('clients');
    const user = await collection.find().toArray();
    if (!user) {
      return res.status(404).json({ error: 'Users not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET a user by ownerMobile
router.get('/:ownerMobile', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json({ error: 'Internal server error' });
    }
    const collection = db.collection('clients');
    const user = await collection.findOne({ ownerMobile: req.params.ownerMobile });
    // if (!user) {
    //   return res.status(404).json({ error: 'User not found' });
    // }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST (upsert) a user by ownerMobile
router.post('/:ownerMobile', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json({ error: 'Internal server error' });
    }
    const collection = db.collection('clients');
    const existingUser = await collection.findOne({ ownerMobile: req.params.ownerMobile });
    if (existingUser) {
      await collection.findOneAndUpdate(
        { ownerMobile: req.params.ownerMobile },
        { $set: req.body },
        { returnOriginal: false }
      );
    } else {
      await collection.insertOne(req.body);
    }
    const updatedUser =  await collection.find().toArray();
    res.json(updatedUser);
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// PUT (upsert) a user by ownerMobile
router.put('/:ownerMobile', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json({ error: 'Internal server error' });
    }
    const collection = db.collection('clients');
    const existingUser = await collection.findOne({ ownerMobile: req.params.ownerMobile });
    if (existingUser) {
      await collection.findOneAndUpdate(
        { ownerMobile: req.params.ownerMobile },
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
// DELETE a user by ownerMobile
router.delete('/:ownerMobile', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json({ error: 'Internal server error' });
    }
    const collection = db.collection('clients');
    await collection.findOneAndDelete({ ownerMobile: req.params.ownerMobile });
    const activeUsers = await collection.find().toArray();
    res.json(activeUsers);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
