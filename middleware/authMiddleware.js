const { admin } = require('../firebase');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided or malformed header' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        req.user = decodedToken;

        next();
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};

module.exports = authMiddleware;