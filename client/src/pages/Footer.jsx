// import React from 'react'
import { FaCopyright } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bottom-0 w-full">
      <div className='mt-12 w-full bg-black h-10 flex items-center text-white gap-3 px-6'>
        <FaCopyright className="h-5" aria-label="Copyright" />
        <span className="text-sm bg-center ">Khushal Team members</span>
      </div>
    </footer>
  )
}
