const { createAuthClient } = require('better-auth/react');
const authClient = createAuthClient({ baseURL: process.env.BETTER_AUTH_URL });
console.log('authClient:', authClient);
console.log('authClient baseURL:', authClient.baseURL);