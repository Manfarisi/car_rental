import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Loader from "../components/Loader";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CarDetails() {
  const { id } = useParams();
  const { cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate } =
    useAppContext();

  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const currency = import.meta.env.VITE_CURRENCY;
  const isDateBooked = (date) => {
    return bookedRanges.some((range) => {
      const start = new Date(range.pickupDate);
      const end = new Date(range.returnDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      return date >= start && date <= end;
    });
  };

  /* =========================
     FETCH CAR DETAIL
  ========================== */
  useEffect(() => {
    setCar(cars.find((c) => c._id === id));
  }, [cars, id]);

  /* =========================
     FETCH BOOKED DATES
  ========================== */
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const { data } = await axios.get(`/api/bookings/booked-dates/${id}`);
        if (data.success) {
          setBookedRanges(data.bookings);
        }
      } catch (error) {
        toast.error("Failed to load booked dates");
      }
    };

    fetchBookedDates();
  }, [id]);

  /* =========================
     DISABLE BOOKED DATES
  ========================== */
  const getDisabledDates = () => {
    let dates = [];

    bookedRanges.forEach((range) => {
      let current = new Date(range.pickupDate);
      const end = new Date(range.returnDate);

      current.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });

    return dates;
  };

  /* =========================
     SUBMIT BOOKING
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pickupDate || !returnDate) {
      toast.error("Please select pickup and return date");
      return;
    }

    try {
      const { data } = await axios.post("/api/bookings/create", {
        car: id,
        pickupDate,
        returnDate,
        paymentMethod,
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (!car) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 font-medium"
      >
        <img src={assets.arrow_icon} alt="" className="w-4" />
        Back To All Cars
      </button>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* LEFT */}
        <div className="flex-1 max-w-4xl bg-white rounded-2xl shadow-md p-6">
          <img
            src={car.image}
            alt=""
            className="w-full h-72 object-cover rounded-xl shadow-md"
          />

          <h1 className="text-3xl font-bold mt-6">
            {car.brand} {car.model}
          </h1>
          <p className="text-gray-500">
            {car.category} • {car.year}
          </p>

          <hr className="my-6" />

          <p className="text-gray-600">{car.description}</p>
        </div>

        {/* RIGHT – BOOKING */}
        <div className="w-full lg:flex-[0.35] lg:sticky lg:top-10">
          <div className="p-6 bg-blue-50 shadow-lg rounded-2xl border border-blue-200">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <p className="text-3xl font-bold text-blue-700">
                {currency}
                {car.pricePerDay}
                <span className="text-lg text-gray-600"> / day</span>
              </p>

              {/* PICKUP DATE */}
              <div>
                <label className="font-medium text-gray-700 mb-1 block">
                  Pickup Date
                </label>
                <DatePicker
                  selected={pickupDate ? new Date(pickupDate) : null}
                  onChange={(date) =>
                    setPickupDate(date.toISOString().split("T")[0])
                  }
                  minDate={new Date()}
                  filterDate={(date) => !isDateBooked(date)} // ❌ tetap blok klik
                  dayClassName={(date) =>
                    isDateBooked(date) ? "booked-day" : undefined
                  }
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select pickup date"
                  className="w-full px-3 py-2 rounded-lg border"
                />
              </div>

              {/* RETURN DATE */}
              <div>
                <label className="font-medium text-gray-700 mb-1 block">
                  Return Date
                </label>
                <DatePicker
                  selected={returnDate ? new Date(returnDate) : null}
                  onChange={(date) =>
                    setReturnDate(date.toISOString().split("T")[0])
                  }
                  minDate={pickupDate ? new Date(pickupDate) : new Date()}
                  filterDate={(date) => !isDateBooked(date)}
                  dayClassName={(date) =>
                    isDateBooked(date) ? "booked-day" : undefined
                  }
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select return date"
                  className="w-full px-3 py-2 rounded-lg border"
                />

                {/* PAYMENT METHOD */}
                <div>
                  <label className="font-medium text-gray-700 mb-2 block">
                    Payment Method
                  </label>

                  <div className="flex flex-col gap-3">
                    {/* CASH */}
                    <label
                      className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${
                        paymentMethod === "Cash"
                          ? "border-blue-500 bg-blue-100"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="Cash"
                        checked={paymentMethod === "Cash"}
                        onChange={() => setPaymentMethod("Cash")}
                      />
                      <div>
                        <p className="font-semibold">Cash</p>
                        <p className="text-sm text-gray-600">
                          Pay directly when picking up the car
                        </p>
                      </div>
                    </label>

                    {/* TRANSFER */}
                    <label
                      className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${
                        paymentMethod === "Transfer"
                          ? "border-blue-500 bg-blue-100"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="Transfer"
                        checked={paymentMethod === "Transfer"}
                        onChange={() => setPaymentMethod("Transfer")}
                      />
                      {paymentMethod === "Transfer" && (
                        <div className="bg-white border border-blue-300 rounded-xl p-4">
                          <p className="font-semibold text-gray-800 mb-2">
                            Transfer To:
                          </p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>
                              <strong>Bank:</strong> BCA
                            </li>
                            <li>
                              <strong>Account No:</strong> 1234567890
                            </li>
                            <li>
                              <strong>Account Name:</strong> PT Rental Mobil
                            </li>
                          </ul>

                          <p className="mt-3 text-xs text-red-600">
                            * Upload proof of Transfer will be required
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="font-semibold">Bank Transfer</p>
                        <p className="text-sm text-gray-600">
                          Transfer before pickup
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <button className="mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
                Book Now
              </button>

              <p className="text-sm text-gray-600 text-center">
                ⭐ No credit card required
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetails;
