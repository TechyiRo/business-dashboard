"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Boxes, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const formSchema = z.object({
  productName: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  serialNumber: z.string().min(2, {
    message: "Serial number must be at least 2 characters.",
  }),
  productId: z.string().min(1, {
    message: "Please select a product.",
  }),
  companyId: z.string().min(1, {
    message: "Please select a company.",
  }),
  status: z.enum(["RENT", "SELL"], {
    message: "Please select a status.",
  }),
  imageUrl: z.string().optional(),
})

type Product = {
  id: string
  name: string
  category: string
}

type Company = {
  id: string
  name: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

export default function AddInventoryItemPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      serialNumber: "",
      productId: "",
      companyId: "",
      status: "SELL",
      imageUrl: "",
    },
  })

  // Fetch products and companies for dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [productsRes, companiesRes] = await Promise.all([fetch("/api/products"), fetch("/api/companies")])

        if (!productsRes.ok || !companiesRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const productsData = await productsRes.json()
        const companiesData = await companiesRes.json()

        setProducts(Array.isArray(productsData) ? productsData : [])
        setCompanies(Array.isArray(companiesData) ? companiesData : [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload to a storage service
    // For this example, we'll use a data URL
    setUploadingImage(true)
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        form.setValue("imageUrl", base64String)
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      setUploadingImage(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to add inventory item")
      }

      toast({
        title: "Success!",
        description: "Inventory item added successfully.",
        variant: "default",
      })

      // Redirect to the inventory page after a short delay
      setTimeout(() => {
        router.push("/inventory")
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error adding inventory item:", error)
      toast({
        title: "Error",
        description: "There was a problem adding the inventory item.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center p-6 py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-blue border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="mx-auto max-w-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-sp-blue/10 to-sp-red/10">
          <div className="flex items-center gap-2">
            <Boxes className="h-6 w-6 text-sp-blue" />
            <CardTitle>Add Inventory Item</CardTitle>
          </div>
          <CardDescription>Add a new item to your product inventory.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter serial number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("companyId") && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h3 className="mb-2 font-medium">Company Details</h3>
                  {companies
                    .filter((company) => company.id === form.watch("companyId"))
                    .map((company) => (
                      <div key={company.id} className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                        <div>
                          <span className="font-medium">Contact Name:</span> {company.contactName}
                        </div>
                        <div>
                          <span className="font-medium">Contact Email:</span> {company.contactEmail}
                        </div>
                        <div>
                          <span className="font-medium">Contact Phone:</span> {company.contactPhone}
                        </div>
                        <div>
                          <span className="font-medium">Address:</span> {company.address}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Product Status</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="RENT" />
                          </FormControl>
                          <FormLabel className="font-normal">RENT</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="SELL" />
                          </FormControl>
                          <FormLabel className="font-normal">SELL</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Upload Product Image</FormLabel>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <div className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 hover:border-sp-blue">
                      <label
                        htmlFor="image-upload"
                        className="flex cursor-pointer flex-col items-center justify-center"
                      >
                        <Upload className="mb-2 h-6 w-6 text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload</span>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    {uploadingImage ? (
                      <div className="flex h-32 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-blue border-t-transparent"></div>
                      </div>
                    ) : imagePreview ? (
                      <div className="relative h-32 w-full overflow-hidden rounded-lg">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Product preview"
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                        <span className="text-sm text-gray-500">No image selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/inventory")}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-sp-red to-sp-yellow hover:from-sp-red/90 hover:to-sp-yellow/90 sm:w-auto"
                >
                  {isSubmitting ? "Adding..." : "Add Inventory Item"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
