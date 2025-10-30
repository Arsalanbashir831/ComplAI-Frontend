# ComplAI Frontend - Deployment Setup

## ✅ Completed Setup

### 1. Repository Cloned
- Repository cloned from: `https://github.com/Arsalanbashir831/ComplAI-Frontend.git`
- Location: `/var/www/complai-frontend`

### 2. Node.js Installation
- Node.js version: v20.19.5
- npm version: 10.8.2

### 3. Dependencies Installed
- All npm packages installed using `--legacy-peer-deps` (to resolve React 19 compatibility)

### 4. Production Build
- Project built successfully using `npm run build`
- Build output in `.next` directory

### 5. PM2 Process Manager
- Application running with PM2
- Process name: `complai-frontend`
- Status: Online and running
- Auto-start on boot: ✅ Configured

### 6. Environment Configuration
- Backend URL configured: `https://api.compl-ai.co.uk`
- Environment variables set in PM2 configuration

### 7. Nginx Reverse Proxy
- Nginx configuration created for `app.compl-ai.co.uk`
- Proxy configuration: Port 80 → Port 3000
- Status: ✅ Active and working

### 8. Application Access
- **Primary URL**: http://app.compl-ai.co.uk ✅ **WORKING**
- Local: http://localhost:3000
- Network: http://147.93.85.168:3000
- HTTP Status: ✅ 200 OK

## 📝 Next Steps (When Domain Details Available)

### 1. Environment Variables
Create/update `/var/www/complai-frontend/.env.local` with:
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
# Add other required environment variables if needed
```

After updating environment variables:
```bash
cd /var/www/complai-frontend
npm run build
pm2 restart complai-frontend
```

### 2. Nginx Reverse Proxy Setup
When you have your domain, configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then enable SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Firewall Configuration
Ensure port 80 and 443 are open (if using direct access):
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

For development, port 3000 is accessible on the network IP.

## 🔧 PM2 Commands

### Useful PM2 Commands:
```bash
# Check status
pm2 status

# View logs
pm2 logs complai-frontend

# Restart application
pm2 restart complai-frontend

# Stop application
pm2 stop complai-frontend

# Reload application (zero downtime)
pm2 reload complai-frontend

# Monitor
pm2 monit
```

## 📂 Project Structure
- **Source code**: `/var/www/complai-frontend/src`
- **Build output**: `/var/www/complai-frontend/.next`
- **PM2 logs**: `/var/www/complai-frontend/logs/`
- **PM2 config**: `/var/www/complai-frontend/ecosystem.config.js`

## 🔍 Current Configuration
- **Port**: 3000
- **Process Manager**: PM2
- **Node Environment**: production
- **Auto-restart**: Enabled
- **Logs**: Enabled and stored in `/var/www/complai-frontend/logs/`

## ⚠️ Notes
- The application is currently running with a placeholder backend URL
- Update `.env.local` and rebuild when backend domain is available
- Consider setting up Nginx reverse proxy for production use
- SSL certificates should be configured for HTTPS in production

