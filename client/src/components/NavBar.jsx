import { NavLink } from 'react-router-dom';

function NavBar() {
  const navLinkClasses = ({ isActive }) => [
    'inline-flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950',
  ].join(' ');

  return (
    <nav className="border-b border-stone-200 bg-white/95 backdrop-blur-sm" aria-label="Main navigation">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <NavLink to="/" className="inline-flex items-center gap-2.5 text-stone-900">
          <img src="/inkwell-icon.svg" alt="Inkwell" className="h-8 w-8 rounded-md object-cover" />
          <span className="font-serif text-xl font-semibold tracking-tight md:text-2xl">Inkwell</span>
        </NavLink>

        <div className="flex items-center gap-2 text-sm font-medium md:gap-3">
          <NavLink to="/write" className={navLinkClasses}>Write</NavLink>
          <NavLink to="/login" className={navLinkClasses}>Log In</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
