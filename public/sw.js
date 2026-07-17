// Dummy service worker to clear any old registrations that might cause 404s
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.registration.unregister();
});
