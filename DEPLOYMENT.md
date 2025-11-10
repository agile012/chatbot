# IIM Ahmedabad Chatbot - Deployment Guide

## Quick Deployment Options

### Option 1: Local Development (Easiest)

```bash
# Install dependencies
npm install

# Start the server
npm start

# Open browser at http://localhost:3000
```

### Option 2: Docker Deployment

```bash
# Build the Docker image
docker build -t iim-chatbot .

# Run the container
docker run -p 3000:3000 --env-file .env iim-chatbot

# Or use Docker Compose
docker-compose up -d
```

### Option 3: Google Cloud Run (Recommended for Production)

1. **Install Google Cloud SDK:**
```bash
brew install google-cloud-sdk  # macOS
# Or download from https://cloud.google.com/sdk/docs/install
```

2. **Authenticate:**
```bash
gcloud auth login
gcloud config set project iimachatbot
```

3. **Deploy:**
```bash
gcloud run deploy iim-ahmedabad-chatbot \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars PROJECT_ID=iimachatbot,LOCATION=us-central1,AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc,LANGUAGE_CODE=en \
  --service-account iimachatbot@iimachatbot.iam.gserviceaccount.com
```

### Option 4: Heroku

1. **Install Heroku CLI:**
```bash
brew tap heroku/brew && brew install heroku  # macOS
```

2. **Login and create app:**
```bash
heroku login
heroku create iim-ahmedabad-chatbot
```

3. **Configure environment:**
```bash
heroku config:set PROJECT_ID=iimachatbot
heroku config:set LOCATION=us-central1
heroku config:set AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc
heroku config:set LANGUAGE_CODE=en
heroku config:set NODE_ENV=production
```

4. **Add credentials:**
```bash
# Create a base64 encoded version of your credentials
cat iimachatbot-542362f8fdae.json | base64 > credentials.txt
heroku config:set GOOGLE_CREDENTIALS_BASE64=$(cat credentials.txt)
```

5. **Deploy:**
```bash
git push heroku main
heroku open
```

### Option 5: AWS EC2

1. **Launch EC2 instance** (Ubuntu 20.04 or later)

2. **SSH into instance:**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Clone and setup:**
```bash
git clone your-repo-url
cd GAIM-CP
npm install
```

5. **Install PM2 for process management:**
```bash
sudo npm install -g pm2
pm2 start server/index.js --name iim-chatbot
pm2 startup
pm2 save
```

6. **Configure Nginx as reverse proxy:**
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/chatbot
```

Add:
```nginx
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
}
```

```bash
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 6: Azure App Service

1. **Install Azure CLI:**
```bash
brew install azure-cli  # macOS
```

2. **Login:**
```bash
az login
```

3. **Create resources:**
```bash
az group create --name iim-chatbot-rg --location eastus
az appservice plan create --name iim-chatbot-plan --resource-group iim-chatbot-rg --sku B1 --is-linux
az webapp create --resource-group iim-chatbot-rg --plan iim-chatbot-plan --name iim-ahmedabad-chatbot --runtime "NODE|18-lts"
```

4. **Configure and deploy:**
```bash
az webapp config appsettings set --resource-group iim-chatbot-rg --name iim-ahmedabad-chatbot --settings PROJECT_ID=iimachatbot LOCATION=us-central1 AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc

az webapp deployment source config-local-git --name iim-ahmedabad-chatbot --resource-group iim-chatbot-rg
git remote add azure <deployment-url>
git push azure main
```

## Environment Variables Required

All deployment options need these environment variables:

```env
PROJECT_ID=iimachatbot
LOCATION=us-central1
AGENT_ID=a9d8bab5-5db3-4131-93d4-175fef446bdc
GOOGLE_APPLICATION_CREDENTIALS=./iimachatbot-542362f8fdae.json
PORT=3000
NODE_ENV=production
LANGUAGE_CODE=en
SESSION_TTL=3600
```

## SSL/HTTPS Configuration

For production, always use HTTPS:

### With Nginx + Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### With Cloudflare:
1. Add your domain to Cloudflare
2. Point DNS to your server
3. Enable SSL (Full or Full Strict)

## Monitoring & Logging

### PM2 Logs:
```bash
pm2 logs iim-chatbot
pm2 monit
```

### Docker Logs:
```bash
docker logs -f container-id
```

### Cloud Run Logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=iim-ahmedabad-chatbot" --limit 50
```

## Performance Optimization

1. **Enable compression** (already included)
2. **Use CDN** for static assets
3. **Implement Redis** for session storage
4. **Set up load balancer** for high traffic
5. **Enable caching** headers

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Enable CORS for specific domains only
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Backup credentials securely
- [ ] Use secrets management (AWS Secrets Manager, Google Secret Manager, etc.)

## Scaling Strategies

### Horizontal Scaling:
- Use load balancer (AWS ALB, Google Cloud Load Balancing)
- Deploy multiple instances
- Implement Redis for shared sessions

### Vertical Scaling:
- Increase server resources (CPU, RAM)
- Optimize database queries
- Use caching effectively

## Cost Optimization

1. **Google Cloud Run**: Pay per request (free tier: 2M requests/month)
2. **Heroku**: Free tier available for hobby projects
3. **AWS EC2**: Use t3.micro for small traffic (free tier eligible)
4. **Cloudflare**: Free CDN and DDoS protection

## Testing Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-domain.com/api/health

# Send message
curl -X POST https://your-domain.com/api/dialogflow/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "test-user"}'
```

## Rollback Strategy

### Docker:
```bash
docker tag iim-chatbot:latest iim-chatbot:backup
# If needed:
docker run -p 3000:3000 iim-chatbot:backup
```

### Git-based (Heroku, Cloud Run):
```bash
git revert HEAD
git push heroku main  # or appropriate remote
```

### PM2:
```bash
pm2 restart iim-chatbot --update-env
```

## Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test Google credentials access
4. Check firewall rules
5. Verify DNS settings

---

**Choose the deployment option that best fits your needs and infrastructure!**
