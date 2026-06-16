# 🌊 42AI - MCPiscine

## C'est quoi MCP ?

**Model Context Protocol** est un standard ouvert créé par Anthropic qui définit comment un LLM peut appeler des outils externes de façon structurée.

```
┌─────────────┐      stdio (MCP)      ┌──────────────────────┐
│   agent/    │ ◄───────────────────► │  step-*/src/index.ts  │
│  (Claude)   │                       │     (ton code)        │
└─────────────┘                       └──────────────────────┘
```

L'agent (fourni, dans `agent/`) :

1. Démarre le serveur MCP en sous-processus via **stdio**
2. Découvre automatiquement les outils disponibles (`listTools`)
3. Transmet les appels de Claude vers le bon tool (`callTool`)

**Ton travail :** implémenter les tools dans les fichiers `index.ts` de chaque step.

---

## Setup

### Prérequis

- Node.js ≥ 18
- Une clé API Anthropic : https://console.anthropic.com/

### 1. Installe les dépendances

```bash
npm install
```

### 2. Configure les variables d'environnement

```bash
cp agent/.env.example agent/.env
```

Run : 

```
curl -X POST "https://api.intra.42.fr/oauth/token" \
  -d "grant_type=client_credentials" \
  -d "client_id=<uid>" \
  -d "client_secret=<secret>"
```

Édite `agent/.env` :

```
ANTHROPIC_API_KEY=sk-ant-...      # ta clé Anthropic

# Pour l'exercice 2 (fourni par l'organisateur) :
FORTY_TWO_TOKEN=<bearer token>
FORTY_TWO_URL="https://api.intra.42.fr/"
```

---

## Exercice 1 — Calculatrice

### Lance l'agent

```bash
cd agent
npx tsx src/index.ts ../step-1-calculator/src/index.ts
```

Tu devrais voir :

```
🔌 2 outil(s) découvert(s) depuis le serveur MCP :
   • add — Additionne deux nombres et retourne leur somme.
   • multiply — Multiplie deux nombres et retourne leur produit.

💬 Agent prêt ! Tape ta question (ou "exit" pour quitter).

Toi >
```

### Ce qu'il faut implémenter

Ouvre `step-1-calculator/src/index.ts`. Deux tools à compléter :

- `add(a, b)` → retourne `a + b`
- `multiply(a, b)` → retourne `a * b`

Chaque tool retourne son résultat au format MCP :

```ts
{ content: [{ type: "text", text: String(résultat) }] }
```

Tant que les TODOs ne sont pas remplis, l'outil te renverra l'erreur
`TODO: implémente add() dans index.ts` — c'est normal, ça confirme que le câblage
agent ↔ serveur ↔ outil fonctionne avant même d'avoir écrit la logique.

Bloqué ? La solution est dans `step-1-calculator/src/index.solution.ts`.

---

## Exercice 2 — API 42

### Lance l'agent

```bash
cd agent
npx tsx src/index.ts ../step-2-42api/src/index.ts
```

### Ce qu'il faut implémenter

Ouvre `step-2-42api/src/index.ts`. L'`axiosInstance` (configurée avec le token Bearer) et
`toResult()` sont déjà implémentés — il ne reste que le tool à compléter :

- `get_user_profile(idOrLogin)` → appelle `axiosInstance.get(\`v2/users/${idOrLogin}\`)` et
  retourne `toResult(response.data)`.

```
Toi > montre-moi le profil de <ton_login_42>
```

Si l'utilisateur n'existe pas, renvoie une erreur MCP (`isError: true`) plutôt que de laisser
l'erreur remonter.

Bloqué ? La solution est dans `step-2-42api/src/index.solution.ts`.

---

## Structure du repo

```
mcpiscine/
├── agent/
│   ├── src/index.ts            ← Agent MCP (ne pas modifier)
│   ├── .env.example            ← Toutes les variables d'env (Anthropic + 42)
│   └── package.json
├── step-1-calculator/
│   ├── src/
│   │   ├── index.ts             ← ✏️  TON EXERCICE
│   │   └── index.solution.ts    ← Solution
│   └── package.json
└── step-2-42api/
    ├── src/
    │   ├── index.ts             ← ✏️  TON EXERCICE
    │   └── index.solution.ts    ← Solution
    └── package.json
```

---

## Pour aller plus loin

- [Spec officielle MCP](https://modelcontextprotocol.io)
- [SDK TypeScript MCP](https://github.com/modelcontextprotocol/typescript-sdk)
- [Liste de serveurs MCP](https://github.com/punkpeye/awesome-mcp-servers)
- [API 42 Docs](https://api.intra.42.fr/apidoc)

---

_Atelier organisé par **42AI** — MCPiscine_
