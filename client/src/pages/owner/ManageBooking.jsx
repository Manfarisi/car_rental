import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ManageBooking = () => {
  const { currency, axios } = useAppContext();
  const [bookings, setBookings] = useState([]);

  const fetchOwnerBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/owner");
      data.success ? setBookings(data.bookings) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post("/api/bookings/change-status", {
        bookingId,
        status,
      });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const statusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Title title="Manage Bookings" />

      <div className="mt-8 max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full border-collapse">
          {/* HEADER */}
          <thead className="bg-gray-100 border-b">
            <tr className="text-left text-lg font-semibold text-gray-700">
              <th className="px-8 py-5">Car</th>
              <th className="px-8 py-5">Date Range</th>
              <th className="px-8 py-5">Total</th>
              <th className="px-8 py-5">Payment</th>
              <th className="px-8 py-5 text-center">Status</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {bookings.map((booking, index) => (
              <tr
                key={index}
                className="border-b last:border-none hover:bg-gray-50 hover:shadow-md transition-all"
              >
                {/* CAR */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <img
                      src={booking.car.image}
                      alt={booking.car.model}
                      className="w-28 h-20 rounded-xl object-cover border shadow-sm"
                    />
                    <p className="text-xl font-bold text-gray-900">
                      {booking.car.brand} {booking.car.model}
                    </p>
                  </div>
                </td>

                {/* DATE RANGE */}
                <td className="px-8 py-6">
                  <span className="inline-block px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-base font-medium">
                    {booking.pickupDate.split("T")[0]} →{" "}
                    {booking.returnDate.split("T")[0]}
                  </span>
                </td>

                {/* TOTAL */}
                <td className="px-8 py-6 text-xl font-bold text-gray-900">
                  {currency}
                  {booking.price}
                </td>

                {/* PAYMENT */}
                <td className="px-8 py-6 space-y-2">
                  {/* PAYMENT LABEL */}
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold
      ${
        booking.status === "Cancelled"
          ? booking.paymentMethod === "Transfer"
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-600"
          : booking.paymentMethod === "Cash"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}
                  >
                    {booking.status === "Cancelled"
                      ? booking.paymentMethod === "transfer"
                        ? "Refund"
                        : "Cancelled"
                      : booking.paymentMethod === "cash"
                      ? "Cash"
                      : "Transfer"}
                  </span>

                  {/* STATUS */}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium
      ${
        booking.status === "Confirmed"
          ? "bg-green-100 text-green-700"
          : booking.status === "Pending"
          ? "bg-orange-100 text-orange-700"
          : "bg-red-100 text-red-700"
      }`}
                  >
                    {booking.status}
                  </span>
                </td>

                {/* STATUS */}
                <td className="px-8 py-6 text-center">
                  <select
                    value={booking.status}
                    onChange={(e) =>
                      changeBookingStatus(booking._id, e.target.value)
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-semibold outline-none cursor-pointer
      transition-all duration-200
      ${statusStyle(booking.status)}
    `}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="py-14 text-center text-lg text-gray-500">
            No bookings found
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBooking;
