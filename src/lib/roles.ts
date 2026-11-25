// Display labels for account roles. The stored role values (e.g. "landlord") are API
// identifiers and stay unchanged; only what people read is mapped here.
const ROLE_LABELS: Record<string, string> = {
    caretaker: 'Caretaker',
    landlord: 'Host / Property Owner',
    resident: 'Resident',
    security: 'Security',
    saas_owner: 'Platform owner',
};

export function roleLabel(role: string): string {
    return ROLE_LABELS[role] ?? role.replace(/_/g, ' ');
}
