import Navbar from '../components/Navbar';

function Notification() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Swap Requests</h1>
        <p className="text-gray-600">Incoming and outgoing swap requests will appear here.</p>
      </div>
    </div>
  )
}

export default Notification
