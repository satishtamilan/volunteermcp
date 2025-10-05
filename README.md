# 🌐 Volunteer Search MCP Server & REST API

A **Model Context Protocol (MCP)** server and REST API for searching volunteer opportunities from the free [VolunteerConnector API](https://www.volunteerconnector.org/api).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

---

## 🎯 Features

- **🔌 MCP Server** - True Model Context Protocol implementation for AI assistants
- **🌐 REST API** - HTTP endpoints for web/mobile/Salesforce integration
- **💰 FREE** - Uses VolunteerConnector API (no authentication required)
- **🚀 Heroku Ready** - Deploy to Heroku in 5 minutes
- **🧪 Tested** - Includes test scripts and examples
- **📚 Well Documented** - Complete guides and examples

---

## 📦 What's Included

### **1. MCP Server** (`volunteer-search-server.js`)
- Implements Model Context Protocol
- Works with Claude Desktop and other MCP clients
- Exposes 2 tools:
  - `search_volunteer_opportunities` - Search with filters
  - `get_opportunity_details` - Get full details by ID

### **2. REST API** (`server.js`)
- Express.js REST API
- Deployable to Heroku/Render/Railway
- Endpoints:
  - `GET /` - API info
  - `GET /health` - Health check
  - `POST /api/search` - Search opportunities
  - `GET /api/opportunity/:id` - Get details

---

## 🚀 Quick Start

### **Option 1: REST API (for Heroku/Salesforce)**

```bash
# Install dependencies
npm install

# Start the REST API
npm start

# Test locally
curl http://localhost:3000/health
```

### **Option 2: MCP Server (for Claude Desktop)**

```bash
# Install dependencies
npm install

# Start the MCP server
npm run start:mcp
```

Then add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

---

## 🌐 REST API Endpoints

### **GET /**
Returns API information and available endpoints.

### **GET /health**
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-05T..."
}
```

### **POST /api/search**
Search for volunteer opportunities.

**Request Body:**
```json
{
  "keywords": "tutoring",
  "location": "Toronto",
  "remote_only": false,
  "max_results": 10
}
```

**Response:**
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
      "description": "...",
      "url": "https://...",
      "dates": "September 8, 2025 - November 9, 2025",
      "duration": null,
      "remote": false,
      "location": "British Columbia",
      "activities": "Event Planning, Marketing, Social Media"
    }
  ],
  "formatted_text": "🌐 Found 10 volunteer opportunities..."
}
```

### **GET /api/opportunity/:id**
Get detailed information about a specific opportunity.

**Response:**
```json
{
  "success": true,
  "opportunity": {
    "id": 43243,
    "title": "Event Planner",
    "organization": "Canadian Network for International Surgery",
    "description": "...",
    "url": "https://...",
    "dates": "September 8, 2025 - November 9, 2025",
    "activities": [
      {"name": "Event Planning", "category": "PR, Fundraising, Events"}
    ]
  },
  "formatted_text": "📋 Volunteer Opportunity Details..."
}
```

---

## 🔧 MCP Tools

### **search_volunteer_opportunities**

Search for volunteer opportunities with optional filters.

**Parameters:**
- `keywords` (string, optional) - Search terms
- `location` (string, optional) - City or region
- `remote_only` (boolean, optional) - Filter for remote opportunities
- `max_results` (number, optional) - Max results (1-50, default: 10)

**Example:**
```json
{
  "keywords": "tutoring",
  "location": "Toronto",
  "max_results": 5
}
```

### **get_opportunity_details**

Get detailed information about a specific opportunity.

**Parameters:**
- `opportunity_id` (number, required) - The opportunity ID

**Example:**
```json
{
  "opportunity_id": 43243
}
```

---

## 🚀 Deploy to Heroku

### **Quick Deploy:**

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main

# Open app
heroku open
```

### **Detailed Guide:**
See [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md) for complete deployment instructions.

---

## 🧪 Testing

### **Test REST API:**

```bash
# Test locally
./test-api.sh http://localhost:3000

