import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-gray-500 selection:bg-blue-100 selection:text-blue-900 bg-white border-gray-300 flex h-10 w-full min-w-0 rounded-lg border-2 px-4 py-2 text-base shadow-sm transition-all duration-300 ease-in-out outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-blue-50/30 hover:border-blue-400 hover:shadow-md",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/20",
        "placeholder:transition-colors focus:placeholder:text-gray-400",
        className
      )}
      {...props}
    />
  )
}

export { Input }
