# Authentication Token Refresh Flow

This document explains how our Apollo Client configuration handles authentication tokens, specifically focusing on the process of automatically refreshing expired tokens.

## Apollo Link Chain Architecture

Our Apollo Client uses a chain of links to process GraphQL operations:

```typescript
link: from([errorLink, refreshLink, authLink, httpLink])
```

Each link in this chain has a specific responsibility:

1. **errorLink**: Detects GraphQL errors, particularly authentication errors
2. **refreshLink**: Handles token refresh when needed
3. **authLink**: Adds the authentication token to requests
4. **httpLink**: Sends the request to the GraphQL server

## Flow for an Expired Token

Here's the step-by-step process that occurs when a request is made with an expired token:

1. **Initial Request**: A GraphQL operation is initiated with an expired token
2. **Error Detection**: The request flows through the link chain:
   - Goes through `errorLink` initially (no errors yet)
   - Goes through `refreshLink` (no refresh needed yet)
   - Goes through `authLink` (adds the expired token to the request)
   - Goes through `httpLink` (sends the request to the server)
3. **Auth Error**: The server rejects the request with an `UNAUTHENTICATED` error
4. **Error Handling**: The error propagates back through the chain
5. **Error Link Processing**: The `errorLink` catches the error:
   - Identifies it as an authentication error (`extensions.code === "UNAUTHENTICATED"`)
   - Marks the operation with a `_needsRefresh` header
   - Forwards the operation back through the link chain
6. **Token Refresh**: The operation reaches `refreshLink`, which:
   - Detects the `_needsRefresh` header
   - Calls `refreshTokenRequest()` to get a fresh token using the refresh token
   - Updates the tokens in localStorage
7. **Re-authentication**: The operation continues through the chain:
   - `authLink` adds the new token to the request
   - `httpLink` sends the request again with the fresh token
8. **Success**: The server processes the authenticated request

## Key Benefits

This implementation offers several advantages:

- **Seamless User Experience**: Token refresh happens automatically without user intervention
- **Separation of Concerns**: Each link has a specific responsibility
- **Efficiency**: Only tries to refresh the token when necessary
- **Resilience**: If the refresh token is invalid, the user is logged out

## Error Prevention

The implementation includes safeguards to prevent issues:

- Checks for the proper error code (`UNAUTHENTICATED`) rather than using string matching
- Avoids infinite loops by not refreshing tokens during refresh token operations
- Uses a separate client for token refresh to avoid circular dependencies
- Handles logout gracefully when refresh fails
