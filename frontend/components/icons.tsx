import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

export function ClientsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8.5" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <circle cx="17" cy="8.5" r="2.6" />
      <path d="M15.5 13c2.6.2 4.5 2.3 4.5 5.3" />
    </Icon>
  );
}

export function PatientsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3c1 2 3 2.6 3 5a3 3 0 0 1-6 0c0-2.4 2-3 3-5Z" />
      <path d="M6 21c0-4 2.5-6.5 6-6.5S18 17 18 21" />
    </Icon>
  );
}

export function AnimalsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 10c0-3 2-6 8-6s8 3 8 6-2 8-8 8-8-5-8-8Z" />
      <circle cx="9" cy="9" r="0.6" fill="currentColor" />
      <circle cx="15" cy="9" r="0.6" fill="currentColor" />
    </Icon>
  );
}

export function AnimalTypesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 12 12 20l-8-8V5a2 2 0 0 1 2-2h7l7 9Z" />
      <circle cx="8.5" cy="7.5" r="1" />
    </Icon>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="12" cy="10.5" r="2.5" />
      <path d="M7.5 18c.5-2.5 2-3.5 4.5-3.5s4 1 4.5 3.5" />
    </Icon>
  );
}

export function PasswordIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2.2} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2} {...props}>
      <path d="M15 6l-6 6 6 6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon strokeWidth={2} {...props}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}
