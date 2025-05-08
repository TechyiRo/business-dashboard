"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpDown, Building2, Plus } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"

type Company = {
  id: string
  name: string
  address: string
  contactName: string
  contactEmail: string
  contactPhone: string
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
    accessorKey: "address",
    header: "Address",
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
]

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true)
        const response = await fetch("/api/companies")
        if (!response.ok) {
          throw new Error("Failed to fetch companies")
        }
        const data = await response.json()
        setCompanies(data)
      } catch (error) {
        console.error("Error fetching companies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Companies</h1>
        <Link href="/companies/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <p>Loading companies...</p>
            </div>
          ) : (
            <DataTable columns={companyColumns} data={companies} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
