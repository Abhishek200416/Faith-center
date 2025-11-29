#!/usr/bin/env python3
"""
Backend API Testing Script
Tests all public API endpoints for the ministry platform
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://faith-mgmt-1.preview.emergentagent.com/api"

def test_get_brands():
    """Test GET /api/brands endpoint - Verify 2 brands with specific data"""
    print("🔍 Testing GET /api/brands...")
    try:
        response = requests.get(f"{BACKEND_URL}/brands", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            brands = response.json()
            print(f"   Response Type: {type(brands)}")
            print(f"   Brands Count: {len(brands) if isinstance(brands, list) else 'Not a list'}")
            
            if isinstance(brands, list):
                if len(brands) == 2:
                    # Find NMD and Faith Centre brands
                    ndm_brand = None
                    faith_brand = None
                    
                    for brand in brands:
                        if brand.get('name') == "Nehemiah David Ministries":
                            ndm_brand = brand
                        elif brand.get('name') == "Faith Centre":
                            faith_brand = brand
                    
                    # Verify both brands exist
                    if ndm_brand and faith_brand:
                        print("   ✅ Found both required brands")
                        
                        # Verify NMD brand data
                        print("   🔍 Verifying Nehemiah David Ministries data...")
                        ndm_valid = True
                        
                        if ndm_brand.get('tagline') != "Imparting Faith, Impacting Lives":
                            print(f"   ❌ NMD tagline incorrect: {ndm_brand.get('tagline')}")
                            ndm_valid = False
                        else:
                            print("   ✅ NMD tagline correct")
                        
                        expected_location = "Amaravathi Rd, above Yousta, Gorantla, Guntur, Andhra Pradesh 522034"
                        if ndm_brand.get('location') != expected_location:
                            print(f"   ❌ NMD location incorrect: {ndm_brand.get('location')}")
                            ndm_valid = False
                        else:
                            print("   ✅ NMD location correct")
                        
                        if not ndm_brand.get('logo_url') or not ndm_brand.get('logo_url').endswith('.svg'):
                            print(f"   ❌ NMD logo_url invalid: {ndm_brand.get('logo_url')}")
                            ndm_valid = False
                        else:
                            print("   ✅ NMD logo_url valid (.svg)")
                        
                        if not ndm_brand.get('hero_image_url'):
                            print("   ❌ NMD hero_image_url missing")
                            ndm_valid = False
                        else:
                            print("   ✅ NMD hero_image_url present")
                        
                        # Verify Faith Centre brand data
                        print("   🔍 Verifying Faith Centre data...")
                        faith_valid = True
                        
                        if faith_brand.get('tagline') != "Where Faith Meets Community":
                            print(f"   ❌ Faith Centre tagline incorrect: {faith_brand.get('tagline')}")
                            faith_valid = False
                        else:
                            print("   ✅ Faith Centre tagline correct")
                        
                        if not faith_brand.get('location') or faith_brand.get('location') == expected_location:
                            print(f"   ❌ Faith Centre location should be different from NMD: {faith_brand.get('location')}")
                            faith_valid = False
                        else:
                            print("   ✅ Faith Centre location different from NMD")
                        
                        if not faith_brand.get('hero_image_url') or faith_brand.get('hero_image_url') == ndm_brand.get('hero_image_url'):
                            print(f"   ❌ Faith Centre hero_image_url should be different from NMD")
                            faith_valid = False
                        else:
                            print("   ✅ Faith Centre hero_image_url different from NMD")
                        
                        if ndm_valid and faith_valid:
                            print("   ✅ All brand data validation passed")
                            return True, ndm_brand.get('id'), faith_brand.get('id')
                        else:
                            print("   ❌ Brand data validation failed")
                            return False, ndm_brand.get('id'), faith_brand.get('id')
                    else:
                        print(f"   ❌ Missing required brands. Found: {[b.get('name') for b in brands]}")
                        return False, None, None
                else:
                    print(f"   ❌ Expected 2 brands, found {len(brands)}")
                    if len(brands) > 0:
                        print(f"   Available brands: {[b.get('name') for b in brands]}")
                    return False, None, None
            else:
                print("   ❌ Response is not a list")
                return False, None, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None, None

def test_get_events(brand_id=None, brand_name=None, expected_count=None):
    """Test GET /api/events endpoint"""
    url = f"{BACKEND_URL}/events"
    if brand_id:
        url += f"?brand_id={brand_id}"
        print(f"🔍 Testing GET /api/events?brand_id={brand_id} ({brand_name})...")
    else:
        print("🔍 Testing GET /api/events...")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            events = response.json()
            print(f"   Response Type: {type(events)}")
            print(f"   Events Count: {len(events) if isinstance(events, list) else 'Not a list'}")
            
            if isinstance(events, list):
                if expected_count is not None:
                    if len(events) == expected_count:
                        print(f"   ✅ Correct number of events ({expected_count})")
                        if len(events) > 0:
                            print(f"   Event titles: {[e.get('title') for e in events]}")
                        return True
                    else:
                        print(f"   ❌ Expected {expected_count} events, found {len(events)}")
                        if len(events) > 0:
                            print(f"   Found events: {[e.get('title') for e in events]}")
                        return False
                else:
                    if len(events) > 0:
                        print(f"   Sample Event: {events[0].get('title', 'No title')}")
                    else:
                        print("   ⚠️  Empty events list")
                    return True
            else:
                print("   ❌ Response is not a list")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_brand_content_uniqueness(ndm_id, faith_id):
    """Test that each brand has unique content (events and ministries)"""
    print("🔍 Testing brand content uniqueness...")
    
    try:
        # Get NMD events
        ndm_events_response = requests.get(f"{BACKEND_URL}/events?brand_id={ndm_id}", timeout=10)
        faith_events_response = requests.get(f"{BACKEND_URL}/events?brand_id={faith_id}", timeout=10)
        
        # Get NMD ministries
        ndm_ministries_response = requests.get(f"{BACKEND_URL}/ministries?brand_id={ndm_id}", timeout=10)
        faith_ministries_response = requests.get(f"{BACKEND_URL}/ministries?brand_id={faith_id}", timeout=10)
        
        if all(r.status_code == 200 for r in [ndm_events_response, faith_events_response, ndm_ministries_response, faith_ministries_response]):
            ndm_events = ndm_events_response.json()
            faith_events = faith_events_response.json()
            ndm_ministries = ndm_ministries_response.json()
            faith_ministries = faith_ministries_response.json()
            
            # Check events uniqueness
            ndm_event_titles = set(e.get('title') for e in ndm_events)
            faith_event_titles = set(e.get('title') for e in faith_events)
            
            events_overlap = ndm_event_titles.intersection(faith_event_titles)
            if events_overlap:
                print(f"   ❌ Events overlap between brands: {events_overlap}")
                return False
            else:
                print(f"   ✅ Events are unique between brands")
            
            # Check ministries uniqueness
            ndm_ministry_titles = set(m.get('title') for m in ndm_ministries)
            faith_ministry_titles = set(m.get('title') for m in faith_ministries)
            
            ministries_overlap = ndm_ministry_titles.intersection(faith_ministry_titles)
            if ministries_overlap:
                print(f"   ❌ Ministries overlap between brands: {ministries_overlap}")
                return False
            else:
                print(f"   ✅ Ministries are unique between brands")
            
            print(f"   NMD Events: {list(ndm_event_titles)}")
            print(f"   Faith Centre Events: {list(faith_event_titles)}")
            print(f"   NMD Ministries: {list(ndm_ministry_titles)}")
            print(f"   Faith Centre Ministries: {list(faith_ministry_titles)}")
            
            return True
        else:
            print("   ❌ Failed to fetch brand content for comparison")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_get_ministries(brand_id=None, brand_name=None, expected_count=None):
    """Test GET /api/ministries endpoint"""
    url = f"{BACKEND_URL}/ministries"
    if brand_id:
        url += f"?brand_id={brand_id}"
        print(f"🔍 Testing GET /api/ministries?brand_id={brand_id} ({brand_name})...")
    else:
        print("🔍 Testing GET /api/ministries...")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            ministries = response.json()
            print(f"   Response Type: {type(ministries)}")
            print(f"   Ministries Count: {len(ministries) if isinstance(ministries, list) else 'Not a list'}")
            
            if isinstance(ministries, list):
                if expected_count is not None:
                    if len(ministries) == expected_count:
                        print(f"   ✅ Correct number of ministries ({expected_count})")
                        if len(ministries) > 0:
                            print(f"   Ministry titles: {[m.get('title') for m in ministries]}")
                        return True
                    else:
                        print(f"   ❌ Expected {expected_count} ministries, found {len(ministries)}")
                        if len(ministries) > 0:
                            print(f"   Found ministries: {[m.get('title') for m in ministries]}")
                        return False
                else:
                    if len(ministries) > 0:
                        print(f"   Sample Ministry: {ministries[0].get('title', 'No title')}")
                    else:
                        print("   ⚠️  Empty ministries list")
                    return True
            else:
                print("   ❌ Response is not a list")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_get_announcements(brand_id=None):
    """Test GET /api/announcements endpoint with Phase 3 enhanced fields"""
    url = f"{BACKEND_URL}/announcements"
    if brand_id:
        url += f"?brand_id={brand_id}"
        print(f"🔍 Testing GET /api/announcements?brand_id={brand_id} (Phase 3 Enhanced)...")
    else:
        print("🔍 Testing GET /api/announcements (Phase 3 Enhanced)...")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            announcements = response.json()
            print(f"   Response Type: {type(announcements)}")
            print(f"   Announcements Count: {len(announcements) if isinstance(announcements, list) else 'Not a list'}")
            
            if isinstance(announcements, list):
                if len(announcements) > 0:
                    print(f"   Sample Announcement: {announcements[0].get('title', 'No title')}")
                    
                    # Verify Phase 3 enhanced fields are present
                    sample = announcements[0]
                    phase3_fields = ['event_id', 'location', 'event_time', 'requires_registration', 'image_url']
                    
                    print("   🔍 Verifying Phase 3 enhanced fields...")
                    all_fields_present = True
                    for field in phase3_fields:
                        if field not in sample:
                            print(f"   ❌ Missing Phase 3 field: {field}")
                            all_fields_present = False
                        else:
                            field_value = sample.get(field)
                            if field == 'requires_registration':
                                if not isinstance(field_value, bool):
                                    print(f"   ❌ {field} should be boolean, got {type(field_value)}")
                                    all_fields_present = False
                                else:
                                    print(f"   ✅ {field}: {field_value}")
                            else:
                                print(f"   ✅ {field}: {field_value if field_value else 'null'}")
                    
                    if all_fields_present:
                        print("   ✅ All Phase 3 enhanced fields present")
                        return True, announcements
                    else:
                        print("   ❌ Some Phase 3 enhanced fields missing")
                        return False, announcements
                else:
                    print("   ⚠️  Empty announcements list")
                    return True, []
            else:
                print("   ❌ Response is not a list")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_get_urgent_announcements(brand_id=None):
    """Test GET /api/announcements/urgent endpoint with Phase 3 enhanced fields"""
    url = f"{BACKEND_URL}/announcements/urgent"
    if brand_id:
        url += f"?brand_id={brand_id}"
        print(f"🔍 Testing GET /api/announcements/urgent?brand_id={brand_id} (Phase 3 Enhanced)...")
    else:
        print("🔍 Testing GET /api/announcements/urgent (Phase 3 Enhanced)...")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            urgent_announcements = response.json()
            print(f"   Response Type: {type(urgent_announcements)}")
            print(f"   Urgent Announcements Count: {len(urgent_announcements) if isinstance(urgent_announcements, list) else 'Not a list'}")
            
            if isinstance(urgent_announcements, list):
                if len(urgent_announcements) > 0:
                    print(f"   Sample Urgent Announcement: {urgent_announcements[0].get('title', 'No title')}")
                    
                    # Verify all urgent announcements have is_urgent=True
                    all_urgent = True
                    for ann in urgent_announcements:
                        if not ann.get('is_urgent', False):
                            print(f"   ❌ Non-urgent announcement in urgent list: {ann.get('title')}")
                            all_urgent = False
                    
                    if all_urgent:
                        print("   ✅ All announcements are marked as urgent")
                    
                    # Verify Phase 3 enhanced fields are present
                    sample = urgent_announcements[0]
                    phase3_fields = ['event_id', 'location', 'event_time', 'requires_registration', 'image_url']
                    
                    print("   🔍 Verifying Phase 3 enhanced fields in urgent announcements...")
                    all_fields_present = True
                    for field in phase3_fields:
                        if field not in sample:
                            print(f"   ❌ Missing Phase 3 field: {field}")
                            all_fields_present = False
                        else:
                            field_value = sample.get(field)
                            if field == 'requires_registration':
                                if not isinstance(field_value, bool):
                                    print(f"   ❌ {field} should be boolean, got {type(field_value)}")
                                    all_fields_present = False
                                else:
                                    print(f"   ✅ {field}: {field_value}")
                            else:
                                print(f"   ✅ {field}: {field_value if field_value else 'null'}")
                    
                    if all_fields_present and all_urgent:
                        print("   ✅ Urgent announcements with Phase 3 fields working correctly")
                        return True
                    else:
                        return False
                else:
                    print("   ⚠️  No urgent announcements found")
                    return True
            else:
                print("   ❌ Response is not a list")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_create_announcement_with_event_link(admin_token, brand_id, event_id=None):
    """Test POST /api/announcements with Phase 3 enhanced fields including event linking"""
    print("🔍 Testing POST /api/announcements (Phase 3 Enhanced with Event Link)...")
    
    announcement_data = {
        "title": "REVIVE Conference Registration Open",
        "content": "Join us for the 5-day REVIVE Conference! Experience powerful worship, inspiring messages, and life-changing encounters with God. Register now to secure your spot.",
        "image_url": "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",
        "is_urgent": True,
        "event_id": event_id,  # Link to existing event
        "location": "Main Sanctuary, Faith Center",
        "event_time": "December 3-7, 2025 | 7:00 PM - 9:30 PM daily",
        "requires_registration": True,
        "brand_id": brand_id
    }
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/announcements",
            json=announcement_data,
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Created Announcement ID: {result.get('id', 'No ID')}")
                print(f"   Title: {result.get('title', 'No title')}")
                print(f"   Event ID: {result.get('event_id', 'No event_id')}")
                print(f"   Location: {result.get('location', 'No location')}")
                print(f"   Event Time: {result.get('event_time', 'No event_time')}")
                print(f"   Requires Registration: {result.get('requires_registration', 'No requires_registration')}")
                print(f"   Image URL: {result.get('image_url', 'No image_url')}")
                
                # Verify all Phase 3 fields were saved correctly
                phase3_verification = True
                if result.get('event_id') != event_id:
                    print(f"   ❌ Event ID mismatch: expected {event_id}, got {result.get('event_id')}")
                    phase3_verification = False
                if result.get('location') != announcement_data['location']:
                    print(f"   ❌ Location mismatch")
                    phase3_verification = False
                if result.get('event_time') != announcement_data['event_time']:
                    print(f"   ❌ Event time mismatch")
                    phase3_verification = False
                if result.get('requires_registration') != announcement_data['requires_registration']:
                    print(f"   ❌ Requires registration mismatch")
                    phase3_verification = False
                
                if phase3_verification:
                    print("   ✅ All Phase 3 fields saved correctly")
                    return True, result.get('id')
                else:
                    print("   ❌ Some Phase 3 fields not saved correctly")
                    return False, result.get('id')
            else:
                print("   ❌ Response is not a dict")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_update_announcement_with_phase3_fields(admin_token, announcement_id):
    """Test PUT /api/announcements/{id} with Phase 3 enhanced fields"""
    print(f"🔍 Testing PUT /api/announcements/{announcement_id} (Phase 3 Enhanced)...")
    
    update_data = {
        "title": "REVIVE Conference - Updated Details",
        "location": "Updated Location: Grand Auditorium, Faith Center",
        "event_time": "December 3-7, 2025 | Updated Time: 6:30 PM - 9:00 PM daily",
        "requires_registration": False,  # Changed from True to False
        "image_url": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800"
    }
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/announcements/{announcement_id}",
            json=update_data,
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Updated Announcement ID: {result.get('id', 'No ID')}")
                print(f"   Updated Title: {result.get('title', 'No title')}")
                print(f"   Updated Location: {result.get('location', 'No location')}")
                print(f"   Updated Event Time: {result.get('event_time', 'No event_time')}")
                print(f"   Updated Requires Registration: {result.get('requires_registration', 'No requires_registration')}")
                print(f"   Updated Image URL: {result.get('image_url', 'No image_url')}")
                
                # Verify all updates were applied correctly
                update_verification = True
                for field, expected_value in update_data.items():
                    actual_value = result.get(field)
                    if actual_value != expected_value:
                        print(f"   ❌ {field} update failed: expected {expected_value}, got {actual_value}")
                        update_verification = False
                
                if update_verification:
                    print("   ✅ All Phase 3 field updates applied correctly")
                    return True
                else:
                    print("   ❌ Some Phase 3 field updates failed")
                    return False
            else:
                print("   ❌ Response is not a dict")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_post_contact(brand_id=None):
    """Test POST /api/contact endpoint"""
    print("🔍 Testing POST /api/contact...")
    
    # Use a test brand ID or create a dummy one
    test_brand_id = brand_id or "test-brand-id"
    
    contact_data = {
        "name": "Sarah Johnson",
        "email": "sarah.johnson@email.com",
        "subject": "Prayer Request",
        "message": "Please pray for my family during this difficult time. We need strength and guidance.",
        "brand_id": test_brand_id
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/contact",
            json=contact_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Created Contact ID: {result.get('id', 'No ID')}")
                print(f"   Contact Name: {result.get('name', 'No name')}")
                return True
            else:
                print("   ❌ Response is not a dict")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_post_subscribers(brand_id=None):
    """Test POST /api/subscribers endpoint"""
    print("🔍 Testing POST /api/subscribers...")
    
    # Use a test brand ID or create a dummy one
    test_brand_id = brand_id or "test-brand-id"
    
    subscriber_data = {
        "email": "michael.chen@email.com",
        "brand_id": test_brand_id
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/subscribers",
            json=subscriber_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Created Subscriber ID: {result.get('id', 'No ID')}")
                print(f"   Subscriber Email: {result.get('email', 'No email')}")
                return True
            else:
                print("   ❌ Response is not a dict")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

# ========== NEW MEMBER/USER AUTHENTICATION TESTS ==========

def test_admin_login():
    """Test admin login to get admin token - Updated credentials from review request"""
    print("🔍 Testing Admin Login...")
    
    login_data = {
        "email": "promptforge.dev@gmail.com",
        "password": "P9$wX!7rAq#4Lz@M2f"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict) and "token" in result:
                print(f"   Admin Token: {result['token'][:20]}...")
                print(f"   Admin Email: {result.get('admin', {}).get('email', 'No email')}")
                return True, result["token"]
            else:
                print("   ❌ Response missing token")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_user_register(brand_id):
    """Test POST /api/users/register - Register new member"""
    print("🔍 Testing POST /api/users/register...")
    
    # Use timestamp to make email unique
    import time
    timestamp = int(time.time())
    
    user_data = {
        "email": f"john.smith.{timestamp}@gracechurch.org",
        "password": "SecurePass123!",
        "name": "John Smith",
        "phone": "+1-555-0123",
        "brand_id": brand_id
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/users/register",
            json=user_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict) and "token" in result:
                print(f"   User Token: {result['token'][:20]}...")
                print(f"   User Name: {result.get('user', {}).get('name', 'No name')}")
                print(f"   User Email: {result.get('user', {}).get('email', 'No email')}")
                return True, result["token"], result.get('user', {}).get('id'), user_data["email"]
            else:
                print("   ❌ Response missing token or user")
                return False, None, None, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None, None, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None, None, None

def test_user_login(email):
    """Test POST /api/users/login - Login member"""
    print("🔍 Testing POST /api/users/login...")
    
    login_data = {
        "email": email,
        "password": "SecurePass123!"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/users/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict) and "token" in result:
                print(f"   Login Token: {result['token'][:20]}...")
                print(f"   User Name: {result.get('user', {}).get('name', 'No name')}")
                return True, result["token"]
            else:
                print("   ❌ Response missing token")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_get_current_user(user_token):
    """Test GET /api/users/me - Get current logged in member info"""
    print("🔍 Testing GET /api/users/me...")
    
    try:
        headers = {
            "Authorization": f"Bearer {user_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{BACKEND_URL}/users/me",
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   User Name: {result.get('name', 'No name')}")
                print(f"   User Email: {result.get('email', 'No email')}")
                print(f"   User Role: {result.get('role', 'No role')}")
                return True
            else:
                print("   ❌ Response is not a dict")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_get_all_users(admin_token, brand_id):
    """Test GET /api/users - Get all members for a brand (admin only)"""
    print("🔍 Testing GET /api/users...")
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        url = f"{BACKEND_URL}/users"
        if brand_id:
            url += f"?brand_id={brand_id}"
        
        response = requests.get(url, headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, list):
                print(f"   Users Count: {len(result)}")
                if len(result) > 0:
                    print(f"   Sample User: {result[0].get('name', 'No name')}")
                return True
            else:
                print("   ❌ Response is not a list")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_create_user_by_admin(admin_token, brand_id):
    """Test POST /api/users - Admin creates new member"""
    print("🔍 Testing POST /api/users (Admin Create User)...")
    
    user_data = {
        "email": "mary.johnson@gracechurch.org",
        "password": "AdminCreated123!",
        "name": "Mary Johnson",
        "phone": "+1-555-0456",
        "brand_id": brand_id
    }
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/users",
            json=user_data,
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Created User Name: {result.get('name', 'No name')}")
                print(f"   Created User Email: {result.get('email', 'No email')}")
                return True, result.get('id')
            else:
                print("   ❌ Response is not a dict")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_toggle_user_status(admin_token, user_id):
    """Test PUT /api/users/{user_id}/status - Admin toggles member status"""
    print("🔍 Testing PUT /api/users/{user_id}/status...")
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        # Toggle to inactive
        response = requests.put(
            f"{BACKEND_URL}/users/{user_id}/status?is_active=false",
            headers=headers,
            timeout=10
        )
        print(f"   Status Code (deactivate): {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Deactivate Response: {result.get('message', 'No message')}")
            
            # Toggle back to active
            response2 = requests.put(
                f"{BACKEND_URL}/users/{user_id}/status?is_active=true",
                headers=headers,
                timeout=10
            )
            print(f"   Status Code (reactivate): {response2.status_code}")
            
            if response2.status_code == 200:
                result2 = response2.json()
                print(f"   Reactivate Response: {result2.get('message', 'No message')}")
                return True
            else:
                print(f"   ❌ Reactivate failed with status {response2.status_code}")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

# ========== GIVING CATEGORY TESTS ==========

def test_get_giving_categories(brand_id):
    """Test GET /api/giving-categories?brand_id={id}"""
    print("🔍 Testing GET /api/giving-categories...")
    
    try:
        url = f"{BACKEND_URL}/giving-categories"
        if brand_id:
            url += f"?brand_id={brand_id}"
        
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, list):
                print(f"   Categories Count: {len(result)}")
                if len(result) > 0:
                    print(f"   Sample Category: {result[0].get('name', 'No name')}")
                    return True, result[0].get('id')
                else:
                    print("   ⚠️  Empty categories list")
                    return True, None
            else:
                print("   ❌ Response is not a list")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_create_giving_category(admin_token, brand_id):
    """Test POST /api/giving-categories - Create new giving category"""
    print("🔍 Testing POST /api/giving-categories...")
    
    category_data = {
        "name": "Building Fund",
        "description": "Contributions for church building maintenance and improvements",
        "brand_id": brand_id
    }
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/giving-categories",
            json=category_data,
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Created Category: {result.get('name', 'No name')}")
                print(f"   Category ID: {result.get('id', 'No ID')}")
                return True, result.get('id')
            else:
                print("   ❌ Response is not a dict")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

# ========== STRIPE PAYMENT TESTS ==========

def test_create_checkout_session(brand_id, category_id=None):
    """Test POST /api/payments/create-checkout - Create Stripe checkout session"""
    print("🔍 Testing POST /api/payments/create-checkout...")
    
    checkout_data = {
        "amount": 50.00,
        "category": "Tithe",
        "category_id": category_id,
        "donor_name": "David Wilson",
        "brand_id": brand_id
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/payments/create-checkout",
            json=checkout_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict) and "url" in result and "session_id" in result:
                print(f"   Checkout URL: {result['url'][:50]}...")
                print(f"   Session ID: {result['session_id']}")
                return True, result["session_id"]
            else:
                print("   ❌ Response missing url or session_id")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_get_payment_status(session_id):
    """Test GET /api/payments/status/{session_id} - Check payment status"""
    print("🔍 Testing GET /api/payments/status/{session_id}...")
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/payments/status/{session_id}",
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Payment Status: {result.get('payment_status', 'No status')}")
                print(f"   Transaction Status: {result.get('status', 'No status')}")
                print(f"   Amount: ${result.get('amount', 0)}")
                return True
            else:
                print("   ❌ Response is not a dict")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_get_payment_history(user_token):
    """Test GET /api/payments/history - Get user's giving history"""
    print("🔍 Testing GET /api/payments/history...")
    
    try:
        headers = {
            "Authorization": f"Bearer {user_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{BACKEND_URL}/payments/history",
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, list):
                print(f"   Payment History Count: {len(result)}")
                if len(result) > 0:
                    print(f"   Latest Payment: ${result[0].get('amount', 0)} - {result[0].get('category', 'No category')}")
                return True
            else:
                print("   ❌ Response is not a list")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_get_all_transactions(admin_token):
    """Test GET /api/payments/transactions - Get all transactions (admin only)"""
    print("🔍 Testing GET /api/payments/transactions...")
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{BACKEND_URL}/payments/transactions",
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, list):
                print(f"   Total Transactions: {len(result)}")
                if len(result) > 0:
                    print(f"   Latest Transaction: ${result[0].get('amount', 0)} - {result[0].get('payment_status', 'No status')}")
                return True
            else:
                print("   ❌ Response is not a list")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

