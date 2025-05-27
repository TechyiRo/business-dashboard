export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE" | "VIEWER"

export interface Permission {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canDownload: boolean
}

export const getPermissions = (role: UserRole): Permission => {
  switch (role) {
    case "ADMIN":
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canDownload: true,
      }
    case "MANAGER":
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canDownload: true,
      }
    case "EMPLOYEE":
      return {
        canView: true,
        canCreate: true,
        canEdit: false,
        canDelete: false,
        canDownload: false,
      }
    default:
      return {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canDownload: false,
      }
  }
}

export const hasPermission = (role: UserRole, action: keyof Permission): boolean => {
  const permissions = getPermissions(role)
  return permissions[action]
}
