const KEY = "findit_token";

export const tokenStore = {
  get: () => localStorage.getItem(KEY) || sessionStorage.getItem(KEY),
  set: (token, remember) => {
    tokenStore.clear();
    (remember ? localStorage : sessionStorage).setItem(KEY, token);
  },
  clear: () => {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  },
};


