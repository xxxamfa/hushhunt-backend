const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const authMiddleware = require('../middleware/authMiddleware');
const { sendPushNotification } = require('../services/notificationService');

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { itemId, bidAmount } = req.body;
        const bidderId = req.user.uid;
        if (!itemId || !bidAmount) {
            return res.status(400).json({ error: 'Missing itemId or bidAmount' });
        }

        const itemRef = db.collection('auctionItems').doc(itemId);
        const itemDoc = await itemRef.get();

        if (!itemDoc.exists) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const item = itemDoc.data();

        if (item.sellerId === bidderId) {
            return res.status(403).json({ error: "You cannot bid on your own item." });
        }
        
        if (new Date(item.endDate.toDate()) < new Date()) {
            return res.status(400).json({ error: 'Auction has already ended' });
        }

        if (Number(bidAmount) <= item.currentBid) {
            return res.status(400).json({ error: 'Your bid must be higher than the current bid' });
        }

        const previousBidderId = item.buyerId; 

        if (previousBidderId && previousBidderId !== bidderId) {
            const userRef = db.collection('users').doc(previousBidderId);
            const userDoc = await userRef.get();
            if (userDoc.exists && userDoc.data().pushToken) {
                const pushToken = userDoc.data().pushToken;
                const notificationTitle = 'Your bid has been outbid!';
                const notificationBody = `Someone placed a higher bid on ${item.name}.`;

                sendPushNotification(pushToken, notificationTitle, notificationBody, { itemId });
            }
        }

        const batch = db.batch();
        const bidRef = db.collection('bids').doc();
        batch.set(bidRef, {
            itemId,
            bidderId,
            bidAmount: Number(bidAmount),
            createdAt: new Date()
        });

        batch.update(itemRef, {
            currentBid: Number(bidAmount),
            buyerId: bidderId
        });

        await batch.commit();
        res.status(200).json({ message: 'Bid placed successfully' });

    } catch (error) {
        console.error('Error placing bid:', error);
        res.status(500).json({ error: 'Failed to place bid' });
    }
});

module.exports = router;