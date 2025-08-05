const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// POST /api/items
router.post('/', async (req, res) => {
  try {
    const { title, description, imageUrl, startingBid, deadline, sellerId } = req.body;

    if (!title || !description || !imageUrl || !startingBid || !deadline || !sellerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const itemRef = await db.collection('items').add({
      title,
      description,
      imageUrl,
      startingBid,
      deadline: new Date(deadline),
      sellerId,
      currentBid: startingBid,
      currentBidderId: null,
      createdAt: new Date()
    });

    res.status(201).json({ id: itemRef.id });
  } catch (error) {
    console.error('Error uploading item:', error);
    res.status(500).json({ error: 'Failed to upload item' });
  }
});

// GET /api/items
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

module.exports = router;
