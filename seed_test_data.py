#!/usr/bin/env python3
"""
Seed test data for backend testing
"""

import requests
import json

BACKEND_URL = "https://adminaccess.preview.emergentagent.com/api"

def create_test_brand():
    """Create a test brand"""
    print("Creating test brand...")
    
    brand_data = {
        "name": "Grace Community Church",
        "domain": "gracecommunity.org",
        "tagline": "Where Faith Meets Community",
        "primary_color": "#2563eb",
        "secondary_color": "#f59e0b",
        "service_times": "Sunday 9:00 AM & 11:00 AM",
        "location": "123 Faith Street, Hope City, HC 12345"
    }
    
    try:
        # Note: This will fail without authentication, but let's try
        response = requests.post(
            f"{BACKEND_URL}/brands",
            json=brand_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            brand = response.json()
            print(f"Created brand: {brand['name']} (ID: {brand['id']})")
            return brand['id']
        else:
            print(f"Failed to create brand: {response.text}")
            return None
    except Exception as e:
        print(f"Exception creating brand: {e}")
        return None

def test_with_existing_data():
    """Test endpoints to see if there's any existing data"""
    print("\n🔍 Checking for existing data...")
    
    # Check brands
    response = requests.get(f"{BACKEND_URL}/brands")
    if response.status_code == 200:
        brands = response.json()
        print(f"Found {len(brands)} brands")
        if brands:
            brand_id = brands[0]['id']
            print(f"Using brand: {brands[0]['name']} (ID: {brand_id})")
            
            # Test with this brand ID
            print(f"\n🔍 Testing with brand_id: {brand_id}")
            
            # Test events
            response = requests.get(f"{BACKEND_URL}/events?brand_id={brand_id}")
            if response.status_code == 200:
                events = response.json()
                print(f"Events for brand: {len(events)}")
            
            # Test ministries  
            response = requests.get(f"{BACKEND_URL}/ministries?brand_id={brand_id}")
            if response.status_code == 200:
                ministries = response.json()
                print(f"Ministries for brand: {len(ministries)}")
                
            # Test announcements
            response = requests.get(f"{BACKEND_URL}/announcements?brand_id={brand_id}")
            if response.status_code == 200:
                announcements = response.json()
                print(f"Announcements for brand: {len(announcements)}")

if __name__ == "__main__":
    print("=" * 50)
    print("🌱 SEED DATA TESTING")
    print("=" * 50)
    
    # Try to create a brand (will likely fail due to auth)
    brand_id = create_test_brand()
    
    # Test with existing data
    test_with_existing_data()