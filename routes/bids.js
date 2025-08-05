const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// POST /api/bids
router.post('/', async (req, res) => {
    try {
        const { itemId, bidderId, bidAmount } = req.body;

        if (!itemId || !bidderId || !bidAmount) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const itemRef = db.collection('items').doc(itemId);
        const itemDoc = await itemRef.get();

        if (!itemDoc.exists) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const item = itemDoc.data();

        if (new Date(item.deadline.toDate ? item.deadline.toDate() : item.deadline) < new Date()) {
            return res.status(400).json({ error: 'Auction ended' });
        }

        if (bidAmount <= item.currentBid) {
            return res.status(400).json({ error: 'Bid too low' });
        }

        await db.collection('bids').add({
            itemId,
            bidderId,
            bidAmount,
            createdAt: new Date()
        });

        await itemRef.update({
            currentBid: bidAmount,
            currentBidderId: bidderId
        });

        res.status(200).json({ message: 'Bid placed successfully' });
    } catch (error) {
        console.error('Bid error:', error);
        res.status(500).json({ error: 'Failed to place bid' });
    }
});

module.exports = router;
