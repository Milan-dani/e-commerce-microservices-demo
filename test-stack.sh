#!/bin/bash
set -e

echo "🟢 Starting Docker Compose..."
docker compose up -d

# Wait a bit for services to initialize
echo "⏳ Waiting 15 seconds for services to be ready..."
sleep 15

# Helper function to test HTTP endpoints
function test_endpoint() {
    local name=$1
    local url=$2
    echo -n "Testing $name at $url ... "
    if curl -s --head --request GET $url | grep "200\|401" > /dev/null; then
        echo "✅ OK"
    else
        echo "❌ Failed"
    fi
}

# ----------------------------
# 2️⃣ Test main endpoints
# ----------------------------
test_endpoint "API Gateway" "http://localhost:8080"
test_endpoint "Frontend" "http://localhost:3000"
test_endpoint "Auth Service" "http://localhost:3001"
test_endpoint "Products Service" "http://localhost:3002"
test_endpoint "Cart Service" "http://localhost:3003"
test_endpoint "Orders Service" "http://localhost:3004"
test_endpoint "Payments Service" "http://localhost:3005"
test_endpoint "Recommendations Service" "http://localhost:3007"
test_endpoint "Analytics Service" "http://localhost:3008"
test_endpoint "Consul" "http://localhost:8500"

echo "✅ Smoke test completed."
