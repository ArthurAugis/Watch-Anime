import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import LayoutContent from "@/components/LayoutContent";
import Script from 'next/script';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const MAINTENANCE = false;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (MAINTENANCE) {
    return (
      <html lang="fr">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          style={{
            backgroundColor: "rgb(20, 18, 27)",
            color: "white",
            minHeight: "100vh",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
            🚧 Maintenance en cours
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              maxWidth: 500,
              textAlign: "center",
            }}
          >
            Le site est temporairement indisponible pour cause de maintenance.
            <br />
            Merci de revenir plus tard.
          </p>
        </body>
      </html>
    );
  }

  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: "rgb(20, 18, 27)",
          color: "white",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <SessionProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </SessionProvider>r
      </body>
    </html>
  );
}
