import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [incomingCount, setIncomingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { triggerRefresh, refreshTrigger } = useApp();

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        setLoading(true);
        const response = await api.get('/swap-request/my-requests');
        setIncomingCount(response.data.incoming.filter(r => r.status === 'PENDING').length);
      } catch (err) {
        console.error('Failed to fetch notification count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 60000);

    return () => clearInterval(interval);
  }, [refreshTrigger]);

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
            {incomingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {incomingCount}
              </span>
            )}
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
