# UniPlace Manager Deployment Guide

This document describes how to deploy the UniPlace Manager system to the Internet Computer.

## Deployment Process

The UniPlace Manager is deployed automatically through the Caffeine.ai platform. When you request a deployment, the system:

1. Builds the frontend React application
2. Deploys the backend Motoko canister to the Internet Computer
3. Generates a public preview URL for accessing the live application

## Accessing Your Deployment

After deployment completes, you will receive a **public preview URL** that allows you to access your live UniPlace Manager system directly in any web browser.

No downloads or local installations are required - the system runs entirely on the Internet Computer blockchain.

## Triggering a Fresh Redeploy

If you encounter HTTP 400 errors or the preview URL becomes invalid:

1. Request a fresh redeploy through the Caffeine.ai interface
2. Wait for the build and deployment process to complete
3. A new public preview URL will be generated
4. Open the new URL in your browser to verify it loads correctly

This process creates a clean deployment and resolves most gateway or URL registration issues.

## User Roles

The system supports two user roles:

- **Admin**: Full access to create goals, reviews, feedback, competencies, and development plans
- **Placement Assistance Team**: View and interact with assigned items only

## First-Time Setup

1. Open the public preview URL in your browser
2. Select your role (Admin or Assistance)
3. Log in using Internet Identity
4. Complete your profile setup (name, email, department)
5. Start using the system

## Troubleshooting

### HTTP 400 Error
- Try reloading the page once or twice
- Open the URL in a different browser or incognito window
- If the error persists, request a fresh redeploy

### Preview URL Not Loading
- Verify you're using the exact URL provided after deployment
- Check your internet connection
- Request a fresh redeploy to generate a new URL

## Notes

- All user-facing text is in English
- The system uses Internet Identity for secure authentication
- Data is stored on the Internet Computer blockchain
- Each redeploy may generate a new preview URL
- No application features or UI are changed during redeployment

---

**Last Updated**: February 15, 2026
