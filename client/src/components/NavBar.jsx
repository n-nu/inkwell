import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="border-b border-stone-200 bg-white" aria-label="Main navigation">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-serif text-2xl font-semibold tracking-tight">Inkwell</Link>
        <div className="flex gap-5 text-sm font-medium">
          <Link to="/write" className="text-stone-600 hover:text-stone-950">Write</Link>
          <Link to="/login" className="text-stone-600 hover:text-stone-950">Log In</Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
