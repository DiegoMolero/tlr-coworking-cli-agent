export interface SkillInstallOptions {
    project?: boolean;
    force?: boolean;
    json?: boolean;
}
export declare function skillInstallCommand(opts: SkillInstallOptions): Promise<void>;
