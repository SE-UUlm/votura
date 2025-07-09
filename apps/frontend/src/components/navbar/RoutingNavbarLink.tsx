import { NavLink, type NavLinkProps } from '@mantine/core';
import { NavLink as RouterNavLink } from 'react-router';

export interface RoutingNavLinkProps {
  to: string;
  icon?: NavLinkProps['leftSection'];
  label: NavLinkProps['label'];
}

export const RoutingNavbarLink = ({ to, icon, label }: RoutingNavLinkProps) => {
  return (
    <RouterNavLink to={to} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <NavLink
          component="button"
          active={isActive}
          variant="light"
          leftSection={icon}
          childrenOffset={28}
          label={label}
          styles={{
            root: {
              borderRadius: 'var(--mantine-radius-default)',
            },
          }}
        />
      )}
    </RouterNavLink>
  );
};
