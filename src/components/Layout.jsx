import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AiIcon,
  AssetsIcon,
  HomeIcon,
  ScheduleIcon,
  WeatherIcon,
} from "../assets/icons/index.jsx";

const navItems = [
  { to: "/", label: "\uD648", Icon: HomeIcon, matchPaths: ["/", "/home"] },
  { to: "/weather", label: "\uB0A0\uC528", Icon: WeatherIcon, matchPaths: ["/weather"] },
  {
    to: "/accounts",
    label: "\uC790\uC0B0",
    Icon: AssetsIcon,
    matchPaths: ["/accounts", "/transactions"],
  },
  { to: "/ai", label: "AI", Icon: AiIcon, matchPaths: ["/ai"] },
  { to: "/schedule", label: "\uC77C\uC815", Icon: ScheduleIcon, matchPaths: ["/schedule"] },
];

function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto flex h-full w-full max-w-[403px] flex-col bg-canvas text-ink">
      <main className="no-scrollbar flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav
        className="flex shrink-0 items-center justify-around border-t border-[#E9EDF2] bg-white px-[6px] pt-[8px] pb-[10px]"
        aria-label="\uD558\uB2E8 \uB124\uBE44\uAC8C\uC774\uC158"
      >
        {navItems.map(({ to, label, Icon, matchPaths }) => {
          const isActive = matchPaths.includes(pathname);

          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-[4px] text-[11px] font-medium transition-colors ${
                isActive ? "text-[#155DFC]" : "text-muted"
              }`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default Layout;
