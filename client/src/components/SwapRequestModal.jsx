import { useState} from "react";
import { formatDateTime } from "../utils/formatDateTime";
const SwapRequestModal = ({
  isOpen,
  onClose,
  selectedSlot,
  userEvents,
  onConfirm,
}) => {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter only SWAPPABLE events
  const swappableEvents = userEvents.filter(
    (event) => event.status === "SWAPPABLE"
  );

  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId);
  };

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedEventId) {
      setError("Please select an event to swap");
      return;
    }

    // validation: cannot swap with own event
    const selectedEvent = userEvents.find((e) => e._id === selectedEventId);

    if (selectedEvent.userId === selectedSlot.userId._id) {
      setError("Cannot swap with your own event");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onConfirm(selectedEventId, selectedSlot._id);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create swap request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Request Swap</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Slot Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold text-gray-800 mb-2">
            You want to swap for:
          </h3>
          <p className="text-lg font-bold text-blue-700">
            {selectedSlot.title}
          </p>
          <p className="text-sm text-gray-600">
            by {selectedSlot.userId.username}
          </p>
          <p className="text-sm text-gray-700 mt-2">
            {formatDateTime(selectedSlot.startTime)} →{" "}
            {formatDateTime(selectedSlot.endTime)}
          </p>
        </div>

        {/* Select Slot */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Select your event to offer:
          </label>

          {swappableEvents.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded text-yellow-800">
              You have no swappable events. Please mark an event as swappable in
              your dashboard first.
            </div>
          ) : (
            <select
              value={selectedEventId}
              onChange={(e) => handleEventSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {swappableEvents.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title} ({formatDateTime(event.startTime)})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || swappableEvents.length === 0}
            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Requesting..." : "Confirm Swap"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapRequestModal;
