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
} as const;

export function apiPath(path: string): string {
  return `${config.baseUrl}/community/i/organizations/${config.orgSlug}${path}`;
}
