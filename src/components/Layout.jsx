import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { HomeIcon, WeatherIcon, AssetsIcon, AiIcon, ScheduleIcon } from '../assets/icons/index.jsx'

/*
 * 모든 페이지를 감싸는 공통 레이아웃.
 * 모바일 프레임(최대 폭 403px)을 화면 가운데 두고, 배경은 연회색(canvas).
 * 하단은 5개 탭(홈/날씨/자산/AI/일정). 활성 색은 #155DFC.
 * 홈·날씨·AI는 다른 팀원 담당이라 경로만 잡아둔다.
 *
 * 자산 탭은 계좌(/accounts)와 거래내역(/transactions) 둘 다에서 활성화된다.
 * matchPaths 에 나열된 경로 중 하나라도 현재 경로와 맞으면 활성으로 본다.
 */

const navItems = [
  { to: '/home', label: '홈', Icon: HomeIcon, matchPaths: ['/home'] },
  { to: '/weather', label: '날씨', Icon: WeatherIcon, matchPaths: ['/weather'] },
  { to: '/accounts', label: '자산', Icon: AssetsIcon, matchPaths: ['/accounts', '/transactions'] },
  { to: '/ai', label: 'AI', Icon: AiIcon, matchPaths: ['/ai'] },
  { to: '/schedule', label: '일정', Icon: ScheduleIcon, matchPaths: ['/schedule'] },
]

function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="mx-auto flex h-svh w-full max-w-[403px] flex-col bg-canvas text-ink">
      {/* 콘텐츠 영역: 남는 공간을 차지하며 스크롤된다. */}
      <main className="no-scrollbar flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* 하단 네비게이션: 문서 흐름상 별도의 고정 영역이라 콘텐츠와 절대 겹치지 않는다. */}
      <nav className="flex shrink-0 items-center justify-around border-t border-[#E9EDF2] bg-white px-[6px] pt-[8px] pb-[10px]">
        {navItems.map(({ to, label, Icon, matchPaths }) => {
          const isActive = matchPaths.includes(pathname)
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-[4px] text-[11px] font-medium transition-colors ${
                isActive ? 'text-[#155DFC]' : 'text-muted'
              }`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

export default Layout
