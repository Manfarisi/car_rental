import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

// function to check availability of car for a given date
export const checkAvailability = async (carId, pickupDate, returnDate) => {
  const booking = await Booking.findOne({
    car: carId,
    status: { $in: ["Confirmed", "Pending", "Cancelled"] },
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
  });

  if (!booking) {
    return { available: true };
  }

  return {
    available: false,
    bookedFrom: booking.pickupDate,
    bookedUntil: booking.returnDate,
  };
};

// api to check availability of cars for the given Date and location
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    const cars = await Car.find({
      location,
      isAvailable: true,
    });

    const carsWithAvailability = await Promise.all(
      cars.map(async (car) => {
        const availability = await checkAvailability(
          car._id,
          pickupDate,
          returnDate
        );

        return {
          ...car._doc,
          isDateAvailable: availability.available,
          bookedFrom: availability.bookedFrom || null,
          bookedUntil: availability.bookedUntil || null,
        };
      })
    );

    res.json({
      success: true,
      cars: carsWithAvailability,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// create booking
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { car, pickupDate, returnDate, paymentMethod } = req.body;

    if (!pickupDate || !returnDate) {
      return res.json({
        success: false,
        message: "Pickup date and return date are required",
      });
    }

    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ❌ tanggal tidak valid
    if (picked >= returned) {
      return res.json({
        success: false,
        message: "Return date must be after pickup date",
      });
    }

    // ❌ booking masa lalu
    if (picked < today) {
      return res.json({
        success: false,
        message: "Pickup date cannot be in the past",
      });
    }

    // cek availability (IMPORTANT)
    const availability = await checkAvailability(car, pickupDate, returnDate);

    if (!availability.available) {
      return res.json({
        success: false,
        message: "Car already booked for selected dates",
        bookedFrom: availability.bookedFrom,
        bookedUntil: availability.bookedUntil,
      });
    }

    const carData = await Car.findById(car);
    if (!carData) {
      return res.json({
        success: false,
        message: "Car not found",
      });
    }

    // hitung jumlah hari (min 1 hari)
    const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));

    const price = carData.pricePerDay * noOfDays;

    // paymentMthod
    if (!["Cash", "Transfer"].includes(paymentMethod)) {
      return res.json({
        success: false,
        message: "Invalid payment method",
      });
    }

    await Booking.create({
      car,
      owner: carData.owner,
      user: _id,
      pickupDate,
      returnDate,
      price,
      paymentMethod,
      status: "Pending", // 🔥 PENTING
    });

    res.json({
      success: true,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// GET booked dates for a car
export const getBookedDates = async (req, res) => {
  try {
    const { carId } = req.params;

    const bookings = await Booking.find({
      car: carId,
      status: { $in: ["Confirmed", "Pending", "Cancelled"] },
    }).select("pickupDate returnDate");

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// api to list user bookings
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id })
      .populate("car")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api get owner booking
export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car user")
      .select("-user.password")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to change booking status
export const changeBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (booking.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }
    booking.status = status;
    await booking.save();
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to cancel booking (USER)
export const cancelBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (booking.user.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (booking.status === "Cancelled") {
      return res.json({ success: false, message: "Already cancelled" });
    }

    if (new Date(booking.pickupDate) <= new Date()) {
      return res.json({ success: false, message: "Pickup date already passed" });
    }

    booking.status = "Cancelled";
    await booking.save();

    await Car.findByIdAndUpdate(booking.car, {
      isAvailable: true,
    });

    res.json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
