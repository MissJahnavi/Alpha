export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    '/',
    '/login',
    '/unauthorized',
    '/dashboard',
    '/products',
    '/products/:id',
    '/analytics',
  ],
  [ROLES.USER]: [
    '/',
    '/login',
    '/unauthorized',
    '/products',
    '/products/:id',
  ],
};

/**
 * Checks if a specific role is allowed to access a given URL pathname.
 * Handles dynamic parameters like '/products/:id' via regex translation.
 */
export function canAccess(pathname, role) {
  if (!role) return false;
  
  const allowedPatterns = ROLE_PERMISSIONS[role] || [];
  
  return allowedPatterns.some(pattern => {
    const cleanPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexString = '^' + cleanPattern.replace(/:[^\s/]+/g, '[^/]+') + '$';
    const regex = new RegExp(regexString);
    return regex.test(pathname);
  });
}
