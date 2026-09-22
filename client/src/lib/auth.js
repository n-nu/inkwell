const ACCESS_TOKEN_KEY = 'inkwell_access_token';

export function saveToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
