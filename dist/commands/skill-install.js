import { existsSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import path from "node:path";
import { printError } from "../lib/format.js";
const SKILL_NAME = "carmen-plz";
/** Resolves the root of the installed/cloned tlr-coworking-cli package, regardless of how it was run. */
function packageRoot() {
    const here = path.dirname(fileURLToPath(import.meta.url));
    // dist/commands/skill-install.js -> package root is two levels up.
    return path.resolve(here, "..", "..");
}
export async function skillInstallCommand(opts) {
    try {
        const source = path.join(packageRoot(), "skill", SKILL_NAME);
        if (!existsSync(source)) {
            throw new Error(`Could not find the bundled skill at ${source}. Make sure you installed from the full ` +
                "git repository (git clone / npx github:DiegoMolero/tlr-coworking-cli-agent), not a " +
                "partial copy.");
        }
        const targetDir = opts.project
            ? path.join(process.cwd(), ".claude", "skills")
            : path.join(homedir(), ".claude", "skills");
        const target = path.join(targetDir, SKILL_NAME);
        if (existsSync(target)) {
            if (!opts.force) {
                throw new Error(`${target} already exists. Re-run with --force to overwrite it.`);
            }
            rmSync(target, { recursive: true, force: true });
        }
        cpSync(source, target, { recursive: true });
        const result = { installed: true, target, command: "/carmen-plz" };
        if (opts.json) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log(`Skill installed at ${target}`);
            console.log('Restart Claude Code (or start a new session) and try: /carmen-plz');
        }
    }
    catch (err) {
        printError(err, Boolean(opts.json));
        process.exitCode = 1;
    }
}
//# sourceMappingURL=skill-install.js.map