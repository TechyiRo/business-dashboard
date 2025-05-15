"use client"

import { useState } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  customCategory: z.string().optional(),
})

// Define the predefined categories
const predefinedCategories = [
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

export default function AddProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<string[]>(predefinedCategories)
  const [showCustomCategory, setShowCustomCategory] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      customCategory: "",
    },
  })

  // Watch the category field to show/hide the custom category input
  const selectedCategory = form.watch("category")

  // Update UI when category changes
  if (selectedCategory === "OTHER" && !showCustomCategory) {
    setShowCustomCategory(true)
  } else if (selectedCategory !== "OTHER" && showCustomCategory) {
    setShowCustomCategory(false)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // If "OTHER" is selected and a custom category is provided, use that instead
      let finalCategory = values.category
      if (values.category === "OTHER" && values.customCategory) {
        finalCategory = values.customCategory.toUpperCase()

        // Add the new category to the list if it's not already there
        if (!categories.includes(finalCategory)) {
          // Add it before the "OTHER" option
          const newCategories = [...categories]
          newCategories.splice(newCategories.length - 1, 0, finalCategory)
          setCategories(newCategories)

          // Store in localStorage for persistence
          try {
            const existingCategories = JSON.parse(localStorage.getItem("customCategories") || "[]")
            if (!existingCategories.includes(finalCategory)) {
              localStorage.setItem("customCategories", JSON.stringify([...existingCategories, finalCategory]))
            }
          } catch (e) {
            console.error("Error storing categories in localStorage:", e)
          }
        }
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          category: finalCategory,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add product")
      }

      toast({
        title: "Product added",
        description: "The product has been added successfully.",
      })

      router.push("/products")
      router.refresh()
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "There was a problem adding the product.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mx-auto max-w-md">
        <CardHeader className="bg-gradient-to-r from-sp-blue/10 to-sp-yellow/10">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-sp-blue" />
            <CardTitle>Add Product</CardTitle>
          </div>
          <CardDescription>Add a new product to your catalog.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
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
                        <ScrollArea className="h-72">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCustomCategory && (
                <FormField
                  control={form.control}
                  name="customCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter custom category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-sp-blue to-sp-yellow hover:from-sp-blue/90 hover:to-sp-yellow/90"
                >
                  {isSubmitting ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
