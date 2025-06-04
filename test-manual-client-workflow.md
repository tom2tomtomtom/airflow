# Manual Client Creation Test

## Test Steps

1. **Open browser and navigate to app**
   - Go to http://localhost:3000
   - Should redirect to login page

2. **Login with real credentials**
   - Email: tomh@redbaez.com
   - Password: Wijlre2010
   - Click login
   - Should redirect to dashboard

3. **Navigate to clients page**
   - Go to http://localhost:3000/clients
   - Check if 401 error occurs
   - Check developer tools for network errors

4. **Test client creation**
   - Click "Add Client" button
   - Fill out the stepper form
   - Test each step of the process

5. **Debug Authentication**
   - Check browser cookies for airwave_token
   - Check localStorage for airwave_user
   - Check network requests for Authorization headers

## Expected Results

- Login should work ✅
- Dashboard should load ✅  
- Clients page should load (currently failing with 401)
- Client creation should work

## Current Issues

- /clients page returns 307 redirect to login
- Middleware authentication is failing
- Cookies are being cleared instead of set

## Debug Information

From curl test:
```
HTTP/1.1 307 Temporary Redirect
location: /login?from=%2Fclients
set-cookie: airwave_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

This shows the middleware is clearing cookies instead of reading them.