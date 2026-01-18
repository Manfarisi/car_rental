import express from "express";
import {
  addCar,
  changeRoleToOwner,
  deleteCar,
  getDashboardData,
  getOwnerCars,
  getSingleCar,
  toggleCarAvailability,
  updateCar,
} from "../controller/ownerController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleToOwner);
ownerRouter.post("/add-car", protect, upload.array("images", 5), addCar);
ownerRouter.get("/cars", protect, getOwnerCars);
ownerRouter.get("/car/:id", protect, getSingleCar);

ownerRouter.put(
  "/update-car/:id",
  protect,
  upload.array("images", 5),
  updateCar
);


ownerRouter.post("/toggle-car", protect, toggleCarAvailability);
ownerRouter.post("/delete-car", protect, deleteCar);
ownerRouter.get("/dashboard", protect, getDashboardData);

export default ownerRouter;
