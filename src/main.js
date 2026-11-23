import './app.css';
import App from './App.svelte';

const API_BASE = import.meta.env.VITE_API_BASE;
if (API_BASE) {
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    if (typeof url === 'string' && url.startsWith('/api')) {
      url = API_BASE + url.slice(4);
    }
    return originalFetch.call(this, url, options);
  };
}

const app = new App({
  target: document.getElementById('app'),
});

export default app;
