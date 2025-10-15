#!/usr/bin/env node

/**
 * HYBRID Server: REST API + MCP over SSE
 * This allows BOTH Salesforce (REST) AND MCP clients (SSE) to use the same server
 * 
 * Endpoints:
 * - POST /api/search - REST API (for Salesforce)
 * - GET /mcp - MCP SSE endpoint (for MCP clients over HTTP)
 * - POST /mcp/message - MCP message handler
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static demo page
app.use(express.static('public'));

// ============================================
// EXISTING REST API (Keep for Salesforce)
// ============================================

app.get('/', (req, res) => {
  res.json({
    name: 'Volunteer Search API - Hybrid',
    version: '2.0.0',
    status: 'healthy',
    protocols: {
      rest: {
        search: 'POST /api/search',
        details: 'GET /api/opportunity/:id'
      },
      mcp: {
        sse: 'GET /mcp',
        message: 'POST /mcp/message'
      }
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * REST API: Search volunteer opportunities
 * Used by: Salesforce Agentforce
 */
app.post('/api/search', async (req, res) => {
  try {
    const {
      keywords = '',
      location = '',
      remote_only = false,
      max_results = 10
    } = req.body;

    console.log(`[REST API] Searching: keywords="${keywords}", location="${location}"`);

    const result = await searchVolunteerOpportunities({
      keywords,
      location,
      remote_only,
      max_results
    });

    res.json(result);
  } catch (error) {
    console.error('[REST API] Error:', error);
    res.status(500).json({
      error: 'Failed to search volunteer opportunities',
      message: error.message
    });
  }
});

/**
 * REST API: Get opportunity details
 */
app.get('/api/opportunity/:id', async (req, res) => {
  try {
    const opportunityId = parseInt(req.params.id);
    
    if (isNaN(opportunityId)) {
      return res.status(400).json({
        error: 'Invalid opportunity ID',
        message: 'ID must be a number'
      });
    }

    console.log(`[REST API] Getting details for opportunity ${opportunityId}`);

    const result = await getOpportunityDetails({ opportunity_id: opportunityId });

    res.json(result);
  } catch (error) {
    console.error('[REST API] Error:', error);
    res.status(500).json({
      error: 'Failed to get opportunity details',
      message: error.message
    });
  }
});

// ============================================
// NEW: MCP over SSE (for MCP clients)
// ============================================

/**
 * MCP SSE Endpoint
 * Used by: MCP clients that support HTTP transport
 * 
 * Example: Salesforce could call this if it had an MCP client
 */
app.get('/mcp', (req, res) => {
  console.log('[MCP SSE] Client connected');

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial handshake
  const handshake = {
    jsonrpc: '2.0',
    id: 'init',
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: true
        }
      },
      serverInfo: {
        name: 'volunteer-search-server',
        version: '2.0.0'
      }
    }
  };

  res.write(`data: ${JSON.stringify(handshake)}\n\n`);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 30000);

  req.on('close', () => {
    console.log('[MCP SSE] Client disconnected');
    clearInterval(keepAlive);
  });
});

/**
 * MCP Message Handler
 * Handles MCP protocol messages over HTTP
 */
app.post('/mcp/message', async (req, res) => {
  try {
    const message = req.body;
    console.log('[MCP] Received message:', JSON.stringify(message, null, 2));

    let response;

    // Handle different MCP methods
    switch (message.method) {
      case 'tools/list':
        response = {
          jsonrpc: '2.0',
          id: message.id,
          result: {
            tools: [
              {
                name: 'search_volunteer_opportunities',
                description: 'Search for volunteer opportunities from VolunteerConnector API',
                inputSchema: {
                  type: 'object',
                  properties: {
                    keywords: {
                      type: 'string',
                      description: 'Search keywords (e.g., tutoring, food bank)'
                    },
                    location: {
                      type: 'string',
                      description: 'City, region, or country'
                    },
                    remote_only: {
                      type: 'boolean',
                      description: 'Filter for remote opportunities only',
                      default: false
                    },
                    max_results: {
                      type: 'number',
                      description: 'Maximum number of results (1-50)',
                      default: 10
                    }
                  }
                }
              }
            ]
          }
        };
        break;

      case 'tools/call':
        const { name, arguments: args } = message.params;
        
        if (name === 'search_volunteer_opportunities') {
          const searchResult = await searchVolunteerOpportunities(args);
          
          response = {
            jsonrpc: '2.0',
            id: message.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: searchResult.formatted_text || JSON.stringify(searchResult)
                }
              ]
            }
          };
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
        break;

      default:
        throw new Error(`Unknown method: ${message.method}`);
    }

    res.json(response);
  } catch (error) {
    console.error('[MCP] Error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
});

