#!/usr/bin/env python3
"""
DM Motors Backend API Test Suite
Tests all backend endpoints according to the review request
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from frontend .env
BASE_URL = "https://concessionaria-hub.preview.emergentagent.com/api"

# Test credentials from memory/test_credentials.md
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

class DMMotorsAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_health_check(self):
        """Test 1: Health Check - GET /api/"""
        try:
            response = requests.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "DM Motors API":
                    self.log_test("Health Check", True, "API is responding correctly")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_admin_login(self):
        """Test 2: Admin Authentication - POST /api/auth/login"""
        try:
            login_data = {
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
            
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "username" in data:
                    self.auth_token = data["token"]
                    self.log_test("Admin Login", True, f"Login successful for user: {data['username']}")
                    return True
                else:
                    self.log_test("Admin Login", False, f"Missing token or username in response: {data}")
                    return False
            else:
                self.log_test("Admin Login", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
            return False

    def test_get_vehicles_public(self):
        """Test 3: Vehicles API (Public - GET) - GET /api/vehicles"""
        try:
            response = requests.get(f"{self.base_url}/vehicles")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Vehicles (Public)", True, f"Retrieved {len(data)} vehicles")
                    return True
                else:
                    self.log_test("Get Vehicles (Public)", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Get Vehicles (Public)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Vehicles (Public)", False, f"Exception: {str(e)}")
            return False

    def test_create_submission_public(self):
        """Test 4: Submissions API (Public - POST) - POST /api/submissions"""
        try:
            submission_data = {
                "type": "consignar",
                "client_name": "João Silva",
                "phone": "32999999999",
                "brand": "Toyota",
                "model": "Corolla",
                "year": 2022,
                "mileage": 15000,
                "color": "Branco",
                "observations": "Veículo em excelente estado, revisões em dia",
                "photos": []
            }
            
            response = requests.post(
                f"{self.base_url}/submissions",
                json=submission_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data.get("client_name") == submission_data["client_name"]:
                    self.submission_id = data["id"]  # Store for later tests
                    self.log_test("Create Submission (Public)", True, f"Submission created with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Submission (Public)", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Create Submission (Public)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Submission (Public)", False, f"Exception: {str(e)}")
            return False

    def test_get_submissions_admin(self):
        """Test 5: Admin Protected Routes - GET /api/submissions (with Bearer token)"""
        if not self.auth_token:
            self.log_test("Get Submissions (Admin)", False, "No auth token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(f"{self.base_url}/submissions", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Submissions (Admin)", True, f"Retrieved {len(data)} submissions")
                    return True
                else:
                    self.log_test("Get Submissions (Admin)", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Get Submissions (Admin)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Submissions (Admin)", False, f"Exception: {str(e)}")
            return False

    def test_update_submission_admin(self):
        """Test 6: Update Submission Status - PUT /api/submissions/{id} (with Bearer token)"""
        if not self.auth_token:
            self.log_test("Update Submission (Admin)", False, "No auth token available")
            return False
            
        if not hasattr(self, 'submission_id'):
            self.log_test("Update Submission (Admin)", False, "No submission ID available from previous test")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            update_data = {"status": "approved"}
            
            response = requests.put(
                f"{self.base_url}/submissions/{self.submission_id}",
                json=update_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "approved":
                    self.log_test("Update Submission (Admin)", True, f"Submission status updated to: {data['status']}")
                    return True
                else:
                    self.log_test("Update Submission (Admin)", False, f"Status not updated correctly: {data}")
                    return False
            else:
                self.log_test("Update Submission (Admin)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Update Submission (Admin)", False, f"Exception: {str(e)}")
            return False

    def test_create_vehicle_admin(self):
        """Test 7: Admin Vehicle Management - POST /api/vehicles (with Bearer token)"""
        if not self.auth_token:
            self.log_test("Create Vehicle (Admin)", False, "No auth token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            vehicle_data = {
                "brand": "Honda",
                "model": "Civic",
                "year": 2023,
                "mileage": 0,
                "color": "Vermelho",
                "price": 85000.00,
                "description": "Honda Civic 2023 zero quilômetro, completo",
                "photos": []
            }
            
            response = requests.post(
                f"{self.base_url}/vehicles",
                json=vehicle_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data.get("brand") == vehicle_data["brand"]:
                    self.vehicle_id = data["id"]  # Store for potential future tests
                    self.log_test("Create Vehicle (Admin)", True, f"Vehicle created with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Vehicle (Admin)", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("Create Vehicle (Admin)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Vehicle (Admin)", False, f"Exception: {str(e)}")
            return False

    def test_auth_protection(self):
        """Test 8: Verify auth protection on admin endpoints"""
        try:
            # Test without token
            response = requests.get(f"{self.base_url}/submissions")
            
            if response.status_code == 401 or response.status_code == 403:
                self.log_test("Auth Protection", True, "Admin endpoints properly protected")
                return True
            else:
                self.log_test("Auth Protection", False, f"Expected 401/403, got: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Auth Protection", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting DM Motors Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_admin_login,
            self.test_get_vehicles_public,
            self.test_create_submission_public,
            self.test_get_submissions_admin,
            self.test_update_submission_admin,
            self.test_create_vehicle_admin,
            self.test_auth_protection
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed. Check details above.")
            return False

    def get_summary(self):
        """Get test summary"""
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        summary = {
            "total_tests": total,
            "passed": passed,
            "failed": total - passed,
            "success_rate": f"{(passed/total)*100:.1f}%" if total > 0 else "0%",
            "results": self.test_results
        }
        
        return summary

if __name__ == "__main__":
    tester = DMMotorsAPITester()
    success = tester.run_all_tests()
    
    # Print detailed summary
    summary = tester.get_summary()
    print(f"\n📋 Detailed Summary:")
    print(f"   Total Tests: {summary['total_tests']}")
    print(f"   Passed: {summary['passed']}")
    print(f"   Failed: {summary['failed']}")
    print(f"   Success Rate: {summary['success_rate']}")
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)