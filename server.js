#!/usr/bin/env node

/**
 * REST API Server for Volunteer Search
 * Wraps MCP server logic in HTTP endpoints for Heroku deployment
 * 
 * This server exposes the same functionality as the MCP server
 * but via REST API endpoints that work with Heroku and Salesforce
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Volunteer Search API',
    version: '1.0.0',
    status: 'healthy',
    endpoints: {
      search: 'POST /api/search',
      details: 'GET /api/opportunity/:id',
      health: 'GET /health'
    },
    documentation: 'https://github.com/your-repo/mcp-server'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Search volunteer opportunities
 * POST /api/search
 * 
 * Body:
 * {
 *   "keywords": "tutoring",
 *   "location": "Toronto",
 *   "remote_only": false,
 *   "max_results": 10
 * }
 */
app.post('/api/search', async (req, res) => {
  try {
    const {
      keywords = '',
      location = '',
      remote_only = false,
      max_results = 10
    } = req.body;

    console.log(`[API] Searching: keywords="${keywords}", location="${location}", remote=${remote_only}`);

    const result = await searchVolunteerOpportunities({
      keywords,
      location,
      remote_only,
      max_results
    });

    res.json(result);
  } catch (error) {
    console.error('[API] Search error:', error);
    res.status(500).json({
      error: 'Failed to search volunteer opportunities',
      message: error.message
    });
  }
});

/**
 * Get opportunity details
 * GET /api/opportunity/:id
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

    console.log(`[API] Getting details for opportunity ${opportunityId}`);

    const result = await getOpportunityDetails({ opportunity_id: opportunityId });

    res.json(result);
  } catch (error) {
    console.error('[API] Details error:', error);
    res.status(500).json({
      error: 'Failed to get opportunity details',
      message: error.message
    });
  }
});

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

  // Build API URL with query parameters
  const baseUrl = 'https://www.volunteerconnector.org/api/search/';
  const params = new URLSearchParams();

  if (keywords) {
    params.append('q', keywords);
  }

  if (remote_only) {
    params.append('remote_or_online', 'true');
  }

  const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

  console.log(`[API] Calling VolunteerConnector: ${url}`);

  // Call the API
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'VTO-Agent/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`VolunteerConnector API returned status ${response.status}`);
  }

  const data = await response.json();

  // Transform results
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

  console.log(`[API] Fetching opportunity ${opportunity_id} from VolunteerConnector`);

  // Search all opportunities and filter by ID
  const response = await fetch('https://www.volunteerconnector.org/api/search/', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'VTO-Agent/1.0'
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
      organization_logo: org.logo,
      description: opportunity.description,
      url: opportunity.url,
      dates: opportunity.dates,
      duration: opportunity.duration,
      remote: opportunity.remote_or_online || false,
      location: regions.length > 0 ? regions.join(', ') : 'Not specified',
      activities: (opportunity.activities || []).map(a => ({
        name: a.name,
        category: a.category
      })),
      audience: {
        scope: audience.scope,
        regions: regions
      }
    },
    formatted_text: formatOpportunityDetails(opportunity)
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
  if (keywords) {
    output += ` for "${keywords}"`;
  }
  output += '\n\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  opportunities.forEach((opp, index) => {
    output += `${index + 1}. 🎯 ${opp.title}\n`;
    output += `   🏢 ${opp.organization}\n`;
    output += `   📍 ${opp.location}\n`;

    if (opp.dates) {
      output += `   📅 ${opp.dates}\n`;
    }

    if (opp.duration) {
      output += `   ⏱️ ${opp.duration}\n`;
    }

    if (opp.remote) {
      output += `   💻 Remote/Online Available\n`;
    }

    if (opp.activities) {
      output += `   🎨 ${opp.activities}\n`;
    }

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
  output += '💡 Use /api/opportunity/{id} to see full details.';

  return output;
}

/**
 * Format opportunity details
 */
function formatOpportunityDetails(opportunity) {
  const org = opportunity.organization || {};
  const audience = opportunity.audience || {};
  const regions = audience.regions || [];

  let output = '📋 Volunteer Opportunity Details\n\n';
  output += `🎯 Title: ${opportunity.title}\n`;
  output += `🏢 Organization: ${org.name || 'Unknown'}\n`;
  output += `📍 Location: ${regions.length > 0 ? regions.join(', ') : 'Not specified'}\n`;
  output += `📅 Dates: ${opportunity.dates || 'Not specified'}\n`;
  output += `⏱️ Duration: ${opportunity.duration || 'Not specified'}\n`;
  output += `💻 Remote/Online: ${opportunity.remote_or_online ? 'Yes' : 'No'}\n\n`;

  output += '📝 Description:\n';
  output += `${opportunity.description}\n\n`;

  if (opportunity.activities && opportunity.activities.length > 0) {
    output += '🎨 Activities:\n';
    opportunity.activities.forEach(a => {
      output += `• ${a.name} (${a.category})\n`;
    });
    output += '\n';
  }

  output += `🔗 Apply Here: ${opportunity.url}\n\n`;

  if (org.url) {
    output += `🏢 Organization Details: ${org.url}\n`;
  }

  return output;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Volunteer Search API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Search endpoint: POST http://localhost:${PORT}/api/search`);
  console.log(`📋 Details endpoint: GET http://localhost:${PORT}/api/opportunity/:id`);
});

export default app;
