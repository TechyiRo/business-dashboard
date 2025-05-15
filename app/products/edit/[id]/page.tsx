"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
})

const categories = [
  "FIREWALL",
  "MANAGED SWITCHES",
  "ACCESS POINT",
  "ANTIVIRUS",
  "BACKUP-SOLUTIONS",
  "OS",
  "WIN SERVER",
  "SOFTWARE",
  "HARDWARE",
  "ROUTER",
  "OTHER",
]

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
    },
  })

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch product")
        }

        const product = await response.json()

        form.reset({
          name: product.name,
          category: product.category,
        })
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: "Error",
          description: "Failed to load product data. Please try again.",
          variant: "destructive",
        })
        router.push("/products")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, form, router])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      })

      router.push("/products")
      router.refresh()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "There was a problem updating the product.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sp-blue border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-sp-blue" />
            <CardTitle>Edit Product</CardTitle>
          </div>
          <CardDescription>Update product information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Website Development" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push("/products")}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-sp-blue to-sp-yellow hover:from-sp-blue/90 hover:to-sp-yellow/90"
                >
                  {isSubmitting ? "Updating..." : "Update Product"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
