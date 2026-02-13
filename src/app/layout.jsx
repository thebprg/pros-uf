import './globals.css'
import './App.css'

export const metadata = {
  title: 'Gator Scholars',
  description: 'Browse and filter University of Florida faculty scholars',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
