import { placeOrder } from "./trade";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0"
});

// Add an addition tool
server.tool("add",
  {
    title: "Addition Tool",
    description: "Add two numbers",
    inputSchema: { a: z.number(), b: z.number() }
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Add a subtraction tool
server.tool("buy-stock","Buys the specified stock with the given quantity on Zerodha.It is assumed that the user has already logged in and has an active session. It executes a real market order for the user on exchange.", 
    {
        stock:z.string(),
        quantity: z.number().int().positive()
    },
    async ({ stock, quantity }) => {
        try {
            await placeOrder(stock, "BUY", quantity);
            return { content: [{ type: "text", text: `Order placed for buying ${quantity} shares of ${stock}` }] };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return { content: [{ type: "text", text: `Error placing order: ${errorMessage}` }] };
        }
    }
)

// Add a tool to sell a stock
server.tool("sell-stock","Sells the specified stock with the given quantity on Zerodha for the user. It is assumed that the user has already logged in and has an active session. It executes a real market order for the user on exchange.",
    {
        stock:z.string(),
        quantity: z.number().int().positive()
    },
    async ({ stock, quantity }) => {
        try {
            await placeOrder(stock, "SELL", quantity);
            return { content: [{ type: "text", text: `Order placed for selling ${quantity} shares of ${stock}` }] };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return { content: [{ type: "text", text: `Error placing order: ${errorMessage}` }] };
        }
    }
)

//Show portfolio
server.tool("show-portfolio","Fetches the user's current holdings from Zerodha. It is assumed that the user has already logged in and has an active session.",
    {},
    async() => {
        try {
            const holdings = await import("./trade").then(mod => mod.getHoldings());
            return { content: [{ type: "text", text: holdings }] };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return { content: [{ type: "text", text: `Error fetching holdings: ${errorMessage}` }] };
        }
    }
)

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
