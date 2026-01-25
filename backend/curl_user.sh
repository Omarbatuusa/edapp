curl -X POST http://localhost:3000/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"studentNumber":"STU001", "pin":"password123", "tenantId":"f6d6ccac-92d6-4ce5-befa-ab7bd82c633a"}'
