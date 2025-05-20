"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpDown, Download, Edit, FileText, Package, Plus, Trash2 } from "lucide-react"
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

type Product = {
  id: string
  name: string
  category: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercasedSearch) ||
          product.category.toLowerCase().includes(lowercasedSearch),
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  async function fetchProducts() {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function deleteProduct(id: string) {
    try {
      setDeleteError(null)
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        setDeleteError(data.error || "Failed to delete product")
        return false
      }

      // Remove the product from the local state
      const updatedProducts = products.filter((product) => product.id !== id)
      setProducts(updatedProducts)
      setFilteredProducts(
        searchTerm.trim() === "" ? updatedProducts : filteredProducts.filter((product) => product.id !== id),
      )

      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully.",
      })

      return true
    } catch (error) {
      console.error("Error deleting product:", error)
      setDeleteError("An unexpected error occurred")
      return false
    }
  }

  function exportProductsToPDF() {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Products List", 14, 22)

      // Add current date
      const date = new Date().toLocaleDateString()
      doc.setFontSize(10)
      doc.text(`Generated on: ${date}`, 14, 30)

      // Prepare data for table
      const tableColumn = ["Name", "Category"]
      const tableRows = filteredProducts.map((product) => [product.name, product.category])

      // Add table to document
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "striped",
        headStyles: { fillColor: [91, 93, 168] }, // SP-blue color
      })

      // Save the PDF
      doc.save("SP_IT_Technologies_Products.pdf")

      toast({
        title: "PDF Exported",
        description: "Products list has been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export products to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  function exportProductDetailsToPDF(product: Product) {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Product Details", 14, 22)

      // Add product information
      const productData = [
        ["Name", product.name],
        ["Category", product.category],
      ]

      autoTable(doc, {
        startY: 30,
        head: [["Field", "Value"]],
        body: productData,
        theme: "striped",
        headStyles: { fillColor: [91, 93, 168] }, // SP-blue color
      })

      // Save the PDF
      doc.save(`Product_${product.name.replace(/\s+/g, "_")}.pdf`)

      toast({
        title: "PDF Exported",
        description: "Product details have been exported to PDF successfully.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export product details to PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const productColumns: ColumnDef<Product>[] = [
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
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original

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
                <Link href={`/products/edit/${product.id}`}>
                  <Edit className="mr-2 h-4 w-4 text-blue-500" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDeleteProductId(product.id)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportProductDetailsToPDF(product)}>
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
          <Package className="h-8 w-8 text-sp-blue" />
          Products
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/products/add">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-sp-blue to-sp-yellow hover:from-sp-blue/90 hover:to-sp-yellow/90 transition-all duration-300 hover:shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full sm:w-auto transition-all duration-300 hover:shadow-md"
            onClick={exportProductsToPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-sp-blue/10 to-sp-yellow/10">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-sp-blue" />
            Product List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <SearchInput
              placeholder="Search products by name or category..."
              onChange={setSearchTerm}
              className="max-w-md"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-blue border-t-transparent"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {searchTerm ? (
                <>
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-xl font-medium text-gray-900">No matching products found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">📦</div>
                  <h3 className="text-xl font-medium text-gray-900">No products yet</h3>
                  <p className="text-gray-500 mt-2">Add your first product to get started</p>
                  <Link href="/products/add" className="mt-4">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <DataTable columns={productColumns} data={filteredProducts} />
              <p className="text-sm text-muted-foreground mt-2">
                Showing {filteredProducts.length} of {products.length} products
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
                "This action cannot be undone. This will permanently delete the product."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {!deleteError && (
              <AlertDialogAction
                onClick={async () => {
                  if (deleteProductId) {
                    const success = await deleteProduct(deleteProductId)
                    if (success) {
                      setDeleteProductId(null)
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
