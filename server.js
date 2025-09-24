import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

import "./src/config/db.js"; // 만약 여기서 즉시 연결한다면, 우선 비우거나 연결코드 옮기세요
import favoritesRoutes from "./src/routes/favorites.js";
import authRoutes from "./src/routes/auth.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// ✅ 헬스 체크: DB 상태와 무관하게 즉시 200
app.get("/", (_, res) => res.send("OK"));
app.get("/health", (_, res) => res.json({ ok: true }));

// 라우트
app.use("/auth", authRoutes);
app.use("/favorites", favoritesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[server] listening on ${PORT}`);
  // 서버는 바로 뜸 → Render 헬스 체크 통과
  connectMongoWithRetry();
});

// ✅ Mongo는 배경에서 짧은 타임아웃으로 연결 + 재시도
const MONGO_URI = process.env.MONGO_URI;
async function connectMongo() {
  if (!MONGO_URI) throw new Error("MONGO_URI missing");
  await mongoose.connect(MONGO_URI, {
    // 타임아웃 짧게: 헬스체크 지연 방지
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 20000,
    // 필요시: dbName: "your-db"
  });
  console.log("✅ Mongo connected");
}

let retryTimer = null;
async function connectMongoWithRetry() {
  try {
    await connectMongo();
  } catch (err) {
    console.error("❌ Mongo connect failed:", err.message);
    // 5초 후 재시도 (Render는 서버만 살아있으면 OK)
    retryTimer = setTimeout(connectMongoWithRetry, 5000);
  }
}
