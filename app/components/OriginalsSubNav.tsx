import Link from 'next/link';
import { lora } from '../fonts';

type OriginalsSubNavProps = {
  active: 'originals' | 'collections' | 'prints';
  showCollections: boolean;
  showPrints: boolean;
};

type SubNavItem = {
  key: OriginalsSubNavProps['active'];
  label: string;
  href: string;
  enabled: boolean;
};

export default function OriginalsSubNav({
  active,
  showCollections,
  showPrints,
}: OriginalsSubNavProps) {
  const items: SubNavItem[] = [
    { key: 'originals', label: 'Originals', href: '/originals', enabled: true },
    { key: 'collections', label: 'Collections', href: '/originals/collections', enabled: showCollections },
    { key: 'prints', label: 'Prints', href: '/originals/prints', enabled: showPrints },
  ];

  return (
    <nav aria-label="Originals sub-navigation" className="mb-10">
      <ul className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 ${lora.className}`}>
        {items.map((item) => {
          const isActive = item.key === active;
          const baseClassName =
            'inline-flex items-center rounded-full border px-5 py-2 text-sm transition-colors duration-200';
          const activeClassName = 'border-olive bg-olive/10 text-brown';
          const enabledClassName = 'border-tan/50 bg-white/70 text-warm-gray hover:border-olive hover:text-brown';
          const disabledClassName = 'border-tan/30 bg-white/40 text-warm-gray/60 cursor-default';

          if (!item.enabled) {
            return (
              <li key={item.key}>
                <span className={`${baseClassName} ${disabledClassName}`}>
                  {item.label}
                </span>
              </li>
            );
          }

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={`${baseClassName} ${isActive ? activeClassName : enabledClassName}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
