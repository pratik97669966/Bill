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
    const collection = db.collection('transactions');
    
    // Find the latest 100 transactions, sorted by createdAt in descending order
    const latestTransactions = await collection.find().sort({ createdAt: -1 }).limit(100).toArray();
    
    if (!latestTransactions || latestTransactions.length === 0) {
      res.json([]);
    }
    
    res.json(latestTransactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).send('Internal server error');
  }
});

// GET transactions by ownerName with a limit of 100 records
router.get('/:ownerMobile', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('MongoDB connection not established');
    }
    const collection = db.collection('transactions');
    const users = await collection.find({ ownerMobile: req.params.ownerMobile }).limit(100).toArray();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).send('Error getting users: '+error);
  }
});


router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).json('MongoDB connection not established');
    }
    
    const collection = db.collection('transactions');
    const createdAt = new Date();
    req.body.createdAt = createdAt;
    
    // Insert transaction into the transactions collection
    await collection.insertOne(req.body);
    
    // Update balance in the clients collection
    const collectionClients = db.collection('clients');
    await collectionClients.findOneAndUpdate(
      { ownerMobile: req.body.ownerMobile },
      { $set: { balance: req.body.dueBalance } },
      { upsert: true, returnOriginal: false } // Upsert if the user does not exist
    );
    
    // Reduce quantity in the products collection
    const collectionProducts = db.collection('products');
    for (const product of req.body.productsList) {
      const { itemName, itemId, itemQuantity } = product;
      let query;
      if (itemId) {
        query = { itemId };
      } else {
        query = { itemName };
      }
      
      // Convert itemQuantity from string to number
      const quantityToReduce = parseInt(itemQuantity);
      
      await collectionProducts.updateOne(
        query,
        { $inc: { itemQuantity: -quantityToReduce } } // Decrement item quantity
      );
    }
    
    res.json(req.body);
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).send('Error creating or updating user: '+error);
  }
});



// GET monthly transactions by ownerMobile
router.get('/monthly/:ownerMobile', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('transactions');

    const ownerMobile = req.params.ownerMobile;

    // Calculate the start and end dates for the current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Query transactions within the current month for the specified ownerMobile
    const monthlyTransactions = await collection.find({
      ownerMobile: ownerMobile,
      createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    }).toArray();

    res.json(monthlyTransactions);
  } catch (error) {
    console.error('Error getting monthly transactions:', error);
    res.status(500).send('Internal server error');
  }
});

// POST transactions by date range
router.post('/range', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('transactions');

    // Extract start and end dates from request body
    const { startDate, endDate } = req.body;

    // Validate start and end dates
    if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
      return res.status(400).send('Invalid date format');
    }

    // Query transactions within the specified date range
    const transactions = await collection.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).toArray();

    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).send('Internal server error');
  }
});52

module.exports = router;
