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
        "registration_enabled": True,
        "registration_fields": {"mobile_number": True, "place": True, "category": True},
        "category_options": ["General", "VIP", "Volunteer", "Speaker", "Media", "Youth", "Family"],
        "registration_deadline": None,
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
        "title": "REVIVE 2025 - 5 Day Revival Conference",
        "content": "Join us for an extraordinary 5-day revival experience that will transform your faith! Experience powerful worship, life-changing messages, and divine encounters. Don't miss this once-a-year gathering of believers.",
        "image_url": "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80",
        "is_urgent": True,
        "event_id": ndm_events[0]["id"],
        "location": "Main Sanctuary, Amaravathi Rd, Guntur",
        "event_time": "December 3-7, 2025 | 6:00 PM - 9:00 PM Daily",
        "requires_registration": True,
        "scheduled_start": None,
        "scheduled_end": None,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": ndm_id,
        "title": "New Small Groups Starting",
        "content": "Join a small group this season! Groups meet weekly for Bible study, prayer, and fellowship. Connect with others and grow in your faith journey.",
        "image_url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
        "is_urgent": False,
        "event_id": None,
        "location": None,
        "event_time": None,
        "requires_registration": False,
        "scheduled_start": None,
        "scheduled_end": None,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Annual Faith Conference 2025",
        "content": "Our biggest event of the year is here! Join us for 3 days of worship, teaching, and fellowship. Special guest speakers and worship teams from around the country.",
        "image_url": "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&q=80",
        "is_urgent": True,
        "event_id": fc_events[0]["id"],
        "location": "Main Hall, Faith Centre",
        "event_time": "Every Sunday | 9:00 AM - 11:00 AM",
        "requires_registration": False,
        "scheduled_start": None,
        "scheduled_end": None,
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "brand_id": fc_id,
        "title": "Volunteer Opportunities Available",
        "content": "We're looking for volunteers to help with our community service initiatives. Sign up today and make a difference!",
        "image_url": "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
        "is_urgent": False,
        "event_id": None,
        "location": None,
        "event_time": None,
        "requires_registration": False,
        "scheduled_start": None,
        "scheduled_end": None,
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

# Create Blogs
print("Creating blogs...")
db.blogs.delete_many({})

