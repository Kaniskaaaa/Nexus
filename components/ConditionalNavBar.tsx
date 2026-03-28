'use client'

import { usePathname } from 'next/navigation'
import NavBar from './NavBar'

export default function ConditionalNavBar() {
  const pathname = usePathname()
  
  // Don't show NavBar on auth pages
  if (pathname.startsWith('/auth')) {
    return null
  }
  
  return <NavBar />
}
