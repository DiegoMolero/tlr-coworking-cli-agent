# TLR Coworking booking skill (`/carmen-plz`)

A [Claude/Copilot Skill](../README.md) that teaches an AI agent to book desks/rooms at
**TLR Coworking (Málaga)** by calling the `tlr` CLI installed on your machine. Once installed,
invoke it directly with `/carmen-plz`, or just ask naturally and Claude will load it when relevant.

## Requirements

- `tlr` installed and available on your `PATH`:
  ```bash
  git clone https://github.com/DiegoMolero/tlr-coworking-cli-agent.git
  cd tlr-coworking-cli-agent
  npm install
  npm install -g .
  ```
- You must have already run `tlr login` yourself in a terminal — the skill will never ask for
  or handle your password. If `tlr` isn't installed when the skill is used, the agent will tell
  you to install it first instead of trying to do it for you.

## Installing this skill

The easiest way, once `tlr` is installed:

```bash
tlr skill install
```

This copies `carmen-plz/` into `~/.claude/skills/carmen-plz` (pass `--project` to install it only
for the current project, or `--force` to overwrite an existing copy).

Prefer to do it in one line without cloning first?

```bash
npx github:DiegoMolero/tlr-coworking-cli-agent skill install
```

Or copy the folder manually:

```bash
cp -r skill/carmen-plz ~/.claude/skills/carmen-plz
```

Once installed, restart Claude Code and either type `/carmen-plz` directly or just ask your
agent things like:

- "Is there a free hot desk at TLR Coworking next Tuesday morning?"
- "Book me a desk at TLR Coworking tomorrow 9 to 13."
- "What bookings do I have coming up at TLR Coworking?"
- "Cancel my TLR Coworking booking for Friday."

See [`carmen-plz/SKILL.md`](./carmen-plz/SKILL.md) for the exact instructions given to the agent.
