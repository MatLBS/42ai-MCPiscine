/**
 * Exercice 2 — Brancher l'API de l'intra 42 sur un serveur MCP.
 *
 *   agent (Claude)  ◄── stdio ──►  ce fichier  ── HTTPS ──►  api.intra.42.fr
 *
 * Cette fois le tool ne calcule rien : il va chercher de la donnée sur une API
 * externe. La plomberie est déjà écrite, il ne reste que le tool.
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

// TODO: créé un tool "get_user_profile" afin de récupérer le profil complet d'un étudiant 42
//
// Le tool prend un identifiant (ID numérique ou login) et doit :
//   - interroger la route `v2/users/:idOrLogin` avec `axiosInstance`, déclarée
//     plus haut : elle porte déjà l'URL de base et le token, un simple
//     `axiosInstance.get(...)` suffit donc ;
//   - passer la donnée reçue à `toResult()`, qui se charge de la mettre au
//     format de réponse attendu par MCP.
//
// Si le login n'existe pas, l'API répond 404 : attrape l'erreur et renvoie un
// résultat avec `isError: true` plutôt que de laisser planter le tool.

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
