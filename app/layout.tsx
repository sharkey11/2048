// app/layout.tsx
import { ClientLayout } from "./layout.client";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{backgroundColor: "rgba(238, 228, 218)"}}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
