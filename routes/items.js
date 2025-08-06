const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const authMiddleware = require('../middleware/authMiddleware'); 

// POST /api/items
// add authMiddleware
router.post('/', authMiddleware, async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { name, description, image, startBid, endDate } = req.body;

    if (!name || !description || !image || !startBid || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const itemRef = await db.collection('auctionItems').add({
      name,
      description,
      image,
      startBid: Number(startBid),
      endDate: new Date(endDate),
      sellerId,
      currentBid: Number(startBid),
      buyerId: null,
      isActive: true,
      isSold: false,
      createdAt: new Date()
    });

    res.status(201).json({ id: itemRef.id, message: 'Item created successfully' });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// GET /api/items
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('auctionItems').where('isActive', '==', true).get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

module.exports = router;