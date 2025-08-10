// lib/types/user/index.ts
export * from './User';           // Export the core User type
export * from './UserProfile';    // Export UserProfile, UpdateUserProfileDto, and all nested types defined within it
// If you separate nested types into their own files (e.g., UserExperience.ts),
// you would add export statements for them here too:
// export * from './UserExperience';
// export from './UserSkill';
// ... etc.