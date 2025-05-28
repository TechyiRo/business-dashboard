"use client"

import { useState } from "react"

export function RichTextDisplay({ content, maxLength = 300 }: { content: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false)

  // Clean and sanitize HTML content
  const cleanHtml = (html: string) => {
    if (!html) return ""

    // Remove any potentially dangerous scripts or elements
    const cleanedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")

    return cleanedHtml
  }

  // Strip HTML tags for plain text version (for length checking)
  const stripHtml = (html: string) => {
    if (typeof document !== "undefined") {
      const tmp = document.createElement("div")
      tmp.innerHTML = html
      return tmp.textContent || tmp.innerText || ""
    }
    // Fallback for server-side rendering
    return html.replace(/<[^>]*>/g, "")
  }

  const cleanedContent = cleanHtml(content)
  const plainText = stripHtml(cleanedContent)
  const shouldTruncate = plainText.length > maxLength && !expanded

  if (shouldTruncate) {
    // For truncated view, show truncated HTML content with "Show more" button
    return (
      <div className="rich-text-content">
        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{
            __html: cleanedContent.substring(0, maxLength) + "...",
          }}
        />
        <button onClick={() => setExpanded(true)} className="text-sm text-blue-600 hover:text-blue-800 mt-1">
          Show more
        </button>
      </div>
    )
  }

  // For full view, render the complete HTML content
  return (
    <div className="rich-text-content">
      <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: cleanedContent }} />
      {expanded && (
        <button onClick={() => setExpanded(false)} className="text-sm text-blue-600 hover:text-blue-800 mt-1">
          Show less
        </button>
      )}
    </div>
  )
}
