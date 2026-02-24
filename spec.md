# Specification

## Summary
**Goal:** Display a short 5-digit numeric representation of the Principal ID in the user profile instead of the full Principal ID string.

**Planned changes:**
- Add a deterministic utility function that maps any Principal ID string to a consistent zero-padded 5-digit number (00001–99999) using a hash-based algorithm
- Update the `UserProfileSection` component to display the 5-digit numeric ID instead of the full Principal ID string
- Keep the copy-to-clipboard button copying the original full Principal ID

**User-visible outcome:** Users see a compact 5-digit number in their profile where the full Principal ID was previously shown, while the copy button still copies the original full Principal ID.
