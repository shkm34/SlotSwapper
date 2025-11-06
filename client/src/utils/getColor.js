export const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-l-yellow-500";
    case "ACCEPTED":
      return "bg-green-100 text-green-800 border-l-green-500";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-l-red-500";
    default:
      return "bg-gray-100 text-gray-800 border-l-gray-500";
  }
};

export const statusBadgeColor = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-200 text-yellow-800";
    case "ACCEPTED":
      return "bg-green-200 text-green-800";
    case "REJECTED":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};
