import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
    price: { type: Number, required: true },
    paymentMethod: {type: String, required: true,
      enum: ["Cash","Transfer"],
      default: "Cash"
    }
  },{ timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
