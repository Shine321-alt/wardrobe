"""
ไฟล์นี้ใช้สำหรับฟังก์ชันจัดการข้อมูลสินค้าและคอลเลคชั่นในระบบ backend
"""
import json
import os
import pymysql
from mysql.connector import connect, Error
from pymysql.cursors import DictCursor

DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST'),
    'port': int(os.getenv('MYSQL_PORT')),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DB'),
    'cursorclass': DictCursor,
    'charset': 'utf8mb4'
}

def get_db_connection():
    """
    ฟังก์ชันสำหรับเชื่อมต่อฐานข้อมูล MySQL ด้วย pymysql
    """
    try:
        # ใช้ **DB_CONFIG เพื่อกระจายค่าใน Dictionary เข้าไปในคำสั่ง connect
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except pymysql.MySQLError as e:
        print(f"Error connecting to the database: {e}")
        return None