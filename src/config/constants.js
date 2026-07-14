export const STORAGE_KEYS = {
  USER: 'alpha_auth_user',
  IS_AUTHENTICATED: 'alpha_is_authenticated',
};

export const DEMO_USERS = {
  ADMIN: {
    id: 1,
    name: 'Sarah Connor (Admin)',
    email: 'admin@alpha.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  },
  USER: {
    id: 2,
    name: 'Alex Mercer (Staff)',
    email: 'user@alpha.com',
    password: 'user123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  },
};
