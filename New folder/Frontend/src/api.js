let csrfToken

async function getCsrfToken() {
  const response = await fetch('/api/auth/csrf', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('Could not start a secure login session.')
  const result = await response.json()
  csrfToken = result.token
  return csrfToken
}

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    headers['X-XSRF-TOKEN'] = csrfToken || await getCsrfToken()
  }

  const response = await fetch(path, {
    ...options,
    method,
    credentials: 'same-origin',
    headers,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    const body = await response.text()
    try {
      const error = JSON.parse(body)
      message = error.detail || error.message || error.error || message
    } catch {
      if (body) message = body
    }
    const requestError = new Error(message)
    requestError.status = response.status
    throw requestError
  }

  if (response.status === 204) return null
  return response.json()
}

export async function login(username, password) {
  const token = await getCsrfToken()
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-XSRF-TOKEN': token,
    },
    body: new URLSearchParams({ username, password }),
  })

  if (!response.ok) {
    throw new Error(response.status === 401
      ? 'The username or password is incorrect.'
      : 'Sign-in failed. Please try again.')
  }

  csrfToken = undefined
  await getCsrfToken()
  return getCurrentUser()
}

export const getCurrentUser = () => request('/api/auth/me')
export const logout = () => request('/api/auth/logout', { method: 'POST' })
export const getProducts = () => request('/api/products')
export const createProduct = (product) => request('/api/products', { method: 'POST', body: JSON.stringify(product) })
export const updateProduct = (id, product) => request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(product) })
export const deleteProduct = (id) => request(`/api/products/${id}`, { method: 'DELETE' })
export const getOrders = () => request('/api/orders')
export const createOrder = (order) => request('/api/orders', { method: 'POST', body: JSON.stringify(order) })
export const getPickingTasks = () => request('/api/picking-tasks')
export const completePickingTask = (id) => request(`/api/picking-tasks/${id}/complete`, { method: 'PATCH' })
