import { Link, useLocation } from 'react-router-dom';
import { Train, Search, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-teal text-white'
        : 'text-gray-600 hover:text-teal hover:bg-teal-light'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-teal font-bold text-lg">
          <Train size={22} strokeWidth={2.2} />
          <span>CiviSeva</span>
          <span className="text-[10px] font-normal text-gray-400 ml-1 hidden sm:inline">
            KMRL Grievance Redressal
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/" className={linkClass('/')}>
            <Train size={15} /> Submit
          </Link>
          <Link to="/track" className={linkClass('/track')}>
            <Search size={15} /> Track
          </Link>
          <Link to="/official" className={linkClass('/official')}>
            <ShieldCheck size={15} /> Official
          </Link>
        </div>
      </div>
    </nav>
  );
}

