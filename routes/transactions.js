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
    const user = await collection.find().limit(100).toArray();
    if (!user) {
      return res.status(404).send('products not found');
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).send('Internal server error');
  }
});
// GET transactions by ownerName with a limit of 100 records
router.get('/:ownerMobile', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('transactions');
    const users = await collection.find({ ownerMobile: req.params.ownerMobile }).limit(100).toArray();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).send('Internal server error');
  }
});


// POST (upsert) a user by ownerMobile
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      console.error('MongoDB connection not established');
      return res.status(500).send('Internal server error');
    }
    const collection = db.collection('transactions');
    await collection.insertOne(req.body);
    res.json(req.body);
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).send('Internal server error');
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
});

module.exports = router;
