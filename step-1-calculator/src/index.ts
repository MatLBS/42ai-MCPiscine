import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "step-1-calculator",
  version: "1.0.0",
});

// TODO: créé un tool "add" qui prend deux nombres a et b, et retourne leur somme au format MCP :
// { content: [{ type: "text", text: "..." }] }

// TODO: créé un tool "multiply" qui prend deux nombres a et b, et retourne leur produit au format MCP :
// { content: [{ type: "text", text: "..." }] }

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✅ Serveur MCP step-1-calculator démarré.");
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
