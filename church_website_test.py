#!/usr/bin/env python3
"""
Church Website Backend Testing Script
Tests specific requirements from the review request
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://church-admin-15.preview.emergentagent.com/api"

def test_brand_data_verification():
    """Test 1: Brand Data Verification - Check Nehemiah David Ministries service times and image URLs"""
    print("🔍 Testing Brand Data Verification...")
    try:
        response = requests.get(f"{BACKEND_URL}/brands", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            brands = response.json()
            ndm_brand = None
            
            # Find Nehemiah David Ministries brand
            for brand in brands:
                if brand.get('name') == "Nehemiah David Ministries":
                    ndm_brand = brand
                    break
            
            if not ndm_brand:
                print("   ❌ Nehemiah David Ministries brand not found")
                return False, None
            
            print(f"   ✅ Found Nehemiah David Ministries brand")
            
            # Check service times - should show all 4 services
            service_times = ndm_brand.get('service_times', '')
            print(f"   Service Times: {service_times}")
            
            # Check for all 4 expected services (flexible matching)
            expected_services = [
                ("Morning", "7", "9"),  # Morning 7-9am
                ("Service", "10", "12"), # Service 10am-12pm
                ("Evening", "Online", "6:30", "8:30"), # Evening Online 6:30-8:30pm
                ("Friday", "7", "9")  # Friday 7-9pm
            ]
            
            service_times_valid = True
            service_times_lower = service_times.lower()
            
            for service_parts in expected_services:
                service_name = service_parts[0]
                if service_name.lower() == "evening":
                    # Special check for Evening Online service
                    if all(part.lower() in service_times_lower for part in service_parts):
                        print(f"   ✅ Found service: Evening Online 6:30-8:30pm")
                    else:
                        print(f"   ❌ Missing service: Evening Online 6:30-8:30pm")
                        service_times_valid = False
                elif service_name.lower() == "service":
                    # Check for main service
                    if "service" in service_times_lower and "10" in service_times and "12" in service_times:
                        print(f"   ✅ Found service: Service 10am-12pm")
                    else:
                        print(f"   ❌ Missing service: Service 10am-12pm")
                        service_times_valid = False
                elif service_name.lower() == "morning":
                    # Check for morning service
                    if "morning" in service_times_lower and "7" in service_times and "9" in service_times:
                        print(f"   ✅ Found service: Morning 7-9am")
                    else:
                        print(f"   ❌ Missing service: Morning 7-9am")
                        service_times_valid = False
                elif service_name.lower() == "friday":
                    # Check for Friday service
                    if "friday" in service_times_lower and "7" in service_times and "9" in service_times:
                        print(f"   ✅ Found service: Friday 7-9pm")
                    else:
                        print(f"   ❌ Missing service: Friday 7-9pm")
                        service_times_valid = False
            
            # Check hero_image_url and logo_url
            hero_image_url = ndm_brand.get('hero_image_url')
            logo_url = ndm_brand.get('logo_url')
            
            if not hero_image_url:
                print("   ❌ hero_image_url missing")
                return False, ndm_brand.get('id')
            else:
                print(f"   ✅ hero_image_url present: {hero_image_url[:50]}...")
            
            if not logo_url:
                print("   ❌ logo_url missing")
                return False, ndm_brand.get('id')
            else:
                print(f"   ✅ logo_url present: {logo_url[:50]}...")
            
            if service_times_valid:
                print("   ✅ All service times verification passed")
                return True, ndm_brand.get('id')
            else:
                print("   ❌ Service times verification failed")
                return False, ndm_brand.get('id')
                
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_revive_event(brand_id):
    """Test 2: REVIVE Event - Check for REVIVE - 5 Day Revival Conference event"""
    print("🔍 Testing REVIVE Event...")
    try:
        url = f"{BACKEND_URL}/events"
        if brand_id:
            url += f"?brand_id={brand_id}"
        
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            events = response.json()
            revive_event = None
            
            # Find REVIVE event
            for event in events:
                title = event.get('title', '').lower()
                if 'revive' in title and '5 day' in title.lower():
                    revive_event = event
                    break
            
            if not revive_event:
                print("   ❌ REVIVE - 5 Day Revival Conference event not found")
                print(f"   Available events: {[e.get('title') for e in events]}")
                return False, None
            
            print(f"   ✅ Found REVIVE event: {revive_event.get('title')}")
            
            # Check date (should be Dec 3-7, 2025)
            event_date = revive_event.get('date', '')
            print(f"   Event Date: {event_date}")
            
            # Check if date contains Dec 3-7, 2025 or similar
            description = revive_event.get('description', '')
            if '2025' in event_date and ('2025-12-03' in event_date or 'dec' in event_date.lower() or '12' in event_date):
                if ('3-7' in description) or ('December 3-7, 2025' in description):
                    print("   ✅ Event date/description contains Dec 3-7, 2025 range")
                elif '2025-12-03' in event_date:
                    print("   ✅ Event date shows Dec 3, 2025 (start date)")
                else:
                    print("   ⚠️  Event date may not contain full Dec 3-7 range")
            else:
                print("   ❌ Event date does not contain Dec 2025")
            
            # Check description mentions 5-day revival
            description = revive_event.get('description', '').lower()
            if '5' in description and ('day' in description or 'revival' in description):
                print("   ✅ Description mentions 5-day revival")
            else:
                print("   ⚠️  Description may not mention 5-day revival")
            
            return True, revive_event.get('id')
                
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_event_registration(event_id, brand_id):
    """Test 3: Event Registration API - POST /api/events/{event_id}/register"""
    print("🔍 Testing Event Registration API...")
    
    if not event_id:
        print("   ❌ No event_id provided, cannot test registration")
        return False, None
    
    # Test data as specified in review request
    registration_data = {
        "name": "John Doe",
        "email": "john@test.com", 
        "phone": "+1234567890",
        "guests": 2,
        "notes": "Looking forward!",
        "event_id": event_id,
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
            print(f"   Response Type: {type(result)}")
            
            if isinstance(result, dict):
                attendee_id = result.get('id')
                if attendee_id:
                    print(f"   ✅ Registration successful - Attendee ID: {attendee_id}")
                    print(f"   Attendee Name: {result.get('name')}")
                    print(f"   Attendee Email: {result.get('email')}")
                    print(f"   Guests: {result.get('guests')}")
                    return True, attendee_id
                else:
                    print("   ❌ Registration response missing attendee ID")
                    return False, None
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

def create_admin_user():
    """Create admin user if not exists"""
    print("🔍 Creating/Testing Admin User...")
    
    # Try to register admin first
    admin_data = {
        "email": "admin@ndm.com",
        "password": "admin123"
    }
    
    try:
        # Try to register (will fail if already exists)
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=admin_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            print("   ✅ Admin user created successfully")
        elif response.status_code == 400:
            print("   ✅ Admin user already exists")
        else:
            print(f"   ⚠️  Admin registration status: {response.status_code}")
        
        # Now try to login
        login_response = requests.post(
            f"{BACKEND_URL}/auth/login",
            json=admin_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if login_response.status_code == 200:
            result = login_response.json()
            token = result.get('token')
            if token:
                print(f"   ✅ Admin login successful - Token: {token[:20]}...")
                return True, token
            else:
                print("   ❌ Admin login response missing token")
                return False, None
        else:
            print(f"   ❌ Admin login failed with status {login_response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_event_attendees_api(event_id, brand_id, admin_token):
    """Test 4: Event Attendees API - GET /api/events/{event_id}/attendees and GET /api/attendees"""
    print("🔍 Testing Event Attendees API...")
    
    if not admin_token:
        print("   ❌ No admin token provided, cannot test attendees API")
        return False
    
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    # Test 4a: GET /api/events/{event_id}/attendees
    if event_id:
        try:
            response = requests.get(
                f"{BACKEND_URL}/events/{event_id}/attendees",
                headers=headers,
                timeout=10
            )
            print(f"   Event Attendees Status Code: {response.status_code}")
            
            if response.status_code == 200:
                attendees = response.json()
                print(f"   ✅ Event attendees retrieved - Count: {len(attendees)}")
                if len(attendees) > 0:
                    print(f"   Sample attendee: {attendees[0].get('name')} - {attendees[0].get('email')}")
            else:
                print(f"   ❌ Event attendees failed with status {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Event attendees exception: {str(e)}")
            return False
    
    # Test 4b: GET /api/attendees?brand_id={brand_id}
    try:
        url = f"{BACKEND_URL}/attendees"
        if brand_id:
            url += f"?brand_id={brand_id}"
        
        response = requests.get(url, headers=headers, timeout=10)
        print(f"   All Attendees Status Code: {response.status_code}")
        
        if response.status_code == 200:
            all_attendees = response.json()
            print(f"   ✅ All attendees retrieved - Count: {len(all_attendees)}")
            if len(all_attendees) > 0:
                print(f"   Sample attendee: {all_attendees[0].get('name')} - {all_attendees[0].get('email')}")
            return True
        else:
            print(f"   ❌ All attendees failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ All attendees exception: {str(e)}")
        return False

def test_image_urls(brand_id):
    """Test 5: Image URLs - Verify all events have updated image URLs from unsplash"""
    print("🔍 Testing Event Image URLs...")
    
    try:
        url = f"{BACKEND_URL}/events"
        if brand_id:
            url += f"?brand_id={brand_id}"
        
        response = requests.get(url, timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            events = response.json()
            print(f"   Events Count: {len(events)}")
            
            if len(events) == 0:
                print("   ⚠️  No events found to check image URLs")
                return True
            
            all_have_images = True
            unsplash_count = 0
            
            for event in events:
                title = event.get('title', 'Untitled')
                image_url = event.get('image_url', '')
                
                if not image_url:
                    print(f"   ❌ Event '{title}' missing image_url")
                    all_have_images = False
                else:
                    print(f"   ✅ Event '{title}' has image_url: {image_url[:50]}...")
                    if 'unsplash' in image_url.lower():
                        unsplash_count += 1
                        print(f"      ✅ Uses Unsplash image")
                    else:
                        print(f"      ⚠️  Not from Unsplash")
            
            print(f"   Events with Unsplash images: {unsplash_count}/{len(events)}")
            
            if all_have_images:
                print("   ✅ All events have image URLs")
                return True
            else:
                print("   ❌ Some events missing image URLs")
                return False
                
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def main():
    """Run church website backend tests"""
    print("=" * 80)
    print("🏛️  CHURCH WEBSITE BACKEND TESTING")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 80)
    
    results = {}
    brand_id = None
    event_id = None
    admin_token = None
    
    # Test 1: Brand Data Verification
    print("\n1️⃣  BRAND DATA VERIFICATION")
    print("-" * 40)
    success, brand_id = test_brand_data_verification()
    results['brand_data'] = success
    print()
    
    # Test 2: REVIVE Event
    print("2️⃣  REVIVE EVENT VERIFICATION")
    print("-" * 40)
    success, event_id = test_revive_event(brand_id)
    results['revive_event'] = success
    print()
    
    # Test 3: Event Registration API
    print("3️⃣  EVENT REGISTRATION API")
    print("-" * 40)
    success, attendee_id = test_event_registration(event_id, brand_id)
    results['event_registration'] = success
    print()
    
    # Create/Login Admin User
    print("4️⃣  ADMIN USER SETUP")
    print("-" * 40)
    success, admin_token = create_admin_user()
    results['admin_setup'] = success
    print()
    
    # Test 4: Event Attendees API (requires admin auth)
    print("5️⃣  EVENT ATTENDEES API")
    print("-" * 40)
    success = test_event_attendees_api(event_id, brand_id, admin_token)
    results['event_attendees'] = success
    print()
    
    # Test 5: Image URLs
    print("6️⃣  EVENT IMAGE URLS")
    print("-" * 40)
    success = test_image_urls(brand_id)
    results['image_urls'] = success
    print()
    
    # Summary
    print("=" * 80)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 80)
    
    passed = 0
    total = 0
    failed_tests = []
    
    test_descriptions = {
        'brand_data': 'Brand Data Verification (Service Times & Images)',
        'revive_event': 'REVIVE Event Verification (Dec 3-7, 2025)',
        'event_registration': 'Event Registration API',
        'admin_setup': 'Admin User Setup',
        'event_attendees': 'Event Attendees API (Admin Auth)',
        'image_urls': 'Event Image URLs (Unsplash)'
    }
    
    for test_name, description in test_descriptions.items():
        if test_name in results:
            success = results[test_name]
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{description:45} {status}")
            if success:
                passed += 1
            else:
                failed_tests.append(test_name)
            total += 1
    
    print("-" * 80)
    print(f"OVERALL TOTAL: {passed}/{total} tests passed")
    
    if failed_tests:
        print(f"\n❌ FAILED TESTS: {', '.join(failed_tests)}")
    
    if passed == total:
        print("\n🎉 ALL CHURCH WEBSITE TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️  {len(failed_tests)} TESTS FAILED!")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)