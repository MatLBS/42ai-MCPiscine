import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;
const SYSTEM_PROMPT =
  "Tu es un assistant qui répond en français. Tu as accès à des outils externes : " +
  "utilise-les chaque fois qu'ils permettent de répondre plus précisément à la question.";

async function main() {
  const serverPath = process.argv[2];
  if (!serverPath) {
    console.error("Usage : tsx src/index.ts <chemin-vers-serveur-mcp>");
    process.exit(1);
  }

  const anthropic = new Anthropic();
  const mcpClient = new Client({ name: "mcpiscine-agent", version: "1.0.0" });

  try {
    await mcpClient.connect(
      new StdioClientTransport({
        command: "npx",
        args: ["tsx", serverPath],
        env: process.env,
      }),
    );
  } catch (err) {
    console.error(`❌ Impossible de démarrer le serveur MCP "${serverPath}" :`);
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const { tools: mcpTools } = await mcpClient.listTools();
  console.log(
    `🔌 ${mcpTools.length} outil(s) découvert(s) depuis le serveur MCP :`,
  );
  for (const tool of mcpTools) {
    console.log(
      `   • ${tool.name} — ${tool.description ?? "(pas de description)"}`,
    );
  }

  const tools: Anthropic.Tool[] = mcpTools.map((tool) => ({
    name: tool.name,
    description: tool.description ?? "",
    input_schema: tool.inputSchema as Anthropic.Tool["input_schema"],
  }));

  const history: Anthropic.MessageParam[] = [];
  const rl = readline.createInterface({ input: stdin, output: stdout });
  console.log('\n💬 Agent prêt ! Tape ta question (ou "exit" pour quitter).\n');

  while (true) {
    const userInput = await rl.question("Toi > ");
    if (userInput.trim().toLowerCase() === "exit") break;

    history.push({ role: "user", content: userInput });

    let waitingForUser = false;
    while (!waitingForUser) {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        tools,
        messages: history,
      });

      history.push({ role: "assistant", content: response.content });

      if (response.stop_reason !== "tool_use") {
        const text = response.content
          .filter(
            (block): block is Anthropic.TextBlock => block.type === "text",
          )
          .map((block) => block.text)
          .join("\n");
        console.log(`\nClaude > ${text}\n`);
        waitingForUser = true;
        continue;
      }

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        console.log(
          `🔧 Appel de l'outil "${block.name}" avec ${JSON.stringify(block.input)}`,
        );

        try {
          const result = await mcpClient.callTool({
            name: block.name,
            arguments: block.input as Record<string, unknown>,
          });
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content:
              result.content as Anthropic.ToolResultBlockParam["content"],
            is_error: Boolean(result.isError),
          });
        } catch (err) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: err instanceof Error ? err.message : String(err),
            is_error: true,
          });
        }
      }

      history.push({ role: "user", content: toolResults });
    }
  }

  rl.close();
  await mcpClient.close();
}

main();
