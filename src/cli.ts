#!/usr/bin/env node
import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { whoamiCommand } from "./commands/whoami.js";
import { desksListCommand } from "./commands/desks-list.js";
import { bookCommand } from "./commands/book.js";
import { bookingsListCommand, bookingsCancelCommand } from "./commands/bookings.js";
import { skillInstallCommand } from "./commands/skill-install.js";

const program = new Command();

program
  .name("tlr")
  .description(
    "Unofficial CLI to book desks/rooms at TLR Coworking (Malaga). Not affiliated with TLR " +
      "Coworking or OfficeRnD. Use at your own risk with your own account."
  )
  .version("0.1.0");

program
  .command("login")
  .description("Log in to family.tlr-coworking.com and store the session locally")
  .option("--json", "output JSON")
  .action((opts) => loginCommand(opts));

program
  .command("logout")
  .description("Clear the locally stored session")
  .option("--json", "output JSON")
  .action((opts) => logoutCommand(opts));

program
  .command("whoami")
  .description("Show the currently logged-in user")
  .option("--json", "output JSON")
  .action((opts) => whoamiCommand(opts));

const desks = program.command("desks").description("Manage bookable desks/rooms");
desks
  .command("list")
  .description("List bookable resources (desks, meeting rooms, ...)")
  .option("--date <date>", "date in YYYY-MM-DD format (default: today)")
  .option("--type <type>", "resource type (default: hotdesk)")
  .option("--json", "output JSON")
  .action((opts) => desksListCommand(opts));

program
  .command("book <resource>")
  .description("Book a desk/room by name or id")
  .requiredOption("--date <date>", "date in YYYY-MM-DD format")
  .requiredOption("--start <time>", "start time in HH:mm (UTC)")
  .requiredOption("--end <time>", "end time in HH:mm (UTC)")
  .option("--title <title>", "booking title/summary")
  .option("--type <type>", "resource type to search within (default: hotdesk)")
  .option("--json", "output JSON")
  .action((resource, opts) => bookCommand(resource, opts));

const bookings = program.command("bookings").description("Manage your own bookings");
bookings
  .command("list")
  .description("List your upcoming bookings")
  .option("--json", "output JSON")
  .action((opts) => bookingsListCommand(opts));
bookings
  .command("cancel <bookingId>")
  .description("Cancel one of your bookings")
  .option("--json", "output JSON")
  .action((bookingId, opts) => bookingsCancelCommand(bookingId, opts));

const skill = program.command("skill").description("Manage the bundled AI agent skill (/carmen-plz)");
skill
  .command("install")
  .description("Install the /carmen-plz skill for Claude Code (or compatible agents)")
  .option("--project", "install into ./.claude/skills instead of ~/.claude/skills")
  .option("--force", "overwrite an existing installation")
  .option("--json", "output JSON")
  .action((opts) => skillInstallCommand(opts));

program.parseAsync(process.argv);
