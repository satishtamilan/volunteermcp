# 🚀 Getting Started

## 📦 Project Overview

This is a **standalone project** that provides two ways to search volunteer opportunities:

1. **REST API** - HTTP endpoints for web/mobile/Salesforce
2. **MCP Server** - Model Context Protocol for AI assistants (Claude Desktop)

Both use the **free VolunteerConnector API** (no authentication required).

---

## ⚡ Quick Start (3 Options)

### **Option 1: Run REST API Locally**

Perfect for testing and development.

```bash
# Install dependencies
npm install

# Start the server
npm start

# Test it
curl http://localhost:3000/health
```

Server runs on: `http://localhost:3000`

---

### **Option 2: Deploy to Heroku**

Perfect for production and Salesforce integration.

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main

# Open app
heroku open
```

Your API will be at: `https://your-app-name.herokuapp.com`

---

### **Option 3: Use MCP with Claude Desktop**

Perfect for AI assistant integration.

```bash
# Start MCP server
npm run start:mcp
```

Then configure Claude Desktop:

**File:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "volunteer-search": {
      "command": "node",
      "args": ["/absolute/path/to/volunteer-search-mcp/volunteer-search-server.js"]
    }
  }
}
```

Restart Claude Desktop and ask: *"Search for volunteer opportunities in Toronto"*

---

## 🧪 Testing

### **Test REST API:**

```bash
# Test locally
./test-api.sh http://localhost:3000

# Test on Heroku
./test-api.sh https://your-app.herokuapp.com
```

### **Test with curl:**

```bash
# Health check
curl http://localhost:3000/health

# Search
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"keywords":"tutoring","max_results":5}'

# Get details
curl http://localhost:3000/api/opportunity/43243
```

---

## 📚 API Documentation

### **Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| POST | `/api/search` | Search opportunities |
| GET | `/api/opportunity/:id` | Get details |

### **Search Request:**

```json
{
  "keywords": "tutoring",
  "location": "Toronto",
  "remote_only": false,
  "max_results": 10
}
```

### **Search Response:**

```json
{
  "success": true,
  "total_count": 969,
  "returned_count": 10,
  "opportunities": [
    {
      "id": 43243,
      "title": "Event Planner",
      "organization": "Canadian Network for International Surgery",
      "location": "British Columbia",
      "dates": "September 8, 2025 - November 9, 2025",
      "url": "https://..."
    }
  ]
}
```

---

## 🔗 Integration Examples

### **JavaScript/Node.js:**

```javascript
const response = await fetch('http://localhost:3000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keywords: 'tutoring',
    max_results: 10
  })
});

const data = await response.json();
console.log(data.opportunities);
```

### **Python:**

```python
import requests

response = requests.post(
    'http://localhost:3000/api/search',
    json={'keywords': 'tutoring', 'max_results': 10}
)

data = response.json()
print(data['opportunities'])
```

### **Salesforce Apex:**

```apex
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:Volunteer_Search_API/api/search');
req.setMethod('POST');
req.setHeader('Content-Type', 'application/json');

Map<String, Object> body = new Map<String, Object>{
    'keywords' => 'tutoring',
    'max_results' => 10
};
req.setBody(JSON.serialize(body));

Http http = new Http();
HttpResponse res = http.send(req);
String responseBody = res.getBody();
```

---

## 🛠️ Development

### **Project Structure:**

```
volunteer-search-mcp/
├── server.js                    # REST API (Express.js)
├── volunteer-search-server.js   # MCP Server
├── package.json                 # Dependencies
├── Procfile                     # Heroku config
├── test-api.sh                  # Test script
├── HEROKU_DEPLOYMENT.md         # Deployment guide
├── GETTING_STARTED.md           # This file
├── README.md                    # Full documentation
└── LICENSE                      # MIT License
```

### **Available Scripts:**

```bash
npm start           # Start REST API
npm run start:mcp   # Start MCP server
npm run dev         # Start REST API with auto-reload
npm run dev:mcp     # Start MCP server with auto-reload
```

---

## 🌐 Data Source

**VolunteerConnector API:**
- URL: https://www.volunteerconnector.org/api/search/
- Cost: FREE
- Auth: None required
- Coverage: 969+ opportunities across North America
- Docs: https://www.volunteerconnector.org/api

---

## 💡 Use Cases

- **Salesforce Agentforce** - Add volunteer search to AI agents
- **Claude Desktop** - Search volunteers via MCP
- **Mobile Apps** - Find local volunteer opportunities
- **Nonprofit Websites** - Display volunteer opportunities
- **Corporate VTO Programs** - Help employees find volunteer work

---

## 📞 Next Steps

1. **Choose your option:**
   - Local development? → Run `npm start`
   - Production deployment? → Deploy to Heroku
   - AI integration? → Configure MCP with Claude Desktop

2. **Test the API:**
   - Run `./test-api.sh`
   - Try the example requests above

3. **Integrate:**
   - Add to your Salesforce project
   - Connect to your web/mobile app
   - Use with Claude Desktop

---

## 🐛 Troubleshooting

### **Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=8080 npm start
```

### **Dependencies not installed:**
```bash
npm install
```

### **Heroku deployment fails:**
```bash
# Check logs
heroku logs --tail

# Verify Procfile exists
cat Procfile
```

---

## 📚 More Resources

- **Full Documentation:** [README.md](README.md)
- **Heroku Deployment:** [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md)
- **MCP Documentation:** https://modelcontextprotocol.io/
- **VolunteerConnector API:** https://www.volunteerconnector.org/api

---

## 🎉 You're Ready!

Choose your path and start building! 🚀

**Questions?** Check the [README.md](README.md) or open an issue.
