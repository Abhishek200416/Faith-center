#!/usr/bin/env python3
"""
Create Nehemiah David Ministries admin user
"""
import os
from pymongo import MongoClient
import bcrypt
import uuid
from datetime import datetime, timezone

# Connect to MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client['ministry_platform']

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Create admin user for Nehemiah David Ministries
admin_data = {
    "id": str(uuid.uuid4()),
    "email": "admin@nehemiahdavid.com",
    "password_hash": hash_password("Admin@123"),
    "role": "admin",
    "created_at": datetime.now(timezone.utc).isoformat()
}

# Check if admin already exists
existing = db.admins.find_one({"email": "admin@nehemiahdavid.com"})
if existing:
    print("Admin user already exists")
else:
    db.admins.insert_one(admin_data)
    print("Nehemiah David Ministries admin user created successfully")
    print(f"Email: admin@nehemiahdavid.com")
    print(f"Password: Admin@123")
