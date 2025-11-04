from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Stripe Configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ========== MODELS ==========

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    role: str = "admin"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AdminCreate(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class Brand(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    domain: str
    logo_url: Optional[str] = None
    primary_color: str = "#1a1a1a"
    secondary_color: str = "#4a90e2"
    tagline: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    service_times: Optional[str] = None
    location: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BrandCreate(BaseModel):
    name: str
    domain: str
    logo_url: Optional[str] = None
    primary_color: str = "#1a1a1a"
    secondary_color: str = "#4a90e2"
    tagline: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    service_times: Optional[str] = None
    location: Optional[str] = None

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    date: str
    time: Optional[str] = None
    location: str
    is_free: bool = True
    image_url: Optional[str] = None
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    time: Optional[str] = None
    location: str
    is_free: bool = True
    image_url: Optional[str] = None
    brand_id: str

class EventAttendee(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    guests: int = 1
    notes: Optional[str] = None
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EventAttendeeCreate(BaseModel):
    event_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    guests: int = 1
    notes: Optional[str] = None
    brand_id: str

class Ministry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_url: Optional[str] = None
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MinistryCreate(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None
    brand_id: str

class Announcement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    is_urgent: bool = False
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    is_urgent: bool = False
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    brand_id: str

class VolunteerApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    ministry: str
    availability: str
    skills: Optional[str] = None
    message: Optional[str] = None
    status: str = "new"
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VolunteerApplicationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    ministry: str
    availability: str
    skills: Optional[str] = None
    message: Optional[str] = None
    brand_id: str

class Subscriber(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SubscriberCreate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    brand_id: str

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str
    brand_id: str

class SermonMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    speaker: str
    date: str
    media_type: str  # video, audio
    media_url: str
    thumbnail_url: Optional[str] = None
    transcript: Optional[str] = None
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SermonMessageCreate(BaseModel):
    title: str
    description: str
    speaker: str
    date: str
    media_type: str
    media_url: str
    thumbnail_url: Optional[str] = None
    transcript: Optional[str] = None
    brand_id: str

class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    content: str
    image_url: Optional[str] = None
    featured: bool = False
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TestimonialCreate(BaseModel):
    name: str
    content: str
    image_url: Optional[str] = None
    featured: bool = False
    brand_id: str

class PrayerRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[EmailStr] = None
    request: str
    is_anonymous: bool = False
    status: str = "new"  # new, praying, answered
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PrayerRequestCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    request: str
    is_anonymous: bool = False
    brand_id: str

class Donation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    donor_name: str
    donor_email: Optional[EmailStr] = None
    amount: float
    category: str  # General, Building, Missions, etc
    date: str
    notes: Optional[str] = None
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DonationCreate(BaseModel):
    donor_name: str
    donor_email: Optional[EmailStr] = None
    amount: float
    category: str
    date: str
    notes: Optional[str] = None
    brand_id: str

class Gallery(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    image_url: str
    event_id: Optional[str] = None
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GalleryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    event_id: Optional[str] = None
    brand_id: str

# ========== MEMBER USER MODELS ==========

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: str = "member"
    brand_id: str
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    brand_id: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class UserRegisterResponse(BaseModel):
    token: str
    user: User

class UserLoginResponse(BaseModel):
    token: str
    user: User

# ========== GIVING/PAYMENT MODELS ==========

class GivingCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    brand_id: str
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GivingCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    brand_id: str

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    amount: float
    currency: str = "usd"
    category: str
    category_id: Optional[str] = None
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    donor_name: Optional[str] = None
    payment_status: str = "pending"  # pending, paid, failed, expired
    status: str = "initiated"  # initiated, completed, failed
    brand_id: str
    metadata: Optional[Dict] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CreateCheckoutRequest(BaseModel):
    amount: float
    category: str
    category_id: Optional[str] = None
    donor_name: Optional[str] = None
    brand_id: str

# ========== LIVE STREAM MODELS ==========

class LiveStream(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    stream_url: str  # YouTube live URL, Vimeo, etc.
    thumbnail_url: Optional[str] = None
    is_live: bool = True
    scheduled_time: Optional[str] = None
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LiveStreamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    stream_url: str
    thumbnail_url: Optional[str] = None
    is_live: bool = True
    scheduled_time: Optional[str] = None
    brand_id: str


# ========== FOUNDATION MODELS ==========

class Foundation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    image_url: str
    gallery_images: List[str] = []
    goal_amount: Optional[float] = None
    raised_amount: float = 0.0
    is_active: bool = True
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FoundationCreate(BaseModel):
    title: str
    description: str
    image_url: str
    gallery_images: List[str] = []
    goal_amount: Optional[float] = None
    brand_id: str

class FoundationDonation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    foundation_id: str
    donor_name: str
    donor_email: EmailStr
    amount: float
    message: Optional[str] = None
    payment_status: str = "pending"
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FoundationDonationCreate(BaseModel):
    foundation_id: str
    donor_name: str
    donor_email: EmailStr
    amount: float
    message: Optional[str] = None
    brand_id: str

# ========== AUTH UTILITIES ==========

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        role = payload.get("role")
        if email is None or role != "admin":
            raise HTTPException(status_code=401, detail="Invalid token")
        admin = await db.admins.find_one({"email": email}, {"_id": 0})
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        role = payload.get("role")
        if email is None or role != "member":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"email": email}, {"_id": 0})
        if user is None or not user.get("is_active"):
            raise HTTPException(status_code=401, detail="User not found or inactive")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))):
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        role = payload.get("role")
        if role == "member":
            user = await db.users.find_one({"email": email}, {"_id": 0})
            if user and user.get("is_active"):
                return user
    except:
        pass
    return None

# ========== AUTH ROUTES ==========

@api_router.post("/auth/register")
async def register_admin(admin_data: AdminCreate):
    # Check if admin already exists
    existing = await db.admins.find_one({"email": admin_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    admin = Admin(email=admin_data.email)
    doc = admin.model_dump()
    doc["password_hash"] = hash_password(admin_data.password)
    
    await db.admins.insert_one(doc)
    
    token = create_access_token({"email": admin.email, "role": "admin"})
    return {"token": token, "admin": admin}

@api_router.post("/auth/login")
async def login_admin(login_data: AdminLogin):
    admin = await db.admins.find_one({"email": login_data.email}, {"_id": 0})
    if not admin or not verify_password(login_data.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"email": admin["email"], "role": "admin"})
    admin_obj = Admin(**admin)
    return {"token": token, "admin": admin_obj}

@api_router.get("/auth/me", response_model=Admin)
async def get_me(admin = Depends(get_current_admin)):
    return Admin(**admin)

# ========== BRAND ROUTES ==========

@api_router.get("/brands", response_model=List[Brand])
async def get_brands():
    brands = await db.brands.find({}, {"_id": 0}).to_list(100)
    return brands

@api_router.get("/brands/{brand_id}", response_model=Brand)
async def get_brand(brand_id: str):
    brand = await db.brands.find_one({"id": brand_id}, {"_id": 0})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand

@api_router.post("/brands", response_model=Brand)
async def create_brand(brand_data: BrandCreate, admin = Depends(get_current_admin)):
    brand = Brand(**brand_data.model_dump())
    await db.brands.insert_one(brand.model_dump())
    return brand

@api_router.put("/brands/{brand_id}", response_model=Brand)
async def update_brand(brand_id: str, brand_data: BrandCreate, admin = Depends(get_current_admin)):
    result = await db.brands.update_one(
        {"id": brand_id},
        {"$set": brand_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    brand = await db.brands.find_one({"id": brand_id}, {"_id": 0})
    return brand

# ========== EVENT ROUTES ==========

@api_router.get("/events", response_model=List[Event])
async def get_events(brand_id: Optional[str] = None):
    query = {"brand_id": brand_id} if brand_id else {}
    events = await db.events.find(query, {"_id": 0}).to_list(1000)
    return events

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, admin = Depends(get_current_admin)):
    event = Event(**event_data.model_dump())
    await db.events.insert_one(event.model_dump())
    return event

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event_data: EventCreate, admin = Depends(get_current_admin)):
    result = await db.events.update_one(
        {"id": event_id},
        {"$set": event_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    return event

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, admin = Depends(get_current_admin)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}

# ========== EVENT ATTENDEE ROUTES ==========

@api_router.post("/events/{event_id}/register", response_model=EventAttendee)
async def register_for_event(event_id: str, attendee_data: EventAttendeeCreate):
    # Check if event exists
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    attendee = EventAttendee(**attendee_data.model_dump())
    await db.event_attendees.insert_one(attendee.model_dump())
    return attendee

@api_router.get("/events/{event_id}/attendees", response_model=List[EventAttendee])
async def get_event_attendees(event_id: str, admin = Depends(get_current_admin)):
    attendees = await db.event_attendees.find({"event_id": event_id}, {"_id": 0}).to_list(1000)
    return attendees

@api_router.get("/attendees", response_model=List[EventAttendee])
async def get_all_attendees(brand_id: Optional[str] = None, admin = Depends(get_current_admin)):
    query = {"brand_id": brand_id} if brand_id else {}
    attendees = await db.event_attendees.find(query, {"_id": 0}).to_list(1000)
    return attendees

# ========== MINISTRY ROUTES ==========

@api_router.get("/ministries", response_model=List[Ministry])
async def get_ministries(brand_id: Optional[str] = None):
    query = {"brand_id": brand_id} if brand_id else {}
    ministries = await db.ministries.find(query, {"_id": 0}).to_list(1000)
    return ministries

@api_router.post("/ministries", response_model=Ministry)
async def create_ministry(ministry_data: MinistryCreate, admin = Depends(get_current_admin)):
    ministry = Ministry(**ministry_data.model_dump())
    await db.ministries.insert_one(ministry.model_dump())
    return ministry

@api_router.put("/ministries/{ministry_id}", response_model=Ministry)
async def update_ministry(ministry_id: str, ministry_data: MinistryCreate, admin = Depends(get_current_admin)):
    result = await db.ministries.update_one(
        {"id": ministry_id},
        {"$set": ministry_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ministry not found")
    ministry = await db.ministries.find_one({"id": ministry_id}, {"_id": 0})
    return ministry

@api_router.delete("/ministries/{ministry_id}")
async def delete_ministry(ministry_id: str, admin = Depends(get_current_admin)):
    result = await db.ministries.delete_one({"id": ministry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ministry not found")
    return {"message": "Ministry deleted"}

# ========== ANNOUNCEMENT ROUTES ==========

@api_router.get("/announcements", response_model=List[Announcement])
async def get_announcements(brand_id: Optional[str] = None):
    query = {"brand_id": brand_id} if brand_id else {}
    announcements = await db.announcements.find(query, {"_id": 0}).to_list(1000)
    return announcements

@api_router.get("/announcements/urgent")
async def get_urgent_announcements(brand_id: Optional[str] = None):
    now = datetime.now(timezone.utc).isoformat()
    query = {
        "is_urgent": True,
        "brand_id": brand_id
    } if brand_id else {"is_urgent": True}
    
    announcements = await db.announcements.find(query, {"_id": 0}).to_list(10)
    
    # Filter by scheduled dates
    filtered = []
    for ann in announcements:
        if ann.get("scheduled_start") and ann["scheduled_start"] > now:
            continue
        if ann.get("scheduled_end") and ann["scheduled_end"] < now:
            continue
        filtered.append(ann)
    
    return filtered

@api_router.post("/announcements", response_model=Announcement)
async def create_announcement(announcement_data: AnnouncementCreate, admin = Depends(get_current_admin)):
    announcement = Announcement(**announcement_data.model_dump())
    await db.announcements.insert_one(announcement.model_dump())
    return announcement

@api_router.put("/announcements/{announcement_id}", response_model=Announcement)
async def update_announcement(announcement_id: str, announcement_data: AnnouncementCreate, admin = Depends(get_current_admin)):
    result = await db.announcements.update_one(
        {"id": announcement_id},
        {"$set": announcement_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    announcement = await db.announcements.find_one({"id": announcement_id}, {"_id": 0})
    return announcement

@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, admin = Depends(get_current_admin)):
    result = await db.announcements.delete_one({"id": announcement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted"}

# ========== VOLUNTEER ROUTES ==========

@api_router.post("/volunteers", response_model=VolunteerApplication)
async def create_volunteer_application(application_data: VolunteerApplicationCreate):
    application = VolunteerApplication(**application_data.model_dump())
    await db.volunteer_applications.insert_one(application.model_dump())
    return application

@api_router.get("/volunteers", response_model=List[VolunteerApplication])
async def get_volunteer_applications(brand_id: Optional[str] = None, admin = Depends(get_current_admin)):
    query = {"brand_id": brand_id} if brand_id else {}
    applications = await db.volunteer_applications.find(query, {"_id": 0}).to_list(1000)
    return applications

@api_router.put("/volunteers/{application_id}/status")
async def update_volunteer_status(application_id: str, status: str, admin = Depends(get_current_admin)):
    result = await db.volunteer_applications.update_one(
        {"id": application_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Status updated"}

# ========== SUBSCRIBER ROUTES ==========

@api_router.post("/subscribers", response_model=Subscriber)
async def create_subscriber(subscriber_data: SubscriberCreate):
    subscriber = Subscriber(**subscriber_data.model_dump())
    await db.subscribers.insert_one(subscriber.model_dump())
    return subscriber

@api_router.get("/subscribers", response_model=List[Subscriber])
async def get_subscribers(brand_id: Optional[str] = None, admin = Depends(get_current_admin)):
    query = {"brand_id": brand_id} if brand_id else {}
    subscribers = await db.subscribers.find(query, {"_id": 0}).to_list(1000)
    return subscribers

# ========== CONTACT ROUTES ==========

@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(message_data: ContactMessageCreate):
    message = ContactMessage(**message_data.model_dump())
    await db.contact_messages.insert_one(message.model_dump())
    return message

@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages(brand_id: Optional[str] = None, admin = Depends(get_current_admin)):
    query = {"brand_id": brand_id} if brand_id else {}
    messages = await db.contact_messages.find(query, {"_id": 0}).to_list(1000)
    return messages

# ========== SERMON/MESSAGE ROUTES ==========

@api_router.get("/sermons", response_model=List[SermonMessage])
async def get_sermons(brand_id: Optional[str] = None):
    query = {"brand_id": brand_id} if brand_id else {}
    sermons = await db.sermons.find(query, {"_id": 0}).to_list(1000)
    return sermons

@api_router.get("/sermons/{sermon_id}", response_model=SermonMessage)
async def get_sermon(sermon_id: str):
    sermon = await db.sermons.find_one({"id": sermon_id}, {"_id": 0})
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    return sermon

@api_router.post("/sermons", response_model=SermonMessage)
async def create_sermon(sermon_data: SermonMessageCreate, admin = Depends(get_current_admin)):
    sermon = SermonMessage(**sermon_data.model_dump())
    await db.sermons.insert_one(sermon.model_dump())
    return sermon

@api_router.put("/sermons/{sermon_id}", response_model=SermonMessage)
async def update_sermon(sermon_id: str, sermon_data: SermonMessageCreate, admin = Depends(get_current_admin)):
    result = await db.sermons.update_one(
        {"id": sermon_id},
        {"$set": sermon_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sermon not found")
    sermon = await db.sermons.find_one({"id": sermon_id}, {"_id": 0})
    return sermon

@api_router.delete("/sermons/{sermon_id}")
async def delete_sermon(sermon_id: str, admin = Depends(get_current_admin)):
    result = await db.sermons.delete_one({"id": sermon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sermon not found")
    return {"message": "Sermon deleted"}

# ========== TESTIMONIAL ROUTES ==========

@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials(brand_id: Optional[str] = None, featured: Optional[bool] = None):
    query = {"brand_id": brand_id} if brand_id else {}
    if featured is not None:
        query["featured"] = featured
    testimonials = await db.testimonials.find(query, {"_id": 0}).to_list(1000)
    return testimonials

@api_router.post("/testimonials", response_model=Testimonial)
async def create_testimonial(testimonial_data: TestimonialCreate, admin = Depends(get_current_admin)):
    testimonial = Testimonial(**testimonial_data.model_dump())
    await db.testimonials.insert_one(testimonial.model_dump())
    return testimonial

@api_router.put("/testimonials/{testimonial_id}", response_model=Testimonial)
async def update_testimonial(testimonial_id: str, testimonial_data: TestimonialCreate, admin = Depends(get_current_admin)):
    result = await db.testimonials.update_one(
        {"id": testimonial_id},
        {"$set": testimonial_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    testimonial = await db.testimonials.find_one({"id": testimonial_id}, {"_id": 0})
    return testimonial

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, admin = Depends(get_current_admin)):
    result = await db.testimonials.delete_one({"id": testimonial_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"message": "Testimonial deleted"}

# ========== PRAYER REQUEST ROUTES ==========

@api_router.post("/prayer-requests", response_model=PrayerRequest)
async def create_prayer_request(prayer_data: PrayerRequestCreate):
    prayer = PrayerRequest(**prayer_data.model_dump())
    await db.prayer_requests.insert_one(prayer.model_dump())
    return prayer

@api_router.get("/prayer-requests", response_model=List[PrayerRequest])
async def get_prayer_requests(brand_id: Optional[str] = None, admin = Depends(get_current_admin)):
    query = {"brand_id": brand_id} if brand_id else {}
    prayers = await db.prayer_requests.find(query, {"_id": 0}).to_list(1000)
    return prayers

@api_router.put("/prayer-requests/{prayer_id}/status")
async def update_prayer_status(prayer_id: str, status: str, admin = Depends(get_current_admin)):
    result = await db.prayer_requests.update_one(
        {"id": prayer_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prayer request not found")
    return {"message": "Status updated"}

@api_router.get("/prayer-requests/public")
async def get_public_prayer_requests(brand_id: Optional[str] = None):
    query = {"brand_id": brand_id, "is_anonymous": False} if brand_id else {"is_anonymous": False}
    prayers = await db.prayer_requests.find(query, {"_id": 0, "email": 0}).to_list(100)
    return prayers

# ========== DONATION ROUTES ==========

@api_router.post("/donations", response_model=Donation)
async def create_donation(donation_data: DonationCreate, admin = Depends(get_current_admin)):
    donation = Donation(**donation_data.model_dump())
    await db.donations.insert_one(donation.model_dump())
    return donation

@api_router.get("/donations", response_model=List[Donation])
async def get_donations(brand_id: Optional[str] = None, admin = Depends(get_current_admin)):
    query = {"brand_id": brand_id} if brand_id else {}
    donations = await db.donations.find(query, {"_id": 0}).to_list(1000)
    return donations

@api_router.get("/donations/stats")
async def get_donation_stats(brand_id: Optional[str] = None, admin = Depends(get_current_admin)):
    query = {"brand_id": brand_id} if brand_id else {}
    donations = await db.donations.find(query, {"_id": 0}).to_list(10000)
    
    total = sum(d["amount"] for d in donations)
    by_category = {}
    for d in donations:
        cat = d.get("category", "General")
        by_category[cat] = by_category.get(cat, 0) + d["amount"]
    
    return {
        "total": total,
        "count": len(donations),
        "by_category": by_category,
        "donations": donations[-10:]  # Last 10
    }

# ========== GALLERY ROUTES ==========

@api_router.get("/gallery", response_model=List[Gallery])
async def get_gallery_images(brand_id: Optional[str] = None, event_id: Optional[str] = None):
    query = {}
    if brand_id:
        query["brand_id"] = brand_id
    if event_id:
        query["event_id"] = event_id
    images = await db.gallery.find(query, {"_id": 0}).to_list(1000)
    return images

@api_router.post("/gallery", response_model=Gallery)
async def create_gallery_image(gallery_data: GalleryCreate, admin = Depends(get_current_admin)):
    image = Gallery(**gallery_data.model_dump())
    await db.gallery.insert_one(image.model_dump())
    return image

@api_router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: str, admin = Depends(get_current_admin)):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted"}

# ========== ANALYTICS ROUTES ==========

@api_router.get("/analytics/overview")
async def get_analytics_overview(brand_id: Optional[str] = None, admin = Depends(get_current_admin)):
    query = {"brand_id": brand_id} if brand_id else {}
    
    events_count = await db.events.count_documents(query)
    ministries_count = await db.ministries.count_documents(query)
    announcements_count = await db.announcements.count_documents(query)
    volunteers_count = await db.volunteer_applications.count_documents(query)
    subscribers_count = await db.subscribers.count_documents(query)
    prayers_count = await db.prayer_requests.count_documents(query)
    testimonials_count = await db.testimonials.count_documents(query)
    sermons_count = await db.sermons.count_documents(query)
    contacts_count = await db.contact_messages.count_documents(query)
    
    # Get recent activity
    recent_volunteers = await db.volunteer_applications.find(query, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    recent_prayers = await db.prayer_requests.find(query, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "totals": {
            "events": events_count,
            "ministries": ministries_count,
            "announcements": announcements_count,
            "volunteers": volunteers_count,
            "subscribers": subscribers_count,
            "prayers": prayers_count,
            "testimonials": testimonials_count,
            "sermons": sermons_count,
            "contacts": contacts_count
        },
        "recent_activity": {
            "volunteers": recent_volunteers,
            "prayers": recent_prayers
        }
    }

# ========== MEMBER USER ROUTES ==========

@api_router.post("/users/register", response_model=UserRegisterResponse)
async def register_user(user_data: UserCreate):
    # Check if user already exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        brand_id=user_data.brand_id
    )
    doc = user.model_dump()
    doc["password_hash"] = hash_password(user_data.password)
    
    await db.users.insert_one(doc)
    
    token = create_access_token({"email": user.email, "role": "member"})
    return UserRegisterResponse(token=token, user=user)

@api_router.post("/users/login", response_model=UserLoginResponse)
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active"):
        raise HTTPException(status_code=403, detail="Account is inactive")
    
    token = create_access_token({"email": user["email"], "role": "member"})
    user_obj = User(**user)
    return UserLoginResponse(token=token, user=user_obj)

@api_router.get("/users/me", response_model=User)
async def get_current_user_info(user = Depends(get_current_user)):
    return User(**user)

@api_router.put("/users/me", response_model=User)
async def update_current_user(user_data: UserUpdate, user = Depends(get_current_user)):
    update_dict = {k: v for k, v in user_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if update_dict:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": update_dict}
        )
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return User(**updated_user)

@api_router.get("/users", response_model=List[User])
async def get_all_users(brand_id: Optional[str] = None, admin = Depends(get_current_admin)):
    query = {"brand_id": brand_id} if brand_id else {}
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.post("/users", response_model=User)
async def create_user_by_admin(user_data: UserCreate, admin = Depends(get_current_admin)):
    # Check if user already exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        brand_id=user_data.brand_id
    )
    doc = user.model_dump()
    doc["password_hash"] = hash_password(user_data.password)
    
    await db.users.insert_one(doc)
    return user

@api_router.put("/users/{user_id}/status")
async def toggle_user_status(user_id: str, is_active: bool, admin = Depends(get_current_admin)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": is_active, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User status updated"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin = Depends(get_current_admin)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# ========== GIVING CATEGORY ROUTES ==========

@api_router.get("/giving-categories", response_model=List[GivingCategory])
async def get_giving_categories(brand_id: Optional[str] = None):
    query = {"brand_id": brand_id, "is_active": True} if brand_id else {"is_active": True}
    categories = await db.giving_categories.find(query, {"_id": 0}).to_list(100)
    return categories

@api_router.post("/giving-categories", response_model=GivingCategory)
async def create_giving_category(category_data: GivingCategoryCreate, admin = Depends(get_current_admin)):
    category = GivingCategory(**category_data.model_dump())
    await db.giving_categories.insert_one(category.model_dump())
    return category

@api_router.put("/giving-categories/{category_id}", response_model=GivingCategory)
async def update_giving_category(category_id: str, category_data: GivingCategoryCreate, admin = Depends(get_current_admin)):
    result = await db.giving_categories.update_one(
        {"id": category_id},
        {"$set": category_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    category = await db.giving_categories.find_one({"id": category_id}, {"_id": 0})
    return category

@api_router.delete("/giving-categories/{category_id}")
async def delete_giving_category(category_id: str, admin = Depends(get_current_admin)):
    result = await db.giving_categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# ========== STRIPE PAYMENT ROUTES ==========

@api_router.post("/payments/create-checkout")
async def create_checkout_session(
    request: Request,
    checkout_data: CreateCheckoutRequest,
    current_user = Depends(get_optional_user)
):
    try:
        # Get host URL from request
        host_url = str(request.base_url).rstrip('/')
        
        # Initialize Stripe checkout
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Build success and cancel URLs
        success_url = f"{host_url}/giving/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{host_url}/giving"
        
        # Prepare metadata
        metadata = {
            "category": checkout_data.category,
            "brand_id": checkout_data.brand_id,
            "donor_name": checkout_data.donor_name or "Anonymous"
        }
        
        if checkout_data.category_id:
            metadata["category_id"] = checkout_data.category_id
        
        if current_user:
            metadata["user_id"] = current_user["id"]
            metadata["user_email"] = current_user["email"]
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=float(checkout_data.amount),
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            session_id=session.session_id,
            amount=checkout_data.amount,
            currency="usd",
            category=checkout_data.category,
            category_id=checkout_data.category_id,
            user_id=current_user["id"] if current_user else None,
            user_email=current_user["email"] if current_user else None,
            donor_name=checkout_data.donor_name,
            payment_status="pending",
            status="initiated",
            brand_id=checkout_data.brand_id,
            metadata=metadata
        )
        
        await db.payment_transactions.insert_one(transaction.model_dump())
        
        return {
            "url": session.url,
            "session_id": session.session_id
        }
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    try:
        # Get transaction from database
        transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # If already completed, return existing status
        if transaction.get("payment_status") == "paid":
            return transaction
        
        # Check status with Stripe
        webhook_url = f"{os.environ.get('BACKEND_URL', 'http://localhost:8001')}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction in database
        update_data = {
            "payment_status": checkout_status.payment_status,
            "status": "completed" if checkout_status.payment_status == "paid" else checkout_status.status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        
        # Get updated transaction
        updated_transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        
        return updated_transaction
        
    except Exception as e:
        logger.error(f"Error checking payment status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to check payment status: {str(e)}")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction based on webhook
        if webhook_response.session_id:
            update_data = {
                "payment_status": webhook_response.payment_status,
                "status": "completed" if webhook_response.payment_status == "paid" else "failed",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": update_data}
            )
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/payments/history")
async def get_payment_history(
    brand_id: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = {"user_id": current_user["id"]}
    if brand_id:
        query["brand_id"] = brand_id
    
    transactions = await db.payment_transactions.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return transactions

@api_router.get("/payments/transactions")
async def get_all_transactions(
    brand_id: Optional[str] = None,
    admin = Depends(get_current_admin)
):
    query = {"brand_id": brand_id} if brand_id else {}
    transactions = await db.payment_transactions.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return transactions

@api_router.get("/payments/stats")
async def get_payment_stats(
    brand_id: Optional[str] = None,
    admin = Depends(get_current_admin)
):
    query = {"brand_id": brand_id, "payment_status": "paid"} if brand_id else {"payment_status": "paid"}
    transactions = await db.payment_transactions.find(query, {"_id": 0}).to_list(10000)
    
    total = sum(t["amount"] for t in transactions)
    by_category = {}
    for t in transactions:
        cat = t.get("category", "General")
        by_category[cat] = by_category.get(cat, 0) + t["amount"]
    
    return {
        "total": total,
        "count": len(transactions),
        "by_category": by_category,
        "recent_transactions": transactions[:10]
    }

# ========== LIVE STREAM ROUTES ==========

@api_router.get("/live-streams", response_model=List[LiveStream])
async def get_live_streams(brand_id: Optional[str] = None, is_live: Optional[bool] = None):
    query = {}
    if brand_id:
        query["brand_id"] = brand_id
    if is_live is not None:
        query["is_live"] = is_live
    
    streams = await db.live_streams.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return streams

@api_router.get("/live-streams/active")
async def get_active_stream(brand_id: Optional[str] = None):
    query = {"is_live": True}
    if brand_id:
        query["brand_id"] = brand_id
    
    stream = await db.live_streams.find_one(query, {"_id": 0})
    if not stream:
        return None
    return stream

@api_router.post("/live-streams", response_model=LiveStream)
async def create_live_stream(stream_data: LiveStreamCreate, admin = Depends(get_current_admin)):
    stream = LiveStream(**stream_data.model_dump())
    await db.live_streams.insert_one(stream.model_dump())
    return stream

@api_router.put("/live-streams/{stream_id}", response_model=LiveStream)
async def update_live_stream(stream_id: str, stream_data: LiveStreamCreate, admin = Depends(get_current_admin)):
    result = await db.live_streams.update_one(
        {"id": stream_id},
        {"$set": stream_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Live stream not found")
    stream = await db.live_streams.find_one({"id": stream_id}, {"_id": 0})
    return stream

@api_router.delete("/live-streams/{stream_id}")
async def delete_live_stream(stream_id: str, admin = Depends(get_current_admin)):
    result = await db.live_streams.delete_one({"id": stream_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Live stream not found")
    return {"message": "Live stream deleted"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
