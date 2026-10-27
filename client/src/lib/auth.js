const ACCESS_TOKEN_KEY = 'inkwell_access_token';
const USER_KEY = 'inkwell_user';

export function saveToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}
