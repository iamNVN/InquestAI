#!/bin/bash

echo "Starting InquestAI Deployment..."

# 1. Update and install dependencies
echo "Installing Node.js and Nginx..."
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# 2. Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# 3. Install project dependencies
echo "Installing project dependencies..."
npm install

# 4. Build the Vite frontend
echo "Building React frontend..."
npm run build

# 5. Start the backend with PM2
echo "Starting backend..."
pm2 stop inquest-backend || true
pm2 start server/index.js --name inquest-backend
pm2 save
pm2 startup | tail -n 1 | bash

# 6. Configure Nginx
echo "Configuring Nginx..."
sudo cat > /etc/nginx/sites-available/inquest << 'EOF'
server {
    listen 80;
    server_name _;

    root /home/ubuntu/InquestAI/dist;
    index index.html;

    # Serve React Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js Backend
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # SSE settings
        proxy_set_header Connection '';
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/inquest /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

echo "Deployment complete! Your app is now running on this EC2 instance."
