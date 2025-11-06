import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MarketplaceSlots from "../components/MarketplaceSlots";
import SwapRequestModal from "../components/SwapRequestModal";
import api from "../utils/api";
import { useApp } from '../context/AppContext';

function Marketplace() {
  const [slots, setSlots] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

   const { refreshTrigger, triggerRefresh } = useApp();

  // Fetch marketplace slots-
  // only SWAPPABLE slots from other users
  const fetchMarketplaceSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get("/swap-request/swappable-slots");
      setSlots(response.data.slots);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch marketplace slots"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's events for swap selection
  const fetchUserEvents = async () => {
    try {
      const response = await api.get("/events");
      setUserEvents(response.data.events);
    } catch (err) {
      console.error("Failed to fetch user events:", err);
    }
  };

  useEffect(() => {
    fetchMarketplaceSlots();
    fetchUserEvents();
  }, [refreshTrigger]);

  // Handle request swap button click
  const handleRequestSwap = (slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  // Handle swap confirmation
  const handleConfirmSwap = async (mySlotId, theirSlotId) => {
    try {
      await api.post("/swap-request/create", {
        mySlotId,
        theirSlotId,
      });

      setSuccessMessage("Swap request sent successfully!");

      triggerRefresh(); // Trigger global refresh

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to create swap request"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-gray-600">
            Browse swappable slots from other users and request swaps
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Found {slots.length} swappable slot{slots.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={triggerRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>

        <MarketplaceSlots
          slots={slots}
          loading={loading}
          onRequestSwap={handleRequestSwap}
        />

        {selectedSlot && (
          <SwapRequestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selectedSlot={selectedSlot}
            userEvents={userEvents}
            onConfirm={handleConfirmSwap}
          />
        )}
      </div>
    </div>
  );
}

export default Marketplace;
