"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  className?: string
}

export function SearchInput({ placeholder = "Search...", value, onChange, className }: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(value || "")

  useEffect(() => {
    if (value !== undefined && value !== searchTerm) {
      setSearchTerm(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    onChange(newValue)
  }

  const handleClear = () => {
    setSearchTerm("")
    onChange("")
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
      <Input type="text" placeholder={placeholder} value={searchTerm} onChange={handleChange} className="pl-9 pr-10" />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={handleClear}
        >
          <X className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  )
}
