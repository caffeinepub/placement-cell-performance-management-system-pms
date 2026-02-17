/**
 * Centralized, standardized user-facing messages for authentication and authorization flows.
 * Ensures consistent English phrasing across login, role guards, and access-denied screens.
 */

export const authMessages = {
  roleMismatch: {
    admin: 'This Internet Identity is not assigned the Placement Admin role.',
    assistant: 'This Internet Identity is not assigned the Placement Assistance Team role.',
  },
  unassigned: {
    adminAlreadyExists: 'No admin role assigned. The first admin has already been created. Please contact an administrator to assign you the Placement Admin role.',
    assistantNeedsAssignment: 'No role assigned. Please contact an administrator to assign you the Placement Assistance Team role.',
    generic: 'You do not have a role assigned. Please contact an administrator to grant you access.',
  },
  verificationError: 'An error occurred while verifying your credentials. Please try logging in again.',
  logoutAction: 'Log out and try again',
} as const;
