// Service worker for Bin Day push notifications.
// Runs even when the app/tab isn't open — this is what makes the
// notification appear in the background.

const ICON = "data:image/png;base64,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";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "Bin day", body: "Check the app for your next collection." };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // Fall back to the default text above if the payload isn't JSON.
  }

  const options = {
    body: data.body,
    icon: ICON,
    badge: ICON,
    tag: "bin-day", // replaces any previous bin-day notification rather than stacking
    renotify: true,
    data: { url: "./" }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Tapping the notification opens (or focuses) the app.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
