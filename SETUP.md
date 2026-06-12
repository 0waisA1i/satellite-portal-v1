# Setup: building the Satellite Portal in Claude Code

This is the start-to-finish path for a you-led build in Claude Code, using the newest Claude model (Fable), reading from Owais's Supabase. You do not need to be a developer. You drive in plain language; the agent writes the code.

## 0. What to get from Owais first

You can start building the UI without these (the sample data covers it), but you need them to connect the real database:

- Supabase project URL and anon key (Supabase dashboard > Project Settings > API). Ask for a development or staging project, not production.
- The service role key (secret, server-side only).
- Confirmation of the actual table and column names, or access so the agent can introspect the schema. The build spec proposes a schema; the live one is what matters.
- Whether Row-Level Security is already set up for tenant isolation, and how a login maps to a client.

## 1. Install the tools (one time)

1. Install Node.js version 18 or later from nodejs.org.
2. Install Claude Code:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
3. Check it works by running `claude` in a terminal. Sign in when prompted.

## 2. Create the project folder

1. Make a new empty folder for the repo, for example `satellite-portal`.
2. Copy the contents of this `build-handoff` folder into it, so the new repo contains `CLAUDE.md`, `KICKOFF_PROMPT.md`, `.env.example`, and the `docs/` folder.
3. Open a terminal in that folder.

## 3. Start Claude Code on the newest model

1. In the project folder, run:
   ```
   claude
   ```
2. Select the newest model. Type:
   ```
   /model
   ```
   and pick the latest Claude (this is "Fable"). If it is not listed by that name, choose the `opus` alias, which resolves to the newest model. `/model` saves your choice for future sessions.
3. Confirm context loaded by typing `/memory`. You should see `CLAUDE.md` listed.

## 4. Run the kickoff

Open `KICKOFF_PROMPT.md`, copy the prompt section, and paste it as your first message. The agent will read the context, propose a plan, scaffold Next.js, and build the Feed page against the sample data. Let it work step by step. After it scaffolds, run:
```
npm run dev
```
and open the local URL it prints to watch progress. Iterate in small, specific asks.

## 5. Connect Supabase (after you have Owais's keys)

1. Copy `.env.example` to `.env.local` and paste in the values from Owais.
2. (Recommended) Add the Supabase MCP server so the agent can read the live schema and generate types directly:
   ```
   claude mcp add
   ```
   Follow the prompts for the Supabase server, pointing it at the dev/staging project. Then ask the agent to introspect the schema, generate types, and map the mockup fields to the real columns. Have it list any missing columns as a gap for Owais.
3. Ask the agent to switch the Feed page from the sample JSON to live Supabase reads, keeping all tier gating on the server.

## 6. Deploy to Vercel

1. Create a GitHub repo and push the project (the agent can run the git commands for you).
2. At vercel.com, import the GitHub repo.
3. Add the three environment variables from `.env.local` in the Vercel project settings.
4. Deploy. Vercel auto-deploys on every push after that, with preview URLs per branch.

## Working rhythm

- Build the UI fully against the sample data first. Get it looking right before touching the database.
- Keep asks small and concrete. Reference the mockup: "match the archetype rail in the mockup," "the strength bar should fill to the confidence value."
- The one rule that protects the business model: locked signals and contact details must be filtered out on the server, never just hidden in the browser. The agent knows this from CLAUDE.md, but check it when the database is wired.
- Keep `CLAUDE.md` updated as decisions change. It is the memory that survives across sessions.
