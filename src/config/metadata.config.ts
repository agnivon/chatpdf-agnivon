import { Metadata } from "next";
import { VERCEL_PRODUCTION_URL } from "./env.config";

const title = "ChatPDF";
const description = "Chat with PDFs using LLM powered chat models";

export const siteMetadata: Metadata = {
  title: title,
  description: description,
  generator: title,
  applicationName: title,
  referrer: "origin-when-cross-origin",
  keywords: [
    "Agnivo Neogi",
    "ChatPDF",
    "PDF chatbot",
    "AI PDF chat",
    "chat with PDFs",
    "LLM PDF assistant",
    "AI document chat",
    "PDF AI tool",
    "interactive PDF reader",
    "smart PDF assistant",
    "AI-powered document chat",
    "NLP PDF chat",
    "PDF summarizer",
    "AI document reader",
    "intelligent PDF search",
  ],
  authors: [{ name: "Agnivo Neogi", url: "https://agnivon.com" }],
  creator: "Agnivo Neogi",
  publisher: "Agnivo Neogi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: title,
    description: description,
    url: VERCEL_PRODUCTION_URL,
    siteName: title,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    site: "@agnivon",
    creator: "@agnivon",
  },
};
