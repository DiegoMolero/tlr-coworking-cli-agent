# TLR Coworking booking skill

A [Claude/Copilot Skill](../README.md) that teaches an AI agent to book desks/rooms at
**TLR Coworking (Málaga)** by calling the `tlr` CLI installed on your machine.

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

Copy (or symlink) this folder into your agent's skills directory, e.g.:

```bash
# Example for a generic per-project skills folder; adjust to your agent's convention
cp -r skill ~/.claude/skills/tlr-coworking-booking
```

Once installed, you can ask your agent things like:

- "Is there a free hot desk at TLR Coworking next Tuesday morning?"
- "Book me a desk at TLR Coworking tomorrow 9 to 13."
- "What bookings do I have coming up at TLR Coworking?"
- "Cancel my TLR Coworking booking for Friday."

See [`SKILL.md`](./SKILL.md) for the exact instructions given to the agent.
