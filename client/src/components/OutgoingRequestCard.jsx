import { formatDateTime } from "../utils/formatDateTime";
import { getStatusColor, statusBadgeColor } from "../utils/getColor";

function OutgoingRequestCard ({ request }) {

  return (
    <div
      className={`rounded-lg shadow-md p-6 border-l-4 ${getStatusColor(
        request.status
      )}`}
    >
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Swap request to {request.receiverId.username}
          </h3>
          <p className="text-sm text-gray-600">
            Sent on {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeColor(
            request.status
          )}`}
        >
          {request.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Your Offer */}
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            You offered:
          </p>
          <p className="text-lg font-bold text-blue-700">
            {request.requesterSlotId.title}
          </p>
          <p className="text-sm text-gray-600">
            {formatDateTime(request.requesterSlotId.startTime)} →{' '}
            {formatDateTime(request.requesterSlotId.endTime)}
          </p>
        </div>

        {/* Their Slot */}
        <div className="p-4 bg-purple-50 rounded">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            For their slot:
          </p>
          <p className="text-lg font-bold text-purple-700">
            {request.receiverSlotId.title}
          </p>
          <p className="text-sm text-gray-600">
            {formatDateTime(request.receiverSlotId.startTime)} →{' '}
            {formatDateTime(request.receiverSlotId.endTime)}
          </p>
        </div>
      </div>

      {request.status === 'ACCEPTED' && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded text-green-800 text-sm">
          ✓ This swap has been accepted! Check your dashboard to see the
          updated events.
        </div>
      )}

      {request.status === 'REJECTED' && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded text-red-800 text-sm">
          ✗ This swap request was rejected.
        </div>
      )}
    </div>
  );
};

export default OutgoingRequestCard;
