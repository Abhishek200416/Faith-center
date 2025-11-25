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
    "domain": "nehemiahdavid.com",
    "tagline": "Imparting Faith, Impacting Lives",
    "logo_url": "https://nehemiahdavid.com/images/logo.svg",
    "hero_image_url": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920",
    "hero_video_url": "",
    "location": "Amaravathi Rd, above Yousta, Gorantla, Guntur, Andhra Pradesh 522034",
    "service_times": "Morning: 7:00 AM - 9:00 AM | Service: 10:00 AM - 12:00 PM | Evening (Online): 6:30 PM - 8:30 PM | Friday: 7:00 PM - 9:00 PM",
    "primary_color": "#1a1a1a",
    "secondary_color": "#4a90e2",
    "whatsapp_number": "+919876543210",
    "created_at": datetime.utcnow().isoformat()
}

# Create Faith Centre Brand
fc_id = str(uuid.uuid4())
fc_brand = {
    "id": fc_id,
    "name": "Faith Centre",
    "domain": "faithcentre.com",
    "tagline": "Where Faith Meets Community",
    "logo_url": "https://nehemiahdavid.com/images/logo.svg",
    "hero_image_url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920",
    "hero_video_url": "",
    "location": "123 Faith Street, Community Center, Vijayawada, Andhra Pradesh 520001",
    "service_times": "Morning: 7:00 AM - 9:00 AM | Service: 10:00 AM - 12:00 PM | Evening (Online): 6:30 PM - 8:30 PM | Friday: 7:00 PM - 9:00 PM",
    "primary_color": "#1a1a1a",
    "secondary_color": "#4a90e2",
    "whatsapp_number": "+919876543210",
    "created_at": datetime.utcnow().isoformat()
}

print("Creating brands...")
db.brands.insert_many([ndm_brand, fc_brand])

# Create events for Nehemiah David Ministries
ndm_events = [
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "REVIVE - 5 Day Revival Conference",
        "description": "Join us for a powerful 5-day revival experience! Experience renewed faith, powerful worship, and life-changing messages. December 3-7, 2025. Don't miss this transformative event!",
        "date": "2025-12-03",
        "time": "6:00 PM - 9:00 PM Daily",
        "location": "Main Sanctuary",
        "image_url": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80",
        "is_free": True,
        "accepts_donations": True,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Sunday Worship Service",
        "description": "Join us for an uplifting worship experience with powerful praise and teaching from God's Word.",
        "date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "time": "10:00 AM - 12:00 PM",
        "location": "Main Sanctuary",
        "image_url": "https://images.unsplash.com/photo-1477281765962-ef34e8bb0967?w=800&q=80",
        "is_free": True,
        "accepts_donations": False,
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
        "image_url": "https://images.unsplash.com/photo-1610070835951-156b6921281d?w=800&q=80",
        "is_free": True,
        "accepts_donations": True,
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
        "image_url": "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
        "is_free": True,
        "accepts_donations": True,
        "created_at": datetime.utcnow().isoformat()
    }
]

# Create events for Faith Centre
fc_events = [
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Sunday Worship",
        "description": "Experience the presence of God in our Sunday morning service.",
        "date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "time": "9:00 AM - 11:00 AM",
        "location": "Main Hall",
        "image_url": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80",
        "is_free": True,
        "accepts_donations": True,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Prayer Meeting",
        "description": "Join us for a powerful time of prayer and intercession.",
        "date": (datetime.utcnow() + timedelta(days=3)).isoformat(),
        "time": "6:00 PM - 8:00 PM",
        "location": "Prayer Room",
        "image_url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80",
        "is_free": True,
        "accepts_donations": False,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Community Service Day",
        "description": "Make a difference in our community. Volunteers needed!",
        "date": (datetime.utcnow() + timedelta(days=15)).isoformat(),
        "time": "8:00 AM - 4:00 PM",
        "location": "Various Locations",
        "image_url": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
        "is_free": True,
        "accepts_donations": True,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Family Fellowship",
        "description": "Bring your family for a fun time of fellowship and games.",
        "date": (datetime.utcnow() + timedelta(days=21)).isoformat(),
        "time": "3:00 PM - 6:00 PM",
        "location": "Fellowship Hall",
        "image_url": "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&q=80",
        "is_free": True,
        "accepts_donations": False,
        "created_at": datetime.utcnow().isoformat()
    }
]

print("Creating events...")
db.events.insert_many(ndm_events + fc_events)

