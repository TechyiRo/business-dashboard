"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpDown, Building2, Download, Edit, FileText, Plus, Trash2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
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
import { SearchInput } from "@/components/search-input"

type Company = {
  id: string
  name: string
  address: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteCompanyId, setDeleteCompanyId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCompanies(companies)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = companies.filter(
        (company) =>
          company.name.toLowerCase().includes(lowercasedSearch) ||
          company.address.toLowerCase().includes(lowercasedSearch) ||
          company.contactName.toLowerCase().includes(lowercasedSearch) ||
          company.contactEmail.toLowerCase().includes(lowercasedSearch) ||
          company.contactPhone.toLowerCase().includes(lowercasedSearch),
      )
      setFilteredCompanies(filtered)
    }
  }, [searchTerm, companies])

  async function fetchCompanies() {
    try {
      setLoading(true)
      const response = await fetch("/api/companies")
      if (!response.ok) {
        throw new Error("Failed to fetch companies")
      }
      const data = await response.json()
      setCompanies(data)
      setFilteredCompanies(data)
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast({
        title: "Error",
        description: "Failed to load companies. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function deleteCompany(id: string) {
    try {
      setDeleteError(null)
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        setDeleteError(data.error || "Failed to delete company")
        return false
      }

      // Remove the company from the local state
      const updatedCompanies = companies.filter((company) => company.id !== id)
      setCompanies(updatedCompanies)
      setFilteredCompanies(
        searchTerm.trim() === "" ? updatedCompanies : filteredCompanies.filter((company) => company.id !== id),
      )

      toast({
        title: "Company Deleted",
        description: "The company has been deleted successfully.",
      })

      return true
    } catch (error) {
      console.error("Error deleting company:", error)
      setDeleteError("An unexpected error occurred")
      return false
    }
  }

  function exportCompaniesToPDF() {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Companies List", 14, 22)

      // Add current date
      const date = new Date().toLocaleDateString()
      doc.setFontSize(10)
      doc.text(`Generated on: ${date}`, 14, 30)

      // Prepare data for table
      const tableColumn = ["Name", "Contact Name", "Contact Email", "Contact Phone"]
      const tableRows = filteredCompanies.map((company) => [
        company.name,
        company.contactName,
        company.contactEmail,
        company.contactPhone,
      ])

      // Add table to document
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "striped",
        headStyles: { fillColor: [247, 148, 29] }, // SP-yellow color
      })

      // Save the PDF
      doc.save("SP_IT_Technologies_Companies.pdf")

      toast({
        title: "PDF Exported",
        description: "Companies list has been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export companies to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  function exportCompanyDetailsToPDF(company: Company) {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Company Details", 14, 22)

      // Add company information
      const companyData = [
        ["Name", company.name],
        ["Address", company.address],
        ["Contact Name", company.contactName],
        ["Contact Email", company.contactEmail],
        ["Contact Phone", company.contactPhone],
      ]

      autoTable(doc, {
        startY: 30,
        head: [["Field", "Value"]],
        body: companyData,
        theme: "striped",
        headStyles: { fillColor: [247, 148, 29] }, // SP-yellow color
      })

      // Save the PDF
      doc.save(`Company_${company.name.replace(/\s+/g, "_")}.pdf`)

      toast({
        title: "PDF Exported",
        description: "Company details have been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export company details to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const companyColumns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "contactName",
      header: "Contact Name",
    },
    {
      accessorKey: "contactEmail",
      header: "Contact Email",
    },
    {
      accessorKey: "contactPhone",
      header: "Contact Phone",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const company = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-more-horizontal"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/companies/edit/${company.id}`}>
                  <Edit className="mr-2 h-4 w-4 text-blue-500" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDeleteCompanyId(company.id)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportCompanyDetailsToPDF(company)}>
                <FileText className="mr-2 h-4 w-4 text-green-500" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2 animate-fade-in">
          <Building2 className="h-8 w-8 text-sp-yellow" />
          Companies
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/companies/add">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-sp-yellow to-sp-red hover:from-sp-yellow/90 hover:to-sp-red/90 transition-all duration-300 hover:shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full sm:w-auto transition-all duration-300 hover:shadow-md"
            onClick={exportCompaniesToPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sp-yellow/10 to-sp-red/10">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-sp-yellow" />
            Company List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <SearchInput
              placeholder="Search companies by name, address, or contact details..."
              onChange={setSearchTerm}
              className="max-w-md"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-yellow border-t-transparent"></div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {searchTerm ? (
                <>
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-xl font-medium text-gray-900">No matching companies found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">🏢</div>
                  <h3 className="text-xl font-medium text-gray-900">No companies yet</h3>
                  <p className="text-gray-500 mt-2">Add your first company to get started</p>
                  <Link href="/companies/add" className="mt-4">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Company
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <DataTable columns={companyColumns} data={filteredCompanies} />
              <p className="text-sm text-muted-foreground mt-2">
                Showing {filteredCompanies.length} of {companies.length} companies
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="animate-fade-in-up">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError ? (
                <div className="text-red-500">{deleteError}</div>
              ) : (
                "This action cannot be undone. This will permanently delete the company and all associated data."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {!deleteError && (
              <AlertDialogAction
                onClick={async () => {
                  if (deleteCompanyId) {
                    const success = await deleteCompany(deleteCompanyId)
                    if (success) {
                      setDeleteCompanyId(null)
                    }
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
