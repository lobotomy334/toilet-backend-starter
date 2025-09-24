import express from "express";
import Favorite from "../models/Favorite.js";
import { authRequired } from "../middleware/auth.js"; // ✅ verifyToken → authRequired

const router = express.Router();

// 키 생성 규칙 (프론트와 반드시 동일해야 함)
const toKey = (t) =>
  t.id ?? `${t.name}|${t.lat.toFixed(6)},${t.lng.toFixed(6)}`;

/**
 * POST /favorites/batch
 * body: { adds: ToiletLite[], removes: ToiletLite[] }
 * ToiletLite = { id?: string, name: string, lat: number, lng: number }
 */
router.post("/batch", authRequired, async (req, res) => {
  const userId = req.user.id || req.user._id;
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
            toilet: {
              id: t.id ?? null,
              name: t.name,
              lat: t.lat,
              lng: t.lng,
            },
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
    if (!ops.length) {
      return res.json({ success: true, result: "nothing to do" });
    }
    const result = await Favorite.bulkWrite(ops, { ordered: false });
    res.json({ success: true, result });
  } catch (e) {
    console.error("favorites/batch error", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /favorites
 * 사용자의 즐겨찾기 목록 반환
 */
router.get("/", authRequired, async (req, res) => {
  const userId = req.user.id || req.user._id;
  try {
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
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
