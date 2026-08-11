/**
 * Non-secret configuration for TLR Coworking (Malaga) on OfficeRnD Flex.
 * These IDs are public identifiers of the organization/office, not personal data.
 */
export const config = {
    baseUrl: "https://family.tlr-coworking.com",
    orgSlug: "tlr-coworking",
    // Malaga office id, as seen in the public member portal traffic.
    officeId: "5a2abf4f3f2e6b160028493a",
    timezone: "Europe/Madrid",
};
export function apiPath(path) {
    return `${config.baseUrl}/community/i/organizations/${config.orgSlug}${path}`;
}
//# sourceMappingURL=config.js.map