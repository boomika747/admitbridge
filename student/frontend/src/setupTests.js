import '@testing-library/jest-dom';

const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = (value ?? '').toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

try {
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, configurable: true, writable: true });
} catch (e) {
  window.localStorage = mockLocalStorage;
}

try {
  Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, configurable: true, writable: true });
} catch (e) {
  globalThis.localStorage = mockLocalStorage;
}
