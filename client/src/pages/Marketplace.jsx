import Navbar from '../components/Navbar';

function Marketplace() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
        <p className="text-gray-600">Swappable slots from other users will appear here.</p>
      </div>
    </div>
  )
}

export default Marketplace
