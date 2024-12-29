import './globals.css'

export const metadata = {
    title: 'Hockey Roster Generator',
    description: 'Generate balanced hockey teams',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="h-full bg-gray-50">
            <body className="h-full">{children}</body>
        </html>
    );
}
