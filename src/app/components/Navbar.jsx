'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-500 sticky top-0 shadow-md">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Main Links */}
          <div className="flex items-center">
            <div className=" md:block">
            <Image src="/Barrie.png" alt="Barrie Recreation Center" width={100} height={80} />
            </div>
            <div className="hidden md:flex md:ml-6 md:space-x-4">
              <Link href="/" className="text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link href="/schedule" className="text-white px-3 py-2 rounded-md text-sm font-medium">Schedule</Link>
              <Link href="/capacity" className="text-white px-3 py-2 rounded-md text-sm font-medium">Capacity</Link>
              <Link href="/register" className="text-white px-3 py-2 rounded-md text-sm font-medium">Register</Link>
              <Link href="/backend" className="text-white px-3 py-2 rounded-md text-sm font-medium">Staff Login</Link>
              <Link href="/aichat" className="text-white px-3 py-2 rounded-md text-sm font-medium">ChatBot</Link>
              <Link href="/aiphone" className="text-white px-3 py-2 rounded-md text-sm font-medium">AI Agent</Link>
            </div>
          </div>
          {/* Sponsored Logo & Mobile Menu Button */}
          <div className="flex items-center">
            <div className="md:hidden ml-2">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                type="button"
                className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-600 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {menuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block text-white px-3 py-2 rounded-md text-base font-medium">Home</Link>
            <Link href="/schedule" className="block text-white px-3 py-2 rounded-md text-base font-medium">Schedule</Link>
            <Link href="/capacity" className="block text-white px-3 py-2 rounded-md text-base font-medium">Capacity</Link>
            <Link href="/register" className="block text-white px-3 py-2 rounded-md text-base font-medium">Register</Link>
            <Link href="/backend" className="block text-white px-3 py-2 rounded-md text-base font-medium">Staff Login</Link>
            <Link href="/aichat" className="block text-white px-3 py-2 rounded-md text-base font-medium">ChatBot</Link>
            <Link href="/aiphone" className="block text-white px-3 py-2 rounded-md text-base font-medium">AI Phone</Link>
          </div>
          <div className="px-5 pb-3">
            <Image src="/rise.png" alt="Sponsored by RISE" width={120} height={60} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
