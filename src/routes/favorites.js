import express from "express";
import Favorite from "../models/Favorite.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// 프론트와 동일하게 맞춰야 하는 key 생성 규칙
const toKey = (t) =>
  t.id ?? `${t.name}|${Number(t.lat).toFixed(6)},${Number(t.lng).toFixed(6)}`;

/**
 * POST /favorites/batch
 * body: { adds: ToiletLite[], removes: ToiletLite[] }
 * ToiletLite = { id?: string, name: string, lat: number, lng: number }
 */
router.post("/batch", authRequired, async (req, res) => {
  const userId = req.user.id || req.user._id;
  let { adds = [], removes = [] } = req.body || {};

  // 방어적 정규화
  const normalize = (t) => ({
    id: t.id ?? null,
    name: String(t.name ?? "").trim(),
    lat: Number.parseFloat(t.lat),
    lng: Number.parseFloat(t.lng),
  });

  adds = Array.isArray(adds)
    ? adds.map(normalize).filter((t) => t.name && Number.isFinite(t.lat) && Number.isFinite(t.lng))
    : [];
  removes = Array.isArray(removes)
    ? removes.map(normalize).filter((t) => t.name && Number.isFinite(t.lat) && Number.isFinite(t.lng))
    : [];

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
            toilet: { id: t.id, name: t.name, lat: t.lat, lng: t.lng },
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
      return res.json({ success: true, upserted: 0, modified: 0, deleted: 0 });
    }

    const result = await Favorite.bulkWrite(ops, { ordered: false });
    res.json({
      success: true,
      upserted: result.upsertedCount ?? 0,
      modified: result.modifiedCount ?? 0,
      deleted: result.deletedCount ?? 0,
    });
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
