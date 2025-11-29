from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64
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
    # Header navigation settings - list of hidden nav links (deprecated - use navigation_links instead)
    hidden_nav_links: Optional[List[str]] = []
    # Enhanced navigation settings with order and visibility
    navigation_links: Optional[List[Dict[str, Any]]] = None
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
    hidden_nav_links: Optional[List[str]] = []
    navigation_links: Optional[List[Dict[str, Any]]] = None

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
    image_url: Optional[str] = None  # Featured image for announcement
    is_urgent: bool = False
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    # New fields for event-related announcements
    event_id: Optional[str] = None  # Link to specific event
    location: Optional[str] = None  # Event location
    event_time: Optional[str] = None  # Event timing info
    requires_registration: bool = False  # If event needs registration
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    is_urgent: bool = False
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    event_id: Optional[str] = None
    location: Optional[str] = None
    event_time: Optional[str] = None
    requires_registration: bool = False
    brand_id: str

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    is_urgent: Optional[bool] = None
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    event_id: Optional[str] = None
    location: Optional[str] = None
    event_time: Optional[str] = None
    requires_registration: Optional[bool] = None

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

# ========== BLOG MODELS ==========

class ContentBlock(BaseModel):
    """Represents a content block in a blog post (text, image, heading, etc.)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # "text", "image", "heading", "quote"
    content: Optional[str] = None  # For text/heading content
    image_url: Optional[str] = None  # For image blocks
    alignment: Optional[str] = "left"  # "left", "right", "center"
    order: int = 0  # Order in the blog post

class Blog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str  # Keep for backward compatibility and plain text
    content_blocks: Optional[List[ContentBlock]] = []  # Rich content blocks
    excerpt: Optional[str] = None
    author: str = "Admin"
    image_url: Optional[str] = None  # Featured image
    brand_id: str
    published: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BlogCreate(BaseModel):
    title: str
    content: str
    content_blocks: Optional[List[ContentBlock]] = []
    excerpt: Optional[str] = None
    author: str = "Admin"
    image_url: Optional[str] = None
    brand_id: str
    published: bool = True

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    content_blocks: Optional[List[ContentBlock]] = None
    excerpt: Optional[str] = None
    author: Optional[str] = None
    image_url: Optional[str] = None
    published: Optional[bool] = None

# ========== COUNTDOWN MODELS ==========

class Countdown(BaseModel):
    """Countdown timer for events (e.g., live stream services)"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str  # e.g., "Sunday Morning Service", "Revival Conference"
    event_date: str  # ISO format datetime
    banner_image_url: Optional[str] = None  # Event banner/poster
    is_active: bool = True  # Show/hide countdown
    priority: int = 0  # Higher priority shows first
    brand_id: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CountdownCreate(BaseModel):
    title: str
    event_date: str
    banner_image_url: Optional[str] = None
    is_active: bool = True
    priority: int = 0
    brand_id: str

