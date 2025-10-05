# 🚀 Deploy to Heroku - Complete Guide

## 📋 Prerequisites

1. **Heroku Account** - Sign up at https://heroku.com (free tier available)
2. **Heroku CLI** - Install from https://devcenter.heroku.com/articles/heroku-cli
3. **Git** - Already installed on your Mac

---

## 🎯 Quick Deploy (5 Minutes)

### **Step 1: Install Heroku CLI**

```bash
# If not already installed
brew tap heroku/brew && brew install heroku
```

### **Step 2: Login to Heroku**

```bash
heroku login
# Press any key to open browser and login
```

### **Step 3: Create Heroku App**

```bash
cd mcp-server

# Create a new Heroku app (replace 'your-app-name' with a unique name)
heroku create vto-volunteer-search

# Or let Heroku generate a random name
heroku create
```

### **Step 4: Deploy**

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Volunteer Search API"

# Deploy to Heroku
git push heroku main

# If you're on master branch instead of main:
# git push heroku master
```

### **Step 5: Verify Deployment**

```bash
# Open your app in browser
heroku open

# Check logs
heroku logs --tail

# Test the API
curl https://your-app-name.herokuapp.com/health
```

---

## 🧪 Test Your Deployed API

### **1. Health Check**

```bash
curl https://your-app-name.herokuapp.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-05T..."
}
```

### **2. Search Volunteer Opportunities**

```bash
curl -X POST https://your-app-name.herokuapp.com/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "tutoring",
    "location": "Toronto",
    "max_results": 5
  }'
```

### **3. Get Opportunity Details**

```bash
curl https://your-app-name.herokuapp.com/api/opportunity/43243
```

---

## 🔗 Update Salesforce to Use Heroku

### **Step 1: Create Named Credential**

1. Go to **Setup → Named Credentials → New**
2. Fill in:
   - **Label:** Heroku Volunteer Search
   - **Name:** Heroku_Volunteer_Search
   - **URL:** `https://your-app-name.herokuapp.com`
   - **Identity Type:** Anonymous
   - **Authentication Protocol:** No Authentication

### **Step 2: Update Apex Class**

Update `ExternalVolunteerSearchAction.cls`:

```apex
// Change line 78 from:
String endpoint = 'https://www.volunteerconnector.org/api/search/';

// To:
String endpoint = 'callout:Heroku_Volunteer_Search/api/search';

// And change the method from GET to POST
req.setMethod('POST');
req.setHeader('Content-Type', 'application/json');

// Build request body
Map<String, Object> requestBody = new Map<String, Object>{
    'keywords' => keywords,
    'location' => location,
    'max_results' => maxResults
};
req.setBody(JSON.serialize(requestBody));
```

---

## 📊 Heroku App Management

### **View Logs**

```bash
# Stream logs in real-time
heroku logs --tail

# View last 100 lines
heroku logs -n 100

# Filter by source
heroku logs --source app
```

### **Restart App**

```bash
heroku restart
```

### **Scale Dynos**

```bash
# Check current dyno status
heroku ps

# Scale to 1 web dyno (free tier)
heroku ps:scale web=1

# Scale to 0 to stop (saves dyno hours)
heroku ps:scale web=0
```

### **Open App**

```bash
# Open in browser
heroku open

# Open specific endpoint
heroku open /health
```

### **Set Environment Variables**

```bash
# Set a variable
heroku config:set NODE_ENV=production

# View all variables
heroku config

# Remove a variable
heroku config:unset VARIABLE_NAME
```

---

## 💰 Heroku Pricing

### **Free Tier (Eco Dynos)**
- ✅ 1000 dyno hours/month (enough for 24/7 if only one app)
- ✅ Sleeps after 30 min of inactivity
- ✅ Perfect for development/hackathons
- ❌ Cold start delay (5-10 seconds)

### **Hobby Tier ($7/month)**
- ✅ Never sleeps
- ✅ Custom domains
- ✅ SSL certificates
- ✅ Better for production

### **Professional Tier ($25-50/month)**
- ✅ Horizontal scaling
- ✅ Metrics
- ✅ Preboot (zero downtime deploys)

---

## 🔧 Advanced Configuration

