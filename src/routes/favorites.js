import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import Favorite from '../models/Favorite.js';

const router = Router();
router.use(authRequired);

// Get all favorites for current user
router.get('/', async (req, res) => {
  const items = await Favorite.find({ userId: req.user.id }).lean();
  res.json({ success: true, items });
});

// Upsert favorite/rating/review
router.post('/', async (req, res) => {
  const { toiletId, fav, rating, review, meta } = req.body;
  if (!toiletId) return res.status(400).json({ success: false, message: 'Missing toiletId' });
  const doc = await Favorite.findOneAndUpdate(
    { userId: req.user.id, toiletId },
    { $set: { fav, rating, review, meta } },
    { upsert: true, new: true }
  ).lean();
  res.json({ success: true, item: doc });
});

// Remove record
router.delete('/:toiletId', async (req, res) => {
  const { toiletId } = req.params;
  await Favorite.deleteOne({ userId: req.user.id, toiletId });
  res.json({ success: true });
});

export default router;
