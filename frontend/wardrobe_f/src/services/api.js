// ไฟล์นี้สำหรับเขียนฟังก์ชันเชื่อมต่อ API ของระบบ
import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);

  return { user, setUser };
}