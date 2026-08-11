'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/rules', label: 'Rules', icon: '📜' },
    { href: '/deck-builder', label: 'Deck Builder', icon: '🃏' },
    { href: '/battle', label: 'Battle', icon: '⚔️' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-purple-900/30"
      aria-label="Primary"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2" aria-label="The Warded Ones home">
            <span className="text-lg" aria-hidden="true">🔮</span>
            <span className="font-bold text-sm bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              The Warded Ones
            </span>
          </Link>

          <div className="flex items-center gap-1" role="list">
            {links.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="listitem"
                  aria-current={active ? 'page' : undefined}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400
                    ${active
                      ? 'bg-purple-800/50 text-purple-200 border border-purple-600/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }
                  `}
                >
                  <span aria-hidden="true">{link.icon}</span> {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
