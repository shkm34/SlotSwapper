import { Link } from 'react-router-dom';

function NotFound (){
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>

        <p className="text-gray-500 mb-8">
          Page doesn't exist.
        </p>

        <Link
          to="/"
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
