# Deployment Guide

## Local Development

1. **Prerequisites**
   - Node.js 18+
   - Python 3.8+
   - Gemini API Key

2. **Quick Start**
   \`\`\`bash
   # Clone and setup
   git clone <repo-url>
   cd talktotext-pro
   
   # Run installation script
   chmod +x install.sh
   ./install.sh
   
   # Add your Gemini API key to .env file
   # Start both servers
   ./start.sh
   \`\`\`

## Production Deployment

### Option 1: Docker Deployment

\`\`\`bash
# Build and run with Docker
docker build -t talktotext-pro .
docker run -p 3000:3000 -p 5000:5000 \
  -e GEMINI_API_KEY=your_key_here \
  talktotext-pro
\`\`\`

### Option 2: Manual Production Setup

1. **Server Requirements**
   - Ubuntu 20.04+ or similar
   - 2GB+ RAM
   - 10GB+ storage
   - Domain name (optional)

2. **Installation**
   \`\`\`bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Python
   sudo apt install python3 python3-pip -y
   
   # Clone project
   git clone <repo-url>
   cd talktotext-pro
   
   # Install dependencies
   pip3 install -r requirements.txt
   npm install
   
   # Build frontend
   npm run build
   
   # Setup environment
   cp .env.example .env
   # Edit .env with your values
   
   # Initialize database
   python3 database.py
   \`\`\`

3. **Process Management (PM2)**
   \`\`\`bash
   # Install PM2
   npm install -g pm2
   
   # Start backend
   pm2 start app.py --name "talktotext-backend" --interpreter python3
   
   # Start frontend
   pm2 start npm --name "talktotext-frontend" -- start
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   \`\`\`

4. **Nginx Configuration**
   \`\`\`nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   \`\`\`

### Option 3: Cloud Deployment

#### Vercel + Railway
1. **Frontend (Vercel)**
   - Connect GitHub repo to Vercel
   - Set environment variables
   - Deploy automatically

2. **Backend (Railway)**
   - Connect GitHub repo to Railway
   - Add Python service
   - Set environment variables
   - Deploy backend API

#### AWS/GCP/Azure
- Use container services (ECS, Cloud Run, Container Instances)
- Set up load balancers
- Configure environment variables
- Set up database (RDS, Cloud SQL, etc.)

## Environment Variables

### Required
- `GEMINI_API_KEY`: Google AI Studio API key
- `SECRET_KEY`: Flask secret key
- `JWT_SECRET_KEY`: JWT signing key

### Optional
- `DATABASE_PATH`: SQLite database path
- `UPLOAD_FOLDER`: File upload directory
- `MAX_CONTENT_LENGTH`: Max file size (bytes)

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **HTTPS**: Use SSL certificates in production
3. **CORS**: Configure proper CORS origins
4. **File Uploads**: Validate file types and sizes
5. **Rate Limiting**: Implement API rate limiting
6. **Database**: Use proper database in production (PostgreSQL)

## Monitoring

1. **Logs**: Monitor application logs
2. **Performance**: Track API response times
3. **Storage**: Monitor disk usage for uploads
4. **Errors**: Set up error tracking (Sentry)

## Backup

1. **Database**: Regular SQLite backups
2. **Uploads**: Backup uploaded files
3. **Configuration**: Backup environment files

## Scaling

1. **Horizontal**: Multiple server instances
2. **Database**: Migrate to PostgreSQL/MySQL
3. **Storage**: Use cloud storage (S3, GCS)
4. **CDN**: Use CDN for static assets
5. **Load Balancer**: Distribute traffic
