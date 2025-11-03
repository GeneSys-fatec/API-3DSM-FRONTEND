import { NavLink } from "react-router-dom";

interface NavItemProps {
  to: string;
  iconClass: string;
  label: string;
  className?: string;
  activeClassName?: string;
}

export default function NavItem({
  to,
  iconClass,
  label,
  className,
  activeClassName,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `${className} ${isActive ? activeClassName : ""}`
      }
    >
      <i className={`${iconClass} text-2xl`}></i>
    </NavLink>
  );
}
