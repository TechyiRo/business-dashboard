"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpDown, Download, Edit, Plus, Trash2 } from "lucide-react"
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

type InventoryItem = {
  id: string
  productName: string
  serialNumber: string
  status: string
  imageUrl?: string
  product: {
    name: string
    category: string
  }
  company: {
    name: string
    contactName: string
    contactEmail: string
    contactPhone: string
  }
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [dbError, setDbError] = useState(false)

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  async function fetchInventoryItems() {
    try {
      setLoading(true)
      setDbError(false)
      const response = await fetch("/api/inventory")
      if (!response.ok) {
        throw new Error("Failed to fetch inventory items")
      }
      const data = await response.json()
      setInventoryItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching inventory items:", error)
      toast({
        title: "Database Error",
        description: "Failed to load inventory items. The database might not be properly set up or connected.",
        variant: "destructive",
      })
      setInventoryItems([])
      setDbError(true)
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
        title: "Item Deleted",
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

  function exportItemToPDF(item: InventoryItem) {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Product Inventory Details", 14, 22)

      // Add item information
      const itemData = [
        ["Product Name", item.productName],
        ["Serial Number", item.serialNumber],
        ["Status", item.status],
        ["Product Category", item.product?.category || "N/A"],
        ["Company", item.company?.name || "N/A"],
        ["Contact Name", item.company?.contactName || "N/A"],
        ["Contact Email", item.company?.contactEmail || "N/A"],
        ["Contact Phone", item.company?.contactPhone || "N/A"],
      ]

      autoTable(doc, {
        startY: 30,
        head: [["Field", "Value"]],
        body: itemData,
        theme: "striped",
      })

      // Save the PDF
      doc.save(`Inventory_${item.id}.pdf`)

      toast({
        title: "PDF Exported",
        description: "Inventory item has been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting item to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export inventory item to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const inventoryColumns: ColumnDef<InventoryItem>[] = [
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
      accessorKey: "company.name",
      header: "Company",
      cell: ({ row }) => row.original.company?.name || "N/A",
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
        const status = row.original.status
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              status === "RENT" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
            }`}
          >
            {status}
          </div>
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
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportItemToPDF(item)}>
                <Download className="mr-2 h-4 w-4 text-green-500" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Product Inventory</h1>
        <Link href="/inventory/add">
          <Button className="w-full bg-gradient-to-r from-sp-red to-sp-yellow hover:from-sp-red/90 hover:to-sp-yellow/90 sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Inventory Item
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-sp-blue/10 to-sp-red/10">
          <CardTitle className="flex items-center gap-2 text-sp-blue">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-boxes"
            >
              <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
              <path d="m7 16.5-4.74-2.85" />
              <path d="m7 16.5 5-3" />
              <path d="M7 16.5v5.17" />
              <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
              <path d="m17 16.5-5-3" />
              <path d="m17 16.5 4.74-2.85" />
              <path d="M17 16.5v5.17" />
              <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
              <path d="M12 8 7.26 5.15" />
              <path d="m12 8 4.74-2.85" />
              <path d="M12 13.5V8" />
            </svg>
            Inventory Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-blue border-t-transparent"></div>
            </div>
          ) : (
            <>
              {dbError && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                  <h3 className="mb-2 font-semibold">Database Connection Error</h3>
                  <p className="text-sm">There was an error connecting to the database. This might be because:</p>
                  <ul className="mt-2 list-inside list-disc text-sm">
                    <li>The database hasn't been properly set up</li>
                    <li>The Prisma schema needs to be generated</li>
                    <li>The database connection string is incorrect</li>
                  </ul>
                  <p className="mt-2 text-sm">
                    Try running <code className="rounded bg-red-100 px-1 py-0.5">npx prisma generate</code> and
                    <code className="ml-1 rounded bg-red-100 px-1 py-0.5">npx prisma db push</code> to set up the
                    database.
                  </p>
                </div>
              )}
              <DataTable columns={inventoryColumns} data={inventoryItems} />
            </>
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
