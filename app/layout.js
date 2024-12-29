import './globals.css'

export const metadata = {
    title: 'Hockey Roster Generator',
    description: 'Generate balanced hockey teams',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="h-full">
            <head />
            <body className="h-full bg-gray-50 antialiased">{children}</body>
        </html>
    );
}