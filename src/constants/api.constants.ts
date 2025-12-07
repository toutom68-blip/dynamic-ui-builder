/**
 * General API constants shared across the application
 */

export const API_BASE = {
  AUTH: '/auth',
  API_AUTH: '/auth',
  API_USER: '/user',
  API_SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
} as const;

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  LANGUAGE: 'language',
  THEME: 'theme',
} as const;

export const REQUEST_HEADERS = {
  NO_LOADING: 'x-no-loading',
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
} as const;

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
} as const;
