#!/usr/bin/env node

/**
 * MCP Server for Volunteer Opportunity Search
 * Implements Model Context Protocol to expose volunteer search as a tool
 * 
 * Usage:
 *   node volunteer-search-server.js
 * 
 * MCP Protocol: https://modelcontextprotocol.io/
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

// MCP Server Configuration
const server = new Server(
  {
    name: "volunteer-search-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available MCP tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_volunteer_opportunities",
        description: "Search for volunteer opportunities from VolunteerConnector API. Returns real volunteer opportunities with organization details, dates, locations, and application links.",
        inputSchema: {
          type: "object",
          properties: {
            keywords: {
              type: "string",
              description: "Search keywords (e.g., 'tutoring', 'food bank', 'environment')",
            },
            location: {
              type: "string",
              description: "City, region, or country to search in (optional)",
            },
            remote_only: {
              type: "boolean",
              description: "Filter for remote/online opportunities only",
              default: false,
            },
            max_results: {
              type: "number",
              description: "Maximum number of results to return (1-50)",
              default: 10,
              minimum: 1,
              maximum: 50,
            },
          },
        },
      },
      {
        name: "get_opportunity_details",
        description: "Get detailed information about a specific volunteer opportunity by ID",
        inputSchema: {
          type: "object",
          properties: {
            opportunity_id: {
              type: "number",
              description: "The unique ID of the volunteer opportunity",
            },
          },
          required: ["opportunity_id"],
        },
      },
    ],
  };
});

/**
 * Handle MCP tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_volunteer_opportunities") {
      return await searchVolunteerOpportunities(args);
    } else if (name === "get_opportunity_details") {
      return await getOpportunityDetails(args);
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Search volunteer opportunities using VolunteerConnector API
 */
async function searchVolunteerOpportunities(args) {
  const {
    keywords = "",
    location = "",
    remote_only = false,
    max_results = 10,
  } = args;

  // Build API URL with query parameters
  const baseUrl = "https://www.volunteerconnector.org/api/search/";
  const params = new URLSearchParams();

  if (keywords) {
    params.append("q", keywords);
  }

  if (remote_only) {
    params.append("remote_or_online", "true");
  }

  const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

  console.error(`[MCP] Searching volunteer opportunities: ${url}`);

  // Call the API
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();

  // Transform results
  const opportunities = (data.results || []).slice(0, max_results).map((opp) => {
    const org = opp.organization || {};
    const audience = opp.audience || {};
    const regions = audience.regions || [];

    return {
      id: opp.id,
      title: opp.title,
      organization: org.name || "Unknown Organization",
      description: opp.description,
      url: opp.url,
      dates: opp.dates,
      duration: opp.duration,
      remote: opp.remote_or_online || false,
      location: regions.length > 0 ? regions.join(", ") : "Location not specified",
      activities: (opp.activities || []).map((a) => a.name).join(", "),
    };
  });

  // Format response for MCP
  const formattedText = formatOpportunities(opportunities, keywords, data.count);

  return {
    content: [
      {
        type: "text",
        text: formattedText,
      },
    ],
  };
}

/**
 * Get details for a specific opportunity
 */
async function getOpportunityDetails(args) {
  const { opportunity_id } = args;

  console.error(`[MCP] Getting opportunity details for ID: ${opportunity_id}`);

  // Note: VolunteerConnector API doesn't have a direct detail endpoint
  // So we search and filter by ID
  const response = await fetch(
    "https://www.volunteerconnector.org/api/search/",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();
  const opportunity = (data.results || []).find(
    (opp) => opp.id === opportunity_id
  );

  if (!opportunity) {
    throw new Error(`Opportunity with ID ${opportunity_id} not found`);
  }

  const org = opportunity.organization || {};
  const audience = opportunity.audience || {};
  const regions = audience.regions || [];

  const formatted = `
📋 Volunteer Opportunity Details

🎯 Title: ${opportunity.title}
🏢 Organization: ${org.name || "Unknown"}
📍 Location: ${regions.length > 0 ? regions.join(", ") : "Not specified"}
📅 Dates: ${opportunity.dates || "Not specified"}
⏱️ Duration: ${opportunity.duration || "Not specified"}
💻 Remote/Online: ${opportunity.remote_or_online ? "Yes" : "No"}

📝 Description:
${opportunity.description}

🎨 Activities:
${(opportunity.activities || []).map((a) => `• ${a.name} (${a.category})`).join("\n")}

🔗 Apply Here: ${opportunity.url}

🏢 Organization Details:
${org.url || "No organization URL available"}
`;

  return {
    content: [
      {
        type: "text",
        text: formatted.trim(),
      },
    ],
  };
}

/**
 * Format opportunities for display
 */
function formatOpportunities(opportunities, keywords, totalCount) {
  if (opportunities.length === 0) {
    return `No volunteer opportunities found${keywords ? ` for "${keywords}"` : ""}.`;
  }

  let output = `🌐 Found ${opportunities.length} volunteer opportunities`;
  if (totalCount > opportunities.length) {
    output += ` (showing ${opportunities.length} of ${totalCount} total)`;
  }
  if (keywords) {
    output += ` for "${keywords}"`;
  }
  output += "\n\n";
  output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

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
      const shortDesc =
        opp.description.length > 150
          ? opp.description.substring(0, 150) + "..."
          : opp.description;
      output += `   📝 ${shortDesc}\n`;
    }

    output += `   🔗 ${opp.url}\n`;
    output += `   ID: ${opp.id}\n\n`;
  });

  output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
  output +=
    "💡 Use get_opportunity_details with an ID to see full information.";

  return output;
}

/**
 * Start the MCP server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Volunteer Search MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
