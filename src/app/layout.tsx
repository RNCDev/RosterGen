import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Hockey Roster Manager',
    description: 'A tool for managing hockey team rosters',
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body className={`${inter.className} flex flex-col min-h-screen`}>
                {process.env.NODE_ENV === 'development' && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                // Filter out common non-critical warnings in development
                                const originalWarn = console.warn;
                                console.warn = function(...args) {
                                    const message = args.join(' ');
                                    // Skip browser extension warnings
                                    if (message.includes('data-dashline') || 
                                        message.includes('data-dashlane') ||
                                        message.includes('Extra attributes from the server')) {
                                        return;
                                    }
                                    originalWarn.apply(console, args);
                                };
                            `,
                        }}
                    />
                )}
                {children}
            </body>
        </html>
    );
}