# Create ministries for Nehemiah David Ministries
ndm_ministries = [
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Worship Team",
        "description": "Lead the congregation in spirit-filled worship and praise. Musicians and singers welcome!",
        "leader": "David Williams",
        "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
        "meeting_schedule": "Sundays, 9:00 AM",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Children's Ministry",
        "description": "Teaching children about God's love through engaging lessons and activities.",
        "leader": "Sarah Johnson",
        "image_url": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
        "meeting_schedule": "Sundays, 10:00 AM",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Community Outreach",
        "description": "Serving our community with acts of kindness and compassion.",
        "leader": "Michael Chen",
        "image_url": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
        "meeting_schedule": "Saturdays, 9:00 AM",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Small Groups",
        "description": "Connect with others in intimate settings for prayer, study, and fellowship.",
        "leader": "Emily Rodriguez",
        "image_url": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
        "meeting_schedule": "Wednesdays, 7:00 PM",
        "created_at": datetime.utcnow().isoformat()
    }
]

# Create ministries for Faith Centre
fc_ministries = [
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Prayer Team",
        "description": "Interceding for the needs of our community and church family.",
        "leader": "Grace Thompson",
        "image_url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80",
        "meeting_schedule": "Wednesdays, 6:00 PM",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Hospitality Team",
        "description": "Making everyone feel welcome and at home in God's house.",
        "leader": "James Wilson",
        "image_url": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
        "meeting_schedule": "Sundays, 8:30 AM",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Youth Ministry",
        "description": "Empowering the next generation to live for Christ.",
        "leader": "Alex Martinez",
        "image_url": "https://images.unsplash.com/photo-1610070835951-156b6921281d?w=800&q=80",
        "meeting_schedule": "Fridays, 7:00 PM",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Community Care",
        "description": "Supporting those in need through practical help and resources.",
        "leader": "Linda Brown",
        "image_url": "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
        "meeting_schedule": "Saturdays, 10:00 AM",
        "created_at": datetime.utcnow().isoformat()
    }
]

print("Creating ministries...")
db.ministries.insert_many(ndm_ministries + fc_ministries)

# Create announcements
announcements = [
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "URGENT: Revival Conference Registration Open!",
        "content": "Registration is now open for the REVIVE 5-Day Revival Conference (December 3-7, 2025). Don't miss this life-changing event! Click to register and reserve your spot today.",
        "is_urgent": True,
        "event_id": ndm_events[0]["id"],
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "New Small Groups Starting",
        "content": "Join a small group this season! Groups meet weekly for Bible study, prayer, and fellowship.",
        "is_urgent": False,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Prayer Meeting Tonight",
        "content": "Join us tonight at 6 PM for a powerful prayer meeting. All are welcome!",
        "is_urgent": False,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Volunteer Opportunities Available",
        "content": "We're looking for volunteers to help with our community service initiatives. Sign up today!",
        "is_urgent": False,
        "created_at": datetime.utcnow().isoformat()
    }
]

print("Creating announcements...")
db.announcements.insert_many(announcements)

# Create foundations for Nehemiah David Ministries
foundations = [
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Medical Mission Outreach",
        "description": "Providing healthcare services to underserved communities through mobile clinics and health education programs.",
        "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
        "gallery_images": [
            "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
            "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
            "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=800&q=80",
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
            "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800&q=80",
            "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80"
        ],
        "goal_amount": 100000,
        "raised_amount": 35000,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Widow & Orphan Care",
        "description": "Supporting widows and orphans with housing, education, and emotional support in their time of need.",
        "image_url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
        "gallery_images": [
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
            "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&q=80",
            "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80",
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
            "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80"
        ],
        "goal_amount": 75000,
        "raised_amount": 42000,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Community Feeding Program",
        "description": "Providing nutritious meals to families in need and combating hunger in our local community.",
        "image_url": "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800&q=80",
        "gallery_images": [
            "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800&q=80",
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
            "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
            "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800&q=80",
            "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800&q=80",
            "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80"
        ],
        "goal_amount": 50000,
        "raised_amount": 28000,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "Children's Education Fund",
        "description": "Providing school supplies, tuition assistance, and educational resources to underprivileged children.",
        "image_url": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
        "gallery_images": [
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
            "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
            "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800&q=80"
        ],
        "goal_amount": 60000,
        "raised_amount": 31000,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
]

print("Creating foundations...")
db.foundations.insert_many(foundations)

