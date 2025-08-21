// index.ts - Fixed version with proper imports and type definitions
import { placeOrderWithValidation, getHoldings, initializeStockValidator } from "./trade";
import { stockValidator } from "./stockValidator";
import type { StockInfo } from "./stockValidator";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0"
});

// Initialize stock validator on startup
initializeStockValidator().catch(console.error);

// Add an addition tool
server.tool("add",
  "Addition Tool - Add two numbers",
  {
    a: z.number().describe("First number"),
    b: z.number().describe("Second number")
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Enhanced buy-stock tool with validation
server.tool("buy-stock",
  "Buys the specified stock with the given quantity on Zerodha. It automatically validates and suggests correct stock symbols if the user input doesn't match exactly. It is assumed that the user has already logged in and has an active session. It executes a real market order for the user on exchange.",
  {
    stock: z.string().describe("Stock symbol or name (e.g., 'HDFC', 'HDFC Bank', 'HDFCBANK', 'Reliance', etc.)"),
    quantity: z.number().int().positive().describe("Number of shares to buy")
  },
  async ({ stock, quantity }) => {
    try {
      const result = await placeOrderWithValidation(stock, "BUY", quantity);
      
      if (result.success) {
        return { 
          content: [{ 
            type: "text", 
            text: `✅ ${result.message}\nOrder ID: ${result.orderId || 'N/A'}\nValidated Symbol: ${result.validatedSymbol}` 
          }] 
        };
      } else {
        // If not successful, provide suggestions
        let responseText = `❌ ${result.message}`;
        if (result.suggestions && result.suggestions.length > 0) {
          responseText += "\n\nAvailable options:";
          result.suggestions.slice(0, 5).forEach((suggestion: StockInfo, index: number) => {
            responseText += `\n${index + 1}. ${suggestion.tradingsymbol} - ${suggestion.name}`;
          });
          responseText += "\n\nPlease specify the exact symbol from the list above.";
        }
        
        return { 
          content: [{ 
            type: "text", 
            text: responseText
          }] 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { 
        content: [{ 
          type: "text", 
          text: `❌ Error placing buy order: ${errorMessage}` 
        }] 
      };
    }
  }
);

// Enhanced sell-stock tool with validation
server.tool("sell-stock",
  "Sells the specified stock with the given quantity on Zerodha. It automatically validates and suggests correct stock symbols if the user input doesn't match exactly. It is assumed that the user has already logged in and has an active session. It executes a real market order for the user on exchange.",
  {
    stock: z.string().describe("Stock symbol or name (e.g., 'HDFC', 'HDFC Bank', 'HDFCBANK', 'Reliance', etc.)"),
    quantity: z.number().int().positive().describe("Number of shares to sell")
  },
  async ({ stock, quantity }) => {
    try {
      const result = await placeOrderWithValidation(stock, "SELL", quantity);
      
      if (result.success) {
        return { 
          content: [{ 
            type: "text", 
            text: `✅ ${result.message}\nOrder ID: ${result.orderId || 'N/A'}\nValidated Symbol: ${result.validatedSymbol}` 
          }] 
        };
      } else {
        // If not successful, provide suggestions
        let responseText = `❌ ${result.message}`;
        if (result.suggestions && result.suggestions.length > 0) {
          responseText += "\n\nAvailable options:";
          result.suggestions.slice(0, 5).forEach((suggestion: StockInfo, index: number) => {
            responseText += `\n${index + 1}. ${suggestion.tradingsymbol} - ${suggestion.name}`;
          });
          responseText += "\n\nPlease specify the exact symbol from the list above.";
        }
        
        return { 
          content: [{ 
            type: "text", 
            text: responseText
          }] 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { 
        content: [{ 
          type: "text", 
          text: `❌ Error placing sell order: ${errorMessage}` 
        }] 
      };
    }
  }
);

// New tool to search for stocks
server.tool("search-stock",
  "Search for stock symbols and get suggestions. Useful when users want to find the correct symbol before trading.",
  {
    query: z.string().describe("Stock name or partial symbol to search for")
  },
  async ({ query }) => {
    try {
      const result = await stockValidator.validateStock(query);
      
      if (result.isValid) {
        return {
          content: [{
            type: "text",
            text: `✅ Found exact match: ${result.validatedSymbol} - ${result.suggestions[0]?.name}`
          }]
        };
      } else {
        let responseText = `🔍 ${result.message}`;
        if (result.suggestions.length > 0) {
          responseText += "\n\nSearch results:";
          result.suggestions.slice(0, 10).forEach((suggestion: StockInfo, index: number) => {
            responseText += `\n${index + 1}. ${suggestion.tradingsymbol} - ${suggestion.name}`;
          });
        } else {
          responseText += "\n\nNo matching stocks found. Please try a different search term.";
        }
        
        return {
          content: [{
            type: "text",
            text: responseText
          }]
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [{
          type: "text",
          text: `❌ Error searching for stocks: ${errorMessage}`
        }]
      };
    }
  }
);

// Show portfolio tool
server.tool("show-portfolio",
  "Fetches the user's current holdings from Zerodha. It is assumed that the user has already logged in and has an active session.",
  {},
  async () => {
    try {
      const holdings = await getHoldings();
      return { content: [{ type: "text", text: holdings }] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { content: [{ type: "text", text: `Error fetching holdings: ${errorMessage}` }] };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);