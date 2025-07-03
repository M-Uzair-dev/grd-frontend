import './globals.css'

export const metadata = {
  title: 'Vehicle Inspection Portal',
  description: 'A portal for managing vehicle inspection reports',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
