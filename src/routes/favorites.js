// routes/favorites.js
import express from "express";
import Favorite from "../models/Favorite.js";
import { verifyToken } from "../middleware/auth.js"; // 프로젝트에 맞게 경로 확인

const router = express.Router();

// 클라이언트와 동일한 키 규칙
const toKey = (t) => t.id ?? `${t.name}|${t.lat.toFixed(6)},${t.lng.toFixed(6)}`;

/**
 * POST /favorites/batch
 * body: { adds: ToiletLite[], removes: ToiletLite[] }
 * ToiletLite = { id?: string, name: string, lat: number, lng: number }
 */
router.post("/batch", verifyToken, async (req, res) => {
  const userId = req.user.id || req.user._id; // jwt 페이로드에 따라 조정
  const { adds = [], removes = [] } = req.body || {};

  const ops = [];

  // 추가/갱신 → upsert
  for (const t of adds) {
    const k = toKey(t);
    ops.push({
      updateOne: {
        filter: { userId, key: k },
        update: {
          $set: {
            userId,
            key: k,
            toilet: { id: t.id ?? null, name: t.name, lat: t.lat, lng: t.lng },
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    });
  }

  // 제거
  for (const t of removes) {
    const k = toKey(t);
    ops.push({ deleteOne: { filter: { userId, key: k } } });
  }

  try {
    if (!ops.length) return res.json({ success: true, result: "nothing to do" });

    const result = await Favorite.bulkWrite(ops, { ordered: false });
    return res.json({ success: true, result });
  } catch (e) {
    console.error("favorites/batch error", e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /favorites
 * 사용자의 즐겨찾기 목록 반환 (선택)
 */
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id || req.user._id;
  const docs = await Favorite.find({ userId }).lean();
  res.json({
    success: true,
    items: docs.map((d) => ({
      key: d.key,
      toilet: d.toilet,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })),
  });
});

export default router;
