
import { AquaCastLogo } from '@/components/aqua-cast-logo';
import Link from 'next/link';

const links = {
  Product: [
    { href: '#features', label: 'Features' },
    { href: '#species', label: 'Species' },
    { href: '/dashboard', label: 'Web App' },
  ],
  Company: [
    { href: '#', label: 'About Us' },
    { href: '#', label: 'Contact' },
  ],
  Legal: [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white border-t border-line-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
             <Link href="/" className="flex items-center gap-2 mb-4">
                <AquaCastLogo className="h-8 w-8 text-teal-500" />
                <span className="font-headline text-xl font-bold text-ink-900">AquaCast</span>
            </Link>
            <p className="text-sm text-ink-500">Species-aware fishing forecasts.</p>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-headline font-semibold text-ink-700 mb-4">{title}</h4>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-ink-500 hover:text-teal-600 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-line-200 text-center text-sm text-ink-300">
            <p>&copy; {new Date().getFullYear()} AquaCast. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
