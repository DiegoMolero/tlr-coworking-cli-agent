# Security

This project talks to the unofficial, undocumented API behind
`https://family.tlr-coworking.com` (an OfficeRnD Flex member portal). Please read this before
using or contributing to it.

## How your credentials are handled

- `tlr login` prompts for your email and password **interactively** (the password is masked and
  is never written to shell history or logs).
- Your password is sent **once**, directly from your machine to
  `https://family.tlr-coworking.com`, over HTTPS, to authenticate. It is **never stored** on
  disk, in the keychain, or anywhere else by this CLI.
- On success, the server responds with a session cookie (`connect.sid`). This is the **only**
  secret the CLI persists locally, because it's what's needed to make subsequent authenticated
  requests (list desks, book, cancel, ...) without asking for your password every time.

## Where the session is stored

- **Primary**: the OS-native credential store, via
  [`@napi-rs/keyring`](https://github.com/Brooooooklyn/keyring-node):
  - macOS: Keychain
  - Windows: Credential Manager
  - Linux: Secret Service (libsecret) — requires a running secret service (e.g. GNOME Keyring,
    KWallet); many headless/server Linux setups won't have one.
- **Fallback**: if the OS keyring is unavailable, the session is written to
  `~/.config/tlr-coworking-cli/session.json` with file permissions restricted to the current
  user (`0600`). The CLI prints a warning when this fallback is used.
- `tlr logout` removes the session from whichever backend was used to store it.

## What happens if the session expires or is revoked

The TLR Coworking portal will reject requests with an expired/invalid cookie with `401
Unauthorized`. The CLI surfaces this as a clear "Not logged in" error — simply run `tlr login`
again.

## Reporting a vulnerability

This is a small, community-maintained, unofficial tool. If you find a security issue (e.g. a way
credentials could leak, or a way this CLI could be tricked into acting on someone else's
account), please open a private security advisory on the GitHub repository instead of a public
issue.

## For contributors

- **Never commit** real emails, passwords, session cookies, or member/organization IDs beyond
  the ones already public in this codebase (the TLR Coworking org slug and office id, which are
  not personal data).
- Tests must use mocked HTTP responses with fake/anonymized fixtures. No real account should ever
  be required to run `npm test`.
- If you need to capture new/changed endpoints from the browser's Network tab to fix or extend
  the CLI, **redact cookies, emails, and any personal identifiers** before sharing them in an
  issue or pull request.
