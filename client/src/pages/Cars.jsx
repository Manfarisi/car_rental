import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets, dummyCarData } from "../assets/assets";
import CarCard from "../components/CarCard";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Cars = () => {
  // getting serch panel from url
  const [searchParams] = useSearchParams();
  const pickupLocation = searchParams.get("pickupLocation");
  const pickupDate = searchParams.get("pickupDate");
  const returnDate = searchParams.get("returnDate");

  const { cars, axios } = useAppContext();

  const isSearchData = pickupLocation && pickupDate && returnDate;

  const [filteredCars, setFilteredCars] = useState([]);
  const [input, setInput] = useState("");

  const applyFilter = () => {
    if (input === "") {
      setFilteredCars(cars);
    } else {
      const filtered = cars.filter(
        (car) =>
          car.category.toLowerCase().includes(input.toLowerCase()) ||
          car.model.toLowerCase().includes(input.toLowerCase()) ||
          car.transmission.toLowwerCase().includes(input.toLowerCase())
      );
      setFilteredCars(filtered);
    }
  };



  const searchCarAvailability = async () => {
    const { data } = await axios.post("/api/bookings/check-availability", {
      location: pickupLocation,
      pickupDate,
      returnDate,
    });
    if (data.success) {
      setFilteredCars(data.availableCars);
      if (data.availableCars.length === 0) {
        toast("No Cars available");
      }
      return null;
    }
  };

  useEffect(() => {
    if (isSearchData) {
      searchCarAvailability();
    } else if (cars.length > 0) {
      setFilteredCars(cars);
    }
  }, [pickupLocation, pickupDate, returnDate, cars]);

  useEffect(() => {
    if (!isSearchData) {
      applyFilter();
    }
  }, [input]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        <Title
          title="Available Cars"
          subTitle="Browse our selection of premium vehicles available for your next adventure"
        />

        {/* SEARCH BAR */}
        <div className="flex items-center gap-3 bg-white shadow-md border border-gray-200 rounded-xl px-4 py-3 max-w-xl">
          <img src={assets.search_icon} alt="" className="w-5 opacity-60" />
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Search by make, model, or features"
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
          <img
            src={assets.filter_icon}
            alt=""
            className="w-5 opacity-60 cursor-pointer hover:opacity-100 transition"
          />
        </div>
      </div>

      {/* LIST HEADER */}
      <div className="mt-10 flex items-center justify-between">
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredCars.length}
          </span>{" "}
          Cars
        </p>
      </div>

      {/* CAR GRID */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCars.map((car, index) => (
          <div key={index}>
            <CarCard car={car} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cars;
