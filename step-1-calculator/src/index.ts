/**
 * Exercice 1 — Une calculatrice exposée en serveur MCP.
 *
 * Tu ne lances pas ce fichier toi-même : l'agent le démarre en sous-processus
 * et dialogue avec lui via stdio.
 *   agent (Claude)  ◄── stdio ──►  ce fichier
 *
 * Ton travail : enregistrer les deux tools ci-dessous.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// zod décrit les paramètres des tools. Le SDK le traduit en schéma JSON, que
// le LLM lit pour savoir quels arguments envoyer.
import { z } from "zod";

// Identité du serveur, vue par le client MCP.
const server = new McpServer({
  name: "step-1-calculator",
  version: "1.0.0",
});

// Les tools s'enregistrent avec `server.registerTool()`. À toi de trouver
// comment lui passer un nom, une description, un schéma d'entrée (zod) et la
// fonction à exécuter.

// TODO: créé un tool "add" qui prend deux nombres a et b, et retourne leur somme au format MCP :
// { content: [{ type: "text", text: "..." }] }

// TODO: créé un tool "multiply" qui prend deux nombres a et b, et retourne leur produit au format MCP :
// { content: [{ type: "text", text: "..." }] }

async function main() {
  // stdio : aucun port réseau, le process lit stdin et écrit sur stdout.
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // console.error et pas console.log : stdout est réservé au protocole MCP.
  console.error("✅ Serveur MCP step-1-calculator démarré.");
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err);
  process.exit(1);
});
