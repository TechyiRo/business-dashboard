"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Users, Plus, Edit, Trash2, Shield, Eye, EyeOff, Save, X, UserCheck, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/protected-route"

type User = {
  id: string
  username: string
  role: string
  isActive: boolean
  createdAt: string
  permissions?: {
    dashboard: string
    employees: string
    products: string
    inventory: string
    companies: string
    tasks: string
    workUpdates: string
    reports: string
    credentials: string
    settings: string
    canDownload: boolean
    canManageUsers: boolean
    canViewAllTasks: boolean
    canViewOwnTasks: boolean
    canEditOwnTasks: boolean
    canEditAllTasks: boolean
    canCreateTasks: boolean
    canDeleteTasks: boolean
  }
}

const modules = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "employees", label: "Employees", icon: "👥" },
  { key: "products", label: "Products", icon: "📦" },
  { key: "inventory", label: "Product Inventory", icon: "📋" },
  { key: "companies", label: "Companies", icon: "🏢" },
  { key: "tasks", label: "Tasks", icon: "✅" },
  { key: "workUpdates", label: "Work Updates", icon: "📝" },
  { key: "reports", label: "Reports", icon: "📈" },
  { key: "credentials", label: "Credentials", icon: "🔐" },
  { key: "settings", label: "Settings", icon: "⚙️" },
]

const permissionLevels = [
  { value: "NONE", label: "No Access", color: "bg-gray-500" },
  { value: "READ", label: "Read Only", color: "bg-blue-500" },
  { value: "WRITE", label: "Read & Write", color: "bg-yellow-500" },
  { value: "FULL", label: "Full Access", color: "bg-green-500" },
]

const roleOptions = [
  { value: "ADMIN", label: "👑 Administrator", description: "Full system access and user management" },
  { value: "FULL_ACCESS", label: "🔓 Full Access", description: "Full access to all modules" },
  {
    value: "WORK_EDITOR",
    label: "📝 Work Editor",
    description: "Can add/edit work updates, read-only for everything else",
  },
  { value: "READ_ONLY", label: "👁️ Read Only", description: "Read-only access to all modules" },
  { value: "TASK_USER", label: "✅ Task User", description: "Limited to tasks module only" },
  { value: "CUSTOM", label: "🎯 Custom", description: "Custom permissions per module" },
]

