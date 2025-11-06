import { formatDateTime } from "../utils/formatDateTime";

function MarketplaceSlots ({ slots, loading, onRequestSwap }) {

  if (loading) {
    return <div className="text-center py-8">Loading marketplace...</div>;
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No swappable slots available at the moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {slots.map((slot) => (
        <div
          key={slot._id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {slot.title}
            </h3>
            <p className="text-sm text-gray-600">
              by <span className="font-semibold">{slot.userId.username}</span>
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-700">
              <span className="font-semibold mr-2">Start:</span>
              {formatDateTime(slot.startTime)}
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <span className="font-semibold mr-2">End:</span>
              {formatDateTime(slot.endTime)}
            </div>
          </div>

          <button
            onClick={() => onRequestSwap(slot)}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Request Swap
          </button>
        </div>
      ))}
    </div>
  );
};

export default MarketplaceSlots;