// Super Admin Access Control
// Only these specific emails can access the admin panel

const SUPER_ADMIN_EMAILS = [
  'somasree4746@gmail.com',  // Your email
  'admin@lpu.co.in',         // Default admin account
  // Add more authorized emails here if needed
];

/**
 * Check if a user has super admin access
 * @param userEmail - The user's email address
 * @returns boolean - true if user has super admin access
 */
export const isSuperAdmin = (userEmail?: string): boolean => {
  if (!userEmail) return false;
  return SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase());
};

/**
 * Check if a user can access admin features
 * @param user - The user object
 * @returns boolean - true if user can access admin features
 */
export const canAccessAdmin = (user?: any): boolean => {
  if (!user) return false;
  
  // Must have admin role AND be in the super admin list
  return user.role === 'admin' && isSuperAdmin(user.email);
};

/**
 * Get admin access level for a user
 * @param user - The user object
 * @returns string - The access level
 */
export const getAdminAccessLevel = (user?: any): 'none' | 'admin' | 'super_admin' => {
  if (!user) return 'none';
  
  if (canAccessAdmin(user)) {
    return isSuperAdmin(user.email) ? 'super_admin' : 'admin';
  }
  
  return 'none';
};

export default {
  isSuperAdmin,
  canAccessAdmin,
  getAdminAccessLevel,
  SUPER_ADMIN_EMAILS
};
