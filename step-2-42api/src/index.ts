import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { type AxiosInstance } from "axios";

const FORTY_TWO_TOKEN = process.env.FORTY_TWO_TOKEN;
const FORTY_TWO_URL = process.env.FORTY_TWO_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: FORTY_TWO_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.defaults.headers.common["Authorization"] =
  `Bearer ${FORTY_TWO_TOKEN}`;

function toResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

const server = new McpServer({
  name: "step-2-42api",
  version: "1.0.0",
});

// TODO: créé un tool "get_user_profile" afin de récupérer le profil complet d'un étudiant 42
server.tool(
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✅ Serveur MCP step-2-42api démarré.");
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
