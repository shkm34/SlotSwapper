import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold">
          SlotSwapper
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-blue-200">
            Dashboard
          </Link>
          <Link to="/marketplace" className="hover:text-blue-200">
            Marketplace
          </Link>
          <Link to="/notifications" className="hover:text-blue-200">
            Notifications
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-blue-700 px-4 py-1 rounded hover:bg-blue-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
