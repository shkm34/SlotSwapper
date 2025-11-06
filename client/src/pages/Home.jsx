import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Home () {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-5xl font-bold mb-4">SlotSwapper</h1>
        <p className="text-xl mb-8">
          Swap your calendar slots with others in real-time
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-blue-600 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-12 text-blue-100 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <ul className="space-y-3 text-left">
            <li className="flex items-start">
              <span className="mr-3">1.</span>
              <span>Create calendar events and mark them as swappable</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">2.</span>
              <span>Browse other users' swappable time slots</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">3.</span>
              <span>Request swaps and manage incoming requests</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">4.</span>
              <span>Accept or reject swaps and update your calendar</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
