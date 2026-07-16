# Bin day — hosted version with notifications

A static bin-collection page (GitHub Pages) paired with a scheduled GitHub
Actions job that sends a push notification the evening before collection —
even when the app isn't open.

Schedule logic is verified against the official Sheffield council calendar
(downloaded 21 June 2026): all 49 listed collections through 31 May 2027
match the weekly black/recycling-alternating pattern this uses.

## One-time setup (about 10 minutes)

### 1. Create the repository
- Go to github.com → **New repository**. Any name, e.g. `bin-day`. Public is
  simplest (unlimited free Actions minutes); private also works fine — this
  job runs once a week and stays well within the free tier either way.
- Upload every file in this folder, keeping the same structure:
  ```
  index.html
  sw.js
  subscription.json
  package.json
  scripts/schedule.js
  scripts/send-notification.js
  .github/workflows/notify.yml
  ```
  Easiest way: on the new repo's page, click **uploading an existing file**
  and drag the whole folder in (GitHub preserves the subfolders).

### 2. Turn on GitHub Pages
- **Settings → Pages**
- Under **Build and deployment**, source: **Deploy from a branch**
- Branch: **main**, folder: **/ (root)** → **Save**
- After a minute, your URL appears at the top: `https://<you>.github.io/<repo>/`

### 3. Add your VAPID keys as repository secrets
These were generated for this project. The public key is already built into
`index.html`; the private key must **only** go here — never into a file in
the repo itself.

- **Settings → Secrets and variables → Actions → New repository secret**,
  add three secrets:

  | Name | Value |
  |---|---|
  | `VAPID_PUBLIC_KEY` | `BPJZ2LYp_de01REl2XhnBUBIZQW214efnf7BzayhG3EeGJrOsH2d0gqAhKNovnImdSskLADwTCuRra9he436Nug` |
  | `VAPID_PRIVATE_KEY` | `C37AcQ9eyIdYacNv-787bRkLyzJ1uLgXZRQvcvS07nA` |
  | `VAPID_SUBJECT` | `mailto:you@example.com` (any email — required by the push protocol, not used to contact you) |

### 4. Enable notifications on your phone
- Open your Pages URL on Android Chrome (add it to your home screen too —
  see below).
- Open the **Notifications** panel → **Enable notifications** → allow the
  permission prompt.
- The page shows your subscription data and an **Open subscription.json on
  GitHub** link. Tap it, select all, paste, then **Commit changes…**.
- That's it — the workflow will now find a real subscription instead of the
  placeholder.

### 5. Add to your home screen
Chrome menu (⋮) → **Add to Home screen** → **Install**.

## How the schedule works

- Every Sunday at 15:00 UTC (4pm BST / 3pm GMT), the Action checks tomorrow's
  date against the verified pattern and, if it's a collection day, sends the
  notification.
- You can trigger it manually any time to test: **Actions tab → "Bin day
  notification" → Run workflow**. It'll only actually send if tomorrow
  happens to be a real collection day — check the run's log either way.
- If the council issues a new calendar (typically each April) or a bank
  holiday shifts a date, update the schedule the same way as the local
  version: open the page's **Adjust your schedule** panel and enter one new
  verified recycling date.

## Notes and limits

- **Cron timing isn't exact.** GitHub's scheduler is best-effort and can run
  a few minutes late at busy times. Fine for an evening-before reminder, not
  meant for second-precision alerts.
- **One subscription at a time.** `subscription.json` holds a single
  device's subscription. If you re-subscribe from a new phone or after
  clearing browser data, repeat step 4 to overwrite it.
- **If a push fails with "expired"** (visible in the Action's log), your
  subscription has lapsed — usually after clearing site data or a long
  period offline. Just re-subscribe from the page.
- Keep `VAPID_PRIVATE_KEY` out of any committed file. It's only ever read
  from the encrypted repository secret at run time.
