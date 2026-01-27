#!/bin/bash
set -e

cd /opt/edapp

# Backup current config
sudo cp nginx/nginx.conf nginx/nginx.conf.backup

# Create new nginx config
cat > /tmp/nginx.conf << 'EOFNGINX'
events { 
    worker_connections 2048; 
}

http {
    include /etc/nginx/mime.types;
    
    upstream api { 
        server api:3333; 
    }
    
    server {
        listen 80;
        server_name edapp.co.za *.edapp.co.za;
        location / { 
            return 301 https://$host$request_uri; 
        }
    }
    
    server {
        listen 443 ssl http2;
        server_name edapp.co.za *.edapp.co.za;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        
        location /v1/ {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }
}
EOFNGINX

# Move config
sudo mv /tmp/nginx.conf nginx/nginx.conf

# Create HTML directory
mkdir -p nginx/html

# Create landing page
cat > nginx/html/index.html << 'EOFHTML'
<!DOCTYPE html>
<html><head><title>EdApp</title></head>
<body style="font-family:sans-serif;text-align:center;padding:50px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;">
<h1>🎓 EdApp</h1>
<p>Multi-Tenant Education Platform</p>
<p>API: <a href="/v1" style="color:white">/v1</a></p>
</body></html>
EOFHTML

# Restart proxy
sudo docker-compose -f docker-compose.simple.yml restart proxy

# Wait for startup
sleep 5

# Show status
echo "=== Container Status ==="
sudo docker ps

echo ""
echo "=== Testing locally ==="
curl -s http://localhost | head -5
