import type { Metadata } from 'next';
import { Lexend_Deca } from 'next/font/google';
import './globals.css';
import './dashboard-styles.css';

const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-lexend-deca',
});

export const metadata: Metadata = {
  title: 'Dashboard Político HubSpot',
  description: 'Dashboard para análisis de datos políticos en HubSpot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={lexendDeca.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@300;400;500;600;700&display=swap" />
      </head>
      <body className={lexendDeca.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
} 