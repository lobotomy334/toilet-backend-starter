// src/routes/favorites.js (완성본 예시)
import express from "express";
import Favorite from "../models/Favorite.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// 프론트와 동일하게 맞춰야 하는 key 생성 규칙
const toKey = (t) =>
  t?.id ?? `${t?.name}|${Number(t?.lat).toFixed(6)},${Number(t?.lng).toFixed(6)}`;

// GET /favorites  (내 즐겨찾기 목록)
router.get("/", authRequired, async (req, res) => {
  try {
    const docs = await Favorite.find({ userId: req.user.id }).sort({ updatedAt: -1 }).lean();
    res.json({
      success: true,
      items: docs.map((d) => ({
        key: d.key,
        toilet: d.toilet,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * POST /favorites/batch
 * body: { adds: ToiletLite[], removes: ToiletLite[] }
 * ToiletLite = { id?: string, name: string, lat: number, lng: number, address?: string }
 */
router.post("/batch", authRequired, async (req, res) => {
  const { adds = [], removes = [] } = req.body || {};
  try {
    // 추가
    for (const t of adds) {
      const key = toKey(t);
      await Favorite.updateOne(
        { userId: req.user.id, key },
        {
          userId: req.user.id,
          key,
          toilet: {
            id: t.id,
            name: t.name,
            lat: Number(t.lat),
            lng: Number(t.lng),
            address: t.address,
          },
        },
        { upsert: true }
      );
    }
    // 삭제
    for (const t of removes) {
      const key = toKey(t);
      await Favorite.deleteOne({ userId: req.user.id, key });
    }

    const docs = await Favorite.find({ userId: req.user.id }).sort({ updatedAt: -1 }).lean();
    res.json({
      success: true,
      items: docs.map((d) => ({
        key: d.key,
        toilet: d.toilet,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
