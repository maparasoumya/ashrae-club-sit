import type { Metadata } from "next";
import "./styles.css";
import { Footer, Header } from "@/components/Site";
export const metadata: Metadata = { title: "ASHRAE SIT Pune | Student Chapter", description: "A multidisciplinary student community at Symbiosis Institute of Technology, Pune, driven by engineering, research and a sustainable built environment." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>; }
