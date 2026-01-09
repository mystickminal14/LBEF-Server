export const hasPermission = (user: any, permission: string) => {
  if (!user) return false;
  if (user.role === "SUPERADMIN" || user.role === "ADMIN") return true;
  return user.permissions.includes(permission);
};
