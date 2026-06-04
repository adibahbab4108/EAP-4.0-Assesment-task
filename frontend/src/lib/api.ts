const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Crucial for cookie-based session verification
  };

  const response = await fetch(url, config);
  
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', response.status);
  }

  return data;
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    request(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, body?: any, options?: RequestInit) => 
    request(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
    
  put: (endpoint: string, body?: any, options?: RequestInit) => 
    request(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
    
  delete: (endpoint: string, options?: RequestInit) => 
    request(endpoint, { ...options, method: 'DELETE' }),
};
