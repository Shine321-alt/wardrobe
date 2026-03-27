// import axios library สำหรับใช้ส่ง HTTP request ไปยัง backend
import axios from "axios";

/*
  สร้าง instance ของ axios
  เพื่อกำหนดค่ากลางที่ทุก API จะใช้ร่วมกัน
*/
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const api = axios.create({

  // baseURL คือ URL หลักของ backend server พร้อม /api prefix
  // เวลาที่เราเรียก api.post("/login") จริง ๆ จะกลายเป็น
  // http://localhost:5000/api/login
  baseURL: `${API_URL}/api`,

  /*
    withCredentials: true
    ใช้สำหรับให้ browser ส่ง cookie ไปพร้อมกับ request
  */
  withCredentials: true,

  /*
    headers เริ่มต้นของ request
    บอก backend ว่าเราส่งข้อมูลเป็น JSON
  */
  headers: {
    "Content-Type": "application/json"
  }
});

/*
  export api instance
  เพื่อให้ไฟล์อื่นสามารถ import ไปใช้ได้

  เช่น
  import api from "./api";
*/
export default api;