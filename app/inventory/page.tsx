"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpDown, Boxes, Download, Edit, MoreHorizontal, Plus, Trash, RefreshCw } from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
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

type InventoryItem = {
  id: string
  productName: string
  serialNumber: string
  status: string
  imageUrl?: string
  productId: string
  companyId: string
  product: {
    name: string
    category: string
  } | null
  company: {
    name: string
  } | null
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  async function fetchInventoryItems() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/inventory")

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch inventory items: ${response.status} ${response.statusText}. ${errorText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Ensure we have an array and filter out any items with null relations
      const validItems = Array.isArray(data)
        ? data.filter((item) => item.product !== null && item.company !== null)
        : []

      setInventoryItems(validItems)
    } catch (error) {
      console.error("Error fetching inventory items:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "Failed to load inventory items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function deleteInventoryItem(id: string) {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete inventory item")
      }

      // Remove the item from the local state
      setInventoryItems(inventoryItems.filter((item) => item.id !== id))

      toast({
        title: "Inventory Item Deleted",
        description: "The inventory item has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      })
    }
  }

  function exportToPDF() {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.setTextColor(0, 51, 102) // SP IT Blue color
      doc.text("SP IT Technologies - Product Inventory", 14, 22)

      // Add date
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

      // Prepare data for table
      const tableData = inventoryItems.map((item) => [
        item.productName,
        item.serialNumber,
        item.product?.name || "N/A",
        item.product?.category || "N/A",
        item.company?.name || "N/A",
        item.status,
      ])

      // Add table
      autoTable(doc, {
        startY: 35,
        head: [["Product Name", "Serial Number", "Product Type", "Category", "Company", "Status"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [0, 51, 102], // SP IT Blue color
        },
      })

      // Save the PDF
      doc.save("SP_IT_Product_Inventory.pdf")

      toast({
        title: "PDF Exported",
        description: "Inventory has been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export inventory to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const columns = [
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
      accessorKey: "product.name",
      header: "Product Type",
      cell: ({ row }) => row.original.product?.name || "N/A",
    },
    {
      accessorKey: "product.category",
      header: "Category",
      cell: ({ row }) => row.original.product?.category || "N/A",
    },
    {
      accessorKey: "company.name",
      header: "Company",
      cell: ({ row }) => row.original.company?.name || "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge
            variant={status === "RENT" ? "outline" : "default"}
            className={status === "RENT" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/inventory/edit/${item.id}`}>
                  <Edit className="mr-2 h-4 w-4 text-blue-500" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDeleteItemId(item.id)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash className="mr-2 h-4 w-4 text-red-500" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-alert-circle"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Error Loading Inventory
            </CardTitle>
            <CardDescription className="text-red-700">
              There was a problem loading the inventory items: {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">This could be due to one of the following reasons:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Database connection issue</li>
                  <li>Missing or invalid data in the database</li>
                  <li>Prisma schema mismatch with database structure</li>
                  <li>Server-side error during data processing</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">Suggested actions:</h4>
                <ol className="list-decimal pl-5 space-y-1 text-amber-700">
                  <li>Check that your database is properly connected</li>
                  <li>
                    Run <code className="bg-amber-100 px-1 py-0.5 rounded">npx prisma generate</code> to update the
                    Prisma client
                  </li>
                  <li>
                    Run <code className="bg-amber-100 px-1 py-0.5 rounded">npx prisma db push</code> to sync your schema
                  </li>
                  <li>Check for any orphaned records in your database</li>
                </ol>
              </div>

              <div className="flex justify-center mt-6">
                <Button onClick={fetchInventoryItems} className="bg-sp-blue hover:bg-sp-blue/90 text-white">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Product Inventory</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/inventory/add">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-sp-blue to-sp-red hover:from-sp-blue/90 hover:to-sp-red/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
          <Button variant="outline" onClick={exportToPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sp-blue/10 to-sp-red/10">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-sp-blue" />
              Inventory Items
            </CardTitle>
            <CardDescription>Manage your product inventory items</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-blue border-t-transparent"></div>
            </div>
          ) : inventoryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Boxes className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900">No inventory items found</h3>
              <p className="text-gray-500 mt-2 max-w-md">
                Get started by adding your first inventory item using the "Add Item" button above.
              </p>
              <Link href="/inventory/add" className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Item
                </Button>
              </Link>
            </div>
          ) : (
            <DataTable columns={columns} data={inventoryItems} />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the inventory item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteItemId) {
                  deleteInventoryItem(deleteItemId)
                  setDeleteItemId(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
