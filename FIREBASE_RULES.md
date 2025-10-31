# Firebase Security Rules

This document contains the security rules you need to configure in your Firebase project.

## Firestore Rules

Navigate to **Firestore Database → Rules** in Firebase Console and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - private keys never readable by frontend
    match /users/{userId} {
      allow read: if false; // No frontend reads
      allow write: if false; // Only backend (Admin SDK) can write
    }

    // Campaigns - publicly readable, backend-only writes
    match /campaigns/{campaignId} {
      allow read: if true; // Anyone can view campaigns
      allow write: if false; // Only backend can create/update
    }

    // Contributions - publicly readable, backend-only writes
    match /contributions/{contributionId} {
      allow read: if true; // Anyone can view contributions
      allow write: if false; // Only backend can record
    }

    // Processed tweets - backend only
    match /processed_tweets/{tweetId} {
      allow read: if false;
      allow write: if false;
    }

    // Pending exports - backend only
    match /pending_exports/{code} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

## Realtime Database Rules

Navigate to **Realtime Database → Rules** in Firebase Console and paste these rules:

```json
{
  "rules": {
    "key_exports": {
      "$secretPath": {
        ".read": "data.exists()",
        ".write": false
      }
    },
    ".read": false,
    ".write": false
  }
}
```

### How Realtime DB Rules Work

1. **Secret Paths**: Each export creates a random 64-character hex path (e.g., `/key_exports/7a8f3e9d...`)
2. **Read Access**: Only possible if:
   - You know the exact secret path
   - Data exists at that path
3. **Write Access**: Disabled for frontend (only backend via Admin SDK can write)
4. **No Enumeration**: Cannot list or browse paths - must know the exact random token
5. **Time-Limited**: Keys auto-delete after 30 seconds

### Security Properties

✅ **Unpredictable**: 64-char random hex = ~2^256 possible paths (impossible to guess)
✅ **One-Time**: Deleted after 30 seconds
✅ **Session-Locked**: Only the browser tab with the secret path can read it
✅ **No Browsing**: Cannot enumerate or scan for keys
✅ **Backend-Only Writes**: Frontend cannot inject fake keys

## Testing Rules

After setting rules, test them in the Firebase Console:

### Firestore Tests

```javascript
// Should FAIL - frontend cannot read user private keys
get(/databases/$(database)/documents/users/someUserId)

// Should SUCCEED - anyone can read campaigns
get(/databases/$(database)/documents/campaigns/someCampaignId)

// Should SUCCEED - anyone can read contributions
get(/databases/$(database)/documents/contributions/someContributionId)
```

### Realtime DB Tests

```json
// Should FAIL - cannot list key_exports
".read": "root.child('key_exports').exists()"

// Should FAIL - cannot write to key_exports from frontend
".write": "true"

// Should SUCCEED - can read if you know the exact secret path and data exists
".read": "root.child('key_exports/abc123...').val() != null"
```

## Important Notes

⚠️ **Never relax these rules** - they're critical for security
⚠️ **Private keys are never exposed** to frontend except during 30s export window
⚠️ **Backend uses Admin SDK** which bypasses all rules
⚠️ **Secret paths are cryptographically random** - impossible to brute force

## Deployment Checklist

- [ ] Firestore rules deployed
- [ ] Realtime Database rules deployed
- [ ] Rules tested in Firebase Console
- [ ] Backend Admin SDK configured correctly
- [ ] No private keys logged anywhere
- [ ] HTTPS enforced in production
