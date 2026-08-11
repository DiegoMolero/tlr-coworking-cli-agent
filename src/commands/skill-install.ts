import { existsSync, cpSync, rmSync, mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import path from "node:path";
import { printError } from "../lib/format.js";

const SKILL_NAME = "carmen-plz";

export interface SkillInstallOptions {
  project?: boolean;
  force?: boolean;
  json?: boolean;
}

/** Resolves the root of the installed/cloned tlr-coworking-cli package, regardless of how it was run. */
function packageRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // dist/commands/skill-install.js -> package root is two levels up.
  return path.resolve(here, "..", "..");
}

export async function skillInstallCommand(opts: SkillInstallOptions): Promise<void> {
  try {
    const source = path.join(packageRoot(), "skill", SKILL_NAME);
    if (!existsSync(source)) {
      throw new Error(
        `Could not find the bundled skill at ${source}. Make sure you installed from the full ` +
          "git repository (git clone / npx github:DiegoMolero/tlr-coworking-cli-agent), not a " +
          "partial copy."
      );
    }

    const claudeDir = opts.project ? path.join(process.cwd(), ".claude") : path.join(homedir(), ".claude");

    // 1. The skill itself, auto-invoked by Claude when relevant, or via /carmen-plz.
    const skillTarget = path.join(claudeDir, "skills", SKILL_NAME);
    if (existsSync(skillTarget)) {
      if (!opts.force) {
        throw new Error(`${skillTarget} already exists. Re-run with --force to overwrite it.`);
      }
      rmSync(skillTarget, { recursive: true, force: true });
    }
    cpSync(source, skillTarget, { recursive: true });

    // 2. An explicit slash command at .claude/commands/carmen-plz.md, so /carmen-plz always
    //    works as a direct command even without Claude deciding to auto-invoke the skill.
    const commandsDir = path.join(claudeDir, "commands");
    const commandSource = path.join(source, "command.md");
    const commandTarget = path.join(commandsDir, `${SKILL_NAME}.md`);
    if (existsSync(commandSource)) {
      if (existsSync(commandTarget) && !opts.force) {
        throw new Error(`${commandTarget} already exists. Re-run with --force to overwrite it.`);
      }
      mkdirSync(commandsDir, { recursive: true });
      copyFileSync(commandSource, commandTarget);
    }

    const result = {
      installed: true,
      skill: skillTarget,
      command: existsSync(commandTarget) ? commandTarget : undefined,
      invoke: "/carmen-plz",
    };
    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Skill installed at ${skillTarget}`);
      if (result.command) console.log(`Command installed at ${result.command}`);
      console.log('Restart Claude Code (or start a new session) and try: /carmen-plz');
    }
  } catch (err) {
    printError(err, Boolean(opts.json));
    process.exitCode = 1;
  }
}

