import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ✅ 환경변수 키 하나로 통일: MONGO_URI
const uri = process.env.MONGO_URI;

// 디버깅용: 값 유무만 로그 (노출 위험하니 호스트만)
console.log("[db] MONGO_URI present:", !!uri);

if (!uri) {
  console.error("[db] Missing MONGO_URI");
  // Render 재시작 루프 막기 위해 즉시 종료보다는 경고만 하고 반환도 가능
  // 여기서는 명확히 실패를 드러내기 위해 종료 유지
  process.exit(1);
}

mongoose.set("strictQuery", true);
// 상세 디버그 (연결 과정 로그)
mongoose.set("debug", true);

mongoose
  .connect(uri, {
    // 여기서 DB 이름 고정: Atlas에 있는 그대로
    dbName: "toilet_app",
    // 타임아웃 짧게
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 20000,
  })
  .then(() => console.log("[db] connected"))
  .catch((err) => {
    console.error("[db] connection error name=", err.name, " code=", err.code);
    console.error("[db] message=", err.message);
    // 가장 흔한 원인 힌트 찍기
    if (err.message?.includes("bad auth") || err.code === 18) {
      console.error("[hint] 유저/비밀번호 불일치 (Database Access 사용자 자격 확인)");
    }
    if (err.message?.includes("ENOTFOUND") || err.message?.includes("getaddrinfo")) {
      console.error("[hint] DNS/SRV 호스트 오타 또는 네트워크 문제 (URI 호스트 확인)");
    }
    if (err.message?.includes("IP address") || err.message?.includes("not allowed")) {
      console.error("[hint] Atlas Network Access 화이트리스트(0.0.0.0/0) 설정 필요");
    }
    // 종료 (Render가 재시작)
    process.exit(1);
  });