# Test on Heroku
./test-api.sh https://your-app.herokuapp.com
```

### **Test MCP Server:**

```bash
# Use MCP Inspector
npx @modelcontextprotocol/inspector node volunteer-search-server.js
```

---

## 🔗 Integration Examples

### **Salesforce Apex**

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
```

### **JavaScript/Node.js**

```javascript
const response = await fetch('https://your-app.herokuapp.com/api/search', {
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

### **Python**

```python
import requests

response = requests.post(
    'https://your-app.herokuapp.com/api/search',
    json={
        'keywords': 'tutoring',
        'max_results': 10
    }
)

data = response.json()
print(data['opportunities'])
```

### **curl**

```bash
curl -X POST https://your-app.herokuapp.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"keywords":"tutoring","max_results":10}'
```

---

## 📊 Data Source

This project uses the **VolunteerConnector API**:
- **URL:** https://www.volunteerconnector.org/api/search/
- **Cost:** FREE (no authentication required)
- **Coverage:** 969+ volunteer opportunities across North America
- **Updates:** Real-time
- **Documentation:** https://www.volunteerconnector.org/api

---

## 🏗️ Architecture

### **REST API Flow:**
```
Client (Salesforce/Web/Mobile)
    ↓ HTTP REST
Express.js Server (server.js)
    ↓ HTTP GET
VolunteerConnector API
    ↓
Return formatted results
```

### **MCP Flow:**
```
AI Assistant (Claude Desktop)
    ↓ MCP Protocol (stdio)
MCP Server (volunteer-search-server.js)
    ↓ HTTP GET
VolunteerConnector API
    ↓
Return formatted results
```

---

## 📁 Project Structure

```
volunteer-search-mcp/
├── server.js                    # REST API server (Express.js)
├── volunteer-search-server.js   # MCP server
├── package.json                 # Dependencies
├── Procfile                     # Heroku configuration
├── test-api.sh                  # Test script
├── HEROKU_DEPLOYMENT.md         # Deployment guide
├── README.md                    # This file
├── LICENSE                      # MIT License
└── .gitignore                   # Git ignore rules
```

---

## 🛠️ Development

### **Install Dependencies:**
```bash
npm install
```

### **Run REST API (Development):**
```bash
npm run dev
```

### **Run MCP Server (Development):**
```bash
npm run dev:mcp
```

### **Test:**
```bash
# Test REST API
./test-api.sh http://localhost:3000

# Test MCP Server
npx @modelcontextprotocol/inspector node volunteer-search-server.js
```

---

## 🌟 Use Cases

- **Volunteer Management Platforms** - Integrate external volunteer opportunities
- **Salesforce Agentforce** - Add volunteer search to AI agents
- **Claude Desktop** - Search volunteers via MCP
- **Mobile Apps** - Find local volunteer opportunities
- **Nonprofit Websites** - Display volunteer opportunities
- **Corporate VTO Programs** - Help employees find volunteer work

---

## 📚 Resources

- **MCP Documentation:** https://modelcontextprotocol.io/
- **VolunteerConnector API:** https://www.volunteerconnector.org/api
- **Heroku Docs:** https://devcenter.heroku.com/
- **Express.js:** https://expressjs.com/

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **VolunteerConnector** for providing the free volunteer opportunities API
- **Anthropic** for creating the Model Context Protocol
- **Heroku** for easy deployment platform

---

## 📞 Support

- **Issues:** Open an issue on GitHub
- **API Status:** Check https://www.volunteerconnector.org/
- **MCP Help:** Visit https://modelcontextprotocol.io/

---

## 🎉 Quick Links

- 📖 [Heroku Deployment Guide](HEROKU_DEPLOYMENT.md)
- 🧪 [Test the API](./test-api.sh)
- 🔌 [MCP Documentation](https://modelcontextprotocol.io/)
- 🌐 [VolunteerConnector API](https://www.volunteerconnector.org/api)

---

**Built with ❤️ for the volunteer community**

**Star ⭐ this repo if you find it useful!**