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
BACKEND_URL = "https://blog-enhance.preview.emergentagent.com/api"

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
    """Test GET /api/announcements endpoint"""
    url = f"{BACKEND_URL}/announcements"
    if brand_id:
        url += f"?brand_id={brand_id}"
        print(f"🔍 Testing GET /api/announcements?brand_id={brand_id}...")
    else:
        print("🔍 Testing GET /api/announcements...")
    
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
                else:
                    print("   ⚠️  Empty announcements list")
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
        "email": "admin@faithcenter.com",
        "password": "Admin@2025"
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

def main():
    """Run YouTube integration backend tests as requested"""
    print("=" * 80)
    print("🎬 YOUTUBE INTEGRATION BACKEND TESTING")
    print("=" * 80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    # Track test results
    results = []
    
    print("\n🔍 TESTING MESSAGES PAGE YOUTUBE INTEGRATION BACKEND")
    print("=" * 60)
    print("Testing the two YouTube channel endpoints as requested:")
    print("1. GET /api/youtube/channel/@faithcenter_in - should return exactly 8 videos")
    print("2. GET /api/youtube/channel/@nehemiahdavid - should return exactly 10 videos")
    print("=" * 60)
    
    # Test 1: Faith Center YouTube Channel
    print("\n" + "=" * 50)
    print("🎥 TESTING FAITH CENTER YOUTUBE CHANNEL")
    print("=" * 50)
    
    faith_youtube_success = test_youtube_faith_center_channel()
    results.append(("GET /api/youtube/channel/@faithcenter_in", faith_youtube_success))
    
    # Test 2: Nehemiah David YouTube Channel
    print("\n" + "=" * 50)
    print("🎥 TESTING NEHEMIAH DAVID YOUTUBE CHANNEL")
    print("=" * 50)
    
    nehemiah_youtube_success = test_youtube_nehemiah_david_channel()
    results.append(("GET /api/youtube/channel/@nehemiahdavid", nehemiah_youtube_success))
    
    # Test 3: Content Uniqueness Between Channels
    print("\n" + "=" * 50)
    print("🔍 TESTING YOUTUBE CHANNELS CONTENT UNIQUENESS")
    print("=" * 50)
    
    youtube_uniqueness_success = test_youtube_channels_uniqueness()
    results.append(("YouTube Channels Content Uniqueness", youtube_uniqueness_success))
    
    # Test 4: Video ID Format Validation
    print("\n" + "=" * 50)
    print("🔍 TESTING VIDEO ID FORMAT VALIDATION")
    print("=" * 50)
    
    video_id_validation_success = test_video_id_format_validation()
    results.append(("Video ID Format Validation", video_id_validation_success))
    
    # Print final results
    print("\n" + "=" * 80)
    print("📊 YOUTUBE INTEGRATION TEST RESULTS")
    print("=" * 80)
    
    passed = 0
    failed = 0
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status:<10} {test_name}")
        if success:
            passed += 1
        else:
            failed += 1
    
    print("=" * 80)
    print(f"📈 SUMMARY: {passed} passed, {failed} failed, {passed + failed} total")
    
    if failed == 0:
        print("🎉 ALL YOUTUBE INTEGRATION TESTS PASSED!")
        print("✅ Both channels return correct number of videos with all required fields")
        print("✅ Video IDs are in valid YouTube format (11 characters)")
        print("✅ No thumbnail URLs in response (thumbnails loaded from YouTube CDN)")
        print("✅ Categories are properly set for both channels")
        print("✅ Both channels have unique video content")
        return 0
    else:
        print(f"⚠️  {failed} YOUTUBE INTEGRATION TESTS FAILED")
        print("❌ Some validation checks did not pass - see details above")
        return 1
    
    print("=" * 80)

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)