/**
 * Exercice 2 — SOLUTION. Un serveur MCP qui expose l'API de l'intra 42.
 *
 *   agent (Claude)  ◄── stdio ──►  ce fichier  ── HTTPS ──►  api.intra.42.fr
 *
 * Le tool ne fait pas un calcul mais va chercher de la donnée sur une API
 * externe : c'est tout l'intérêt de MCP.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { type AxiosInstance } from "axios";

// Valeurs lues depuis `agent/.env` : on ne code jamais un token en dur.
const FORTY_TWO_TOKEN = process.env.FORTY_TWO_TOKEN;
const FORTY_TWO_URL = process.env.FORTY_TWO_URL;

// Client HTTP pré-configuré : URL de base et en-têtes définis une seule fois.
const axiosInstance: AxiosInstance = axios.create({
  baseURL: FORTY_TWO_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// L'API 42 exige un token, envoyé à chaque requête dans l'en-tête Authorization.
axiosInstance.defaults.headers.common["Authorization"] =
  `Bearer ${FORTY_TWO_TOKEN}`;

// MCP n'accepte pas un objet brut : on sérialise en JSON dans un bloc `text`.
// Le `as const` force le type littéral "text" attendu par le SDK.
function toResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

const server = new McpServer({
  name: "step-2-42api",
  version: "1.0.0",
});

// `.describe()` donne un exemple concret au LLM, ce qui fiabilise ses appels.
server.registerTool(
  "get_user_profile",
  {
    description:
      "Récupère le profil complet d'un étudiant 42 (réponse brute de l'API).",
    inputSchema: {
      idOrLogin: z
        .string()
        .describe("ID numérique ou login 42 (ex: '12345' ou 'matle-br')"),
    },
  },
  async ({ idOrLogin }) => {
    try {
      // Pas de slash initial : l'URL est relative à la `baseURL`.
      const response = await axiosInstance.get(`v2/users/${idOrLogin}`);
      return toResult(response.data);
    } catch (err) {
      // Login inexistant : on renvoie une erreur DANS le protocole plutôt que
      // de planter, pour que Claude puisse réagir.
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
      // Erreur imprévue (token expiré, réseau...) : on laisse remonter au SDK.
      throw err;
    }
  },
);

async function main() {
  // stdio : aucun port réseau, le process lit stdin et écrit sur stdout.
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // console.error et pas console.log : stdout est réservé au protocole MCP.
  console.error("✅ Serveur MCP step-2-42api démarré.");
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
