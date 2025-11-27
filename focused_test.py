#!/usr/bin/env python3
"""
Focused Backend API Testing Script for Review Request
Tests specific functionality mentioned in the review request
"""

import requests
import json
import sys

# Backend URL from environment
BACKEND_URL = "https://content-blocks-5.preview.emergentagent.com/api"

def test_youtube_integration():
    """Test YouTube Integration: GET /api/youtube/channel/@faithcenter_in"""
    print("🔍 Testing YouTube Integration: GET /api/youtube/channel/@faithcenter_in")
    try:
        response = requests.get(f"{BACKEND_URL}/youtube/channel/@faithcenter_in", timeout=10)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            videos = response.json()
            print(f"   Response Type: {type(videos)}")
            
            if isinstance(videos, list):
                print(f"   ✅ Returns array of videos: {len(videos)} videos")
                
                if len(videos) > 0:
                    # Check video structure
                    sample_video = videos[0]
                    print(f"   Sample Video Title: {sample_video.get('title', 'No title')}")
                    print(f"   Sample Video Category: {sample_video.get('category', 'No category')}")
                    
                    # Check categories
                    categories = set(video.get('category', 'Unknown') for video in videos)
                    print(f"   ✅ Video Categories: {list(categories)}")
                    
                    return True
                else:
                    print("   ⚠️  Empty videos array (acceptable)")
                    return True
            else:
                print("   ❌ Response is not an array")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def test_admin_authentication():
    """Test Admin Authentication: POST /api/auth/login"""
    print("🔍 Testing Admin Authentication: POST /api/auth/login")
    
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
            
            if isinstance(result, dict) and "token" in result and "admin" in result:
                print(f"   ✅ Returns JWT token: {result['token'][:20]}...")
                print(f"   ✅ Returns admin object: {result.get('admin', {}).get('email', 'No email')}")
                return True, result["token"]
            else:
                print("   ❌ Response missing token or admin object")
                return False, None
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False, None

def test_existing_endpoints():
    """Test existing endpoints: brands, events, ministries, announcements"""
    print("🔍 Testing Existing Endpoints (Quick Check)")
    
    endpoints = [
        ("GET /api/brands", f"{BACKEND_URL}/brands"),
        ("GET /api/events", f"{BACKEND_URL}/events"),
        ("GET /api/ministries", f"{BACKEND_URL}/ministries"),
        ("GET /api/announcements", f"{BACKEND_URL}/announcements")
    ]
    
    results = {}
    
    for name, url in endpoints:
        try:
            response = requests.get(url, timeout=10)
            print(f"   {name}: Status {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"     ✅ Returns array with {len(data)} items")
                    results[name] = True
                else:
                    print(f"     ❌ Response is not an array")
                    results[name] = False
            else:
                print(f"     ❌ Failed with status {response.status_code}")
                results[name] = False
                
        except Exception as e:
            print(f"     ❌ Exception: {str(e)}")
            results[name] = False
    
    return results

def main():
    """Run focused tests for review request"""
    print("=" * 80)
    print("🚀 FOCUSED BACKEND TESTING - FAITH CENTER APPLICATION")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 80)
    
    results = {}
    
    # Test 1: YouTube Integration
    print("\n📹 YOUTUBE INTEGRATION TEST")
    print("-" * 40)
    results['youtube_integration'] = test_youtube_integration()
    print()
    
    # Test 2: Admin Authentication
    print("\n🔐 ADMIN AUTHENTICATION TEST")
    print("-" * 40)
    success, admin_token = test_admin_authentication()
    results['admin_authentication'] = success
    print()
    
    # Test 3: Existing Endpoints
    print("\n📋 EXISTING ENDPOINTS TEST")
    print("-" * 40)
    endpoint_results = test_existing_endpoints()
    results.update(endpoint_results)
    print()
    
    # Summary
    print("=" * 80)
    print("📊 FOCUSED TEST RESULTS SUMMARY")
    print("=" * 80)
    
    passed = 0
    total = 0
    
    print("\nCore Requirements:")
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {test_name:25} {status}")
        if success:
            passed += 1
        total += 1
    
    print("-" * 80)
    print(f"OVERALL RESULT: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL FOCUSED TESTS PASSED!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} TESTS FAILED!")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)