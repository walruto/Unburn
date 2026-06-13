import Header from './Header';
import BottomNav from './BottomNav';
import DesktopSidebar from './DesktopSidebar';

export default function AppLayout({ active, wrapperClassName, mainClassName, children }) {
  return (
    <div className={wrapperClassName}>
      <Header />
      <main className={mainClassName}>{children}</main>
      <BottomNav active={active} />
      <DesktopSidebar active={active} />
    </div>
  );
}
