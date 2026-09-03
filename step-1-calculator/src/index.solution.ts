/**
 * Exercice 1 — SOLUTION. Une calculatrice exposée en serveur MCP.
 *
 * L'agent démarre ce fichier en sous-processus et dialogue avec lui via stdio :
 *   agent (Claude)  ◄── stdio ──►  ce fichier
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

// La `description` est ce que Claude lit pour décider quand appeler l'outil.
// `inputSchema` attend un objet plat (pas un z.object) : le SDK l'enveloppe
// lui-même et valide les arguments avant d'appeler le callback.
server.registerTool(
  "add",
  {
    description: "Additionne deux nombres et retourne leur somme.",
    inputSchema: { a: z.number(), b: z.number() },
  },
  async ({ a, b }) => {
    const result = a + b;
    // Format MCP : un tableau `content`, dont le `text` est une chaîne.
    return {
      content: [{ type: "text", text: String(result) }],
    };
  },
);

server.registerTool(
  "multiply",
  {
    description: "Multiplie deux nombres et retourne leur produit.",
    inputSchema: { a: z.number(), b: z.number() },
  },
  async ({ a, b }) => {
    const result = a * b;
    return {
      content: [{ type: "text", text: String(result) }],
    };
  },
);

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
