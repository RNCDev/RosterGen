export const metadata = {
  title: 'Hockey Roster Generator',
  description: 'Generate balanced hockey teams',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="container mx-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
