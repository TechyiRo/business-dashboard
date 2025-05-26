"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Plus,
  Shield,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Building,
  Key,
  User,
  Lock,
  FileText,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ProtectedRoute } from "@/components/protected-route"

type Company = {
  id: string
  name: string
  address: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

type Credential = {
  id: string
  credentialName: string
  username?: string
  password?: string
  other?: string
  isPasswordReadOnly: boolean
  companyId: string
  company: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

function CredentialsPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all") // Updated default value
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null)
  const [deletingCredentialId, setDeletingCredentialId] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    companyId: "",
    credentialName: "",
    username: "",
    password: "",
    other: "",
    isPasswordReadOnly: false,
  })

  // Password visibility states
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [showFormPassword, setShowFormPassword] = useState(false)

  // Collapsible states
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchCompanies()
    fetchCredentials()
  }, [])

  useEffect(() => {
    filterCredentials()
  }, [credentials, selectedCompanyId, searchTerm])

  async function fetchCompanies() {
    try {
      const response = await fetch("/api/companies")
      if (!response.ok) {
        // Mock companies data
        const mockCompanies: Company[] = [
          {
            id: "1",
            name: "Cerathem",
            address: "123 Ceramic Street",
            contactName: "John Ceramic",
            contactEmail: "john@cerathem.com",
            contactPhone: "555-0001",
          },
          {
            id: "2",
            name: "Tech Solutions Inc",
            address: "456 Tech Avenue",
            contactName: "Jane Tech",
            contactEmail: "jane@techsolutions.com",
            contactPhone: "555-0002",
          },
          {
            id: "3",
            name: "Digital Innovations",
            address: "789 Innovation Blvd",
            contactName: "Mike Digital",
            contactEmail: "mike@digitalinnovations.com",
            contactPhone: "555-0003",
          },
        ]
        setCompanies(mockCompanies)
        return
      }
      const data = await response.json()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast({
        title: "Error",
        description: "Failed to load companies. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function fetchCredentials() {
    try {
      setLoading(true)
      const response = await fetch("/api/credentials")

      if (!response.ok) {
        // Mock credentials data
        const mockCredentials: Credential[] = [
          {
            id: "1",
            credentialName: "Database Access",
            username: "admin_user",
            password: "secure_password_123",
            other:
              "<b>Production Database</b><br/>Connection details for the main production database. <span style='color: red;'>Handle with care!</span>",
            isPasswordReadOnly: false,
            companyId: "1",
            company: { id: "1", name: "Cerathem" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            credentialName: "API Keys",
            username: "api_service",
            password: "api_key_456789",
            other:
              "<i>Third-party API integration</i><br/><ul><li>Payment gateway access</li><li>Email service integration</li></ul>",
            isPasswordReadOnly: true,
            companyId: "1",
            company: { id: "1", name: "Cerathem" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "3",
            credentialName: "Server Access",
            username: "server_admin",
            password: "server_pass_789",
            other: "<b style='color: blue;'>Production Server</b><br/>SSH access to production environment.",
            isPasswordReadOnly: false,
            companyId: "2",
            company: { id: "2", name: "Tech Solutions Inc" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
        setCredentials(mockCredentials)
        toast({
          title: "Using Sample Data",
          description: "Database not ready. Using sample data for demonstration.",
        })
        return
      }

      const data = await response.json()
      setCredentials(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching credentials:", error)
      toast({
        title: "Error",
        description: "Failed to load credentials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function filterCredentials() {
    let filtered = credentials

    if (selectedCompanyId !== "all") {
      filtered = filtered.filter((cred) => cred.companyId === selectedCompanyId)
    }

    if (searchTerm.trim()) {
      const lowercasedSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (cred) =>
          cred.credentialName.toLowerCase().includes(lowercasedSearch) ||
          cred.username?.toLowerCase().includes(lowercasedSearch) ||
          cred.company.name.toLowerCase().includes(lowercasedSearch),
      )
    }

    setFilteredCredentials(filtered)
  }

  function resetForm() {
    setFormData({
      companyId: "",
      credentialName: "",
      username: "",
      password: "",
      other: "",
      isPasswordReadOnly: false,
    })
    setShowFormPassword(false)
  }

  function openAddModal() {
    resetForm()
    setIsAddModalOpen(true)
  }

  function openEditModal(credential: Credential) {
    setFormData({
      companyId: credential.companyId,
      credentialName: credential.credentialName,
      username: credential.username || "",
      password: credential.password || "",
      other: credential.other || "",
      isPasswordReadOnly: credential.isPasswordReadOnly,
    })
    setEditingCredential(credential)
    setIsEditModalOpen(true)
  }

  async function handleSubmit() {
    if (!formData.companyId || !formData.credentialName) {
      toast({
        title: "Validation Error",
        description: "Please select a company and enter a credential name.",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingCredential ? `/api/credentials/${editingCredential.id}` : "/api/credentials"
      const method = editingCredential ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${editingCredential ? "update" : "create"} credential`)
      }

      const savedCredential = await response.json()

      if (editingCredential) {
        setCredentials(credentials.map((cred) => (cred.id === editingCredential.id ? savedCredential : cred)))
        setIsEditModalOpen(false)
        setEditingCredential(null)
      } else {
        setCredentials([savedCredential, ...credentials])
        setIsAddModalOpen(false)
      }

      resetForm()
      toast({
        title: "Success",
        description: `Credential ${editingCredential ? "updated" : "created"} successfully.`,
      })
    } catch (error) {
      console.error("Error saving credential:", error)
      toast({
        title: "Error",
        description: `Failed to ${editingCredential ? "update" : "create"} credential. Please try again.`,
        variant: "destructive",
      })
    }
  }

  async function handleDelete() {
    if (!deletingCredentialId) return

    try {
      const response = await fetch(`/api/credentials/${deletingCredentialId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete credential")
      }

      setCredentials(credentials.filter((cred) => cred.id !== deletingCredentialId))
      setIsDeleteDialogOpen(false)
      setDeletingCredentialId(null)

      toast({
        title: "Success",
        description: "Credential deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting credential:", error)
      toast({
        title: "Error",
        description: "Failed to delete credential. Please try again.",
        variant: "destructive",
      })
    }
  }

  function togglePasswordVisibility(credentialId: string) {
    setShowPasswords((prev) => ({
      ...prev,
      [credentialId]: !prev[credentialId],
    }))
  }

  function toggleCompanyExpansion(companyId: string) {
    setExpandedCompanies((prev) => ({
      ...prev,
      [companyId]: !prev[companyId],
    }))
  }

  // Group credentials by company
  const credentialsByCompany = filteredCredentials.reduce(
    (acc, credential) => {
      const companyId = credential.companyId
      if (!acc[companyId]) {
        acc[companyId] = []
      }
      acc[companyId].push(credential)
      return acc
    },
    {} as Record<string, Credential[]>,
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Credentials Management 🔐
          </h1>
          <p className="text-muted-foreground">Securely manage company credentials and access information</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Credential
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-filter">Filter by Company</Label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="All companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search Credentials</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, username, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Display */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : Object.keys(credentialsByCompany).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(credentialsByCompany).map(([companyId, companyCredentials]) => {
            const company = companies.find((c) => c.id === companyId)
            const isExpanded = expandedCompanies[companyId] ?? true

            return (
              <Card key={companyId} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleCompanyExpansion(companyId)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building className="h-5 w-5 text-blue-600" />
                          <div>
                            <CardTitle className="text-lg">{company?.name || "Unknown Company"}</CardTitle>
                            <CardDescription>
                              {companyCredentials.length} credential{companyCredentials.length !== 1 ? "s" : ""}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{companyCredentials.length}</Badge>
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid gap-4">
                        {companyCredentials.map((credential) => (
                          <Card key={credential.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Key className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-semibold text-lg">{credential.credentialName}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {format(new Date(credential.createdAt), "MMM dd, yyyy")}
                                    </Badge>
                                  </div>

                                  {credential.username && (
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm text-muted-foreground">Username:</span>
                                      <span className="font-mono text-sm">{credential.username}</span>
                                    </div>
                                  )}

                                  {credential.password && (
                                    <div className="flex items-center gap-2">
                                      <Lock className="h-4 w-4 text-gray-500" />
                                      <span className="text-sm text-muted-foreground">Password:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm">
                                          {showPasswords[credential.id] ? credential.password : "••••••••"}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => togglePasswordVisibility(credential.id)}
                                          className="h-6 w-6 p-0"
                                          disabled={credential.isPasswordReadOnly}
                                        >
                                          {showPasswords[credential.id] ? (
                                            <EyeOff className="h-3 w-3" />
                                          ) : (
                                            <Eye className="h-3 w-3" />
                                          )}
                                        </Button>
                                        {credential.isPasswordReadOnly && (
                                          <Badge variant="secondary" className="text-xs">
                                            Read-only
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {credential.other && (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-muted-foreground">Additional Details:</span>
                                      </div>
                                      <div
                                        className="bg-gray-50 p-3 rounded-md text-sm border"
                                        dangerouslySetInnerHTML={{ __html: credential.other }}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 ml-4">
                                  <Button variant="outline" size="sm" onClick={() => openEditModal(credential)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setDeletingCredentialId(credential.id)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No credentials found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedCompanyId !== "all" || searchTerm
                ? "No credentials match your current filters."
                : "Get started by adding your first credential."}
            </p>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Credential
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Dialog
        open={isAddModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false)
            setIsEditModalOpen(false)
            setEditingCredential(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCredential ? "Edit Credential" : "Add New Credential"}</DialogTitle>
            <DialogDescription>
              {editingCredential
                ? "Update the credential information below."
                : "Enter the credential details for secure storage and management."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Select Company *</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => setFormData({ ...formData, companyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentialName">Credential Name *</Label>
              <Input
                id="credentialName"
                placeholder="e.g., Database Access, API Keys, Server Login"
                value={formData.credentialName}
                onChange={(e) => setFormData({ ...formData, credentialName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showFormPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={formData.isPasswordReadOnly}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                  >
                    {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="passwordReadOnly"
                    checked={formData.isPasswordReadOnly}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPasswordReadOnly: checked })}
                  />
                  <Label htmlFor="passwordReadOnly" className="text-sm">
                    Make password read-only
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other">Other (Additional Information)</Label>
              <RichTextEditor
                value={formData.other}
                onChange={(value) => setFormData({ ...formData, other: value })}
                placeholder="Enter additional details, configuration notes, or instructions..."
                className="min-h-[150px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setEditingCredential(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingCredential ? "Update Credential" : "Add Credential"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the credential and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function CredentialsPageWrapper() {
  return (
    <ProtectedRoute>
      <CredentialsPage />
    </ProtectedRoute>
  )
}
