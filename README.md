# tlr-coworking-cli

Unofficial, community CLI + Claude/Copilot skill to book desks and rooms at
**TLR Coworking (Málaga)** through its member portal at
`https://family.tlr-coworking.com`, without opening a browser.

> ⚠️ **Disclaimer**: this project is **not affiliated with, endorsed by, or supported by**
> TLR Coworking or OfficeRnD. It was built by reverse-engineering the network traffic of the
> member portal (which runs on the OfficeRnD Flex platform). The API is undocumented and can
> change or break at any time without notice. Use it with **your own account**, at your own
> risk, and in line with TLR Coworking's terms of service.

## What's in this repo

- **The `tlr` CLI** (this package, at the repo root) — install it by cloning this repo, no npm
  registry required.
- **[`skill/`](./skill)** — a Claude/Copilot Skill that teaches an AI agent to use the installed
  `tlr` CLI (via its `--json` output) to check availability, book, list and cancel desks/rooms
  on your behalf, conversationally. If the CLI isn't installed yet, the skill will tell the agent
  to prompt you to install it (it will never install it or handle your password for you).

## Install the CLI

`npm install -g github:...` can unreliably fail on some npm versions due to a known npm
limitation with global installs of git dependencies (it can leave a dangling symlink to a
temporary clone directory that npm itself cleans up right after installing). The reliable way to
install is to clone the repo and install it globally from the local checkout:

```bash
git clone https://github.com/DiegoMolero/tlr-coworking-cli-agent.git
cd tlr-coworking-cli-agent
npm install
npm install -g .
```

This links the pre-built `tlr` command globally (the compiled `dist/` folder is committed to
this repo specifically so no build step is required at install time).

To update later, `cd` back into the cloned repo, `git pull`, and re-run `npm install && npm
install -g .`.

Then log in and try it out:

```bash
tlr login
tlr desks list
tlr book "Hot Desk 02" --date 2026-08-20 --start 07:00 --end 11:00
```

### Local development (instead of a global install)

```bash
git clone https://github.com/DiegoMolero/tlr-coworking-cli-agent.git
cd tlr-coworking-cli-agent
npm install
npm run build
node dist/cli.js login
npm test
```

## How authentication works

The member portal uses a classic server-side session (an Express `connect.sid` cookie), not a
bearer token/JWT. `tlr login` prompts for your email and password interactively (nothing is
echoed to the terminal or kept in shell history), sends them once to TLR Coworking's login
endpoint, and then stores **only the resulting session cookie** — never your password — securely
in your OS keychain (see [SECURITY.md](./SECURITY.md)).

## Commands (v1)

| Command | Description |
|---|---|
| `tlr login` | Interactive login, stores the session locally |
| `tlr logout` | Clears the locally stored session |
| `tlr whoami` | Shows the currently logged-in user |
| `tlr desks list [--date] [--type]` | Lists bookable desks/rooms for a date |
| `tlr book <name-or-id> --date --start --end [--title]` | Books a desk/room |
| `tlr bookings list` | Lists your upcoming bookings |
| `tlr bookings cancel <id>` | Cancels one of your bookings |

Add `--json` to any command for machine-readable output (used by the Skill).

Times: `--start`/`--end` are combined with `--date` as UTC clock times (matching how the
member portal's own calendar behaves for the Europe/Madrid office). Double check the created
booking's actual time with `tlr bookings list` if unsure.

## Using the Claude/Copilot skill (`/carmen-plz`)

Once the CLI is installed (see above) and you're logged in (`tlr login`), install the bundled
`/carmen-plz` skill for Claude Code with one command:

```bash
tlr skill install
```

This copies the skill into `~/.claude/skills/carmen-plz` (use `--project` to install it only for
the current project, or `--force` to overwrite an existing copy). Restart Claude Code and either
invoke it directly with `/carmen-plz` or just ask naturally, e.g. "book me a desk at TLR
Coworking tomorrow 9 to 13" — Claude loads the skill automatically when relevant.

Prefer not to clone the repo first? You can install the CLI **and** the skill in one shot with
`npx`:

```bash
npx github:DiegoMolero/tlr-coworking-cli-agent skill install
```

This fetches the repo into npx's cache and runs `tlr skill install` from there — it does not
install `tlr` itself globally, so you'll still want to follow the "Install" steps above once to
get the `tlr` command on your `PATH` for the skill to actually call.

See [`skill/README.md`](./skill/README.md) for details and
[`skill/carmen-plz/SKILL.md`](./skill/carmen-plz/SKILL.md) for the exact instructions given to
the agent.

## Status

All v1 commands (`login`, `logout`, `whoami`, `desks list`, `book`, `bookings list`,
`bookings cancel`) have been implemented and manually verified end-to-end against the real
TLR Coworking member portal.

## Contributing

No personal data (emails, passwords, session cookies, member/organization IDs beyond the public
ones already used in this repo) should ever be committed. Tests use mocked HTTP responses with
fake/anonymized fixtures — no real credentials are required to run the test suite. See
[SECURITY.md](./SECURITY.md) for more details.

**Important**: the compiled `dist/` folder is committed to this repository on purpose, so that
`npm install -g .` works right after cloning, without a separate build step. If you change
anything under `src/`, run `npm run build` and commit the updated `dist/` output together with
your source change.
