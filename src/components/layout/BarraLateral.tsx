import { navItems } from "@/config/navItems.ts";
import NavItem from "@/components/ui/NavItem.tsx";

export default function BarraLateral() {
  return (
    <div className="h-full w-16 bg-indigo-950 flex flex-col items-center py-4 gap-4">
      {navItems.map((item) => (
        <NavItem
          key={item.to}
          to={item.to}
          iconClass={item.iconClass}
          label={item.label}
          className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          activeClassName="text-white bg-white/20"
        />
      ))}
    </div>
  );
}