class CountdownUpdate(BaseModel):
    title: Optional[str] = None
    event_date: Optional[str] = None
    banner_image_url: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None

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
async def update_announcement(announcement_id: str, announcement_data: AnnouncementUpdate, admin = Depends(get_current_admin)):
    # Check if announcement exists
    existing = await db.announcements.find_one({"id": announcement_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in announcement_data.model_dump().items() if v is not None}
    
    result = await db.announcements.update_one(
        {"id": announcement_id},
        {"$set": update_data}
    )
    
    announcement = await db.announcements.find_one({"id": announcement_id}, {"_id": 0})
    return announcement

@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, admin = Depends(get_current_admin)):
    result = await db.announcements.delete_one({"id": announcement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted"}

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

# ========== YOUTUBE INTEGRATION ==========

@api_router.get("/youtube/channel/{channel_handle}")
async def get_youtube_videos(channel_handle: str):
    """
    Fetch videos from YouTube channels
    Supports @faithcenter_in and @nehemiahdavid channels
    """
    try:
        # Convert channel handle to proper format
        if channel_handle.startswith('@'):
            channel_handle = channel_handle[1:]
        
        # Return channel-specific curated sermon videos
        # In production, you would use YouTube Data API
        
        if channel_handle == "faithcenter_in":
            videos = [
                {
                    "id": "fc1",
                    "videoId": "j7Cj8FhyPQI",
                    "title": "Bible Study w/ Ps. Nehemiah David",
                    "publishedAt": "2025-10-24T19:00:00Z",
                    "description": "Bible study session led by Pastor Nehemiah David. Deep dive into God's Word with practical application for daily living.",
                    "category": "Bible Study",
                    "duration": "55:30",
                    "views": "3.2K"
                },
                {
                    "id": "fc2",
                    "videoId": "ToQZD74z6vs",
                    "title": "Faith Center Live | October 12th, 2025 - The Ten Best Ways Part 6",
                    "publishedAt": "2025-10-12T10:00:00Z",
                    "description": "Part 6 of our teaching series on the ten best ways to grow in your faith and relationship with God.",
                    "category": "Sunday Services",
                    "duration": "68:45",
                    "views": "5.8K"
                },
                {
                    "id": "fc3",
                    "videoId": "x5CvVMJj2Tg",
                    "title": "Annual Faith Conference 2025 | Day 1",
                    "publishedAt": "2025-10-02T09:00:00Z",
                    "description": "Day 1 of our Annual Faith Conference 2025 featuring worship and powerful teachings. A transformative gathering of believers.",
                    "category": "Special Events",
                    "duration": "189:18",
                    "views": "15.3K"
                },
                {
                    "id": "fc4",
                    "videoId": "SI_X6LX8G3o",
                    "title": "How to Hear God's Voice - Festival of Miracles",
                    "publishedAt": "2025-09-26T18:30:00Z",
                    "description": "Special message on recognizing and hearing God's voice in your life. Part of our Festival of Miracles series.",
                    "category": "Special Events",
                    "duration": "62:30",
                    "views": "9.2K"
                },
                {
                    "id": "fc5",
                    "videoId": "vJh6kAyEMs0",
                    "title": "Faith Center Live | September 14th, 2025 - The Ten Best Ways Part 2",
                    "publishedAt": "2025-09-14T10:00:00Z",
                    "description": "Part 2 of our teaching series on practical ways to strengthen your walk with Christ.",
                    "category": "Sunday Services",
                    "duration": "71:20",
                    "views": "6.4K"
                },
                {
                    "id": "fc6",
                    "videoId": "c61bjEJgjXA",
                    "title": "God's Hand Brings Miracles | Full Sermon",
                    "publishedAt": "2025-09-07T10:00:00Z",
                    "description": "Full sermon by Pastor Nehemiah David on the miraculous hand of God working in our lives today.",
                    "category": "Sunday Services",
                    "duration": "62:15",
                    "views": "11.5K"
                },
                {
                    "id": "fc7",
                    "videoId": "peUhOXXFxwQ",
                    "title": "ANNUAL FAITH CONFERENCE 2025 Day 2 - Testimonies & Miracles",
                    "publishedAt": "2025-09-07T14:00:00Z",
                    "description": "Day 2 of Annual Faith Conference with amazing testimonies of God's miraculous power and transformative work.",
                    "category": "Special Events",
                    "duration": "240:00",
                    "views": "18.7K"
                },
                {
                    "id": "fc8",
                    "videoId": "FqI3wT57qzk",
                    "title": "Faith Center Live | August 10th, 2025 - First Sunday with Pastor A.J. Swoboda",
                    "publishedAt": "2025-08-10T10:00:00Z",
                    "description": "Historic first Sunday service with Lead Pastor A.J. Swoboda. A new season of faith and growth.",
                    "category": "Sunday Services",
                    "duration": "65:40",
                    "views": "8.9K"
                },
                {
                    "id": "fc9",
                    "videoId": "4rV2K5S76qc",
                    "title": "Favour and Grace of God | Full Sermon",
                    "publishedAt": "2025-04-28T10:00:00Z",
                    "description": "Full sermon on God's favour and grace. Understanding how to walk in divine favour and experience God's unmerited grace.",
                    "category": "Sunday Services",
                    "duration": "58:45",
                    "views": "7.2K"
                },
                {
                    "id": "fc10",
                    "videoId": "zWZIZ2Zu1Us",
                    "title": "Men's Gathering - A Life Unaffected by the World",
                    "publishedAt": "2025-03-16T14:00:00Z",
                    "description": "Special men's gathering focusing on living a life rooted in faith, not worldly standards.",
                    "category": "Special Events",
                    "duration": "54:30",
                    "views": "4.6K"
                },
                {
                    "id": "fc11",
                    "videoId": "aU21rNmbShk",
                    "title": "Bible Study w/ Ps. Nehemiah David | January 31, 2025",
                    "publishedAt": "2025-01-31T19:00:00Z",
                    "description": "Weekly Bible study session with Pastor Nehemiah David. Exploring God's Word together.",
                    "category": "Bible Study",
                    "duration": "52:15",
                    "views": "3.8K"
                },
                {
                    "id": "fc12",
                    "videoId": "G3jgHbDB4TU",
                    "title": "Prayer Meeting - Seeking His Presence",
                    "publishedAt": "2025-01-22T18:30:00Z",
                    "description": "A powerful prayer meeting focused on seeking God's presence and interceding for our community.",
                    "category": "Prayer & Worship",
                    "duration": "45:20",
                    "views": "2.9K"
                },
                {
                    "id": "fc13",
                    "videoId": "ZxLpEQ_4tqY",
                    "title": "Youth Service - Purpose in Christ",
                    "publishedAt": "2025-01-12T18:00:00Z",
                    "description": "A powerful message for our youth about discovering their God-given purpose and calling.",
                    "category": "Youth Services",
                    "duration": "48:15",
                    "views": "5.4K"
                },
                {
                    "id": "fc14",
                    "videoId": "FNVf6cLYR0s",
                    "title": "Community Outreach - Love in Action",
                    "publishedAt": "2025-01-08T14:00:00Z",
                    "description": "Highlights from our community outreach program. Serving our neighbors with the love of Christ.",
                    "category": "Community",
                    "duration": "32:45",
                    "views": "3.1K"
                },
                {
                    "id": "fc15",
                    "videoId": "UpzRmMVSEmY",
                    "title": "Real Talk Kim - Full Sermon",
                    "publishedAt": "2024-11-04T10:00:00Z",
                    "description": "Guest speaker Real Talk Kim delivers a powerful message of truth and transformation.",
                    "category": "Special Events",
                    "duration": "53:00",
                    "views": "6.7K"
                }
            ]
        elif channel_handle == "nehemiahdavid":
            videos = [
                {
                    "id": "nd1",
                    "videoId": "oCTvqUvt3Q8",
                    "title": "Sharpen Your Weapon — Gain Spiritual Ascendancy",
                    "publishedAt": "2025-11-02T10:00:00Z",
                    "description": "Full sermon encouraging spiritual readiness and sharpening your spiritual weapons for victory in Christ.",
                    "category": "Sunday Services",
                    "duration": "62:15",
                    "views": "8.9K"
                },
                {
                    "id": "nd2",
                    "videoId": "lsNNwxUQ7Eo",
                    "title": "How to Recognise God's Voice",
                    "publishedAt": "2025-10-19T10:00:00Z",
                    "description": "Teaching on discerning and recognizing God's voice in your life. Learning to distinguish His voice from others.",
                    "category": "Bible Study",
                    "duration": "55:30",
                    "views": "6.8K"
                },
                {
                    "id": "nd3",
                    "videoId": "nDx_qJpAtd4",
                    "title": "Nehemiah Sermon Series | Steps to Rebuild Faith",
                    "publishedAt": "2025-09-10T10:00:00Z",
                    "description": "Part of a series on the mission and faith of Nehemiah, focusing on steps to rebuild faith and recognize God's open doors.",
                    "category": "Sunday Services",
                    "duration": "58:45",
                    "views": "7.2K"
                },
                {
                    "id": "nd4",
                    "videoId": "CwTXjaR2g_U",
                    "title": "God's Hand Brings Miracles | September 7, 2025 Full Sermon",
                    "publishedAt": "2025-09-07T10:00:00Z",
                    "description": "Witness the miraculous power of God's hand. A powerful message on God's supernatural intervention in our lives.",
                    "category": "Sunday Services",
                    "duration": "64:30",
                    "views": "10.5K"
                },
                {
                    "id": "nd5",
                    "videoId": "X_XUN97FoAE",
                    "title": "Partake in Jesus - Step into Restoration | August 3, 2025 Full Sermon",
                    "publishedAt": "2025-08-03T10:00:00Z",
                    "description": "A powerful message on restoration through Christ. Understanding how to partake in Jesus and experience complete healing.",
                    "category": "Sunday Services",
                    "duration": "68:15",
                    "views": "9.8K"
                },
                {
                    "id": "nd6",
                    "videoId": "7b7W4WtVDtg",
                    "title": "I am doing a TERRIBLE THING | August 17, 2025 Full Sermon",
                    "publishedAt": "2025-08-17T10:00:00Z",
                    "description": "A convicting message on self-examination and repentance. Turning away from things that hinder our walk with God.",
                    "category": "Sunday Services",
                    "duration": "59:40",
                    "views": "7.9K"
                },
                {
                    "id": "nd7",
                    "videoId": "mT0VK8c9NU4",
                    "title": "A Life Unaffected by the World | Full Sermon",
                    "publishedAt": "2025-03-16T10:00:00Z",
                    "description": "Living a life that is not influenced by worldly standards but rooted in God's truth and principles.",
                    "category": "Sunday Services",
                    "duration": "52:30",
                    "views": "11.3K"
                },
                {
                    "id": "nd8",
                    "videoId": "9rHa_2VIhIQ",
                    "title": "Secure your Territory | March 9, 2025 Full Sermon",
                    "publishedAt": "2025-03-09T10:00:00Z",
                    "description": "A message on spiritual warfare and securing what God has given you. Standing firm in faith.",
                    "category": "Sunday Services",
                    "duration": "56:20",
                    "views": "8.7K"
                },
                {
                    "id": "nd9",
                    "videoId": "7LCYOWo85ZY",
                    "title": "Building Consistency in Prayer | February 2, 2025",
                    "publishedAt": "2025-02-02T10:00:00Z",
                    "description": "Practical teaching on developing a consistent and powerful prayer life that transforms your walk with God.",
                    "category": "Prayer & Worship",
                    "duration": "48:20",
                    "views": "5.6K"
                },
                {
                    "id": "nd10",
                    "videoId": "aU21rNmbShk",
                    "title": "Bible Study w/ Ps. Nehemiah David | January 31, 2025",
                    "publishedAt": "2025-01-31T19:00:00Z",
                    "description": "Weekly Bible study session with Pastor Nehemiah David. Exploring God's Word together with practical application.",
                    "category": "Bible Study",
                    "duration": "52:15",
                    "views": "4.2K"
                },
                {
                    "id": "nd11",
                    "videoId": "x1Nc7Tk-bjA",
                    "title": "Assignment, Ability & Priority | December 22, 2024 Full Sermon",
                    "publishedAt": "2024-12-22T10:00:00Z",
                    "description": "Understanding your God-given assignment, walking in your abilities, and setting right priorities in life.",
                    "category": "Sunday Services",
                    "duration": "61:45",
                    "views": "9.4K"
                },
                {
                    "id": "nd12",
                    "videoId": "1Pu1ZQW_g5Y",
                    "title": "What does the Grace of God do? | May 7, 2024",
                    "publishedAt": "2024-05-07T10:00:00Z",
                    "description": "A deep dive into understanding God's grace and its transformative power in the believer's life.",
                    "category": "Bible Study",
                    "duration": "54:30",
                    "views": "7.8K"
                },
                {
                    "id": "nd13",
                    "videoId": "oQktWgYzME8",
                    "title": "365 Bible Verses Everyone Should Know - Nehemiah 1:4",
                    "publishedAt": "2024-01-04T08:00:00Z",
                    "description": "Daily devotional series exploring essential Bible verses. Today: Nehemiah 1:4 on prayer and fasting.",
                    "category": "Bible Study",
                    "duration": "12:30",
                    "views": "2.9K"
                },
                {
                    "id": "nd14",
                    "videoId": "31U2OGhylAs",
                    "title": "EXCEEDING GREATNESS | Part 1",
                    "publishedAt": "2024-11-15T10:00:00Z",
                    "description": "First part of powerful teaching series on the exceeding greatness of God's power available to believers.",
                    "category": "Ministry Training",
                    "duration": "47:20",
                    "views": "6.5K"
                },
                {
                    "id": "nd15",
                    "videoId": "J03uAKirX_8",
                    "title": "Sowing into the Spirit - Part 2",
                    "publishedAt": "2024-10-20T10:00:00Z",
                    "description": "Continuation of teaching on spiritual sowing and reaping. Understanding the law of sowing and reaping in the Spirit.",
                    "category": "Bible Study",
                    "duration": "51:40",
                    "views": "5.3K"
                },
                {
                    "id": "nd16",
                    "videoId": "sevnilB-BfA",
                    "title": "Pentecost Sunday | Faith Center Live Experience",
                    "publishedAt": "2024-06-09T10:00:00Z",
                    "description": "Celebrating Pentecost Sunday with powerful worship and a message on the Holy Spirit's power.",
                    "category": "Special Events",
                    "duration": "72:15",
                    "views": "13.2K"
                },
                {
                    "id": "nd17",
                    "videoId": "lIQl5xkU9jM",
                    "title": "Double Honor for Shame - Part 1",
                    "publishedAt": "2024-04-14T10:00:00Z",
                    "description": "First part of powerful series on God's restoration. Instead of shame, God gives double honor and blessing.",
                    "category": "Sunday Services",
                    "duration": "58:50",
                    "views": "8.1K"
                }
            ]
        else:
            videos = []
        
        return videos
        
    except Exception as e:
        logging.error(f"Error fetching YouTube videos: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching YouTube videos: {str(e)}")


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
    attendees_count = await db.attendees.count_documents(query)
    subscribers_count = await db.subscribers.count_documents(query)
    prayers_count = await db.prayer_requests.count_documents(query)
    testimonials_count = await db.testimonials.count_documents(query)
    sermons_count = await db.sermons.count_documents(query)
    contacts_count = await db.contact_messages.count_documents(query)
    
    # Get recent activity
    recent_attendees = await db.attendees.find(query, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    recent_prayers = await db.prayer_requests.find(query, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "totals": {
            "events": events_count,
            "ministries": ministries_count,
            "announcements": announcements_count,
            "attendees": attendees_count,
            "subscribers": subscribers_count,
            "prayers": prayers_count,
            "testimonials": testimonials_count,
            "sermons": sermons_count,
            "contacts": contacts_count
        },
        "recent_activity": {
            "attendees": recent_attendees,
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


# ========== FOUNDATION ROUTES ==========

@api_router.get("/foundations", response_model=List[Foundation])
async def get_foundations(brand_id: Optional[str] = None, is_active: Optional[bool] = None):
    query = {}
    if brand_id:
        query["brand_id"] = brand_id
    if is_active is not None:
        query["is_active"] = is_active
    
    foundations = await db.foundations.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return foundations

@api_router.get("/foundations/{foundation_id}", response_model=Foundation)
async def get_foundation(foundation_id: str):
    foundation = await db.foundations.find_one({"id": foundation_id}, {"_id": 0})
    if not foundation:
        raise HTTPException(status_code=404, detail="Foundation not found")
    return foundation

@api_router.post("/foundations", response_model=Foundation)
async def create_foundation(foundation: FoundationCreate, admin = Depends(get_current_admin)):
    foundation_dict = foundation.model_dump()
    foundation_obj = Foundation(**foundation_dict)
    await db.foundations.insert_one(foundation_obj.model_dump())
    return foundation_obj

@api_router.post("/foundations/donate")
async def donate_to_foundation(donation: FoundationDonationCreate):
    # Verify foundation exists
    foundation = await db.foundations.find_one({"id": donation.foundation_id}, {"_id": 0})
    if not foundation:
        raise HTTPException(status_code=404, detail="Foundation not found")
    
    # Create donation record
    donation_dict = donation.model_dump()
    donation_obj = FoundationDonation(**donation_dict, payment_status="completed")
    await db.foundation_donations.insert_one(donation_obj.model_dump())
    
    # Update foundation raised amount
    await db.foundations.update_one(
        {"id": donation.foundation_id},
        {"$inc": {"raised_amount": donation.amount}}
    )
    
    return donation_obj

@api_router.get("/foundations/{foundation_id}/donations")
async def get_foundation_donations(foundation_id: str, admin = Depends(get_current_admin)):
    donations = await db.foundation_donations.find(
        {"foundation_id": foundation_id}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return donations

# ========== UPLOAD ENDPOINTS ==========

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), admin = Depends(get_current_admin)):
    """
    Upload an image and return a base64 data URL
    This allows storing images directly in the database without external storage
    """
    try:
        # Read file content
        contents = await file.read()
        
        # Get file extension and mime type
        file_extension = file.filename.split('.')[-1].lower()
        mime_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        }
        
        mime_type = mime_types.get(file_extension, 'image/jpeg')
        
        # Convert to base64
        base64_encoded = base64.b64encode(contents).decode('utf-8')
        data_url = f"data:{mime_type};base64,{base64_encoded}"
        
        return {
            "success": True,
            "image_url": data_url,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

# ========== BLOG ENDPOINTS ==========

@api_router.get("/blogs", response_model=List[Blog])
async def get_blogs(brand_id: Optional[str] = None, published: Optional[bool] = None):
    query = {}
    if brand_id:
        query["brand_id"] = brand_id
    if published is not None:
        query["published"] = published
    
    blogs = await db.blogs.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return blogs

@api_router.get("/blogs/{blog_id}", response_model=Blog)
async def get_blog(blog_id: str):
    blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@api_router.post("/blogs", response_model=Blog)
async def create_blog(blog: BlogCreate, admin = Depends(get_current_admin)):
    blog_dict = blog.model_dump()
    blog_obj = Blog(**blog_dict)
    await db.blogs.insert_one(blog_obj.model_dump())
    return blog_obj

@api_router.put("/blogs/{blog_id}", response_model=Blog)
async def update_blog(blog_id: str, blog_update: BlogUpdate, admin = Depends(get_current_admin)):
    # Check if blog exists
    existing_blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    if not existing_blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Update fields
    update_data = {k: v for k, v in blog_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.blogs.update_one(
        {"id": blog_id},
        {"$set": update_data}
    )
    
    # Return updated blog
    updated_blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
    return updated_blog

@api_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str, admin = Depends(get_current_admin)):
    result = await db.blogs.delete_one({"id": blog_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"message": "Blog deleted successfully"}

# ========== COUNTDOWN ENDPOINTS ==========

@api_router.get("/countdowns", response_model=List[Countdown])
async def get_countdowns(brand_id: Optional[str] = None, active_only: bool = False):
    """Get all countdowns, optionally filtered by brand and active status"""
    query = {}
    if brand_id:
        query["brand_id"] = brand_id
    if active_only:
        query["is_active"] = True
    
    countdowns = await db.countdowns.find(query, {"_id": 0}).sort("priority", -1).to_list(100)
    return countdowns

@api_router.get("/countdowns/{countdown_id}", response_model=Countdown)
async def get_countdown(countdown_id: str):
    """Get a single countdown by ID"""
    countdown = await db.countdowns.find_one({"id": countdown_id}, {"_id": 0})
    if not countdown:
        raise HTTPException(status_code=404, detail="Countdown not found")
    return countdown

@api_router.post("/countdowns", response_model=Countdown)
async def create_countdown(countdown: CountdownCreate, admin = Depends(get_current_admin)):
    """Create a new countdown"""
    countdown_dict = countdown.model_dump()
    countdown_obj = Countdown(**countdown_dict)
    await db.countdowns.insert_one(countdown_obj.model_dump())
    return countdown_obj

@api_router.put("/countdowns/{countdown_id}", response_model=Countdown)
async def update_countdown(countdown_id: str, countdown_update: CountdownUpdate, admin = Depends(get_current_admin)):
    """Update an existing countdown"""
    existing_countdown = await db.countdowns.find_one({"id": countdown_id}, {"_id": 0})
    if not existing_countdown:
        raise HTTPException(status_code=404, detail="Countdown not found")
    
    update_data = {k: v for k, v in countdown_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.countdowns.update_one(
        {"id": countdown_id},
        {"$set": update_data}
    )
    
    updated_countdown = await db.countdowns.find_one({"id": countdown_id}, {"_id": 0})
    return updated_countdown

@api_router.delete("/countdowns/{countdown_id}")
async def delete_countdown(countdown_id: str, admin = Depends(get_current_admin)):
    """Delete a countdown"""
    result = await db.countdowns.delete_one({"id": countdown_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Countdown not found")
    return {"message": "Countdown deleted successfully"}

# ========== IMAGE UPLOAD ROUTE ==========

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), admin = Depends(get_current_admin)):
    """Upload an image file and return the URL"""
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")
        
        # Create uploads directory if it doesn't exist
        uploads_dir = Path("/app/uploads")
        uploads_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = uploads_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Return URL (in production this would be the CDN URL)
        # For now, we'll return a path that the frontend can use
        image_url = f"/uploads/{unique_filename}"
        
        return {
            "success": True,
            "image_url": image_url,
            "filename": unique_filename
        }
    except Exception as e:
        logging.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

# Include router
app.include_router(api_router)

# Serve uploaded images
from fastapi.staticfiles import StaticFiles
uploads_dir = Path("/app/uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
