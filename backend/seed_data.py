import os
from pymongo import MongoClient
from datetime import datetime, timedelta
import uuid

# Connect to MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client['ministry_platform']

# Clear existing data
print("Clearing existing data...")
db.brands.delete_many({})
db.events.delete_many({})
db.ministries.delete_many({})
db.announcements.delete_many({})

# Create Nehemiah David Ministries Brand
ndm_id = str(uuid.uuid4())
ndm_brand = {
    "id": ndm_id,
    "name": "Nehemiah David Ministries",
    "tagline": "Imparting Faith, Impacting Lives",
    "logo_url": "https://nehemiahdavid.com/assets/images/logo.svg",
    "hero_image_url": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920",
    "hero_video_url": "",
    "location": "Amaravathi Rd, above Yousta, Gorantla, Guntur, Andhra Pradesh 522034",
    "service_times": "Sunday 10:00 AM & Wednesday 7:00 PM",
    "created_at": datetime.utcnow().isoformat(),
    "updated_at": datetime.utcnow().isoformat()
}

# Create Faith Centre Brand
fc_id = str(uuid.uuid4())
fc_brand = {
    "id": fc_id,
    "name": "Faith Centre",
    "tagline": "Where Faith Meets Community",
    "logo_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    "hero_image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920",
    "hero_video_url": "",
    "location": "123 Faith Street, Community City, CC 12345",
    "service_times": "Sunday 9:00 AM & 11:00 AM",
    "created_at": datetime.utcnow().isoformat(),
    "updated_at": datetime.utcnow().isoformat()
}

print("Creating brands...")
db.brands.insert_many([ndm_brand, fc_brand])

# Create events for Nehemiah David Ministries
ndm_events = [
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Sunday Worship Service",
        "description": "Join us for an uplifting worship experience with powerful praise and teaching from God's Word.",
        "date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "time": "10:00 AM - 12:00 PM",
        "location": "Main Sanctuary",
        "image_url": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800",
        "is_free": True,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Youth Night",
        "description": "A special gathering for youth to connect, worship, and grow together in faith.",
        "date": (datetime.utcnow() + timedelta(days=12)).isoformat(),
        "time": "6:00 PM - 8:00 PM",
        "location": "Youth Center",
        "image_url": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
        "is_free": True,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Community Outreach Program",
        "description": "Serve our community with love and compassion. All volunteers welcome!",
        "date": (datetime.utcnow() + timedelta(days=20)).isoformat(),
        "time": "9:00 AM - 2:00 PM",
        "location": "Community Center",
        "image_url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800",
        "is_free": True,
        "created_at": datetime.utcnow().isoformat()
    }
]

# Create ministries for Nehemiah David Ministries
ndm_ministries = [
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Worship Team",
        "description": "Use your musical talents to lead our congregation in powerful worship.",
        "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Children's Ministry",
        "description": "Nurturing the next generation with biblical foundations and fun activities.",
        "image_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Community Outreach",
        "description": "Making a difference in our local community through acts of service and love.",
        "image_url": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Small Groups",
        "description": "Build meaningful relationships and grow spiritually in a small group setting.",
        "image_url": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
        "created_at": datetime.utcnow().isoformat()
    }
]

# Create announcements for Nehemiah David Ministries
ndm_announcements = [
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Welcome to Our Community!",
        "content": "We're excited to have you join us. Whether you're new to faith or looking for a church home, you'll find a warm welcome here.",
        "is_urgent": False,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Prayer Meeting This Wednesday",
        "content": "Join us for our weekly prayer meeting at 7:00 PM. Come together as we lift up our community, nation, and world in prayer.",
        "is_urgent": False,
        "created_at": datetime.utcnow().isoformat()
    }
]

print("Creating events...")
db.events.insert_many(ndm_events)

print("Creating ministries...")
db.ministries.insert_many(ndm_ministries)

print("Creating announcements...")
db.announcements.insert_many(ndm_announcements)

# Verify
print("\n=== Database Seeded Successfully! ===")
print(f"Brands: {db.brands.count_documents({})}")
print(f"Events: {db.events.count_documents({})}")
print(f"Ministries: {db.ministries.count_documents({})}")
print(f"Announcements: {db.announcements.count_documents({})}")

client.close()
