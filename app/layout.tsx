import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteIntro from "@/components/SiteIntro";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SiteEffects from "@/components/SiteEffects";
import ChatBot from "@/components/ChatBot";
import { site } from "@/lib/site-config";
import "./globals.css";
import "./interactions.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["500"],
});

// NEXT_PUBLIC_SITE_URL may be unset or blank (an empty value in the host's settings); then fall back to the
// production domain Vercel assigns, and to localhost in development.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Furtado Property — Residential Developer, South East Queensland",
  description:
    "Building Dreams, Creating Homes. Residential developments in South East Queensland, built on 20 years of experience.",
  openGraph: {
    siteName: "Furtado Property",
    images: ["/uploads/coast-bay-aerial.webp"],
  },
};

// Runs before first paint: enables the hidden-until-revealed rule unless motion is reduced, and skips the intro
// unless this is the visitor's entry to the site on the home page: any other page marks the session as entered, and
// so does the intro itself once it has played (only if introOncePerSession is on). On the home page it also marks
// the header as sitting over the hero film (and on /contact over the hero image), so it paints clear from the start;
// SiteHeader keeps that flag current.
const bootScript = `(function(){try{var d=document.documentElement;
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('reveal-on');
if(location.pathname==='/'||location.pathname==='/contact')d.setAttribute('data-over-hero','');
if(location.pathname!=='/'){d.classList.add('intro-seen');sessionStorage.setItem('furtado-intro-seen','1');}
else if(${site.introOncePerSession}&&sessionStorage.getItem('furtado-intro-seen')==='1')d.classList.add('intro-seen');
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <SiteIntro />
        <SiteHeader />
        {children}
        <SiteFooter />
        <ChatBot />
        <SiteEffects />
      </body>
    </html>
  );
}
