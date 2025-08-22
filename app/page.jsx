"use client"

import { Suspense } from "react"
import { SimpleQuoteBuilder } from "../components/SimpleQuoteBuilder.jsx"

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading quote builder...</div>}>
      <SimpleQuoteBuilder />
    </Suspense>
  )
}