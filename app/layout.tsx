import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Box, createTheme, CssBaseline, Toolbar } from "@mui/material";
import { StateProvider } from "@/store";
import Navigation from "./components/navigation";
import { Authentication } from "./components/authentication/authentication";

const theme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true, // Disable ripple globally
      },
    },
  },
});


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Payfront",
  description: "Gestiona tus pagos de alquiler con domiciliación bancaria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StateProvider>
          <Authentication></Authentication>
          <CssBaseline />
          <Box sx={{ display: 'flex' }}>
            <Navigation />
            <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 6 }}>
              <Toolbar />
              <Box
                sx={{
                  maxWidth: '760px',
                  margin: 'auto',
                }}
              >
                {children}
              </Box>
            </Box>
          </Box>
        </StateProvider>
      </body>
    </html>
  );
}
