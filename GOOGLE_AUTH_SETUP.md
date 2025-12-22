# Google OAuth Setup for GIF Stash

Follow these steps to enable Google Sign-In for your GIF Stash app.

---

## Step 1: Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **GIF Stash** project
3. In the left sidebar, click **Authentication**
4. Click the **Providers** tab
5. Scroll down to find **Google**
6. Toggle it **ON**
7. **Note the Callback URL** shown (you'll need this for Google Cloud Console)
   - Format: `https://<your-project-ref>.supabase.co/auth/v1/callback`
8. **DO NOT SAVE YET** - we need Client ID and Secret first

---

## Step 2: Create OAuth Credentials in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**

5. If prompted, configure the **OAuth consent screen**:
   - User Type: **External**
   - App name: **GIF Stash**
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Leave default (email, profile, openid)
   - Test users: Add your email
   - Click **Save and Continue** through all steps

6. Back to **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: **GIF Stash**

7. **Authorized JavaScript origins**:
   - Add: `http://localhost:3000` (for development)
   - Add: Your production URL (e.g., `https://gif-stash.vercel.app`)

8. **Authorized redirect URIs**:
   - Add the Supabase callback URL from Step 1
   - Example: `https://abcdefgh.supabase.co/auth/v1/callback`

9. Click **CREATE**

10. **Copy the credentials**:
    - Client ID (starts with `xxx.apps.googleusercontent.com`)
    - Client Secret

---

## Step 3: Complete Supabase Configuration

1. Go back to Supabase Dashboard → Authentication → Providers → Google
2. Paste the **Client ID** from Google Cloud Console
3. Paste the **Client Secret** from Google Cloud Console
4. **Important:** Enable **"Enable manual linking"** option (toggle it ON)
   - This allows anonymous users to upgrade their accounts using `linkIdentity()`
   - Without this, Google sign-in would create a new account instead of linking
5. Click **Save**

---

## Step 4: Verify Configuration

1. The Google provider should now show as "Enabled" in Supabase
2. Your callback URL is registered in Google Cloud Console
3. Test the integration by deploying your code changes

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Ensure the Supabase callback URL is exactly as shown in the Supabase dashboard
- Check for typos in Google Cloud Console redirect URIs
- Make sure there are no trailing slashes

### Error: "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add your email as a test user if app is in testing mode

### Users can't link accounts
- Verify "Enable manual linking" is toggled ON in Supabase Google provider settings
- Check that you're using `linkIdentity()` not `signInWithOAuth()` for anonymous users

---

## Checklist

- [ ] Google provider enabled in Supabase
- [ ] OAuth credentials created in Google Cloud Console
- [ ] Authorized JavaScript origins configured (localhost + production)
- [ ] Authorized redirect URIs configured (Supabase callback URL)
- [ ] Client ID and Secret added to Supabase
- [ ] "Enable manual linking" toggled ON in Supabase
- [ ] Configuration saved

---

Once complete, your app will support Google Sign-In with automatic anonymous account upgrading!