blogs = [
    {
        "id": str(uuid.uuid4()),
        "title": "Welcome to Our New Blog",
        "content": "<p>We're excited to launch our new blog platform where we'll be sharing inspiring stories, spiritual insights, and community updates.</p><p>Stay tuned for more content coming soon!</p>",
        "content_blocks": [
            {
                "id": str(uuid.uuid4()),
                "type": "heading",
                "content": "Why We Started This Blog",
                "alignment": "left",
                "order": 0
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "content": "Our mission is to connect with you beyond Sunday services and share the transformative power of faith in everyday life.",
                "alignment": "left",
                "order": 1
            },
            {
                "id": str(uuid.uuid4()),
                "type": "image",
                "image_url": "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=1200",
                "alignment": "center",
                "order": 2
            },
            {
                "id": str(uuid.uuid4()),
                "type": "quote",
                "content": "Faith is taking the first step even when you don't see the whole staircase. - Martin Luther King Jr.",
                "alignment": "left",
                "order": 3
            }
        ],
        "excerpt": "We're excited to launch our new blog platform where we'll be sharing inspiring stories, spiritual insights, and community updates.",
        "author": "Admin",
        "image_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200",
        "brand_id": ndm_id,
        "published": True,
        "created_at": (now - timedelta(days=7)).isoformat(),
        "updated_at": (now - timedelta(days=7)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "The Power of Community Prayer",
        "content": "<p>Prayer is the foundation of our community. When we come together in prayer, miracles happen.</p><p>Join us every Wednesday evening for our prayer meeting.</p>",
        "content_blocks": [
            {
                "id": str(uuid.uuid4()),
                "type": "heading",
                "content": "Prayer Changes Things",
                "alignment": "left",
                "order": 0
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "content": "Throughout the Bible, we see countless examples of how prayer transformed situations, healed the sick, and brought hope to the hopeless.",
                "alignment": "left",
                "order": 1
            },
            {
                "id": str(uuid.uuid4()),
                "type": "image",
                "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200",
                "alignment": "center",
                "order": 2
            }
        ],
        "excerpt": "Discover the transformative power of community prayer and how it strengthens our faith together.",
        "author": "Pastor David",
        "image_url": "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200",
        "brand_id": ndm_id,
        "published": True,
        "created_at": (now - timedelta(days=5)).isoformat(),
        "updated_at": (now - timedelta(days=5)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Serving Our Community with Love",
        "content": "<p>Last week, our volunteers served over 200 meals to families in need. This is what faith in action looks like.</p>",
        "content_blocks": [
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "content": "Our community outreach program continues to make a difference in the lives of those who need it most. Through food distribution, clothing drives, and educational support, we're living out the call to love our neighbors.",
                "alignment": "left",
                "order": 0
            },
            {
                "id": str(uuid.uuid4()),
                "type": "image",
                "image_url": "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200",
                "alignment": "center",
                "order": 1
            },
            {
                "id": str(uuid.uuid4()),
                "type": "heading",
                "content": "Get Involved",
                "alignment": "left",
                "order": 2
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "content": "Want to join us in serving? Contact our volunteer coordinator to learn about upcoming opportunities to make a difference.",
                "alignment": "left",
                "order": 3
            }
        ],
        "excerpt": "See how our community outreach program is transforming lives through acts of love and service.",
        "author": "Community Team",
        "image_url": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200",
        "brand_id": ndm_id,
        "published": True,
        "created_at": (now - timedelta(days=3)).isoformat(),
        "updated_at": (now - timedelta(days=3)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Faith Centre Community Update",
        "content": "<p>Exciting news from Faith Centre! We're growing and expanding our ministries to serve you better.</p>",
        "content_blocks": [
            {
                "id": str(uuid.uuid4()),
                "type": "heading",
                "content": "What's New at Faith Centre",
                "alignment": "left",
                "order": 0
            },
            {
                "id": str(uuid.uuid4()),
                "type": "text",
                "content": "We've launched new small groups, expanded our children's ministry, and introduced a youth mentorship program. God is doing amazing things in our community!",
                "alignment": "left",
                "order": 1
            },
            {
                "id": str(uuid.uuid4()),
                "type": "image",
                "image_url": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
                "alignment": "center",
                "order": 2
            }
        ],
        "excerpt": "Discover the exciting new programs and ministries launching at Faith Centre this season.",
        "author": "Admin",
        "image_url": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200",
        "brand_id": fc_id,
        "published": True,
        "created_at": (now - timedelta(days=2)).isoformat(),
        "updated_at": (now - timedelta(days=2)).isoformat()
    }
]

db.blogs.insert_many(blogs)

# Create sample event attendees
print("Creating event attendees...")
db.event_attendees.delete_many({})

event_attendees = [
    # Attendees for REVIVE 2025 event
    {
        "id": str(uuid.uuid4()),
        "event_id": ndm_events[0]["id"],  # REVIVE 2025
        "brand_id": ndm_id,
        "name": "John Smith",
        "email": "john.smith@email.com",
        "phone": "+919876543201",
        "guests": 2,
        "created_at": (now - timedelta(days=5)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "event_id": ndm_events[0]["id"],  # REVIVE 2025
        "brand_id": ndm_id,
        "name": "Mary Johnson",
        "email": "mary.johnson@email.com",
        "phone": "+919876543202",
        "guests": 1,
        "created_at": (now - timedelta(days=4)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "event_id": ndm_events[0]["id"],  # REVIVE 2025
        "brand_id": ndm_id,
        "name": "David Wilson",
        "email": "david.wilson@email.com",
        "phone": "+919876543203",
        "guests": 3,
        "created_at": (now - timedelta(days=3)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "event_id": ndm_events[0]["id"],  # REVIVE 2025
        "brand_id": ndm_id,
        "name": "Sarah Brown",
        "email": "sarah.brown@email.com",
        "phone": "+919876543204",
        "guests": 2,
        "created_at": (now - timedelta(days=2)).isoformat()
    },
    # Attendees for Youth Conference
    {
        "id": str(uuid.uuid4()),
        "event_id": ndm_events[1]["id"],  # Youth Conference
        "brand_id": ndm_id,
        "name": "Michael Davis",
        "email": "michael.davis@email.com",
        "phone": "+919876543205",
        "guests": 1,
        "created_at": (now - timedelta(days=3)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "event_id": ndm_events[1]["id"],  # Youth Conference
        "brand_id": ndm_id,
        "name": "Emily Taylor",
        "email": "emily.taylor@email.com",
        "phone": "+919876543206",
        "guests": 1,
        "created_at": (now - timedelta(days=2)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "event_id": ndm_events[1]["id"],  # Youth Conference
        "brand_id": ndm_id,
        "name": "James Anderson",
        "email": "james.anderson@email.com",
        "phone": "+919876543207",
        "guests": 1,
        "created_at": (now - timedelta(days=1)).isoformat()
    },
    # Attendees for Prayer Summit
    {
        "id": str(uuid.uuid4()),
        "event_id": ndm_events[2]["id"],  # Prayer Summit
        "brand_id": ndm_id,
        "name": "Linda Martinez",
        "email": "linda.martinez@email.com",
        "phone": "+919876543208",
        "guests": 2,
        "created_at": (now - timedelta(days=6)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "event_id": ndm_events[2]["id"],  # Prayer Summit
        "brand_id": ndm_id,
        "name": "Robert Garcia",
        "email": "robert.garcia@email.com",
        "phone": "+919876543209",
        "guests": 1,
        "created_at": (now - timedelta(days=5)).isoformat()
    },
    # Attendees for Faith Centre Annual Conference
    {
        "id": str(uuid.uuid4()),
        "event_id": fc_events[0]["id"],  # Annual Faith Conference
        "brand_id": fc_id,
        "name": "Jennifer White",
        "email": "jennifer.white@email.com",
        "phone": "+919876543210",
        "guests": 2,
        "created_at": (now - timedelta(days=4)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "event_id": fc_events[0]["id"],  # Annual Faith Conference
        "brand_id": fc_id,
        "name": "William Harris",
        "email": "william.harris@email.com",
        "phone": "+919876543211",
        "guests": 4,
        "created_at": (now - timedelta(days=3)).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "event_id": fc_events[0]["id"],  # Annual Faith Conference
        "brand_id": fc_id,
        "name": "Patricia Clark",
        "email": "patricia.clark@email.com",
        "phone": "+919876543212",
        "guests": 1,
        "created_at": (now - timedelta(days=2)).isoformat()
    }
]

db.event_attendees.insert_many(event_attendees)

# Create admin users
print("Creating admin users...")
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

admin_users = [
    {
        "id": str(uuid.uuid4()),
        "email": "promptforge.dev@gmail.com",
        "password_hash": pwd_context.hash("P9$wX!7rAq#4Lz@M2f"),
        "full_name": "Admin",
        "role": "admin",
        "brand_id": ndm_id,  # Default to Nehemiah David Ministries
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "email": "admin@faithcenter.com",
        "password_hash": pwd_context.hash("Admin@2025"),
        "full_name": "Faith Centre Admin",
        "role": "admin",
        "brand_id": fc_id,  # Faith Centre admin
        "created_at": datetime.utcnow().isoformat()
    }
]

db.admins.delete_many({})  # Clear existing admin users
db.admins.insert_many(admin_users)

print("\n=== Database Seeded Successfully! ===")
print(f"Brands: {db.brands.count_documents({})}")
print(f"Events: {db.events.count_documents({})}")
print(f"Ministries: {db.ministries.count_documents({})}")
print(f"Announcements: {db.announcements.count_documents({})}")
print(f"Foundations: {db.foundations.count_documents({})}")
print(f"Gallery Images: {db.gallery_images.count_documents({})}")
print(f"Countdowns: {db.countdowns.count_documents({})}")
print(f"Blogs: {db.blogs.count_documents({})}")
print(f"Event Attendees: {db.event_attendees.count_documents({})}")
print(f"Admin Users: {db.admins.count_documents({})}")
