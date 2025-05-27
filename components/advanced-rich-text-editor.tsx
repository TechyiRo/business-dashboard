"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Hash,
  Strikethrough,
  Subscript,
  Superscript,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface AdvancedRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// 48 distinct colors palette
const colorPalette = [
  "#000000",
  "#1a1a1a",
  "#333333",
  "#4d4d4d",
  "#666666",
  "#808080",
  "#999999",
  "#b3b3b3",
  "#cccccc",
  "#e6e6e6",
  "#f2f2f2",
  "#ffffff",
  "#ff0000",
  "#ff3333",
  "#ff6666",
  "#ff9999",
  "#ffcccc",
  "#00ff00",
  "#33ff33",
  "#66ff66",
  "#99ff99",
  "#ccffcc",
  "#0000ff",
  "#3333ff",
  "#6666ff",
  "#9999ff",
  "#ccccff",
  "#ffff00",
  "#ffff33",
  "#ffff66",
  "#ffff99",
  "#ffffcc",
  "#ff00ff",
  "#ff33ff",
  "#ff66ff",
  "#ff99ff",
  "#ffccff",
  "#00ffff",
  "#33ffff",
  "#66ffff",
  "#99ffff",
  "#ccffff",
  "#ffa500",
  "#ff8c00",
  "#ff7f50",
  "#ff6347",
  "#ff4500",
  "#8b4513",
  "#a0522d",
  "#cd853f",
]

// Font families
const fontFamilies = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Georgia",
  "Comic Sans MS",
  "Impact",
  "Trebuchet MS",
  "Arial Black",
  "Palatino",
  "Garamond",
  "Bookman",
  "Avant Garde",
  "Tahoma",
  "Geneva",
  "Lucida Console",
  "Monaco",
]

// Font sizes
const fontSizes = ["8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48", "72"]

export function AdvancedRichTextEditor({ value, onChange, placeholder, className }: AdvancedRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false)
  const [isFontSizePickerOpen, setIsFontSizePickerOpen] = useState(false)
  const [currentFont, setCurrentFont] = useState("Arial")
  const [currentFontSize, setCurrentFontSize] = useState("14")

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const applyColor = (color: string) => {
    execCommand("foreColor", color)
    setIsColorPickerOpen(false)
  }

  const applyFont = (font: string) => {
    execCommand("fontName", font)
    setCurrentFont(font)
    setIsFontPickerOpen(false)
  }

  const applyFontSize = (size: string) => {
    execCommand("fontSize", "3") // Reset to medium first
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      if (!range.collapsed) {
        const span = document.createElement("span")
        span.style.fontSize = `${size}px`
        try {
          range.surroundContents(span)
        } catch (e) {
          span.appendChild(range.extractContents())
          range.insertNode(span)
        }
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
    setCurrentFontSize(size)
    setIsFontSizePickerOpen(false)
    handleInput()
  }

  const insertAutoNumberedList = () => {
    const selection = window.getSelection()
    if (selection && editorRef.current) {
      const range = selection.getRangeAt(0)
      const listHtml = `
        <ol style="margin: 10px 0; padding-left: 20px;">
          <li style="margin: 5px 0;">Step 1</li>
          <li style="margin: 5px 0;">Step 2</li>
          <li style="margin: 5px 0;">Step 3</li>
        </ol>
      `

      if (range.collapsed) {
        const div = document.createElement("div")
        div.innerHTML = listHtml
        range.insertNode(div.firstChild!)
      } else {
        range.deleteContents()
        const div = document.createElement("div")
        div.innerHTML = listHtml
        range.insertNode(div.firstChild!)
      }

      editorRef.current.focus()
      handleInput()
    }
  }

  const insertBulletList = () => {
    execCommand("insertUnorderedList")
  }

  const insertNumberedList = () => {
    execCommand("insertOrderedList")
  }

  return (
    <div className={`border rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b bg-gray-50">
        {/* Font Family */}
        <Popover open={isFontPickerOpen} onOpenChange={setIsFontPickerOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <Type className="h-4 w-4 mr-1" />
              {currentFont}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {fontFamilies.map((font) => (
                <button
                  key={font}
                  type="button"
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                  style={{ fontFamily: font }}
                  onClick={() => applyFont(font)}
                >
                  {font}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Font Size */}
        <Popover open={isFontSizePickerOpen} onOpenChange={setIsFontSizePickerOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs">
              {currentFontSize}px
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-24 p-2">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {fontSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                  onClick={() => applyFontSize(size)}
                >
                  {size}px
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("bold")} className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>

        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("italic")} className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("underline")}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("strikeThrough")}
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("subscript")}
          className="h-8 w-8 p-0"
        >
          <Subscript className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("superscript")}
          className="h-8 w-8 p-0"
        >
          <Superscript className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Color Picker */}
        <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="mb-2 text-sm font-medium">Choose Text Color (48 Colors)</div>
            <div className="grid grid-cols-8 gap-1">
              {colorPalette.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => applyColor(color)}
                  title={color}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("justifyLeft")}
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("justifyCenter")}
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("justifyRight")}
          className="h-8 w-8 p-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertBulletList}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertNumberedList}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertAutoNumberedList}
          className="h-8 px-2 text-xs"
          title="Auto-Numbered Steps"
        >
          <Hash className="h-4 w-4 mr-1" />
          Steps
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[150px] p-4 focus:outline-none"
        style={{ wordWrap: "break-word" }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Help Text */}
      <div className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50">
        💡 Tip: Select text to apply formatting • Use "Steps" button for auto-numbered lists • Choose from 48 colors and
        18 fonts
      </div>
    </div>
  )
}
