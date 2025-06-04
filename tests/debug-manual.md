# Manual Testing Steps

Based on Playwright debugging, let me test manually:

## Current Status
- ✅ Login works and sets `sb-fdsjlutmfaatslznjxiv-auth-token` cookie
- ✅ LocalStorage has user data
- ❌ `/clients` page gives 401 and redirects to login
- ❌ Middleware can't read the session properly

## Manual Test Plan

1. **Open browser to http://localhost:3000**
2. **Login with tomh@redbaez.com / Wijlre2010**
3. **Check browser dev tools:**
   - Application > Cookies: Look for `sb-fdsjlutmfaatslznjxiv-auth-token`
   - Application > Local Storage: Check `airwave_user`
4. **Navigate to /clients manually**
5. **Check Network tab for API calls**

## Key Debugging Questions

1. Is the cookie name consistent between client and server?
2. Is the middleware reading the right cookie?
3. Is there a domain/path mismatch on cookies?
4. Are there any CORS issues?

## Expected vs Actual

**Expected**: Session persists, /clients loads with client data
**Actual**: Session lost, redirected to login

## Next Steps

If manual testing works but Playwright fails:
- Playwright cookie handling issue
- Different user agent or headers

If manual testing also fails:
- Server-side session validation bug
- Cookie configuration issue