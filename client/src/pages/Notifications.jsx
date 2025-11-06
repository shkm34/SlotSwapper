import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import IncomingRequestCard from "../components/IncomingRequestCard";
import OutgoingRequestCard from "../components/OutgoingRequestCard";
import api from "../utils/api";
import { useApp } from '../context/AppContext';

function Notifications() {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { refreshTrigger, triggerRefresh } = useApp();

  // Fetch swap requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/swap-request/my-requests");
      setIncomingRequests(response.data.incoming);
      setOutgoingRequests(response.data.outgoing);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch swap requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [refreshTrigger]);

  // Handle accept swap request
  const handleAccept = async (swapRequestId) => {
    try {
      setActionLoading(true);
      await api.post(`/swap-request/respond/${swapRequestId}`, {
        action: "ACCEPT",
      });

      setSuccessMessage(
        "Swap request accepted! Check your dashboard for updates."
      );

      // Trigger global refresh
      triggerRefresh();

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept swap request");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject swap request
  const handleReject = async (swapRequestId) => {
    if (!window.confirm("Are you sure you want to reject this swap request?")) {
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/swap-request/respond/${swapRequestId}`, {
        action: "REJECT",
      });

      setSuccessMessage("Swap request rejected.");

      // Trigger global refresh
      triggerRefresh();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject swap request");
    } finally {
      setActionLoading(false);
    }
  };

  // auto-refresh notifications every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Auto-clear errors after 5s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Swap Requests</h1>
          <p className="text-gray-600">
            Manage incoming and outgoing swap requests
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

        {loading ? (
          <div className="text-center py-8">Loading swap requests...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
            {/* Incoming Requests */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Incoming Requests</h2>

              {incomingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
                  No incoming swap requests
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[600px]">
                  {incomingRequests.map((request) => (
                    <IncomingRequestCard
                      key={request._id}
                      request={request}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      loading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Outgoing Requests</h2>

              {outgoingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
                  No outgoing swap requests
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[600px]">
                  {outgoingRequests.map((request) => (
                    <OutgoingRequestCard key={request._id} request={request} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={triggerRefresh}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
