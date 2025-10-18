# 🤖 Claude Desktop MCP Demo Guide

## ✅ Setup Complete!

Claude Desktop is now configured with your Volunteer Search MCP Server!

---

## 🎬 **How to Demo (WOW the Judges!)**

### **Step 1: Open Claude Desktop**

Claude Desktop should now be open. If not:
```bash
open -a Claude
```

### **Step 2: Look for MCP Tools**

In Claude Desktop, you should see a **🔌 hammer icon** or **tools indicator** showing that MCP tools are available.

### **Step 3: Test Queries**

Try these queries in Claude Desktop:

#### **Query 1: Basic Search**
```
Search for volunteer opportunities
```

**What Claude Will Do:**
- Automatically call your MCP server
- Use the `search_volunteer_opportunities` tool
- Return formatted results with real opportunities

---

#### **Query 2: Location-Based Search**
```
Find volunteer opportunities in Toronto
```

**What Claude Will Do:**
- Parse "Toronto" from your query
- Call MCP with location parameter
- Return Toronto-specific opportunities

---

#### **Query 3: Keyword Search**
```
Show me tutoring volunteer opportunities
```

**What Claude Will Do:**
- Extract "tutoring" as keyword
- Search for education-related opportunities
- Display relevant results

---

#### **Query 4: Get Details**
```
Tell me more about opportunity 42283
```

**What Claude Will Do:**
- Use the `get_opportunity_details` tool
- Fetch complete information
- Show organization details, dates, description

---

#### **Query 5: Remote Opportunities**
```
Find remote volunteer opportunities
```

**What Claude Will Do:**
- Filter for remote_only = true
- Return only online/remote opportunities

---

## 🎯 **Demo Script for Judges**

### **Opening:**
> "Now let me show you something really exciting. We've implemented the Model Context Protocol, which is an emerging standard for connecting AI assistants to external tools."

### **Show Claude Desktop:**
> "This is Claude Desktop. I've configured it to use our volunteer search as an MCP tool."

### **Live Demo:**
> "Watch what happens when I ask Claude to search for volunteers..."

**Type in Claude:**
```
Search for volunteer opportunities in Vancouver
```

### **Explain What Happened:**
> "Notice how Claude automatically:
> 1. Understood my request
> 2. Called our MCP server
> 3. Retrieved real volunteer data
> 4. Formatted it naturally in the conversation
> 
> This is the power of MCP - any AI assistant can now use our volunteer search through a standardized protocol."

### **Show Another Example:**
```
Find tutoring volunteer opportunities and tell me about the first one
```

> "Claude can even chain multiple tool calls - first searching, then getting details about a specific opportunity."

---

## 🤯 **Why This Impresses Judges:**

1. **Emerging Technology** - MCP is brand new (2024)
2. **Standardization** - Shows understanding of AI protocols
3. **Reusability** - Same backend, multiple AI platforms
4. **Future-Proof** - Built for the AI-native world
5. **Live Demo** - Actually working, not just slides

---

## 🔧 **Troubleshooting**

### **MCP Tools Not Showing?**

1. **Restart Claude Desktop:**
   ```bash
   killall Claude
   open -a Claude
   ```

2. **Check Config:**
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. **Check Logs:**
   - Look for errors in Claude Desktop
   - Check if node is in PATH

### **Tools Show But Don't Work?**

1. **Test MCP Server Directly:**
   ```bash
   cd /Users/sanandhan/code/volunteer-search-mcp
   npm run start:mcp
   ```

2. **Check Dependencies:**
   ```bash
   cd /Users/sanandhan/code/volunteer-search-mcp
   npm install
   ```

---

## 📊 **What's Happening Behind the Scenes:**

```
You ask Claude: "Search for volunteers"
    ↓
Claude recognizes it needs external data
    ↓
Claude calls your MCP server via stdio
    ↓
MCP server calls VolunteerConnector API
    ↓
Results formatted and returned to Claude
    ↓
Claude presents results naturally in conversation
```

---

## 🎨 **Advanced Demo Ideas**

### **Show Multi-Step Reasoning:**
```
Find 3 volunteer opportunities in Toronto, 
then tell me which one would be best for 
someone interested in education
```

Claude will:
1. Search for Toronto opportunities
2. Analyze the results
3. Make a recommendation based on education focus

### **Show Tool Chaining:**
```
Search for volunteer opportunities, 
pick one that sounds interesting, 
and give me the full details
```

Claude will:
1. Call `search_volunteer_opportunities`
2. Analyze results
3. Call `get_opportunity_details` for one
4. Present comprehensive information

---

## 🏆 **Competitive Advantage**

**Most teams will show:**
- ❌ Just a chatbot
- ❌ Hardcoded responses
- ❌ Single platform

**You're showing:**
- ✅ True AI integration
- ✅ Real-time data
- ✅ Multi-platform (Salesforce + Claude)
- ✅ Standardized protocol (MCP)
- ✅ Production deployment (Heroku)

---

## 📝 **Key Talking Points**

1. **"We built this using the Model Context Protocol"**
   - Shows you understand emerging AI standards

2. **"The same backend serves both Salesforce and Claude Desktop"**
   - Demonstrates reusable architecture

3. **"This uses a free API with no authentication"**
   - Shows sustainability and cost-consciousness

4. **"It's deployed on Heroku and accessible worldwide"**
   - Demonstrates production-ready thinking

5. **"Any MCP-compatible AI can now use our volunteer search"**
   - Shows forward-thinking, platform-agnostic design

---

## 🎉 **You're Ready!**

Your complete demo stack:
1. ✅ **Salesforce Agentforce** - Business value
2. ✅ **Heroku REST API** - Scalability
3. ✅ **Claude Desktop MCP** - Innovation

**This is a WINNING combination!** 🏆

---

## 📞 **Quick Reference**

**Config Location:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**MCP Server Location:**
```
/Users/sanandhan/code/volunteer-search-mcp/volunteer-search-server.js
```

**Test Queries:**
- "Search for volunteer opportunities"
- "Find volunteers in Toronto"
- "Show me tutoring opportunities"
- "Tell me about opportunity 42283"

---

**Now go WOW those judges!** 🚀🎊















