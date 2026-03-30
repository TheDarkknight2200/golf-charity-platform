# Fix Sign-in Redirect Task

## Plan Steps:
- [x] 1. Edit src/app/auth/page.js: Replace window.location.href with router.push('/dashboard') + router.refresh(), fix await signIn.
- [x] 2. Add debug logs.
- [x] 3. Add Supabase auth listener for robust Vercel redirect.
- [x] 4. Test & complete.

