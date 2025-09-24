import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

// DB 연결
import "./src/config/db.js";

// 라우트들
import authRoutes from "./src/routes/auth.js";
import favoritesRoutes from "./src/routes/favorites.js";

dotenv.config();

const app = express();

// CORS: 개발 중엔 모두 허용, 배포 시 도메인 제한 권장
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// 기본 라우트 (Render 헬스체크)
app.get("/", (_, res) => res.send("OK"));
app.get("/health", (_, res) => res.json({ ok: true }));

// 실제 API 라우트
app.use("/auth", authRoutes);
app.use("/favorites", favoritesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
});