// ============================================
// Shared Business Logic
// ============================================

/**
 * Search volunteer opportunities using VolunteerConnector API
 */
async function searchVolunteerOpportunities(args) {
  const {
    keywords = '',
    location = '',
    remote_only = false,
    max_results = 10
  } = args;

  const baseUrl = 'https://www.volunteerconnector.org/api/search/';
  const params = new URLSearchParams();

  if (keywords) params.append('q', keywords);
  if (remote_only) params.append('remote_or_online', 'true');

  const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

  console.log(`[API] Calling VolunteerConnector: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'VTO-Agent/2.0'
    }
  });

  if (!response.ok) {
    throw new Error(`VolunteerConnector API returned status ${response.status}`);
  }

  const data = await response.json();

  const opportunities = (data.results || []).slice(0, max_results).map(opp => {
    const org = opp.organization || {};
    const audience = opp.audience || {};
    const regions = audience.regions || [];

    return {
      id: opp.id,
      title: opp.title,
      organization: org.name || 'Unknown Organization',
      description: opp.description,
      url: opp.url,
      dates: opp.dates,
      duration: opp.duration,
      remote: opp.remote_or_online || false,
      location: regions.length > 0 ? regions.join(', ') : 'Location not specified',
      activities: (opp.activities || []).map(a => a.name).join(', ')
    };
  });

  return {
    success: true,
    total_count: data.count || 0,
    returned_count: opportunities.length,
    opportunities: opportunities,
    formatted_text: formatOpportunities(opportunities, keywords, data.count)
  };
}

/**
 * Get details for a specific opportunity
 */
async function getOpportunityDetails(args) {
  const { opportunity_id } = args;

  console.log(`[API] Fetching opportunity ${opportunity_id}`);

  const response = await fetch('https://www.volunteerconnector.org/api/search/', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'VTO-Agent/2.0'
    }
  });

  if (!response.ok) {
    throw new Error(`VolunteerConnector API returned status ${response.status}`);
  }

  const data = await response.json();
  const opportunity = (data.results || []).find(opp => opp.id === opportunity_id);

  if (!opportunity) {
    throw new Error(`Opportunity with ID ${opportunity_id} not found`);
  }

  const org = opportunity.organization || {};
  const audience = opportunity.audience || {};
  const regions = audience.regions || [];

  return {
    success: true,
    opportunity: {
      id: opportunity.id,
      title: opportunity.title,
      organization: org.name || 'Unknown',
      organization_url: org.url,
      description: opportunity.description,
      url: opportunity.url,
      dates: opportunity.dates,
      duration: opportunity.duration,
      remote: opportunity.remote_or_online || false,
      location: regions.length > 0 ? regions.join(', ') : 'Not specified',
      activities: (opportunity.activities || []).map(a => a.name)
    }
  };
}

/**
 * Format opportunities for display
 */
function formatOpportunities(opportunities, keywords, totalCount) {
  if (opportunities.length === 0) {
    return `No volunteer opportunities found${keywords ? ` for "${keywords}"` : ''}.`;
  }

  let output = `🌐 Found ${opportunities.length} volunteer opportunities`;
  if (totalCount > opportunities.length) {
    output += ` (showing ${opportunities.length} of ${totalCount} total)`;
  }
  if (keywords) output += ` for "${keywords}"`;
  output += '\n\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  opportunities.forEach((opp, index) => {
    output += `${index + 1}. 🎯 ${opp.title}\n`;
    output += `   🏢 ${opp.organization}\n`;
    output += `   📍 ${opp.location}\n`;
    if (opp.dates) output += `   📅 ${opp.dates}\n`;
    if (opp.duration) output += `   ⏱️ ${opp.duration}\n`;
    if (opp.remote) output += `   💻 Remote/Online Available\n`;
    if (opp.activities) output += `   🎨 ${opp.activities}\n`;
    if (opp.description) {
      const shortDesc = opp.description.length > 150
        ? opp.description.substring(0, 150) + '...'
        : opp.description;
      output += `   📝 ${shortDesc}\n`;
    }
    output += `   🔗 ${opp.url}\n`;
    output += `   ID: ${opp.id}\n\n`;
  });

  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  return output;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Hybrid API Server running on port ${PORT}`);
  console.log(`📍 REST API: http://localhost:${PORT}/api/search`);
  console.log(`📍 MCP SSE: http://localhost:${PORT}/mcp`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
});

export default app;

