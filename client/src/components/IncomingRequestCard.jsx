import { useState } from "react";
import { formatDateTime } from "../utils/formatDateTime";

function IncomingRequestCard({ request, onAccept, onReject, loading }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(request.status);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await onAccept(request._id);
      setRequestStatus("ACCEPTED");
    } catch (err) {
      setError(err.message || "Failed to accept swap request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await onReject(request._id);
      setRequestStatus("REJECTED");
    } catch (err) {
      setError(err.message || "Failed to reject swap request");
    } finally {
      setActionLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 rounded p-4 text-red-800">
        {error}
      </div>
    );
  }


  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {request.requesterId.username} wants to swap
        </h3>
        <p className="text-sm text-gray-600">
          Request received on {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Requested Offer */}
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            They offer their slot:
          </p>
          <p className="text-lg font-bold text-blue-700">
            {request.requesterSlotId.title}
          </p>
          <p className="text-sm text-gray-600">
            {formatDateTime(request.requesterSlotId.startTime)} →{" "}
            {formatDateTime(request.requesterSlotId.endTime)}
          </p>
        </div>

        {/* Your Slot */}
        <div className="p-4 bg-green-50 rounded">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            In exchange for your slot:
          </p>
          <p className="text-lg font-bold text-green-700">
            {request.receiverSlotId.title}
          </p>
          <p className="text-sm text-gray-600">
            {formatDateTime(request.receiverSlotId.startTime)} →{" "}
            {formatDateTime(request.receiverSlotId.endTime)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {requestStatus === "PENDING" && (
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={actionLoading || loading}
            className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
          >
            {actionLoading ? "Accepting..." : "Accept"}
          </button>
          <button
            onClick={handleReject}
            disabled={actionLoading || loading}
            className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:bg-gray-400 transition-colors"
          >
            {actionLoading ? "Rejecting..." : "Reject"}
          </button>
        </div>
      )}
      
      {requestStatus === "ACCEPTED" && (
        <div className="p-3 bg-green-100 border border-green-400 rounded text-green-800 text-sm">
          ✓ You have accepted this swap request.
        </div>
      )}

      {requestStatus === "REJECTED" && (
        <div className="p-3 bg-red-100 border border-red-400 rounded text-red-800 text-sm">
          ✗ You have rejected this swap request.
        </div>
      )}
    </div>
  );
}

export default IncomingRequestCard;
