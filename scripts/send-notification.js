// Run by the "Bin day notification" GitHub Actions workflow.
// Computes tomorrow's bin colour and, if tomorrow is a collection day,
// sends a Web Push notification to the subscription stored in subscription.json.

const fs = require("fs");
const path = require("path");
const webpush = require("web-push");
const { DEFAULT_CONFIG, BIN_LABELS, binTypeForDate } = require("./schedule.js");

const SUB_PATH = path.join(__dirname, "..", "subscription.json");

function tomorrow() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

async function main() {
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:example@example.com";

  if (!vapidPublic || !vapidPrivate) {
    console.error("Missing VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY secrets.");
    process.exit(1);
  }

  if (!fs.existsSync(SUB_PATH)) {
    console.log("No subscription.json yet — nothing to notify. Skipping.");
    return;
  }

  const raw = fs.readFileSync(SUB_PATH, "utf8").trim();
  if (!raw || raw.startsWith("REPLACE_ME") || raw === "{}") {
    console.log("subscription.json is still a placeholder — nothing to notify. Skipping.");
    return;
  }

  let subscription;
  try {
    subscription = JSON.parse(raw);
  } catch (e) {
    console.error("subscription.json is not valid JSON:", e.message);
    process.exit(1);
  }

  const target = tomorrow();
  const binType = binTypeForDate(target, DEFAULT_CONFIG);

  if (!binType) {
    console.log("No collection tomorrow. No notification sent.");
    return;
  }

  const dateStr = target.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long"
  });

  const payload = JSON.stringify({
    title: "Bin day tomorrow",
    body: `${BIN_LABELS[binType]} — collection is ${dateStr}. Put it out before 7am.`,
    binType
  });

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  try {
    await webpush.sendNotification(subscription, payload);
    console.log("Notification sent for", dateStr, "(" + binType + ")");
  } catch (err) {
    console.error("Push failed:", err.statusCode, err.body || err.message);
    // A 404/410 means the subscription has expired or was revoked on the
    // device (e.g. app reinstalled). That's expected occasionally, not a
    // workflow bug, so don't fail the whole run over it.
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log("Subscription looks expired. Re-subscribe from the page to fix this.");
      return;
    }
    process.exit(1);
  }
}

main();
