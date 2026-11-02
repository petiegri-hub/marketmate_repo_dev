# MarketMate account setup

The app already contains email/password sign-up and sign-in, password reset, Google and Apple OAuth buttons, and per-user cloud workspace saving. These features need a Supabase project before they can authenticate real users. Google and Apple also need OAuth credentials from their developer consoles; the buttons cannot work with placeholder credentials.

## 1. Create and connect Supabase

1. Create a Supabase project and open its SQL Editor.
2. Run `supabase-schema.sql` once. It creates the `user_workspaces` table and row-level security policies. The policies let authenticated users access only the row whose `user_id` matches their account.
3. In Supabase project settings, copy the Project URL and publishable/anon key.
4. Create a local `.env` file next to `package.json` using `.env.example` as the template. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to those values.
5. Never put a Supabase `service_role` key, Google client secret, or Apple signing secret in a `VITE_` variable or browser code. Keep provider secrets in Supabase's Auth provider settings.
6. Restart the local Vite server after changing `.env`.

## 2. Set redirect URLs

In Supabase, open **Authentication → URL Configuration**. Set the Site URL to the local app while developing (`http://localhost:5173`) and add `http://localhost:5173/**` to the redirect URL allow list. Later add the deployed site URL and its callback pattern there as well.

## 3. Configure Google sign-in

1. Create a project in Google Cloud and configure the OAuth consent screen / Google Auth Platform audience.
2. Create an OAuth client with application type **Web application**.
3. Add `http://localhost:5173` as an authorized JavaScript origin.
4. Add the Supabase Google provider callback URL as an authorized redirect URI. Copy the exact URL shown on the Google provider page in the Supabase dashboard; it normally has the form `https://<project-ref>.supabase.co/auth/v1/callback`.
5. Copy the Google client ID and client secret into **Supabase → Authentication → Providers → Google** and enable the provider.

For production, add the final site origin in Google and in Supabase's redirect URL allow list. Do not publish the Google client secret.

## 4. Configure Apple sign-in

Apple web sign-in requires Apple Developer identifiers and a signing key in addition to Supabase settings:

1. In Apple Developer, create an App ID and enable **Sign in with Apple**.
2. Create a **Services ID** for the website and configure its website domain and return URL. Use the Supabase project domain and the exact callback URL shown by Supabase (normally `https://<project-ref>.supabase.co/auth/v1/callback`).
3. Create a Sign in with Apple key and note the Key ID and Team ID.
4. Configure the Apple provider in Supabase with the Services ID, Team ID, Key ID, and generated client secret; enable the provider.
5. Keep the `.p8` signing key and generated secret private. Apple OAuth client secrets must be rotated every six months; set a reminder.

Apple's provider setup has more moving parts than Google's. Follow [Supabase's current Apple setup guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple) if its dashboard labels differ.

## 5. Verify account flows

With Supabase configured, check each item in the local app:

- Register with email and password, then confirm the email.
- Sign out and sign in with the new account.
- Request a password reset, open the email link, set a new password, and sign in again.
- Complete Google sign-in and Apple sign-in.
- Create a post and edit the brand profile, reload the app, then verify that both are still present.
- Sign in as a second account and confirm it cannot see the first account's workspace.

Email delivery may need a custom SMTP provider before inviting real users. Configure every final site origin in Supabase's redirect allow list before publishing.
