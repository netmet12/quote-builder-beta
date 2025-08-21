import "./globals.css"

export const metadata = {
  title: "Simple Quote Builder",
  description: "A simplified quote builder for door products",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}