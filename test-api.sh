#!/bin/bash

# Test script for Volunteer Search API
# Usage: ./test-api.sh [base_url]
# Example: ./test-api.sh http://localhost:3000
# Example: ./test-api.sh https://your-app.herokuapp.com

BASE_URL=${1:-http://localhost:3000}

echo "🧪 Testing Volunteer Search API at: $BASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
curl -s "$BASE_URL/health" | jq '.'
echo ""
echo ""

# Test 2: Root Endpoint
echo "2️⃣ Testing Root Endpoint..."
curl -s "$BASE_URL/" | jq '.'
echo ""
echo ""

# Test 3: Search with Keywords
echo "3️⃣ Testing Search (keywords: tutoring)..."
curl -s -X POST "$BASE_URL/api/search" \
  -H "Content-Type: application/json" \
  -d '{"keywords":"tutoring","max_results":3}' | jq '.opportunities[] | {id, title, organization, location}'
echo ""
echo ""

# Test 4: Search with Location
echo "4️⃣ Testing Search (location: Toronto)..."
curl -s -X POST "$BASE_URL/api/search" \
  -H "Content-Type: application/json" \
  -d '{"location":"Toronto","max_results":2}' | jq '.opportunities[] | {id, title, location}'
echo ""
echo ""

# Test 5: Search Remote Only
echo "5️⃣ Testing Search (remote only)..."
curl -s -X POST "$BASE_URL/api/search" \
  -H "Content-Type: application/json" \
  -d '{"remote_only":true,"max_results":2}' | jq '.opportunities[] | {id, title, remote}'
echo ""
echo ""

# Test 6: Get Opportunity Details
echo "6️⃣ Testing Opportunity Details (ID: 43243)..."
curl -s "$BASE_URL/api/opportunity/43243" | jq '.opportunity | {id, title, organization, dates, url}'
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "💡 Tip: Install jq for better JSON formatting:"
echo "   brew install jq"
