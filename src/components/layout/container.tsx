/**
 * ARCHITECTURE DECISION:
 * - Why it exists: Provides a consistent maximum width and centered alignment for main content areas across the app.
 * - Why this structure scales well: By abstracting the outer wrapper into a reusable component, any global layout changes (like adjusting max-width or padding for larger screens) can be applied centrally instead of modifying every individual page.
 * - Tradeoffs: Adds a very small abstraction layer over native HTML elements. However, the benefit of consistency and cleaner page components outweighs the slight indirection.
 * - Avoiding beginner mistakes: Beginners often repeat wrapper utility classes (`max-w-7xl mx-auto px-4`) on every page, leading to subtle inconsistencies and maintenance headaches when designs change. This standardizes the layout constraint.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
