import mongoose from 'mongoose';

// Store favorites/ratings/reviews for toilets
const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    toiletId: { type: String, index: true, required: true }, // same id scheme as app's idOf()
    fav: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5 },
    review: { type: String, maxlength: 2000 },
    meta: { type: Object }, // room for extensions
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, toiletId: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
