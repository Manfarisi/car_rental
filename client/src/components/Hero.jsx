import React, { useState } from "react";
import { assets, cityList } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate } =
    useAppContext();
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      "/cars?pickupLocation=" +
        pickupLocation +
        "&pickupDate=" +
        pickupDate +
        "&returnDate=" +
        returnDate
    );
  };

  return (
    <div className="w-full bg-linear-to-b from-[#eef3ff] to-[#f9fbff] pt-20 pb-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Heading */}
        <h1 className="text-5xl font-extrabold text-gray-900 mb-12 tracking-tight">
          Luxury Cars on Rent
        </h1>

        {/* Search Card */}
        <form
          onSubmit={handleSearch}
          className="
            bg-white/80 backdrop-blur-lg border border-white/50 shadow-2xl 
            rounded-full py-6 px-8
            flex flex-col md:flex-row items-center gap-8 md:gap-10 
            mx-auto w-full md:w-fit
          "
        >
          {/* Pickup Location */}
          <div className="text-left w-full md:w-auto">
            <p className="text-gray-900 font-semibold text-sm">
              Pickup Location
            </p>

            <select
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full md:w-44 bg-transparent text-gray-700 mt-1 outline-none"
            >
              <option value="">Select location</option>
              {cityList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <p className="text-gray-400 text-xs mt-1">
              {pickupLocation || "Please select location"}
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-gray-300/60" />

          {/* Pick-up Date */}
          <div className="text-left w-full md:w-auto">
            <p className="text-gray-900 font-semibold text-sm">Pick-up Date</p>
            <input
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="mt-1 outline-none bg-transparent"
              required
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-gray-300/60" />

          {/* Return Date */}
          <div className="text-left w-full md:w-auto">
            <p className="text-gray-900 font-semibold text-sm">Return Date</p>
            <input
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              type="date"
              className="mt-1 outline-none bg-transparent"
              required
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="
              bg-blue-600 hover:bg-blue-700 text-white font-medium 
              rounded-full py-4 px-10
              flex items-center gap-2 shadow-md transition-all
              hover:shadow-lg active:scale-95
            "
          >
            <img
              src={assets.search_icon}
              alt="search"
              className="w-5 invert brightness-0"
            />
            Search
          </button>
        </form>

        {/* Car Image */}
        <img
          src={assets.main_car}
          alt="car"
          className="max-w-4xl w-full mx-auto mt-14 drop-shadow-[0_30px_35px_rgba(0,0,0,0.20)]"
        />
      </div>
    </div>
  );
};

export default Hero;
