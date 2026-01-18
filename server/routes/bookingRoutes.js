import express from "express";
import {
  cancelBooking,
  changeBookingStatus,
  checkAvailabilityOfCar,
  createBooking,
  getBookedDates,
  getOwnerBookings,
  getUserBookings,
} from "../controller/bookingController.js";
import { protect } from "../middleware/auth.js";
const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityOfCar);
bookingRouter.post("/create", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/booked-dates/:carId", getBookedDates);
bookingRouter.get("/owner", protect, getOwnerBookings);
bookingRouter.post("/change-status", protect, changeBookingStatus);
bookingRouter.put("/cancel/:bookingId", protect, cancelBooking);

export default bookingRouter;
