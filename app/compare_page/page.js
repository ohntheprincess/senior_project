import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Compare() {
  const router = useRouter();

  const [carData, setCarData] = useState([]);
  const [brands1, setBrands1] = useState([]);
  const [models1, setModels1] = useState([]);
  const [brands2, setBrands2] = useState([]);
  const [models2, setModels2] = useState([]);
  const [selectedBrand1, setSelectedBrand1] = useState("");
  const [selectedModel1, setSelectedModel1] = useState("");
  const [selectedBrand2, setSelectedBrand2] = useState("");
  const [selectedModel2, setSelectedModel2] = useState("");

  useEffect(() => {
    fetch("api/allCar")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCarData(data);
          console.log("Fetched data:", data);

          const uniqueBrands = [...new Set(data.map((car) => car.Brand))];

          setBrands1(uniqueBrands);
          setBrands2(uniqueBrands);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    if (selectedBrand1) {
      const filteredModels = carData
        .filter((car) => car.Brand === selectedBrand1)
        .map((car) => car.Model);
      setModels1([...new Set(filteredModels)]);
    } else {
      setModels1([]);
    }
  }, [selectedBrand1, carData]);

  useEffect(() => {
    if (selectedBrand2) {
      const filteredModels = carData
        .filter((car) => car.Brand === selectedBrand2)
        .map((car) => car.Model);
      setModels2([...new Set(filteredModels)]);
    } else {
      setModels2([]);
    }
  }, [selectedBrand2, carData]);

  const handleBrandChange1 = (event) => {
    setSelectedBrand1(event.target.value);
    setSelectedModel1("");
  };

  const handleModelChange1 = (event) => {
    setSelectedModel1(event.target.value);
  };

  const handleBrandChange2 = (event) => {
    setSelectedBrand2(event.target.value);
    setSelectedModel2("");
  };

  const handleModelChange2 = (event) => {
    setSelectedModel2(event.target.value);
  };

  const isBothSelected =
    selectedBrand1 && selectedModel1 && selectedBrand2 && selectedModel2;

  const getComparisonClass = (value1, value2) => {
    if (value1 > value2) {
      return "text-mainblue font-semibold";
    } else if (value1 < value2) {
      return "text-gray-600 font-semibold";
    } else {
      return "text-gray-400";
    }
  };

  return (
    <div
      className="bg-white w-full flex flex-col items-center text-center font-prompt p-16 pb-24"
      id="section-compare"
    >
      <div className="font-prompt">
        <h5 className="text-2xl font-bold text-mainblue mb-12">
          เปรียบเทียบรถยนต์ไฟฟ้า
        </h5>
      </div>
      <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="flex flex-col w-full text-gray-600 justify-center items-center">
          <p className="font-prompt text-lg text-gray-800 m-2 mt-6">
            เลือก รถยนต์ไฟฟ้าคันที่ 1
          </p>
          <select
            id="brand-select"
            value={selectedBrand1}
            onChange={handleBrandChange1}
            className="text-gray-600 border rounded-md p-3 w-3/4 h-12 my-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Brand</option>
            {brands1.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            id="model-select"
            value={selectedModel1}
            onChange={handleModelChange1}
            disabled={!selectedBrand1}
            className="text-gray-600 border rounded-md p-3 w-3/4 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Model</option>
            {models1.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-full text-gray-600 justify-center items-center">
          <p className="font-prompt text-lg text-gray-800 mt-6">
            เลือก รถยนต์ไฟฟ้าคันที่ 2
          </p>
          <select
            id="brand-select"
            value={selectedBrand2}
            onChange={handleBrandChange2}
            className="text-gray-600 border rounded-md p-3 w-3/4 h-12 my-4 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Brand</option>
            {brands2.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            id="model-select"
            value={selectedModel2}
            onChange={handleModelChange2}
            disabled={!selectedBrand2}
            className="text-gray-600 border rounded-md p-3 w-3/4 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Model</option>
            {models2.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full max-w-4xl place-items-center mt-12">
        {isBothSelected && (
          <div className="grid grid-cols-2 gap-4 w-full">
            {/* รถยนต์คันแรกจ้า */}
            <div className="w-full bg-white rounded-lg shadow-lg p-6 border border-gray-300 hover:shadow-2xl transition-shadow duration-300">
              {carData
                .filter(
                  (car) =>
                    car.Brand === selectedBrand1 && car.Model === selectedModel1
                )
                .map((car) => (
                  <div key={car.Model_ID}>
                    <h3 className="text-xl font-semibold text-mainblue mb-4">
                      {car.Model}
                    </h3>
                    <img
                      src={car.EV_Image_URL}
                      className="w-30 h-30 object-cover mx-auto my-6"
                    ></img>
                    <div className="mb-4 flex justify-between">
                      <span className="font-medium text-lg text-gray-800">
                        Battery:
                      </span>
                      <span
                        className={getComparisonClass(
                          car.Battery,
                          carData.find(
                            (car2) =>
                              car2.Brand === selectedBrand2 &&
                              car2.Model === selectedModel2
                          )?.battery || 0
                        )}
                      >
                        {car.Battery} กิโลวัตต์/ชั่วโมง
                      </span>
                    </div>
                    <div className="mb-4 flex justify-between">
                      <span className="font-medium text-lg text-gray-800">
                        Top Speed:
                      </span>
                      <span
                        className={getComparisonClass(
                          car.Top_Speed,
                          carData.find(
                            (car2) =>
                              car2.Brand === selectedBrand2 &&
                              car2.Model === selectedModel2
                          )?.Top_Speed || 0
                        )}
                      >
                        {car.Top_Speed} กิโลเมตร/ชั่วโมง
                      </span>
                    </div>
                    <div className="mb-4 flex justify-between">
                      <span className="font-medium text-lg text-gray-800">
                        Range:
                      </span>
                      <span
                        className={getComparisonClass(
                          car.Real_Range,
                          carData.find(
                            (car2) =>
                              car2.Brand === selectedBrand2 &&
                              car2.Model === selectedModel2
                          )?.Real_Range || 0
                        )}
                      >
                        {car.Real_Range} กิโลเมตร
                      </span>
                    </div>
                    <div className="mb-4 flex justify-between">
                      <span className="font-medium text-lg text-gray-800">
                        Efficiency:
                      </span>
                      <span
                        className={getComparisonClass(
                          car.Efficiency,
                          carData.find(
                            (car2) =>
                              car2.Brand === selectedBrand2 &&
                              car2.Model === selectedModel2
                          )?.Efficiency || 0
                        )}
                      >
                        {car.Efficiency}
                      </span>
                    </div>
                    <div className="mb-4 flex justify-between">
                      <span className="font-medium text-lg text-gray-800">
                        Fast Charge:
                      </span>
                      <span
                        className={getComparisonClass(
                          car.Fastcharge,
                          carData.find(
                            (car2) =>
                              car2.Brand === selectedBrand2 &&
                              car2.Model === selectedModel2
                          )?.Fastcharge || 0
                        )}
                      >
                        {car.Fastcharge}
                      </span>
                    </div>
                    <hr className="border-gray-300 my-4" />
                    <div className="mb-4 flex justify-between">
                      <span className="font-medium text-lg text-gray-800">
                        Drive Configuration:
                      </span>
                      <span className="text-gray-800">
                        {car.Drive_Configuration}
                      </span>
                    </div>
                    <div className="mb-4 flex justify-between">
                      <span className="font-medium text-lg text-gray-800">
                        Tow Hitch:
                      </span>
                      <span className="text-gray-800">{car.Tow_Hitch}</span>
                    </div>
                    <div className="mb-4 flex justify-between">
                      <span className="font-medium text-lg text-gray-800">
                        Number of Seats:
                      </span>
                      <span className="text-gray-800">{car.Seats} ที่นั่ง</span>
                    </div>{" "}
                  </div>
                ))}
            </div>

            {/* รถยนต์คันที่สองจ้า */}
            <div className="w-full bg-white rounded-lg shadow-lg p-6 border border-gray-300 hover:shadow-2xl transition-shadow duration-300">
              {carData
                .filter(
                  (car) =>
                    car.Brand === selectedBrand2 && car.Model === selectedModel2
                )
                .map((car) => (
                  <div key={car.Model_ID}>
                    <h3 className="text-xl font-semibold text-mainblue mb-4">
                      {car.Model}
                    </h3>
                    <img
                      src={car.EV_Image_URL}
                      className="w-30 h-30 object-cover mx-auto my-6"
                    ></img>
                    <div className="mb-4 flex justify-between text-gray-700">
                      <span className="font-medium text-lg">Battery:</span>
                      <span
                        className={getComparisonClass(
                          car.Battery,
                          carData.find(
                            (car2) =>
                              car2.Brand === selectedBrand1 &&
                              car2.Model === selectedModel1
                          )?.Battery || 0
                        )}
                      >
                        {car.Battery} กิโลวัตต์/ชั่วโมง
                      </span>
                    </div>
                    <div className="mb-4 flex justify-between text-gray-700">
                      <span className="font-medium text-lg">Top Speed:</span>
                      <span
                        className={getComparisonClass(
                          car.Top_Speed,
                          carData.find(
                            (car2) =>
                              car2.Brand === selectedBrand1 &&
                              car2.Model === selectedModel1
                          )?.Top_Speed || 0
                        )}
                      >
                        {car.Top_Speed} กิโลเมตร/ชั่วโมง
                      </span>
                    </div>
                    <div className="mb-4 flex justify-between text-gray-700">
                      <span className="font-medium text-lg">Range:</span>
                      <span
                        className={getComparisonClass(
                          car.Real_Range,
                          carData.find(
                            (car2) =>
                              car2.Brand === selectedBrand1 &&
                              car2.Model === selectedModel1
                          )?.Real_Range || 0
                        )}
                      >
                        {car.Real_Range} กิโลเมตร
                      </span>
                    </div>
                    <div className="mb-4 flex justify-between text-gray-700">
                      <span className="font-medium text-lg">Efficiency:</span>
                      <span
                        className={getComparisonClass(
                          car.Efficiency,
                          carData.find(
                            (car2) =>
                              car2.Brand === selectedBrand1 &&
                              car2.Model === selectedModel1
                          )?.Efficiency || 0
                        )}
                      >
                        {car.Efficiency}
                      </span>
                    </div>
                    <div className="mb-4 flex justify-between text-gray-700">
                      <span className="font-medium text-lg">Fast Charge:</span>
                      <span
                        className={getComparisonClass(
                          car.Fastcharge,
                          carData.find(
                            (car2) =>
                              car2.Brand === selectedBrand1 &&
                              car2.Model === selectedModel1
                          )?.Fastcharge || 0
                        )}
                      >
                        {car.Fastcharge}
                      </span>
                    </div>
                    <div>
                      <hr className="border-gray-300 my-4" />
                      <div className="mb-4 flex justify-between  text-gray-700">
                        <span className="font-medium text-lg">
                          Drive Configuration:
                        </span>
                        <span className="text-gray-800">
                          {car.Drive_Configuration}
                        </span>
                      </div>
                      <div className="mb-4 flex justify-between  text-gray-700">
                        <span className="font-medium text-lg">Tow Hitch:</span>
                        <span className="text-gray-800">{car.Tow_Hitch}</span>
                      </div>
                      <div className="mb-4 flex justify-between text-gray-700">
                        <span className="font-medium text-lg">
                          Number of Seats:
                        </span>
                        <span className="text-gray-800">
                          {car.Seats} ที่นั่ง
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
