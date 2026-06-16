import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "step-1-calculator",
  version: "1.0.0",
});

server.tool(
  "add",
  "Additionne deux nombres et retourne leur somme.",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => {
    const result = a + b;
    return {
      content: [{ type: "text", text: String(result) }],
    };
  },
);

server.tool(
  "multiply",
  "Multiplie deux nombres et retourne leur produit.",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => {
    const result = a * b;
    return {
      content: [{ type: "text", text: String(result) }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✅ Serveur MCP step-1-calculator démarré.");
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
