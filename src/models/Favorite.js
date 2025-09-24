// models/Favorite.js
import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    // 고유 키: 서버에 진짜 toiletId가 있다면 그걸 쓰세요.
    key: { type: String, required: true, index: true, unique: false },

    // 화장실 정보 스냅샷 (간단 캐싱 용도)
    toilet: {
      id: { type: String, default: null },     // 백엔드 DB의 화장실 id가 있으면 사용
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// (userId, key) 복합 유니크 → 같은 항목 중복 방지
FavoriteSchema.index({ userId: 1, key: 1 }, { unique: true });

export default mongoose.model("Favorite", FavoriteSchema);
