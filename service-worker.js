// 🔹 Register Service Worker & handle updates properly
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('✅ Service Worker registered');

      const showToast = (msg) => {
        const toast = document.getElementById('updateToast');
        if (!toast) return;
        toast.textContent = msg;
        toast.style.display = 'block';
      };

      // --- Check for waiting SW (new version available) ---
      if (reg.waiting) {
        showToast('🔄 A new version is available — updating...');
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // --- Detect new worker installation ---
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showToast('🔄 A new version is available — updating...');
            setTimeout(() => {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }, 1500);
          }
        });
      });

      // --- Listen for message from SW ---
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NEW_VERSION') {
          console.log('🆕 New version detected, reloading...');
          setTimeout(() => {
            caches.keys()
              .then(keys => Promise.all(keys.map(k => caches.delete(k))))
              .finally(() => location.reload(true));
          }, 1500);
        }
      });

      // --- Manual periodic check every 5 minutes ---
      setInterval(() => {
        if (reg.active) reg.active.postMessage('checkForUpdate');
      }, 300000);

    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  });
}
