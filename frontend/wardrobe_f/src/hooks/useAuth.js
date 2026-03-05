// ไฟล์นี้สำหรับสร้าง custom hook เพื่อจัดการข้อมูลการเข้าสู่ระบบของผู้ใช้
import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);

  return { user, setUser };
}