### **Custom Domain**

```bash
# Add custom domain
heroku domains:add www.your-domain.com

# View DNS targets
heroku domains
```

### **SSL Certificate**

```bash
# Enable automatic SSL (Hobby tier and above)
heroku certs:auto:enable
```

### **Add-ons**

```bash
# Add Redis for caching
heroku addons:create heroku-redis:mini

# Add monitoring
heroku addons:create papertrail:choklad
```

---

## 🐛 Troubleshooting

### **App Crashes on Startup**

```bash
# Check logs
heroku logs --tail

# Common issues:
# 1. Missing dependencies - run: npm install
# 2. Wrong start command - check Procfile
# 3. Port binding - ensure using process.env.PORT
```

### **"Application Error" Page**

```bash
# Check if dynos are running
heroku ps

# Restart the app
heroku restart

# Check recent logs
heroku logs -n 200
```

### **API Returns Errors**

```bash
# Test locally first
npm start

# Then test the endpoint
curl http://localhost:3000/health

# If local works, check Heroku logs
heroku logs --tail
```

### **Slow Response Times**

- Free tier apps sleep after 30 min inactivity
- First request after sleep takes 5-10 seconds
- Upgrade to Hobby tier for always-on

---

## 📈 Monitoring

### **View App Metrics**

```bash
# Open metrics dashboard
heroku open metrics
```

### **Add Application Monitoring**

```bash
# Add New Relic (free tier available)
heroku addons:create newrelic:wayne

# View New Relic dashboard
heroku addons:open newrelic
```

---

## 🔄 Continuous Deployment

### **Option 1: GitHub Integration**

1. Go to Heroku Dashboard
2. Select your app
3. Go to **Deploy** tab
4. Connect to GitHub
5. Enable **Automatic Deploys**

Now every push to main branch auto-deploys!

### **Option 2: Heroku Pipelines**

```bash
# Create a pipeline
heroku pipelines:create vto-volunteer-pipeline

# Add app to pipeline
heroku pipelines:add vto-volunteer-pipeline --app your-app-name

# Promote from staging to production
heroku pipelines:promote --app your-staging-app
```

---

## 🧪 Testing Before Deploy

### **Test Locally**

```bash
# Install dependencies
npm install

# Run locally
npm start

# Test endpoints
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"keywords":"tutoring"}'
```

### **Test with Heroku Local**

```bash
# Run with Heroku's local environment
heroku local web

# This uses your Procfile and simulates Heroku
```

---

## 📦 Alternative: Deploy to Other Platforms

### **Render.com (Free Tier)**

```bash
# 1. Create account at render.com
# 2. Connect GitHub repo
# 3. Create new Web Service
# 4. Set build command: npm install
# 5. Set start command: npm start
# 6. Deploy!
```

### **Railway.app (Free $5 credit/month)**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Deploy
railway up
```

### **Fly.io (Free Tier)**

```bash
# 1. Install Fly CLI
brew install flyctl

# 2. Login
flyctl auth login

# 3. Launch app
flyctl launch

# 4. Deploy
flyctl deploy
```

---

## ✅ Post-Deployment Checklist

- [ ] App is accessible via Heroku URL
- [ ] Health check endpoint returns 200
- [ ] Search API returns real volunteer data
- [ ] Logs show no errors
- [ ] Salesforce Named Credential configured
- [ ] Salesforce Apex updated to use Heroku endpoint
- [ ] Test end-to-end from Salesforce agent

---

## 🎉 Success!

Your Volunteer Search API is now deployed to Heroku!

**Your API URL:** `https://your-app-name.herokuapp.com`

**Endpoints:**
- `GET /` - API info
- `GET /health` - Health check
- `POST /api/search` - Search opportunities
- `GET /api/opportunity/:id` - Get details

**Next Steps:**
1. Update Salesforce Named Credential
2. Update Apex class to use Heroku endpoint
3. Test from Salesforce agent
4. Monitor logs and performance

---

## 📞 Support

- **Heroku Docs:** https://devcenter.heroku.com/
- **Heroku Status:** https://status.heroku.com/
- **Community:** https://help.heroku.com/

---

**Need help? Check the logs first:**
```bash
heroku logs --tail
```
