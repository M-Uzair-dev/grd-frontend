import './globals.css'
import './pdf.css'

export const metadata = {
  title: 'GRD - Project Management System',
  description: 'Efficient project management system for GRD, enabling seamless collaboration between partners and customers.',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  viewport: 'width=device-width, initial-scale=1.0',
  robots: 'index, follow',
  openGraph: {
    title: 'GRD - Project Management System',
    description: 'Efficient project management system for GRD, enabling seamless collaboration between partners and customers.',
    images: '/logo.svg',
    type: 'website',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