# Create gallery images
gallery_images = [
    # Worship images
    {"id": str(uuid.uuid4()), "brand_id": ndm_id, "url": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80", "category": "worship", "caption": "Sunday Worship Service", "created_at": datetime.utcnow().isoformat()},
    {"id": str(uuid.uuid4()), "brand_id": ndm_id, "url": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80", "category": "worship", "caption": "Praise and Worship", "created_at": datetime.utcnow().isoformat()},
    {"id": str(uuid.uuid4()), "brand_id": ndm_id, "url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80", "category": "worship", "caption": "Worship Night", "created_at": datetime.utcnow().isoformat()},
    {"id": str(uuid.uuid4()), "brand_id": ndm_id, "url": "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&q=80", "category": "worship", "caption": "Community Worship", "created_at": datetime.utcnow().isoformat()},
    {"id": str(uuid.uuid4()), "brand_id": ndm_id, "url": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80", "category": "worship", "caption": "Worship Team", "created_at": datetime.utcnow().isoformat()},
    {"id": str(uuid.uuid4()), "brand_id": ndm_id, "url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80", "category": "worship", "caption": "Worship Leader", "created_at": datetime.utcnow().isoformat()},
    # Community images
    {"id": str(uuid.uuid4()), "brand_id": ndm_id, "url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80", "category": "community", "caption": "Community Outreach", "created_at": datetime.utcnow().isoformat()},
    {"id": str(uuid.uuid4()), "brand_id": ndm_id, "url": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80", "category": "community", "caption": "Helping Hands", "created_at": datetime.utcnow().isoformat()},
    {"id": str(uuid.uuid4()), "brand_id": ndm_id, "url": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80", "category": "community", "caption": "Children's Ministry", "created_at": datetime.utcnow().isoformat()},
    {"id": str(uuid.uuid4()), "brand_id": ndm_id, "url": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80", "category": "community", "caption": "Fellowship Time", "created_at": datetime.utcnow().isoformat()},
]

print("Creating gallery images...")
db.gallery_images.delete_many({})
db.gallery_images.insert_many(gallery_images)

# Create Countdowns for Live Stream Events
print("Creating countdowns...")
db.countdowns.delete_many({})

# Calculate upcoming dates
now = datetime.utcnow()
next_sunday = now + timedelta(days=(6 - now.weekday()) % 7)
next_friday = now + timedelta(days=(4 - now.weekday()) % 7)
next_month = now + timedelta(days=30)

countdowns = [
    # Nehemiah David Ministries countdowns
    {
        "id": str(uuid.uuid4()),
        "title": "Sunday Morning Service",
        "event_date": (next_sunday.replace(hour=7, minute=0, second=0)).isoformat(),
        "banner_image_url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920&q=80",
        "is_active": True,
        "priority": 3,
        "brand_id": ndm_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Main Worship Service",
        "event_date": (next_sunday.replace(hour=10, minute=0, second=0)).isoformat(),
        "banner_image_url": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80",
        "is_active": True,
        "priority": 5,
        "brand_id": ndm_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Evening Online Service",
        "event_date": (next_sunday.replace(hour=18, minute=30, second=0)).isoformat(),
        "banner_image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=80",
        "is_active": True,
        "priority": 2,
        "brand_id": ndm_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Friday Night Prayer & Worship",
        "event_date": (next_friday.replace(hour=19, minute=0, second=0)).isoformat(),
        "banner_image_url": "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1920&q=80",
        "is_active": True,
        "priority": 4,
        "brand_id": ndm_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "REVIVE - 5 Day Revival Conference",
        "event_date": (next_month.replace(hour=18, minute=0, second=0)).isoformat(),
        "banner_image_url": "https://images.unsplash.com/photo-1540206395-68808572332f?w=1920&q=80",
        "is_active": True,
        "priority": 5,
        "brand_id": ndm_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    },
    # Faith Centre countdowns
    {
        "id": str(uuid.uuid4()),
        "title": "Sunday Morning Worship",
        "event_date": (next_sunday.replace(hour=7, minute=0, second=0)).isoformat(),
        "banner_image_url": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80",
        "is_active": True,
        "priority": 3,
        "brand_id": fc_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Main Service",
        "event_date": (next_sunday.replace(hour=10, minute=0, second=0)).isoformat(),
        "banner_image_url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920&q=80",
        "is_active": True,
        "priority": 5,
        "brand_id": fc_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Friday Fellowship Service",
        "event_date": (next_friday.replace(hour=18, minute=30, second=0)).isoformat(),
        "banner_image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=80",
        "is_active": True,
        "priority": 4,
        "brand_id": fc_id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
]

db.countdowns.insert_many(countdowns)

print("\n=== Database Seeded Successfully! ===")
print(f"Brands: {db.brands.count_documents({})}")
print(f"Events: {db.events.count_documents({})}")
print(f"Ministries: {db.ministries.count_documents({})}")
print(f"Announcements: {db.announcements.count_documents({})}")
print(f"Foundations: {db.foundations.count_documents({})}")
print(f"Gallery Images: {db.gallery_images.count_documents({})}")
print(f"Countdowns: {db.countdowns.count_documents({})}")
