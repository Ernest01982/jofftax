import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Joff Tax | Preparation with clarity',description:'A private South African tax preparation workspace. Organise your evidence, understand a bounded salary estimate and prepare your next step.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-ZA"><body>{children}</body></html>;}
