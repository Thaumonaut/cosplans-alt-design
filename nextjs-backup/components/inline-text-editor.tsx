"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InlineTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  variant?: "title" | "heading" | "body" | "caption"
  multiline?: boolean
}

export function InlineTextEditor({
  value,
  onChange,
  placeholder = "Type something...",
  className,
  variant = "body",
  multiline = false,
}: InlineTextEditorProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const variantStyles = {
    title: "text-3xl font-bold leading-tight",
    heading: "text-xl font-semibold leading-snug",
    body: "text-base leading-relaxed",
    caption: "text-sm text-muted-foreground leading-relaxed",
  }

  const baseStyles = cn(
    "w-full resize-none border-none bg-transparent p-0 outline-none transition-colors",
    "placeholder:text-muted-foreground/50",
    isFocused && "placeholder:text-muted-foreground/70",
    variantStyles[variant],
    className,
  )

  React.useEffect(() => {
    if (multiline && textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value, multiline])

  if (multiline) {
    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={baseStyles}
        rows={1}
      />
    )
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={placeholder}
      className={baseStyles}
    />
  )
}
