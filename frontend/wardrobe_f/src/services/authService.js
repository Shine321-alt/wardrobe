// ไฟล์นี้ใช้สำหรับเรียก API ที่เกี่ยวกับ authentication
// ใช้ axios instance จากไฟล์ api.js (มี baseURL และ withCredentials)
import api from "./api";


/*
  LOGIN
  ส่ง identifier (email หรือ username) และ password ไปตรวจสอบกับ backend
*/
export const login = async (identifier, password) => {

  const response = await api.post("/login", {
    identifier: identifier,
    password: password
  });

  return response.data;
};


/*
  REGISTER (SIGN UP)
  ใช้สำหรับสมัครสมาชิกใหม่
*/
export const register = async (data) => {

  const response = await api.post("/signup", data);

  return response.data;
};


/*
  LOGOUT
  เรียก API เพื่อให้ backend ลบ session / cookie
*/
export const logout = async () => {

  const response = await api.post("/logout");

  return response.data;
};


/*
  GET CURRENT USER
  ตรวจสอบ session ปัจจุบันจาก cookie token
  ใช้สำหรับ restore session ตอนเปิดแอป
*/
export const getCurrentUser = async () => {

  const response = await api.get("/me");

  return response.data;
};

/*
  ฟังก์ชัน getMe
  ใช้สำหรับตรวจสอบ session ปัจจุบัน
  กำหนด axios request ให้ส่ง cookie ไปพร้อมกับ request
  backend จะตรวจสอบ token จาก cookie แล้วส่งข้อมูล user กลับมา
  ใช้สำหรับ restore session เมื่อ App เปิด
*/
export const getMe = async () => {

  // เรียก API /me เพื่อตรวจสอบ token และดึงข้อมูล user
  const response = await api.get("/me");

  return response.data;
};


/*
  FORGOT PASSWORD
  ส่ง email ไปให้ backend เพื่อสร้าง reset token
*/
export const forgotPassword = async (email) => {

  const response = await api.post("/forgot-password", {
    email: email
  });

  return response.data;
};


/*
  RESET PASSWORD
  ส่ง token และ password ใหม่ไปให้ backend
*/
export const resetPassword = async (token, password) => {

  const response = await api.post("/reset-password", {
    token: token,
    password: password
  });

  return response.data;
};