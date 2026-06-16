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

server.tool(
  "get_user_profile",
  "Récupère le profil complet d'un étudiant 42 (réponse brute de l'API).",
  {
    idOrLogin: z
      .string()
      .describe("ID numérique ou login 42 (ex: '12345' ou 'matle-br')"),
  },
  async ({ idOrLogin }) => {
    try {
      const response = await axiosInstance.get(`v2/users/${idOrLogin}`);
      return toResult(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Utilisateur introuvable : "${idOrLogin}"`,
            },
          ],
          isError: true,
        };
      }
      throw err;
    }
  },
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
