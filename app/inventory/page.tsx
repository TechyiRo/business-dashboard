"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpDown, Edit, Plus, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { DbConnectionError } from "@/components/db-connection-error"
import { SearchInput } from "@/components/search-input"

type InventoryItem = {
  id: string
  productName: string
  serialNumber: string
  productCategory: string
  status: string
  purchaseDate: string
  price: string
  supplier: string
  notes: string
  productId?: string
  companyId?: string
  product?: {
    name: string
    category: string
  }
  company?: {
    name: string
  }
}

export default function InventoryPage() {
  const router = useRouter()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true)
        const response = await fetch("/api/inventory")

        if (!response.ok) {
          throw new Error(`Error fetching inventory: ${response.status}`)
        }

        const data = await response.json()
        setInventoryItems(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        console.error("Failed to fetch inventory:", err)
        setError("Failed to load inventory items. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete item")
      }

      // Remove the deleted item from the state
      setInventoryItems(inventoryItems.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting item:", error)
      alert("Failed to delete item. Please try again.")
    }
  }

  // Filter inventory items based on search query
  const filteredItems = inventoryItems.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.productName?.toLowerCase().includes(searchLower) ||
      item.serialNumber?.toLowerCase().includes(searchLower) ||
      item.productCategory?.toLowerCase().includes(searchLower) ||
      item.status?.toLowerCase().includes(searchLower) ||
      item.supplier?.toLowerCase().includes(searchLower) ||
      item.notes?.toLowerCase().includes(searchLower) ||
      item.product?.name?.toLowerCase().includes(searchLower) ||
      item.company?.name?.toLowerCase().includes(searchLower)
    )
  })

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "productName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Product Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "serialNumber",
      header: "Serial Number",
    },
    {
      accessorKey: "productCategory",
      header: "Category",
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium inline-block
            ${
              status === "RENT"
                ? "bg-blue-100 text-blue-800"
                : status === "SELL"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </div>
        )
      },
    },
    {
      accessorKey: "price",
      header: "Price",
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/inventory/edit/${item.id}`)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Inventory 📦</h1>
          <p className="text-muted-foreground">Manage your product inventory items here</p>
        </div>
        <Link href="/inventory/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {error ? (
        <DbConnectionError />
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>A list of all inventory items in your database</CardDescription>
            <SearchInput
              placeholder="Search inventory items..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="mt-2"
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No inventory items found</p>
                <Link href="/inventory/add" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Item
                  </Button>
                </Link>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredItems} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
