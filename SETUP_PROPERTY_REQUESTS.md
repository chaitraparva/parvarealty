# Exchange / Sell Property – Setup

1. Supabase → SQL Editor → paste `supabase/property_requests.sql` → Run.
2. Supabase → Authentication → Users → Add user for each admin (same email + password as the website admin login):
   - chaitra@parvarealty.ae
   - nagesh@parvarealty.ae
   - sushma@diagofinance.com
   (Tick "Auto confirm user".)
3. Supabase → Project Settings → API → copy Project URL and anon public key.
4. Vercel → Project → Settings → Environment Variables → add:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   Then redeploy.
5. Supabase → Authentication → URL Configuration → Site URL = https://parvarealty.ae
6. Optional: Authentication → Providers → Email → turn off "Confirm email" if clients should not have to confirm their email before submitting.

New admin later? Add them in the website "Manage Admins", AND in Supabase Auth users, AND run:
   insert into public.site_admins (email) values ('new.admin@parvarealty.ae');

Without the two Vercel variables the site runs in demo mode (requests saved only in that browser).
