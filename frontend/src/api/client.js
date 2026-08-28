const BASE_URL = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(method, path, data = null, isFormData = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const config = { method, headers };
  if (data) config.body = isFormData ? data : JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${path}`, config);
  const json = await res.json();

  if (!res.ok) {
    const err = new Error(json.message || 'Terjadi kesalahan');
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

export const api = {
  get:    (path)           => request('GET',   path),
  post:   (path, data)     => request('POST',  path, data),
  patch:  (path, data)     => request('PATCH', path, data),
  upload: (path, formData) => request('POST',  path, formData, true),
};
