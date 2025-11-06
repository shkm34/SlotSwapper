import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CreateEventForm from "../components/CreateEventForm";
import EventList from "../components/EventList";
import api from "../utils/api";
import { useApp } from '../context/AppContext';

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
   const { refreshTrigger, triggerRefresh } = useApp();

  // Fetch user's events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      setEvents(response.data.events);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  // Create new event
  const handleCreateEvent = async (eventData) => {
    try {
      await api.post("/events", eventData);
      await fetchEvents(); // Local refresh
      triggerRefresh(); // Global refresh
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create event");
    }
  };

  // Toggle event status
  const handleStatusToggle = async (eventId, newStatus) => {
    try {
      await api.patch(`/events/${eventId}/status`, { status: newStatus });
      await fetchEvents(); // Local refresh
      triggerRefresh(); // Global refresh
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  // Delete event
  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
     await fetchEvents(); // Local refresh
      triggerRefresh(); // Global refresh
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete event");
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Calendar</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <CreateEventForm onEventCreated={handleCreateEvent} />

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">My Events</h2>
          <EventList
            events={events}
            onStatusToggle={handleStatusToggle}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
