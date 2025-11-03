#!/usr/bin/env python3
"""
Seed script to populate initial data for the Ministry Platform
Run this script once to create initial brands and admin user
"""

import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import bcrypt
import uuid
from datetime import datetime, timezone

# Load environment
ROOT_DIR = Path(__file__).parent.parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"🌱 Seeding database: {db_name}")
    
    # Create admin user
    print("\n📋 Creating admin user...")
    admin_exists = await db.admins.find_one({"email": "admin@ndm.com"})
    if not admin_exists:
        password_hash = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin_doc = {
            "id": str(uuid.uuid4()),
            "email": "admin@ndm.com",
            "password_hash": password_hash,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.admins.insert_one(admin_doc)
        print("✅ Admin user created: admin@ndm.com / admin123")
    else:
        print("ℹ️  Admin user already exists")
    
    # Create NDM Brand
    print("\n🏢 Creating NDM Brand...")
    ndm_exists = await db.brands.find_one({"domain": "nehemiahdavid.com"})
    if not ndm_exists:
        ndm_brand = {
            "id": str(uuid.uuid4()),
            "name": "Nehemiah David Ministries",
            "domain": "nehemiahdavid.com",
            "logo_url": "https://nehemiahdavid.com/assets/img/logo1.png",
            "primary_color": "#2c3e50",
            "secondary_color": "#3498db",
            "tagline": "Imparting Faith, Impacting Lives",
            "hero_video_url": "",
            "hero_image_url": "https://images.unsplash.com/photo-1496185524395-81f295f4859e?w=1920",
            "service_times": "Sunday 10:00 AM & 6:00 PM",
            "location": "Amaravathi Rd, above Yousta, Gorantla, Guntur, Andhra Pradesh 522034",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        ndm_result = await db.brands.insert_one(ndm_brand)
        ndm_id = ndm_brand["id"]
        print("✅ NDM Brand created")
        
        # Create sample events for NDM
        print("  📅 Adding sample events...")
        events = [
            {
                "id": str(uuid.uuid4()),
                "title": "Sunday Worship Service",
                "description": "Join us for our weekly Sunday worship service with inspiring messages and uplifting music. Experience the presence of God as we worship together.",
                "date": "2025-02-02",
                "time": "10:00 AM",
                "location": "Amaravathi Rd, above Yousta, Gorantla, Guntur",
                "is_free": True,
                "image_url": "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800",
                "brand_id": ndm_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Youth Night",
                "description": "An evening dedicated to our youth with games, worship, and powerful teaching. Join us for a night of faith and fellowship.",
                "date": "2025-02-07",
                "time": "7:00 PM",
                "location": "Nehemiah David Ministries Youth Hall",
                "is_free": True,
                "image_url": "https://images.unsplash.com/photo-1496185524395-81f295f4859e?w=800",
                "brand_id": ndm_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Community Outreach Program",
                "description": "Join us as we serve our local community. Bring your family and be a blessing to those in need.",
                "date": "2025-02-14",
                "time": "9:00 AM",
                "location": "Various Locations in Guntur",
                "is_free": True,
                "image_url": "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800",
                "brand_id": ndm_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.events.insert_many(events)
        print(f"  ✅ Added {len(events)} events")
        
        # Create sample ministries for NDM
        print("  👥 Adding sample ministries...")
        ministries = [
            {
                "id": str(uuid.uuid4()),
                "title": "Worship Team",
                "description": "Use your musical gifts to lead our congregation in worship. We're looking for singers, instrumentalists, and sound technicians who love to worship God.",
                "image_url": "https://images.unsplash.com/photo-1496185524395-81f295f4859e?w=800",
                "brand_id": ndm_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Children's Ministry",
                "description": "Help shape young lives through teaching, activities, and mentorship. Make a difference in the lives of our children through fun and faith-filled activities.",
                "image_url": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
                "brand_id": ndm_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Community Outreach",
                "description": "Serve our local community through various outreach programs, food drives, and support services. Be the hands and feet of Jesus in our community.",
                "image_url": "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800",
                "brand_id": ndm_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Small Groups",
                "description": "Join or lead a small group for fellowship, Bible study, and community. Grow together with other believers in an intimate setting.",
                "image_url": "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800",
                "brand_id": ndm_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.ministries.insert_many(ministries)
        print(f"  ✅ Added {len(ministries)} ministries")
        
        # Create sample announcement for NDM
        print("  📢 Adding sample announcement...")
        announcement = {
            "id": str(uuid.uuid4()),
            "title": "Welcome to Our New Website!",
            "content": "We're excited to launch our new church website! Here you can find information about our services, events, ministries, and more. Stay connected with us and explore all the ways you can get involved in our community.",
            "is_urgent": False,
            "scheduled_start": None,
            "scheduled_end": None,
            "brand_id": ndm_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.announcements.insert_one(announcement)
        print("  ✅ Added sample announcement")
    else:
        print("ℹ️  NDM Brand already exists")
    
    # Create Faith Centre Brand
    print("\n🏢 Creating Faith Centre Brand...")
    faith_exists = await db.brands.find_one({"domain": "faithnatural.com"})
    if not faith_exists:
        faith_brand = {
            "id": str(uuid.uuid4()),
            "name": "Faith Centre",
            "domain": "faithnatural.com",
            "logo_url": "",
            "primary_color": "#1a472a",
            "secondary_color": "#2ecc71",
            "tagline": "Impacting Lives & Imparting Faith",
            "hero_video_url": "",
            "hero_image_url": "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920",
            "service_times": "Sunday 9:00 AM & 5:00 PM",
            "location": "Rajendra Nagar opposite Icon Mall, Guntur, Andhra Pradesh",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.brands.insert_one(faith_brand)
        faith_id = faith_brand["id"]
        print("✅ Faith Centre Brand created")
        
        # Create sample events for Faith Centre
        print("  📅 Adding sample events...")
        events = [
            {
                "id": str(uuid.uuid4()),
                "title": "Sunday Worship",
                "description": "Experience powerful worship and life-changing messages every Sunday.",
                "date": "2025-02-02",
                "time": "9:00 AM",
                "location": "Faith Centre Main Hall",
                "is_free": True,
                "image_url": "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800",
                "brand_id": faith_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.events.insert_many(events)
        print(f"  ✅ Added {len(events)} events")
        
        # Create sample ministries for Faith Centre
        print("  👥 Adding sample ministries...")
        ministries = [
            {
                "id": str(uuid.uuid4()),
                "title": "Prayer Team",
                "description": "Join our dedicated prayer warriors in interceding for our church, community, and nation.",
                "image_url": "https://images.unsplash.com/photo-1528459584353-5297db1a9c01?w=800",
                "brand_id": faith_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Hospitality Team",
                "description": "Be the welcoming face of our church, helping visitors and members feel at home.",
                "image_url": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800",
                "brand_id": faith_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.ministries.insert_many(ministries)
        print(f"  ✅ Added {len(ministries)} ministries")
    else:
        print("ℹ️  Faith Centre Brand already exists")
    
    # Create Giving Categories for both brands
    print("\n💰 Creating Giving Categories...")
    categories_exist = await db.giving_categories.find_one({})
    if not categories_exist:
        # Get brand IDs
        ndm_brand = await db.brands.find_one({"domain": "nehemiahdavid.com"})
        faith_brand = await db.brands.find_one({"domain": "faithcentre.com"})
        
        brand_ids = []
        if ndm_brand:
            brand_ids.append(ndm_brand["id"])
        if faith_brand:
            brand_ids.append(faith_brand["id"])
        
        categories = []
        for brand_id in brand_ids:
            categories.extend([
                {
                    "id": str(uuid.uuid4()),
                    "name": "Tithes & Offerings",
                    "description": "Give your tithes and offerings to support the work of the church",
                    "brand_id": brand_id,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Building Fund",
                    "description": "Support our building and facilities expansion",
                    "brand_id": brand_id,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Missions",
                    "description": "Support our global missions and outreach programs",
                    "brand_id": brand_id,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Special Projects",
                    "description": "Give towards special projects and initiatives",
                    "brand_id": brand_id,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            ])
        
        if categories:
            await db.giving_categories.insert_many(categories)
            print(f"  ✅ Added {len(categories)} giving categories")
    else:
        print("ℹ️  Giving categories already exist")
    
    client.close()
    print("\n✨ Database seeding completed!")
    print("\n📝 Login credentials:")
    print("   Email: admin@ndm.com")
    print("   Password: admin123")
    print("\n🌐 You can now access the admin panel at /admin/login")

if __name__ == "__main__":
    asyncio.run(seed_database())
