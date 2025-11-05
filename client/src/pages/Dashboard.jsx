import Navbar from '../components/Navbar';

function Dashboard() {
  return (
     <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Calendar</h1>
        <p className="text-gray-600">Your events will appear here.</p>
      </div>
    </div>
  )
}

export default Dashboard
