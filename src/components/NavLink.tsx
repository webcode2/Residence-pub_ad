"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef, ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type NavLinkCompatProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  to: string;
  activeClassName?: string;
  pendingClassName?: string;
};

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName: _pending, to, ...props }, ref) => {
    const active = usePathname() === to;
    return <Link ref={ref} href={to} aria-current={active ? 'page' : undefined}
      className={cn(className, active && activeClassName)} {...props} />;
  },
);
NavLink.displayName = 'NavLink';
export { NavLink };
