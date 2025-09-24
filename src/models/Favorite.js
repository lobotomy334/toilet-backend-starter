// src/models/Favorite.js
import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    // 고유 키: toiletId가 있으면 그걸 쓰고, 없으면 name|lat,lng
    key: { type: String, required: true },

    // 화장실 정보 스냅샷
    toilet: {
      id: { type: String, default: null },
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  {
    versionKey: false,
    timestamps: true, // createdAt, updatedAt 자동 관리
  }
);

// (userId, key) 복합 유니크 인덱스
FavoriteSchema.index({ userId: 1, key: 1 }, { unique: true });

// ✅ OverwriteModelError 방지: 이미 등록돼 있으면 재사용
const Favorite =
  mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);

export default Favorite;
