import { navItems } from "@/config/navItems";
import NavItem from "../ui/NavItem";

export default function BottomNavbar() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-indigo-950 shadow-lg z-30">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            iconClass={item.iconClass}
            label={item.label}
            className="flex-1 flex justify-center p-2 text-white/70"
            activeClassName="text-white"
          />
        ))}
      </div>
    </div>
  );
}
