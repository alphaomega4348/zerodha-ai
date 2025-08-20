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
server.tool("Buy a stock",
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
server.tool("Sell a stock",
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

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