export default function UserManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "READ_ONLY",
    isActive: true,
    permissions: {
      dashboard: "NONE",
      employees: "NONE",
      products: "NONE",
      inventory: "NONE",
      companies: "NONE",
      tasks: "NONE",
      workUpdates: "NONE",
      reports: "NONE",
      credentials: "NONE",
      settings: "NONE",
      canDownload: false,
      canManageUsers: false,
      canViewAllTasks: false,
      canViewOwnTasks: true,
      canEditOwnTasks: false,
      canEditAllTasks: false,
      canCreateTasks: false,
      canDeleteTasks: false,
    },
  })

  // Check if user is admin and authenticated
  useEffect(() => {
    console.log("UserManagement: Auth state check:", { user, isAuthenticated, isLoading })

    // If still loading, wait
    if (isLoading) {
      console.log("UserManagement: Still loading auth state...")
      return
    }

    // If not authenticated, redirect will be handled by AuthProvider
    if (!isAuthenticated) {
      console.log("UserManagement: User not authenticated")
      setLoading(false)
      return
    }

    // If user doesn't have admin access, redirect to settings
    if (user && user.role !== "ADMIN" && user.username !== "sp it") {
      console.log("UserManagement: User doesn't have admin access, redirecting to settings")
      router.push("/settings")
      return
    }

    // If user is admin, fetch users
    if (user && (user.role === "ADMIN" || user.username === "sp it")) {
      console.log("UserManagement: User is admin, fetching users")
      fetchUsers()
    }
  }, [user, isAuthenticated, isLoading, router])

  const fetchUsers = async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated || !user) {
      console.log("UserManagement: Not authenticated, skipping user fetch")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log("UserManagement: Fetching users...")

      const response = await fetch("/api/users", {
        credentials: "include",
      })

      console.log("UserManagement: Fetch response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("UserManagement: Users fetched successfully:", data.length, "users")
        setUsers(data)
      } else if (response.status === 401 || response.status === 403) {
        console.log("UserManagement: Unauthorized, user may have been logged out")
        // Don't throw error, just set empty users
        setUsers([])
      } else {
        console.log("UserManagement: Failed to fetch users, status:", response.status)
        setUsers([])
      }
    } catch (error) {
      console.error("UserManagement: Error fetching users:", error)
      // Don't show error toast if user is not authenticated
      if (isAuthenticated && user) {
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        })
      }
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchUsers()
        setIsCreateDialogOpen(false)
        resetForm()
        toast({
          title: "Success",
          description: "User created successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create user")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchUsers()
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        resetForm()
        toast({
          title: "Success",
          description: "User updated successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to update user")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        await fetchUsers()
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
        toast({
          title: "Success",
          description: "User deleted successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete user")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      role: "READ_ONLY",
      isActive: true,
      permissions: {
        dashboard: "NONE",
        employees: "NONE",
        products: "NONE",
        inventory: "NONE",
        companies: "NONE",
        tasks: "NONE",
        workUpdates: "NONE",
        reports: "NONE",
        credentials: "NONE",
        settings: "NONE",
        canDownload: false,
        canManageUsers: false,
        canViewAllTasks: false,
        canViewOwnTasks: true,
        canEditOwnTasks: false,
        canEditAllTasks: false,
        canCreateTasks: false,
        canDeleteTasks: false,
      },
    })
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      password: "",
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions || {
        dashboard: "NONE",
        employees: "NONE",
        products: "NONE",
        inventory: "NONE",
        companies: "NONE",
        tasks: "NONE",
        workUpdates: "NONE",
        reports: "NONE",
        credentials: "NONE",
        settings: "NONE",
        canDownload: false,
        canManageUsers: false,
        canViewAllTasks: false,
        canViewOwnTasks: true,
        canEditOwnTasks: false,
        canEditAllTasks: false,
        canCreateTasks: false,
        canDeleteTasks: false,
      },
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const updatePermission = (module: string, level: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: level,
      },
    }))
  }

  const updateSpecialPermission = (permission: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    }))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500"
      case "FULL_ACCESS":
        return "bg-green-500"
      case "WORK_EDITOR":
        return "bg-yellow-500"
      case "READ_ONLY":
        return "bg-blue-500"
      case "TASK_USER":
        return "bg-purple-500"
      case "CUSTOM":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPermissionBadgeColor = (permission: string) => {
    const level = permissionLevels.find((p) => p.value === permission)
    return level?.color || "bg-gray-500"
  }

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-red border-t-transparent"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Show access denied if user is not admin
  if (!user || (user.role !== "ADMIN" && user.username !== "sp it")) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                <p className="text-gray-600">You don't have permission to access user management.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-sp-red" />
              User Management
            </h1>
            <p className="text-gray-600 mt-2">Manage users, roles, and permissions</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-sp-red hover:bg-sp-red/90">
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Users
            </CardTitle>
            <CardDescription>Manage user accounts and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-red border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users found or unable to load users.</p>
                    <Button onClick={fetchUsers} variant="outline" className="mt-2">
                      Retry
                    </Button>
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-sp-blue to-sp-red text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{user.username}</h3>
                            <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                              {roleOptions.find((r) => r.value === user.role)?.label || user.role}
                            </Badge>
                            {user.isActive ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <UserCheck className="mr-1 h-3 w-3" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                <UserX className="mr-1 h-3 w-3" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.username !== "sp it" && (
                          <Button variant="outline" size="sm" onClick={() => openDeleteDialog(user)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Create a new user account with specific permissions</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">User Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Account Active</Label>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Module Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((module) => (
                      <div key={module.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{module.icon}</span>
                          <span className="font-medium">{module.label}</span>
                        </div>
                        <Select
                          value={formData.permissions[module.key as keyof typeof formData.permissions] as string}
                          onValueChange={(value) => updatePermission(module.key, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${level.color}`} />
                                  {level.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Special Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canDownload">Can Download Data</Label>
                      <Switch
                        id="canDownload"
                        checked={formData.permissions.canDownload}
                        onCheckedChange={(checked) => updateSpecialPermission("canDownload", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canManageUsers">Can Manage Users</Label>
                      <Switch
                        id="canManageUsers"
                        checked={formData.permissions.canManageUsers}
                        onCheckedChange={(checked) => updateSpecialPermission("canManageUsers", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Task-Specific Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canViewAllTasks">Can View All Tasks</Label>
                      <Switch
                        id="canViewAllTasks"
                        checked={formData.permissions.canViewAllTasks}
                        onCheckedChange={(checked) => updateSpecialPermission("canViewAllTasks", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canEditOwnTasks">Can Edit Own Tasks</Label>
                      <Switch
                        id="canEditOwnTasks"
                        checked={formData.permissions.canEditOwnTasks}
                        onCheckedChange={(checked) => updateSpecialPermission("canEditOwnTasks", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canCreateTasks">Can Create Tasks</Label>
                      <Switch
                        id="canCreateTasks"
                        checked={formData.permissions.canCreateTasks}
                        onCheckedChange={(checked) => updateSpecialPermission("canCreateTasks", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="canDeleteTasks">Can Delete Tasks</Label>
                      <Switch
                        id="canDeleteTasks"
                        checked={formData.permissions.canDeleteTasks}
                        onCheckedChange={(checked) => updateSpecialPermission("canDeleteTasks", checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleCreateUser} className="bg-sp-red hover:bg-sp-red/90">
                <Save className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
              <DialogDescription>Update user account and permissions</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-username">Username</Label>
                    <Input
                      id="edit-username"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
                    <div className="relative">
                      <Input
                        id="edit-password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-role">User Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="edit-isActive">Account Active</Label>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Module Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((module) => (
                      <div key={module.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{module.icon}</span>
                          <span className="font-medium">{module.label}</span>
                        </div>
                        <Select
                          value={formData.permissions[module.key as keyof typeof formData.permissions] as string}
                          onValueChange={(value) => updatePermission(module.key, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${level.color}`} />
                                  {level.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Special Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-canDownload">Can Download Data</Label>
                      <Switch
                        id="edit-canDownload"
                        checked={formData.permissions.canDownload}
                        onCheckedChange={(checked) => updateSpecialPermission("canDownload", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-canManageUsers">Can Manage Users</Label>
                      <Switch
                        id="edit-canManageUsers"
                        checked={formData.permissions.canManageUsers}
                        onCheckedChange={(checked) => updateSpecialPermission("canManageUsers", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Task-Specific Permissions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-canViewAllTasks">Can View All Tasks</Label>
                      <Switch
                        id="edit-canViewAllTasks"
                        checked={formData.permissions.canViewAllTasks}
                        onCheckedChange={(checked) => updateSpecialPermission("canViewAllTasks", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-canEditOwnTasks">Can Edit Own Tasks</Label>
                      <Switch
                        id="edit-canEditOwnTasks"
                        checked={formData.permissions.canEditOwnTasks}
                        onCheckedChange={(checked) => updateSpecialPermission("canEditOwnTasks", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-canCreateTasks">Can Create Tasks</Label>
                      <Switch
                        id="edit-canCreateTasks"
                        checked={formData.permissions.canCreateTasks}
                        onCheckedChange={(checked) => updateSpecialPermission("canCreateTasks", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-canDeleteTasks">Can Delete Tasks</Label>
                      <Switch
                        id="edit-canDeleteTasks"
                        checked={formData.permissions.canDeleteTasks}
                        onCheckedChange={(checked) => updateSpecialPermission("canDeleteTasks", checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} className="bg-sp-red hover:bg-sp-red/90">
                <Save className="mr-2 h-4 w-4" />
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the user "{selectedUser?.username}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}
