// Kill switch for the service worker that used to live at this URL.
// Anyone whose browser already registered the old SW will fetch this file on
// its next update check, install it, and activate it immediately — at which
// point it wipes all caches, unregisters itself, and reloads open tabs so
// they go back to being plain, uncontrolled page loads. Safe to remove this
// file entirely once enough time has passed that stragglers are unlikely.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) client.navigate(client.url);
    })()
  );
});
