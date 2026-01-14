import imagekit from "../configs/imagekit.js"
import Booking from "../models/Booking.js"
import Car from "../models/Car.js"
import User from "../models/User.js"
import fs from 'fs'
export const changeRoleToOwner = async (req,res)=>{
    try {
        const {_id} = req.user
        await User.findByIdAndUpdate(_id,{role:"owner"})
        res.json({success:true,message:"Now you can list cars"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

// api to list car
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const car = JSON.parse(req.body.carData);
    const imageFiles = req.files;

    if (!imageFiles || imageFiles.length === 0) {
      return res.json({ success: false, message: "Images required" });
    }

    const uploadedImages = [];

    for (const file of imageFiles) {
      const fileBuffer = fs.readFileSync(file.path);

      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: file.originalname,
        folder: "/cars",
      });

      const optimizedImageUrl = imagekit.url({
        path: response.filePath,
        transformation: [
          { width: "1280" },
          { quality: "auto" },
          { format: "webp" },
        ],
      });

      uploadedImages.push(optimizedImageUrl);
    }

    await Car.create({
      ...car,
      owner: _id,
      images: uploadedImages,
    });

    res.json({ success: true, message: "Car added successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// api to list owner cars
export const getOwnerCars = async (req,res)=>{
try {
    const {_id} = req.user
    const cars = await Car.find({owner:_id})
    res.json({success:true, cars})
} catch (error) {
    console.log(error.message)
    res.json({success:false,message:error.message})
}
}

// api to toggle car availibility
export const toggleCarAvailability = async (req,res)=>{
    try {
        const {_id} = req.user
        const {carId} = req.body
        const car = await Car.findById(carId)

        // checking is car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({success: false, message: "Unauthorized"})
        }

        car.isAvailable = !car.isAvailable
        await car.save()
        res.json({success:true, message: 'Availability Toggled'})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

// api to delete car
export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user
    const { carId } = req.body

    const car = await Car.findById(carId)

    if (!car) {
      return res.json({ success: false, message: "Car not found" })
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" })
    }

    await Car.findByIdAndDelete(carId)

    res.json({ success: true, message: "Car deleted" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


// api get dashboard data
export const getDashboardData = async(req,res)=>{
    try {
        const {_id,role} = req.user

        if(role !== 'owner'){
            return res.json({success: false, message: 'Unauthorized'})
        }

        const cars = await Car.find({owner:_id})
        const bookings = await Booking.find({owner: _id}).populate('car').sort({createdAt: -1})

        const pendingBookings = await Booking.find({owner: _id,status:"Pending"})
        const completedBookings = await Booking.find({owner: _id,status:"Confirmed"})

        // calculate montlyRevenue from bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking =>booking.status === 'Confirmed').reduce((acc,booking)=>acc + booking.price,0)
        const dashboardData = {
            totalCars:cars.length,
            totalBookings:bookings.length,
            pendingBookings:pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings:bookings.slice(0,3),
            monthlyRevenue
        }

        res.json({success:true,dashboardData})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;

    // ⛔ cek file
    if (!req.file) {
      return res.json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const imageFile = req.file;

    // read file buffer
    const fileBuffer = fs.readFileSync(imageFile.path);

    // upload to imagekit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/users",
    });

    // optimized image url
    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: "480" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    // update user image
    await User.findByIdAndUpdate(_id, {
      image: optimizedImageUrl,
    });

    // 🧹 hapus file lokal
    fs.unlinkSync(imageFile.path);

    res.json({
      success: true,
      message: "Update Successful",
      image: optimizedImageUrl,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};