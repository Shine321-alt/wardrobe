// ไฟล์นี้จะเก็บ baseURL และตั้งค่า withCredentials เพื่อให้ cookie ถูกส่งไป backend
import api from "./api";

/*
  ฟังก์ชัน login
  ใช้สำหรับส่งข้อมูล login ไปตรวจสอบกับ backend
  รับค่า identifier (email หรือ username) และ password
*/
export const login = async (identifier, password) => {

  // ส่ง request แบบ POST ไปที่ endpoint /login
  // โดยส่ง identifier และ password ไปใน body
  const response = await api.post("/login", {
    identifier: identifier,
    password: password
  });

  // ส่ง response กลับไปให้ไฟล์ที่เรียกใช้ LoginForm.jsx
  return response.data;
};


/*
  ฟังก์ชัน logout
  ใช้สำหรับ logout ผู้ใช้
  backend จะทำการลบ cookie token
*/
export const logout = async () => {

  // เรียก API /logout เพื่อให้ backend clear cookie
  const response = await api.post("/logout");

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
  ฟังก์ชัน getCurrentUser
  ใช้สำหรับดึงข้อมูล user ที่ login อยู่
  backend จะตรวจ token จาก cookie ก่อน
*/
export const getCurrentUser = async () => {

  // เรียก API /me หรือ /profile เพื่อดึงข้อมูล user
  const response = await api.get("/me");

  return response.data;
};