import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import uuid
from datetime import datetime, timezone

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def update_admin_credentials():
    # Connect to MongoDB
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
    client = AsyncIOMotorClient(MONGO_URL)
    db = client['ministry_platform']
    
    # New admin credentials
    email = "promptforge.dev@gmail.com"
    password = "P9$wX!7rAq#4Lz@M2f"
    
    # Hash the password
    password_hash = pwd_context.hash(password)
    
    # Check if admin exists
    existing_admin = await db.admins.find_one({"email": email})
    
    if existing_admin:
        # Update existing admin
        await db.admins.update_one(
            {"email": email},
            {"$set": {
                "password_hash": password_hash,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        print(f"✅ Updated admin credentials for: {email}")
    else:
        # Create new admin
        admin_doc = {
            "id": str(uuid.uuid4()),
            "email": email,
            "name": "Super Admin",
            "password_hash": password_hash,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.admins.insert_one(admin_doc)
        print(f"✅ Created new admin: {email}")
    
    # Also ensure the old admin@faithcenter.com exists for backward compatibility
    old_admin_email = "admin@faithcenter.com"
    old_admin = await db.admins.find_one({"email": old_admin_email})
    
    if not old_admin:
        old_admin_hash = pwd_context.hash("Admin@2025")
        old_admin_doc = {
            "id": str(uuid.uuid4()),
            "email": old_admin_email,
            "name": "Admin",
            "password_hash": old_admin_hash,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.admins.insert_one(old_admin_doc)
        print(f"✅ Also created legacy admin: {old_admin_email}")
    
    # List all admins
    admins = await db.admins.find({}, {"_id": 0, "password_hash": 0}).to_list(10)
    print(f"\n📋 Current admins in database:")
    for admin in admins:
        print(f"   - {admin['email']} (Name: {admin.get('name', 'N/A')})")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_admin_credentials())