# ========== FOUNDATIONS TESTS ==========

def test_get_foundations(brand_id):
    """Test GET /api/foundations?brand_id={id} - Should return 4 foundations for Nehemiah David Ministries"""
    print("🔍 Testing GET /api/foundations...")
    
    try:
        url = f"{BACKEND_URL}/foundations"
        if brand_id:
            url += f"?brand_id={brand_id}"
        
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            foundations = response.json()
            print(f"   Response Type: {type(foundations)}")
            if isinstance(foundations, list):
                print(f"   Foundations Count: {len(foundations)}")
                
                # For Nehemiah David Ministries, expect 4 foundations
                if len(foundations) == 4:
                    print("   ✅ Found expected 4 foundations")
                    
                    # Verify each foundation has required fields
                    all_valid = True
                    for i, foundation in enumerate(foundations):
                        print(f"   🔍 Verifying Foundation {i+1}: {foundation.get('title', 'No title')}")
                        
                        # Check required fields
                        required_fields = ['title', 'description', 'image_url', 'gallery_images', 'goal_amount', 'raised_amount', 'is_active']
                        for field in required_fields:
                            if field not in foundation:
                                print(f"   ❌ Missing field '{field}' in foundation {i+1}")
                                all_valid = False
                            elif field == 'gallery_images':
                                if not isinstance(foundation[field], list) or len(foundation[field]) != 6:
                                    print(f"   ❌ gallery_images should be array with 6 images, got {len(foundation[field]) if isinstance(foundation[field], list) else 'not array'}")
                                    all_valid = False
                                else:
                                    print(f"   ✅ gallery_images has 6 images")
                            elif field == 'is_active':
                                if foundation[field] != True:
                                    print(f"   ❌ is_active should be true, got {foundation[field]}")
                                    all_valid = False
                                else:
                                    print(f"   ✅ is_active is true")
                            elif field in ['goal_amount', 'raised_amount']:
                                if not isinstance(foundation[field], (int, float)) or foundation[field] < 0:
                                    print(f"   ❌ {field} should be positive number, got {foundation[field]}")
                                    all_valid = False
                                else:
                                    print(f"   ✅ {field}: ${foundation[field]:,}")
                    
                    if all_valid:
                        print("   ✅ All foundations have valid structure")
                        return True, foundations
                    else:
                        print("   ❌ Some foundations have invalid structure")
                        return False, foundations
                else:
                    print(f"   ❌ Expected 4 foundations, found {len(foundations)}")
                    if len(foundations) > 0:
                        print(f"   Found foundations: {[f.get('title') for f in foundations]}")
                    return False, foundations
            else:
                print("   ❌ Response is not a list")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_get_foundation_by_id(foundation_id):
    """Test GET /api/foundations/{foundation_id} - Test retrieving a specific foundation"""
    print(f"🔍 Testing GET /api/foundations/{foundation_id}...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/foundations/{foundation_id}", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            foundation = response.json()
            print(f"   Response Type: {type(foundation)}")
            if isinstance(foundation, dict):
                print(f"   Foundation Title: {foundation.get('title', 'No title')}")
                print(f"   Foundation ID: {foundation.get('id', 'No ID')}")
                
                # Verify required fields
                required_fields = ['id', 'title', 'description', 'image_url', 'gallery_images', 'goal_amount', 'raised_amount', 'is_active']
                all_present = all(field in foundation for field in required_fields)
                
                if all_present:
                    print("   ✅ Foundation has all required fields")
                    return True, foundation
                else:
                    missing = [field for field in required_fields if field not in foundation]
                    print(f"   ❌ Missing fields: {missing}")
                    return False, foundation
            else:
                print("   ❌ Response is not a dict")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_foundation_donate(foundation_id, brand_id):
    """Test POST /api/foundations/donate - Test donation creation and foundation update"""
    print("🔍 Testing POST /api/foundations/donate...")
    
    # First get current raised_amount
    try:
        get_response = requests.get(f"{BACKEND_URL}/foundations/{foundation_id}", timeout=10)
        if get_response.status_code != 200:
            print("   ❌ Could not get foundation details for donation test")
            return False
        
        foundation_before = get_response.json()
        initial_raised = foundation_before.get('raised_amount', 0)
        print(f"   Initial raised amount: ${initial_raised:,}")
        
    except Exception as e:
        print(f"   ❌ Exception getting foundation: {str(e)}")
        return False
    
    # Create donation
    donation_data = {
        "foundation_id": foundation_id,
        "donor_name": "Sarah Thompson",
        "donor_email": "sarah.thompson@email.com",
        "amount": 250.00,
        "message": "Blessed to support this wonderful cause. May God multiply this gift!",
        "brand_id": brand_id
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/foundations/donate",
            json=donation_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Donation ID: {result.get('id', 'No ID')}")
                print(f"   Donor Name: {result.get('donor_name', 'No name')}")
                print(f"   Amount: ${result.get('amount', 0)}")
                
                # Verify foundation raised_amount was updated
                try:
                    updated_response = requests.get(f"{BACKEND_URL}/foundations/{foundation_id}", timeout=10)
                    if updated_response.status_code == 200:
                        foundation_after = updated_response.json()
                        new_raised = foundation_after.get('raised_amount', 0)
                        expected_raised = initial_raised + donation_data['amount']
                        
                        print(f"   Updated raised amount: ${new_raised:,}")
                        print(f"   Expected raised amount: ${expected_raised:,}")
                        
                        if abs(new_raised - expected_raised) < 0.01:  # Allow for floating point precision
                            print("   ✅ Foundation raised_amount updated correctly")
                            return True
                        else:
                            print("   ❌ Foundation raised_amount not updated correctly")
                            return False
                    else:
                        print("   ❌ Could not verify foundation update")
                        return False
                        
                except Exception as e:
                    print(f"   ❌ Exception verifying foundation update: {str(e)}")
                    return False
            else:
                print("   ❌ Response is not a dict")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

# ========== YOUTUBE INTEGRATION TESTS ==========

def test_youtube_faith_center_channel():
    """Test GET /api/youtube/channel/@faithcenter_in - Should return 8 videos with all required fields"""
    print("🔍 Testing GET /api/youtube/channel/@faithcenter_in...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/youtube/channel/@faithcenter_in", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            videos = response.json()
            print(f"   Response Type: {type(videos)}")
            
            if isinstance(videos, list):
                print(f"   Videos Count: {len(videos)}")
                
                # Verify we have exactly 8 videos as requested
                if len(videos) == 8:
                    print("   ✅ Correct number of videos (8)")
                    
                    # Verify all videos have required fields
                    required_fields = ['id', 'videoId', 'title', 'publishedAt', 'description', 'category', 'duration', 'views']
                    all_videos_valid = True
                    
                    for i, video in enumerate(videos):
                        print(f"   🔍 Verifying Video {i+1}: {video.get('title', 'No title')[:50]}...")
                        
                        for field in required_fields:
                            if field not in video:
                                print(f"   ❌ Missing field '{field}' in video {i+1}")
                                all_videos_valid = False
                            elif not video[field]:  # Check for empty values
                                print(f"   ❌ Empty field '{field}' in video {i+1}")
                                all_videos_valid = False
                    
                    if all_videos_valid:
                        print("   ✅ All videos have required fields")
                        
                        # Check categories
                        categories = set(video.get('category', 'Unknown') for video in videos)
                        print(f"   Video Categories: {list(categories)}")
                        
                        # Verify expected categories for Faith Center
                        expected_categories = {"Sunday Services", "Bible Study", "Youth Services", "Special Events", "Community"}
                        found_categories = categories.intersection(expected_categories)
                        
                        if len(found_categories) >= 3:  # Should have at least 3 of the expected categories
                            print(f"   ✅ Found expected categories: {list(found_categories)}")
                            
                            # Verify video IDs are unique
                            video_ids = [video.get('videoId') for video in videos]
                            unique_ids = set(video_ids)
                            
                            if len(unique_ids) == len(video_ids):
                                print("   ✅ All video IDs are unique")
                                
                                # Verify no thumbnail URLs in response (as per requirement)
                                has_thumbnails = False
                                for video in videos:
                                    if 'thumbnail' in video:
                                        print(f"   ❌ Unexpected thumbnail field found in video: {video.get('title', 'Unknown')}")
                                        has_thumbnails = True
                                
                                if not has_thumbnails:
                                    print("   ✅ No thumbnail URLs in response (as required)")
                                    
                                    # Verify dates are in ISO format
                                    all_dates_valid = True
                                    for video in videos:
                                        date_str = video.get('publishedAt', '')
                                        if not date_str.endswith('Z') or 'T' not in date_str:
                                            print(f"   ❌ Invalid date format: {date_str}")
                                            all_dates_valid = False
                                    
                                    if all_dates_valid:
                                        print("   ✅ All dates are in ISO format")
                                        return True
                                    else:
                                        print("   ❌ Some dates are not in ISO format")
                                        return False
                                else:
                                    print("   ❌ Unexpected thumbnail URLs found in response")
                                    return False
                            else:
                                print(f"   ❌ Duplicate video IDs found: {len(video_ids)} total, {len(unique_ids)} unique")
                                return False
                        else:
                            print(f"   ❌ Expected categories not found. Found: {list(categories)}")
                            return False
                    else:
                        print("   ❌ Some videos missing required fields")
                        return False
                else:
                    print(f"   ❌ Expected 8 videos, found {len(videos)}")
                    return False
            else:
                print("   ❌ Response is not a list")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_youtube_nehemiah_david_channel():
    """Test GET /api/youtube/channel/@nehemiahdavid - Should return 10 videos with all required fields"""
    print("🔍 Testing GET /api/youtube/channel/@nehemiahdavid...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/youtube/channel/@nehemiahdavid", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            videos = response.json()
            print(f"   Response Type: {type(videos)}")
            
            if isinstance(videos, list):
                print(f"   Videos Count: {len(videos)}")
                
                # Verify we have exactly 10 videos as requested
                if len(videos) == 10:
                    print("   ✅ Correct number of videos (10)")
                    
                    # Verify all videos have required fields
                    required_fields = ['id', 'videoId', 'title', 'publishedAt', 'description', 'category', 'duration', 'views']
                    all_videos_valid = True
                    
                    for i, video in enumerate(videos):
                        print(f"   🔍 Verifying Video {i+1}: {video.get('title', 'No title')[:50]}...")
                        
                        for field in required_fields:
                            if field not in video:
                                print(f"   ❌ Missing field '{field}' in video {i+1}")
                                all_videos_valid = False
                            elif not video[field]:  # Check for empty values
                                print(f"   ❌ Empty field '{field}' in video {i+1}")
                                all_videos_valid = False
                    
                    if all_videos_valid:
                        print("   ✅ All videos have required fields")
                        
                        # Check categories
                        categories = set(video.get('category', 'Unknown') for video in videos)
                        print(f"   Video Categories: {list(categories)}")
                        
                        # Verify expected categories for Nehemiah David
                        expected_categories = {"Sunday Services", "Bible Study", "Youth Services", "Special Events", "Ministry Training", "Prayer & Worship"}
                        found_categories = categories.intersection(expected_categories)
                        
                        if len(found_categories) >= 4:  # Should have at least 4 of the expected categories
                            print(f"   ✅ Found expected categories: {list(found_categories)}")
                            
                            # Verify video IDs are unique
                            video_ids = [video.get('videoId') for video in videos]
                            unique_ids = set(video_ids)
                            
                            if len(unique_ids) == len(video_ids):
                                print("   ✅ All video IDs are unique")
                                
                                # Verify no thumbnail URLs in response (as per requirement)
                                has_thumbnails = False
                                for video in videos:
                                    if 'thumbnail' in video:
                                        print(f"   ❌ Unexpected thumbnail field found in video: {video.get('title', 'Unknown')}")
                                        has_thumbnails = True
                                
                                if not has_thumbnails:
                                    print("   ✅ No thumbnail URLs in response (as required)")
                                    
                                    # Verify dates are in ISO format
                                    all_dates_valid = True
                                    for video in videos:
                                        date_str = video.get('publishedAt', '')
                                        if not date_str.endswith('Z') or 'T' not in date_str:
                                            print(f"   ❌ Invalid date format: {date_str}")
                                            all_dates_valid = False
                                    
                                    if all_dates_valid:
                                        print("   ✅ All dates are in ISO format")
                                        return True
                                    else:
                                        print("   ❌ Some dates are not in ISO format")
                                        return False
                                else:
                                    print("   ❌ Unexpected thumbnail URLs found in response")
                                    return False
                            else:
                                print(f"   ❌ Duplicate video IDs found: {len(video_ids)} total, {len(unique_ids)} unique")
                                return False
                        else:
                            print(f"   ❌ Expected categories not found. Found: {list(categories)}")
                            return False
                    else:
                        print("   ❌ Some videos missing required fields")
                        return False
                else:
                    print(f"   ❌ Expected 10 videos, found {len(videos)}")
                    return False
            else:
                print("   ❌ Response is not a list")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_youtube_channels_uniqueness():
    """Test that both YouTube channels return different content"""
    print("🔍 Testing YouTube channels content uniqueness...")
    
    try:
        # Get videos from both channels
        faith_response = requests.get(f"{BACKEND_URL}/youtube/channel/@faithcenter_in", timeout=10)
        nehemiah_response = requests.get(f"{BACKEND_URL}/youtube/channel/@nehemiahdavid", timeout=10)
        
        if faith_response.status_code == 200 and nehemiah_response.status_code == 200:
            faith_videos = faith_response.json()
            nehemiah_videos = nehemiah_response.json()
            
            if isinstance(faith_videos, list) and isinstance(nehemiah_videos, list):
                # Check video ID uniqueness between channels
                faith_video_ids = set(video.get('videoId') for video in faith_videos)
                nehemiah_video_ids = set(video.get('videoId') for video in nehemiah_videos)
                
                overlap_ids = faith_video_ids.intersection(nehemiah_video_ids)
                
                if not overlap_ids:
                    print("   ✅ All video IDs are unique between channels")
                    
                    # Check title uniqueness
                    faith_titles = set(video.get('title') for video in faith_videos)
                    nehemiah_titles = set(video.get('title') for video in nehemiah_videos)
                    
                    overlap_titles = faith_titles.intersection(nehemiah_titles)
                    
                    if not overlap_titles:
                        print("   ✅ All video titles are unique between channels")
                        
                        # Verify different content themes
                        faith_categories = set(video.get('category') for video in faith_videos)
                        nehemiah_categories = set(video.get('category') for video in nehemiah_videos)
                        
                        print(f"   Faith Center categories: {list(faith_categories)}")
                        print(f"   Nehemiah David categories: {list(nehemiah_categories)}")
                        
                        # Should have some different categories
                        unique_to_nehemiah = nehemiah_categories - faith_categories
                        if unique_to_nehemiah:
                            print(f"   ✅ Nehemiah David has unique categories: {list(unique_to_nehemiah)}")
                            return True
                        else:
                            print("   ⚠️  No unique categories found for Nehemiah David")
                            return True  # Still pass as content is different
                    else:
                        print(f"   ❌ Overlapping video titles: {list(overlap_titles)}")
                        return False
                else:
                    print(f"   ❌ Overlapping video IDs: {list(overlap_ids)}")
                    return False
            else:
                print("   ❌ One or both responses are not lists")
                return False
        else:
            print(f"   ❌ Failed to get both channels. Faith: {faith_response.status_code}, Nehemiah: {nehemiah_response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_video_id_format_validation():
    """Test that video IDs are in valid YouTube format (11 characters) and no thumbnail URLs in response"""
    print("🔍 Testing video ID format validation and thumbnail URL absence...")
    
    try:
        # Get videos from both channels
        faith_response = requests.get(f"{BACKEND_URL}/youtube/channel/@faithcenter_in", timeout=10)
        nehemiah_response = requests.get(f"{BACKEND_URL}/youtube/channel/@nehemiahdavid", timeout=10)
        
        if faith_response.status_code == 200 and nehemiah_response.status_code == 200:
            faith_videos = faith_response.json()
            nehemiah_videos = nehemiah_response.json()
            
            all_videos = faith_videos + nehemiah_videos
            all_valid = True
            
            print(f"   Testing {len(all_videos)} total videos...")
            
            for i, video in enumerate(all_videos):
                video_id = video.get('videoId', '')
                
                # Check video ID format (should be 11 characters for YouTube)
                if len(video_id) != 11:
                    print(f"   ❌ Video {i+1}: Invalid video ID length: '{video_id}' (expected 11 characters)")
                    all_valid = False
                elif not video_id.isalnum() and not all(c.isalnum() or c in '-_' for c in video_id):
                    print(f"   ❌ Video {i+1}: Invalid video ID format: '{video_id}' (should be alphanumeric with - or _)")
                    all_valid = False
                
                # Check that thumbnail URLs are NOT in the response (as per requirement)
                if 'thumbnail' in video:
                    print(f"   ❌ Video {i+1}: Unexpected thumbnail field found: {video['thumbnail']}")
                    all_valid = False
            
            if all_valid:
                print("   ✅ All video IDs are in valid YouTube format (11 characters)")
                print("   ✅ No thumbnail URLs in response (as required)")
                return True
            else:
                print("   ❌ Some video IDs are invalid or unexpected thumbnail URLs found")
                return False
        else:
            print(f"   ❌ Failed to get channels. Faith: {faith_response.status_code}, Nehemiah: {nehemiah_response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

# ========== COUNTDOWN TESTS ==========

def test_get_countdowns_all():
    """Test GET /api/countdowns - Get all countdowns"""
    print("🔍 Testing GET /api/countdowns (all countdowns)...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/countdowns", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            countdowns = response.json()
            print(f"   Response Type: {type(countdowns)}")
            if isinstance(countdowns, list):
                print(f"   Countdowns Count: {len(countdowns)}")
                
                # Verify sorting by priority (highest first)
                if len(countdowns) > 1:
                    priorities = [c.get('priority', 0) for c in countdowns]
                    is_sorted = all(priorities[i] >= priorities[i+1] for i in range(len(priorities)-1))
                    if is_sorted:
                        print("   ✅ Countdowns sorted by priority (highest first)")
                    else:
                        print(f"   ❌ Countdowns not sorted by priority: {priorities}")
                        return False
                
                # Verify countdown structure
                if len(countdowns) > 0:
                    sample = countdowns[0]
                    required_fields = ['id', 'title', 'event_date', 'is_active', 'priority', 'brand_id']
                    missing_fields = [field for field in required_fields if field not in sample]
                    if missing_fields:
                        print(f"   ❌ Missing fields in countdown: {missing_fields}")
                        return False
                    else:
                        print("   ✅ Countdown has all required fields")
                        print(f"   Sample: {sample.get('title')} (Priority: {sample.get('priority')})")
                
                return True, countdowns
            else:
                print("   ❌ Response is not a list")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_get_countdowns_with_brand_filter(brand_id, brand_name):
    """Test GET /api/countdowns?brand_id={brand_id} - Filter by brand"""
    print(f"🔍 Testing GET /api/countdowns?brand_id={brand_id} ({brand_name})...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/countdowns?brand_id={brand_id}", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            countdowns = response.json()
            print(f"   Response Type: {type(countdowns)}")
            if isinstance(countdowns, list):
                print(f"   Brand Countdowns Count: {len(countdowns)}")
                
                # Verify all countdowns belong to the brand
                for countdown in countdowns:
                    if countdown.get('brand_id') != brand_id:
                        print(f"   ❌ Countdown {countdown.get('title')} has wrong brand_id: {countdown.get('brand_id')}")
                        return False
                
                print(f"   ✅ All countdowns belong to {brand_name}")
                return True, countdowns
            else:
                print("   ❌ Response is not a list")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_get_countdowns_active_only(brand_id, brand_name):
    """Test GET /api/countdowns?active_only=true - Only active countdowns"""
    print(f"🔍 Testing GET /api/countdowns?active_only=true...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/countdowns?active_only=true", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            countdowns = response.json()
            print(f"   Response Type: {type(countdowns)}")
            if isinstance(countdowns, list):
                print(f"   Active Countdowns Count: {len(countdowns)}")
                
                # Verify all countdowns are active
                for countdown in countdowns:
                    if not countdown.get('is_active'):
                        print(f"   ❌ Countdown {countdown.get('title')} is not active")
                        return False
                
                print("   ✅ All countdowns are active")
                return True, countdowns
            else:
                print("   ❌ Response is not a list")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_get_countdowns_brand_and_active(brand_id, brand_name):
    """Test GET /api/countdowns?brand_id={brand_id}&active_only=true - Both filters"""
    print(f"🔍 Testing GET /api/countdowns?brand_id={brand_id}&active_only=true ({brand_name})...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/countdowns?brand_id={brand_id}&active_only=true", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            countdowns = response.json()
            print(f"   Response Type: {type(countdowns)}")
            if isinstance(countdowns, list):
                print(f"   Brand Active Countdowns Count: {len(countdowns)}")
                
                # Verify all countdowns belong to brand and are active
                for countdown in countdowns:
                    if countdown.get('brand_id') != brand_id:
                        print(f"   ❌ Countdown {countdown.get('title')} has wrong brand_id: {countdown.get('brand_id')}")
                        return False
                    if not countdown.get('is_active'):
                        print(f"   ❌ Countdown {countdown.get('title')} is not active")
                        return False
                
                print(f"   ✅ All countdowns belong to {brand_name} and are active")
                return True, countdowns
            else:
                print("   ❌ Response is not a list")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_get_single_countdown(countdown_id):
    """Test GET /api/countdowns/{countdown_id} - Get single countdown"""
    print(f"🔍 Testing GET /api/countdowns/{countdown_id}...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/countdowns/{countdown_id}", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            countdown = response.json()
            print(f"   Response Type: {type(countdown)}")
            if isinstance(countdown, dict):
                print(f"   Countdown Title: {countdown.get('title', 'No title')}")
                
                # Verify all required fields are present
                required_fields = ['id', 'title', 'event_date', 'is_active', 'priority', 'brand_id']
                missing_fields = [field for field in required_fields if field not in countdown]
                if missing_fields:
                    print(f"   ❌ Missing fields: {missing_fields}")
                    return False, None
                
                # Verify optional fields
                optional_fields = ['banner_image_url', 'created_at', 'updated_at']
                for field in optional_fields:
                    if field in countdown:
                        print(f"   ✅ Has {field}: {countdown[field] if field != 'banner_image_url' else 'Present' if countdown[field] else 'None'}")
                
                print("   ✅ Countdown has all required fields")
                return True, countdown
            else:
                print("   ❌ Response is not a dict")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_get_single_countdown_not_found():
    """Test GET /api/countdowns/{invalid_id} - Should return 404"""
    print("🔍 Testing GET /api/countdowns/{invalid_id} (should return 404)...")
    
    invalid_id = "non-existent-countdown-id"
    
    try:
        response = requests.get(f"{BACKEND_URL}/countdowns/{invalid_id}", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("   ✅ Correctly returned 404 for non-existent countdown")
            return True
        else:
            print(f"   ❌ Expected 404, got {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_create_countdown_with_auth(admin_token, brand_id):
    """Test POST /api/countdowns - Create countdown with admin auth"""
    print("🔍 Testing POST /api/countdowns (with admin auth)...")
    
    countdown_data = {
        "title": "Test Revival Service",
        "event_date": "2025-12-25T10:00:00",
        "priority": 3,
        "is_active": True,
        "brand_id": brand_id
    }
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/countdowns",
            json=countdown_data,
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Created Countdown ID: {result.get('id', 'No ID')}")
                print(f"   Created Countdown Title: {result.get('title', 'No title')}")
                
                # Verify all fields are present
                for key, value in countdown_data.items():
                    if result.get(key) != value:
                        print(f"   ❌ Field {key} mismatch: expected {value}, got {result.get(key)}")
                        return False, None
                
                # Verify generated fields
                if not result.get('id'):
                    print("   ❌ Missing generated ID")
                    return False, None
                
                if not result.get('created_at'):
                    print("   ❌ Missing created_at timestamp")
                    return False, None
                
                print("   ✅ Countdown created successfully with all fields")
                return True, result.get('id')
            else:
                print("   ❌ Response is not a dict")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_create_countdown_without_auth():
    """Test POST /api/countdowns - Should fail without admin auth"""
    print("🔍 Testing POST /api/countdowns (without auth - should fail)...")
    
    countdown_data = {
        "title": "Unauthorized Test",
        "event_date": "2025-12-25T10:00:00",
        "priority": 1,
        "is_active": True,
        "brand_id": "test-brand"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/countdowns",
            json=countdown_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code in [401, 403]:
            print("   ✅ Correctly rejected request without authentication")
            return True
        else:
            print(f"   ❌ Expected 401/403, got {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_update_countdown_with_auth(admin_token, countdown_id):
    """Test PUT /api/countdowns/{countdown_id} - Update countdown with admin auth"""
    print(f"🔍 Testing PUT /api/countdowns/{countdown_id} (with admin auth)...")
    
    update_data = {
        "title": "Updated Test Revival Service",
        "priority": 5,
        "is_active": False
    }
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/countdowns/{countdown_id}",
            json=update_data,
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Updated Countdown Title: {result.get('title', 'No title')}")
                
                # Verify updates were applied
                for key, value in update_data.items():
                    if result.get(key) != value:
                        print(f"   ❌ Field {key} not updated: expected {value}, got {result.get(key)}")
                        return False
                
                # Verify updated_at timestamp changed
                if not result.get('updated_at'):
                    print("   ❌ Missing updated_at timestamp")
                    return False
                
                print("   ✅ Countdown updated successfully")
                return True
            else:
                print("   ❌ Response is not a dict")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_update_countdown_without_auth(countdown_id):
    """Test PUT /api/countdowns/{countdown_id} - Should fail without admin auth"""
    print(f"🔍 Testing PUT /api/countdowns/{countdown_id} (without auth - should fail)...")
    
    update_data = {
        "title": "Unauthorized Update"
    }
    
    try:
        response = requests.put(
            f"{BACKEND_URL}/countdowns/{countdown_id}",
            json=update_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code in [401, 403]:
            print("   ✅ Correctly rejected update without authentication")
            return True
        else:
            print(f"   ❌ Expected 401/403, got {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_delete_countdown_without_auth(countdown_id):
    """Test DELETE /api/countdowns/{countdown_id} - Should fail without admin auth"""
    print(f"🔍 Testing DELETE /api/countdowns/{countdown_id} (without auth - should fail)...")
    
    try:
        response = requests.delete(f"{BACKEND_URL}/countdowns/{countdown_id}", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code in [401, 403]:
            print("   ✅ Correctly rejected delete without authentication")
            return True
        else:
            print(f"   ❌ Expected 401/403, got {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_delete_countdown_with_auth(admin_token, countdown_id):
    """Test DELETE /api/countdowns/{countdown_id} - Delete countdown with admin auth"""
    print(f"🔍 Testing DELETE /api/countdowns/{countdown_id} (with admin auth)...")
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.delete(
            f"{BACKEND_URL}/countdowns/{countdown_id}",
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response: {result.get('message', 'No message')}")
            
            # Verify countdown is actually deleted
            verify_response = requests.get(f"{BACKEND_URL}/countdowns/{countdown_id}", timeout=10)
            if verify_response.status_code == 404:
                print("   ✅ Countdown successfully deleted (verified with GET)")
                return True
            else:
                print(f"   ❌ Countdown still exists after delete (GET returned {verify_response.status_code})")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

# ========== LIVE STREAM TESTS ==========

def test_get_live_streams(brand_id):
    """Test GET /api/live-streams?brand_id={id}"""
    print("🔍 Testing GET /api/live-streams...")
    
    try:
        url = f"{BACKEND_URL}/live-streams"
        if brand_id:
            url += f"?brand_id={brand_id}"
        
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, list):
                print(f"   Live Streams Count: {len(result)}")
                if len(result) > 0:
                    print(f"   Sample Stream: {result[0].get('title', 'No title')}")
                return True
            else:
                print("   ❌ Response is not a list")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_get_active_stream(brand_id):
    """Test GET /api/live-streams/active?brand_id={id}"""
    print("🔍 Testing GET /api/live-streams/active...")
    
    try:
        url = f"{BACKEND_URL}/live-streams/active"
        if brand_id:
            url += f"?brand_id={brand_id}"
        
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if result is None:
                print("   ⚠️  No active stream (expected)")
                return True
            elif isinstance(result, dict):
                print(f"   Active Stream: {result.get('title', 'No title')}")
                print(f"   Stream URL: {result.get('stream_url', 'No URL')}")
                return True
            else:
                print("   ❌ Response is not dict or null")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_create_live_stream(admin_token, brand_id):
    """Test POST /api/live-streams - Create new live stream"""
    print("🔍 Testing POST /api/live-streams...")
    
    stream_data = {
        "title": "Sunday Morning Service",
        "description": "Join us for worship and the Word",
        "stream_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        "is_live": True,
        "scheduled_time": "2024-01-21T10:00:00Z",
        "brand_id": brand_id
    }
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/live-streams",
            json=stream_data,
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict):
                print(f"   Created Stream: {result.get('title', 'No title')}")
                print(f"   Stream ID: {result.get('id', 'No ID')}")
                print(f"   Is Live: {result.get('is_live', False)}")
                return True
            else:
                print("   ❌ Response is not a dict")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_get_countdowns(brand_id=None):
    """Test GET /api/countdowns endpoint - Phase 5 requirement"""
    url = f"{BACKEND_URL}/countdowns"
    if brand_id:
        url += f"?brand_id={brand_id}"
        print(f"🔍 Testing GET /api/countdowns?brand_id={brand_id}...")
    else:
        print("🔍 Testing GET /api/countdowns...")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            countdowns = response.json()
            print(f"   Response Type: {type(countdowns)}")
            print(f"   Countdowns Count: {len(countdowns) if isinstance(countdowns, list) else 'Not a list'}")
            
            if isinstance(countdowns, list):
                if len(countdowns) > 0:
                    print(f"   Sample Countdown: {countdowns[0].get('title', 'No title')}")
                    
                    # Verify countdown structure
                    sample = countdowns[0]
                    required_fields = ['id', 'title', 'event_date', 'is_active', 'priority', 'brand_id']
                    
                    all_fields_present = True
                    for field in required_fields:
                        if field not in sample:
                            print(f"   ❌ Missing field: {field}")
                            all_fields_present = False
                        else:
                            print(f"   ✅ {field}: {sample.get(field)}")
                    
                    if all_fields_present:
                        print("   ✅ All required countdown fields present")
                        return True, countdowns
                    else:
                        print("   ❌ Some required countdown fields missing")
                        return False, countdowns
                else:
                    print("   ⚠️  Empty countdowns list")
                    return True, []
            else:
                print("   ❌ Response is not a list")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_admin_login_with_phase5_credentials():
    """Test admin login with Phase 5 specific credentials from review request"""
    print("🔍 Testing Admin Login with Phase 5 Credentials...")
    
    login_data = {
        "email": "promptforge.dev@gmail.com",
        "password": "P9$wX!7rAq#4Lz@M2f"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            if isinstance(result, dict) and "token" in result:
                print(f"   ✅ Admin Token obtained: {result['token'][:20]}...")
                print(f"   Admin Email: {result.get('admin', {}).get('email', 'No email')}")
                return True, result["token"]
            else:
                print("   ❌ Response missing token")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_phase5_api_health_check():
    """Test Phase 5 API Health Check requirements"""
    print("\n🔍 PHASE 5 API HEALTH CHECK")
    print("=" * 50)
    
    health_results = {
        "brands": False,
        "countdowns": False,
        "events": False,
        "announcements": False
    }
    
    # Test GET /api/brands - should return 2 brands
    print("🔍 Testing GET /api/brands (should return 2 brands)...")
    try:
        response = requests.get(f"{BACKEND_URL}/brands", timeout=10)
        if response.status_code == 200:
            brands = response.json()
            if isinstance(brands, list) and len(brands) == 2:
                print(f"   ✅ GET /api/brands returns 2 brands: {[b.get('name') for b in brands]}")
                health_results["brands"] = True
            else:
                print(f"   ❌ Expected 2 brands, got {len(brands) if isinstance(brands, list) else 'not a list'}")
        else:
            print(f"   ❌ GET /api/brands failed with status {response.status_code}")
    except Exception as e:
        print(f"   ❌ GET /api/brands exception: {str(e)}")
    
    # Test GET /api/countdowns - should return countdowns
    print("🔍 Testing GET /api/countdowns (should return countdowns)...")
    try:
        response = requests.get(f"{BACKEND_URL}/countdowns", timeout=10)
        if response.status_code == 200:
            countdowns = response.json()
            if isinstance(countdowns, list):
                print(f"   ✅ GET /api/countdowns returns {len(countdowns)} countdowns")
                health_results["countdowns"] = True
            else:
                print("   ❌ GET /api/countdowns response is not a list")
        else:
            print(f"   ❌ GET /api/countdowns failed with status {response.status_code}")
    except Exception as e:
        print(f"   ❌ GET /api/countdowns exception: {str(e)}")
    
    # Test GET /api/events - should return events
    print("🔍 Testing GET /api/events (should return events)...")
    try:
        response = requests.get(f"{BACKEND_URL}/events", timeout=10)
        if response.status_code == 200:
            events = response.json()
            if isinstance(events, list):
                print(f"   ✅ GET /api/events returns {len(events)} events")
                health_results["events"] = True
            else:
                print("   ❌ GET /api/events response is not a list")
        else:
            print(f"   ❌ GET /api/events failed with status {response.status_code}")
    except Exception as e:
        print(f"   ❌ GET /api/events exception: {str(e)}")
    
    # Test GET /api/announcements - should return announcements
    print("🔍 Testing GET /api/announcements (should return announcements)...")
    try:
        response = requests.get(f"{BACKEND_URL}/announcements", timeout=10)
        if response.status_code == 200:
            announcements = response.json()
            if isinstance(announcements, list):
                print(f"   ✅ GET /api/announcements returns {len(announcements)} announcements")
                health_results["announcements"] = True
            else:
                print("   ❌ GET /api/announcements response is not a list")
        else:
            print(f"   ❌ GET /api/announcements failed with status {response.status_code}")
    except Exception as e:
        print(f"   ❌ GET /api/announcements exception: {str(e)}")
    
    # Summary
    passed = sum(health_results.values())
    total = len(health_results)
    
    print(f"\n📊 API Health Check Results: {passed}/{total} passed")
    if passed == total:
        print("   ✅ All Phase 5 API health checks passed!")
        return True
    else:
        failed_apis = [api for api, result in health_results.items() if not result]
        print(f"   ❌ Failed APIs: {failed_apis}")
        return False

# ========== VOLUNTEER SYSTEM REMOVAL TESTS ==========

def test_volunteer_endpoints_removed():
    """Test that volunteer endpoints return 404 Not Found"""
    print("🔍 Testing Volunteer Endpoints Removal...")
    
    volunteer_endpoints = [
        ("GET", f"{BACKEND_URL}/volunteers"),
        ("POST", f"{BACKEND_URL}/volunteers"),
        ("PUT", f"{BACKEND_URL}/volunteers/test-id/status")
    ]
    
    all_removed = True
    
    for method, url in volunteer_endpoints:
        try:
            print(f"   Testing {method} {url.replace(BACKEND_URL, '')}...")
            
            if method == "GET":
                response = requests.get(url, timeout=10)
            elif method == "POST":
                response = requests.post(url, json={"test": "data"}, headers={"Content-Type": "application/json"}, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json={"status": "active"}, headers={"Content-Type": "application/json"}, timeout=10)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 404:
                print(f"   ✅ {method} endpoint correctly returns 404 Not Found")
            else:
                print(f"   ❌ {method} endpoint should return 404, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                all_removed = False
                
        except Exception as e:
            print(f"   ❌ Exception testing {method} endpoint: {str(e)}")
            all_removed = False
    
    if all_removed:
        print("   ✅ All volunteer endpoints correctly removed (return 404)")
        return True
    else:
        print("   ❌ Some volunteer endpoints still exist")
        return False

def test_analytics_no_volunteers(admin_token):
    """Test that analytics endpoint does NOT include volunteers in totals"""
    print("🔍 Testing Analytics Endpoint - No Volunteers...")
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{BACKEND_URL}/analytics/overview",
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            
            if isinstance(result, dict) and "totals" in result:
                totals = result["totals"]
                print(f"   Analytics Totals Keys: {list(totals.keys())}")
                
                # Check that volunteers is NOT in totals
                if "volunteers" in totals:
                    print(f"   ❌ Analytics still includes 'volunteers' in totals: {totals['volunteers']}")
                    return False
                else:
                    print("   ✅ Analytics does NOT include 'volunteers' in totals")
                
                # Check that attendees IS in totals
                if "attendees" in totals:
                    print(f"   ✅ Analytics includes 'attendees' in totals: {totals['attendees']}")
                else:
                    print("   ❌ Analytics missing 'attendees' in totals")
                    return False
                
                # Check recent activity does not include volunteers
                if "recent_activity" in result:
                    recent_activity = result["recent_activity"]
                    print(f"   Recent Activity Keys: {list(recent_activity.keys())}")
                    
                    if "volunteers" in recent_activity:
                        print(f"   ❌ Recent activity still includes 'volunteers'")
                        return False
                    else:
                        print("   ✅ Recent activity does NOT include 'volunteers'")
                    
                    if "attendees" in recent_activity:
                        print(f"   ✅ Recent activity includes 'attendees': {len(recent_activity['attendees'])} items")
                    else:
                        print("   ⚠️  Recent activity missing 'attendees' (may be empty)")
                
                print("   ✅ Analytics endpoint correctly updated - no volunteers, includes attendees")
                return True
            else:
                print("   ❌ Response missing 'totals' field")
                print(f"   Response structure: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_attendees_still_working(admin_token, brand_id):
    """Test that attendees endpoints still work correctly"""
    print("🔍 Testing Attendees Endpoints Still Working...")
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        # Test GET /api/attendees
        url = f"{BACKEND_URL}/attendees"
        if brand_id:
            url += f"?brand_id={brand_id}"
        
        response = requests.get(url, headers=headers, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Response Type: {type(result)}")
            
            if isinstance(result, list):
                print(f"   Attendees Count: {len(result)}")
                
                if len(result) > 0:
                    print(f"   Sample Attendee: {result[0].get('name', 'No name')} - {result[0].get('email', 'No email')}")
                    
                    # Verify attendee structure
                    required_fields = ['id', 'event_id', 'name', 'email', 'brand_id', 'created_at']
                    sample = result[0]
                    
                    missing_fields = [field for field in required_fields if field not in sample]
                    if missing_fields:
                        print(f"   ❌ Missing fields in attendee: {missing_fields}")
                        return False
                    else:
                        print("   ✅ Attendee has all required fields")
                else:
                    print("   ⚠️  No attendees found (may be empty)")
                
                print("   ✅ Attendees endpoint working correctly")
                return True
            else:
                print("   ❌ Response is not a list")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

# ========== ADMIN PANEL TESTING - THREE NEW FEATURES ==========

def test_phase1_header_navigation_manager_fix(admin_token, brand_id):
    """
    Phase 1: Test Header Navigation Manager Fix
    Test that partial brand updates work correctly - only update hidden_nav_links field
    """
    print("🔍 PHASE 1: Testing Header Navigation Manager Fix...")
    
    # Step 1: Get current brand data
    try:
        get_response = requests.get(f"{BACKEND_URL}/brands/{brand_id}", timeout=10)
        if get_response.status_code != 200:
            print("   ❌ Could not get brand details")
            return False
        
        original_brand = get_response.json()
        print(f"   Original brand name: {original_brand.get('name')}")
        print(f"   Original hidden_nav_links: {original_brand.get('hidden_nav_links', [])}")
        
    except Exception as e:
        print(f"   ❌ Exception getting brand: {str(e)}")
        return False
    
    # Step 2: Update ONLY the hidden_nav_links field
    update_data = {
        "hidden_nav_links": ["testimonials", "gallery"]
    }
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.put(
            f"{BACKEND_URL}/brands/{brand_id}",
            json=update_data,
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            updated_brand = response.json()
            print(f"   Updated hidden_nav_links: {updated_brand.get('hidden_nav_links', [])}")
            
            # Step 3: Verify ONLY hidden_nav_links was updated, other fields unchanged
            verification_passed = True
            
            # Check that hidden_nav_links was updated correctly
            if updated_brand.get('hidden_nav_links') != ["testimonials", "gallery"]:
                print(f"   ❌ hidden_nav_links not updated correctly: {updated_brand.get('hidden_nav_links')}")
                verification_passed = False
            else:
                print("   ✅ hidden_nav_links updated correctly")
            
            # Check that other critical fields were NOT overwritten
            critical_fields = ['name', 'domain', 'tagline', 'location', 'logo_url', 'hero_image_url']
            for field in critical_fields:
                original_value = original_brand.get(field)
                updated_value = updated_brand.get(field)
                if original_value != updated_value:
                    print(f"   ❌ Field '{field}' was overwritten! Original: {original_value}, Updated: {updated_value}")
                    verification_passed = False
                else:
                    print(f"   ✅ Field '{field}' preserved: {updated_value}")
            
            # Step 4: Verify changes persist by getting brand again
            try:
                verify_response = requests.get(f"{BACKEND_URL}/brands/{brand_id}", timeout=10)
                if verify_response.status_code == 200:
                    persisted_brand = verify_response.json()
                    if persisted_brand.get('hidden_nav_links') == ["testimonials", "gallery"]:
                        print("   ✅ Changes persisted correctly")
                    else:
                        print(f"   ❌ Changes did not persist: {persisted_brand.get('hidden_nav_links')}")
                        verification_passed = False
                else:
                    print("   ❌ Could not verify persistence")
                    verification_passed = False
            except Exception as e:
                print(f"   ❌ Exception verifying persistence: {str(e)}")
                verification_passed = False
            
            return verification_passed
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_phase2_enhanced_event_registration(brand_id):
    """
    Phase 2: Test Enhanced Event Registration
    Test that event registration accepts new fields: mobile_number, place, category
    """
    print("🔍 PHASE 2: Testing Enhanced Event Registration...")
    
    # Step 1: Get an event ID
    try:
        events_response = requests.get(f"{BACKEND_URL}/events?brand_id={brand_id}", timeout=10)
        if events_response.status_code != 200:
            print("   ❌ Could not get events")
            return False, None
        
        events = events_response.json()
        if not events:
            print("   ❌ No events found")
            return False, None
        
        event_id = events[0].get('id')
        event_title = events[0].get('title')
        print(f"   Using event: {event_title} (ID: {event_id})")
        
    except Exception as e:
        print(f"   ❌ Exception getting events: {str(e)}")
        return False, None
    
    # Step 2: Register for event with ALL new fields
    registration_data = {
        "event_id": event_id,
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@email.com", 
        "phone": "+919876543210",
        "mobile_number": "+919876543210",  # NEW FIELD
        "place": "Guntur, Andhra Pradesh",  # NEW FIELD
        "category": "VIP",  # NEW FIELD - test values: General, VIP, Volunteer, Speaker, Media, Youth, Family
        "guests": 2,
        "notes": "Looking forward to this blessed event! Coming with family.",
        "brand_id": brand_id
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/events/{event_id}/register",
            json=registration_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Registration ID: {result.get('id')}")
            print(f"   Name: {result.get('name')}")
            print(f"   Mobile Number: {result.get('mobile_number')}")
            print(f"   Place: {result.get('place')}")
            print(f"   Category: {result.get('category')}")
            
            # Step 3: Verify all new fields are included in response
            verification_passed = True
            new_fields = ['mobile_number', 'place', 'category']
            
            for field in new_fields:
                expected_value = registration_data[field]
                actual_value = result.get(field)
                if actual_value != expected_value:
                    print(f"   ❌ Field '{field}' mismatch: expected {expected_value}, got {actual_value}")
                    verification_passed = False
                else:
                    print(f"   ✅ Field '{field}' correct: {actual_value}")
            
            if verification_passed:
                print("   ✅ All new fields accepted and stored correctly")
                return True, result.get('id')
            else:
                print("   ❌ Some new fields not stored correctly")
                return False, result.get('id')
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_phase3_attendees_api_with_category(admin_token, brand_id, test_registration_id):
    """
    Phase 3: Test Attendees API with Category
    Test that attendees API returns new fields: mobile_number, place, category
    """
    print("🔍 PHASE 3: Testing Attendees API with Category...")
    
    try:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        # Step 1: Get all attendees for the brand
        response = requests.get(
            f"{BACKEND_URL}/attendees?brand_id={brand_id}",
            headers=headers,
            timeout=10
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            attendees = response.json()
            print(f"   Total attendees: {len(attendees)}")
            
            if not attendees:
                print("   ❌ No attendees found")
                return False
            
            # Step 2: Verify response includes new fields
            sample_attendee = attendees[0]
            print(f"   Sample attendee: {sample_attendee.get('name')}")
            
            new_fields = ['mobile_number', 'place', 'category']
            all_fields_present = True
            
            for field in new_fields:
                if field not in sample_attendee:
                    print(f"   ❌ Missing new field: {field}")
                    all_fields_present = False
                else:
                    print(f"   ✅ New field present - {field}: {sample_attendee.get(field)}")
            
            # Step 3: Find our test registration and verify it has category "VIP"
            test_attendee_found = False
            for attendee in attendees:
                if attendee.get('id') == test_registration_id:
                    test_attendee_found = True
                    if attendee.get('category') == 'VIP':
                        print("   ✅ Test registration found with correct category 'VIP'")
                    else:
                        print(f"   ❌ Test registration has wrong category: {attendee.get('category')}")
                        all_fields_present = False
                    break
            
            if not test_attendee_found:
                print("   ⚠️  Test registration not found in attendees list (may be expected)")
            
            if all_fields_present:
                print("   ✅ Attendees API returns all new fields correctly")
                return True
            else:
                print("   ❌ Some new fields missing from attendees API")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def main():
    """Main test execution function"""
    print("=" * 80)
    print("🚀 ADMIN PANEL TESTING - THREE NEW FEATURES")
    print("=" * 80)
    
    # Track test results
    test_results = []
    
    # Get admin credentials and login
    print("\n" + "=" * 50)
    print("🔐 ADMIN AUTHENTICATION")
    print("=" * 50)
    
    admin_login_success, admin_token = test_admin_login()
    test_results.append(("Admin Login", admin_login_success))
    
    if not admin_login_success or not admin_token:
        print("\n❌ CRITICAL: Admin login failed. Cannot continue with admin panel tests.")
        print_test_summary(test_results)
        return
    
    # Get brand IDs
    print("\n" + "=" * 50)
    print("📋 GETTING BRAND INFORMATION")
    print("=" * 50)
    
    brands_success, ndm_brand_id, faith_brand_id = test_get_brands()
    test_results.append(("GET /api/brands", brands_success))
    
    if not brands_success or not ndm_brand_id:
        print("\n❌ CRITICAL: Could not get brand information. Cannot continue.")
        print_test_summary(test_results)
        return
    
    print(f"\n✅ Using Nehemiah David Ministries brand ID: {ndm_brand_id}")
    
    # PHASE 1: Header Navigation Manager Fix
    print("\n" + "=" * 50)
    print("🔧 PHASE 1: HEADER NAVIGATION MANAGER FIX")
    print("=" * 50)
    
    phase1_success = test_phase1_header_navigation_manager_fix(admin_token, ndm_brand_id)
    test_results.append(("Phase 1: Header Navigation Manager Fix", phase1_success))
    
    # PHASE 2: Enhanced Event Registration
    print("\n" + "=" * 50)
    print("📝 PHASE 2: ENHANCED EVENT REGISTRATION")
    print("=" * 50)
    
    phase2_success, test_registration_id = test_phase2_enhanced_event_registration(ndm_brand_id)
    test_results.append(("Phase 2: Enhanced Event Registration", phase2_success))
    
    # PHASE 3: Attendees API with Category
    print("\n" + "=" * 50)
    print("👥 PHASE 3: ATTENDEES API WITH CATEGORY")
    print("=" * 50)
    
    phase3_success = test_phase3_attendees_api_with_category(admin_token, ndm_brand_id, test_registration_id)
    test_results.append(("Phase 3: Attendees API with Category", phase3_success))
    
    # Print final summary
    print_test_summary(test_results)

def print_test_summary(test_results):
    """Print a summary of all test results"""
    print("\n" + "=" * 80)
    print("📊 ADMIN PANEL TESTING SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, success in test_results if success)
    total = len(test_results)
    
    print(f"\n✅ PASSED: {passed}/{total} tests")
    print(f"❌ FAILED: {total - passed}/{total} tests")
    
    if total - passed > 0:
        print("\n❌ FAILED TESTS:")
        for test_name, success in test_results:
            if not success:
                print(f"   • {test_name}")
    
    print("\n✅ PASSED TESTS:")
    for test_name, success in test_results:
        if success:
            print(f"   • {test_name}")
    
    print("\n" + "=" * 80)
    if passed == total:
        print("🎉 ALL ADMIN PANEL TESTS PASSED! Three new features working correctly.")
    else:
        print("⚠️  SOME TESTS FAILED. Please check the failed features.")
    print("=" * 80)

def test_volunteer_system_removal():
    """Run Volunteer System Removal Testing - Phase 1"""
    print("🚀 Starting Volunteer System Removal Testing - Phase 1...")
    print("=" * 60)
    print("Focus: Verify volunteer endpoints removed, analytics updated, attendees working")
    print("=" * 60)
    
    # Track test results
    results = {
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    def run_test(test_name, test_func, *args):
        results["total"] += 1
        print(f"\n📋 Test {results['total']}: {test_name}")
        try:
            success = test_func(*args)
            if success:
                results["passed"] += 1
                print(f"✅ PASSED: {test_name}")
            else:
                results["failed"] += 1
                print(f"❌ FAILED: {test_name}")
            return success
        except Exception as e:
            results["failed"] += 1
            print(f"❌ ERROR in {test_name}: {str(e)}")
            return False
    
    # Test 1: Verify volunteer endpoints are removed
    run_test("Volunteer Endpoints Removed", test_volunteer_endpoints_removed)
    
    # Test 2: Get admin token for authenticated tests
    admin_success, admin_token = test_admin_login()
    if not admin_success:
        print("❌ Cannot proceed without admin authentication")
        return False
    
    # Test 3: Verify analytics endpoint updated (no volunteers, includes attendees)
    run_test("Analytics No Volunteers", test_analytics_no_volunteers, admin_token)
    
    # Test 4: Get brand ID for attendees test
    brands_success, ndm_brand_id, faith_brand_id = test_get_brands()
    if not brands_success:
        print("❌ Cannot get brand IDs for attendees test")
        brand_id = None
    else:
        brand_id = ndm_brand_id  # Use Nehemiah David Ministries brand
    
    # Test 5: Verify attendees endpoints still work
    run_test("Attendees Still Working", test_attendees_still_working, admin_token, brand_id)
    
    # Print final results
    print("\n" + "=" * 60)
    print("🏁 VOLUNTEER SYSTEM REMOVAL TESTING COMPLETE")
    print("=" * 60)
    print(f"📊 Results: {results['passed']}/{results['total']} tests passed")
    
    if results['failed'] == 0:
        print("🎉 ALL TESTS PASSED! Volunteer system successfully removed.")
        print("✅ All volunteer endpoints return 404")
        print("✅ Analytics updated (no volunteers, includes attendees)")
        print("✅ Attendees endpoints working correctly")
    else:
        print(f"❌ {results['failed']} test(s) failed")
        if results['passed'] > 0:
            print(f"✅ {results['passed']} test(s) passed")
    
    return results['failed'] == 0

if __name__ == "__main__":
    main()