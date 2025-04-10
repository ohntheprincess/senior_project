"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../nav/page";

export default function CalculatePage() {
  const [selectedFormula, setSelectedFormula] = useState("");
  const [inputMode, setInputMode] = useState("carModel");

  const [selectedBrand1, setSelectedBrand1] = useState("");
  const [selectedModel1, setSelectedModel1] = useState("");

  const [carData, setCarData] = useState([]);
  const [fuelTypeData, setFuelTypeData] = useState([]);
  const [electricTypeData, setElectricTypeData] = useState([]);
  const [chargingStation, setChargingStation] = useState(0);

  const [brands1, setBrands1] = useState([]);
  const [models1, setModels1] = useState([]);
  const [brands2, setBrands2] = useState([]);
  const [models2, setModels2] = useState([]);
  const [FuelCarData, setFuelCarData] = useState([]);

  const [selectedBrand2, setSelectedBrand2] = useState("");
  const [selectedModel2, setSelectedModel2] = useState("");

  const [distanceCompare, setDistanceCompare] = useState(0);
  const [distance, setDistance] = useState(0);

  const [electricityCost, setElectricityCost] = useState(0);
  const [powerConsumption, setPowerConsumption] = useState(0);
  const [batteryChargePercentage, setBatteryChargePercentage] = useState(0);
  const [batteryCapacity, setBatteryCapacity] = useState(0);
  const [chargingCost, setChargingCost] = useState(0);
  const [EVCarInsurance, setEVCarInsurance] = useState(0);

  const [fuelConsumption, setFuelConsumption] = useState(0);
  const [fuelPrice, setFuelPrice] = useState(0);
  const [CarTypeOptions, setCarTypeOptions] = useState(0);
  const [carTax, setCarText] = useState(0);
  const [seats, setSeats] = useState(0);
  const [weight, setWeight] = useState(0);
  const [carInsurance, setCarInsurance] = useState(0);

  const [travelDistance, setTravelDistance] = useState(0);

  const options = { "≤ 5 ปี": 5, "6 ปี": 6, "7 ปี": 7, "8 ปี": 8 };
  const [selectedYear, setSelectedYear] = useState(0);

  const [totalCost, setTotalCost] = useState(0);
  const [totalEVCost, setTotalEVCost] = useState(0);

  const [isInfoMaintainance, setIsInfoMaintainance] = useState(false);
  useEffect(() => {
    fetch("/api/allCar")
      .then((res) => res.json())
      .then((car) => {
        if (Array.isArray(car)) {
          setCarData(car);
          console.log("Fetched fuel car data:", car);

          const uniqueBrands1 = [...new Set(car.map((car) => car.Brand))];
          setBrands1(uniqueBrands1);
        }
      })
      .catch((error) => console.error("Error fetching fuel car data:", error));
  }, []);

  useEffect(() => {
    fetch("/api/fuelType")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched fuelTypeData:", data);
        if (Array.isArray(data)) {
          setFuelTypeData(data);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  useEffect(() => {
    fetch("/api/getPowerRate")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched fuelTypeData:", data);
        if (Array.isArray(data)) {
          setElectricTypeData(data);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    fetch("/api/allFuelCar")
      .then((res) => res.json())
      .then((fuelCar) => {
        if (Array.isArray(fuelCar)) {
          setFuelCarData(fuelCar);
          console.log("Fetched fuel car data:", fuelCar);

          const uniqueBrands2 = [...new Set(fuelCar.map((car) => car.Brand))];
          setBrands2(uniqueBrands2);
        }
      })
      .catch((error) => console.error("Error fetching fuel car data:", error));
  }, []);

  const calculateElectricityUsed = () => {
    if (travelDistance > 0 && powerConsumption > 0 && electricityCost > 0) {
      const electricityUsed = (travelDistance * powerConsumption) / 100;
      const electricCost = electricityUsed * electricityCost;
      return electricCost;
    }
    console.warn("Invalid input for electricity calculation");
    return 0;
  };
  const calculateElectricCost = () => {
    const calculatedElectricCost =
      powerConsumption > 0 && electricityCost > 0
        ? (distance / 100) * powerConsumption * electricityCost
        : 0;
    return calculatedElectricCost;
  };

  const calculateFuelCost = () => {
    const calculatedFuelLiter =
      fuelConsumption !== 0 ? distance / fuelConsumption : 0;
    const calculatedFuelCost = calculatedFuelLiter * fuelPrice;
    return calculatedFuelCost;
  };
  const calculateCarTax = (cc) => {
    let tax = 0;

    if (cc <= 600) {
      tax = cc * 0.5;
    } else if (cc <= 1800) {
      tax = 600 * 0.5 + (cc - 600) * 1.5;
    } else {
      tax = 600 * 0.5 + 1200 * 1.5 + (cc - 1800) * 4;
    }

    return tax;
  };
  const calculateEVCarTax = (seats, weight) => {
    let tax = 0;
    if (seats < 7) {
      if (weight <= 500) {
        tax = 30;
      } else if (weight >= 501 && weight <= 750) {
        tax = 60;
      } else if (weight >= 751 && weight <= 1000) {
        tax = 90;
      } else if (weight >= 1001 && weight <= 1250) {
        tax = 160;
      } else if (weight >= 1251 && weight <= 1500) {
        tax = 200;
      } else if (weight >= 1501 && weight <= 1750) {
        tax = 260;
      } else if (weight >= 1751 && weight <= 2000) {
        tax = 330;
      } else if (weight >= 2001 && weight <= 2500) {
        tax = 380;
      } else if (weight >= 2501 && weight <= 3000) {
        tax = 440;
      } else if (weight >= 3001 && weight <= 3500) {
        tax = 480;
      } else if (weight >= 3501 && weight <= 4000) {
        tax = 520;
      } else if (weight >= 4001 && weight <= 4500) {
        tax = 560;
      } else if (weight >= 4501 && weight <= 5000) {
        tax = 600;
      } else if (weight >= 5001 && weight <= 6000) {
        tax = 640;
      } else if (weight >= 6001 && weight <= 7000) {
        tax = 680;
      } else {
        tax = 720;
      }
    } else {
      if (weight <= 500) {
        tax = 15;
      } else if (weight >= 501 && weight <= 750) {
        tax = 30;
      } else if (weight >= 751 && weight <= 1000) {
        tax = 45;
      } else if (weight >= 1001 && weight <= 1250) {
        tax = 80;
      } else if (weight >= 1251 && weight <= 1500) {
        tax = 100;
      } else if (weight >= 1501 && weight <= 1750) {
        tax = 130;
      } else if (weight >= 1751 && weight <= 2000) {
        tax = 160;
      } else if (weight >= 2001 && weight <= 2500) {
        tax = 190;
      } else if (weight >= 2501 && weight <= 3000) {
        tax = 220;
      } else if (weight >= 3001 && weight <= 3500) {
        tax = 240;
      } else if (weight >= 3501 && weight <= 4000) {
        tax = 260;
      } else if (weight >= 4001 && weight <= 4500) {
        tax = 280;
      } else if (weight >= 4501 && weight <= 5000) {
        tax = 300;
      } else if (weight >= 5001 && weight <= 6000) {
        tax = 320;
      } else if (weight >= 6001 && weight <= 7000) {
        tax = 340;
      } else {
        tax = 360;
      }
    }

    return tax;
  };

  useEffect(() => {
    const calculateFuelCarLongTermCost = () => {
      const calculatedFuelLiter =
        fuelConsumption !== 0 ? distanceCompare / fuelConsumption : 0;
      const fuelCost = calculatedFuelLiter * fuelPrice;
      const totalFuelCost = fuelCost * 365 * selectedYear;

      const carTaxPerYear = calculateCarTax(carTax);
      const totalCarTax = carTaxPerYear * selectedYear;
      const totalInsurance = carInsurance * selectedYear;

      const totalCost = totalFuelCost + totalCarTax + totalInsurance;

      return totalCost;
    };

    setTotalCost(calculateFuelCarLongTermCost());
  }, [
    fuelConsumption,
    distanceCompare,
    fuelPrice,
    selectedYear,
    carInsurance,
    carTax,
  ]);

  useEffect(() => {
    const calculateEVCarLongTermCost = () => {
      const calculatedElectricCost =
        powerConsumption > 0 && electricityCost > 0
          ? (distanceCompare / 100) * powerConsumption * electricityCost
          : 0;
      const totalElectricCost = calculatedElectricCost * 365 * selectedYear;
      const evCarTaxPerYear = calculateEVCarTax(seats, weight) * selectedYear;
      const totalEVCarInsurance = EVCarInsurance * selectedYear;
      console.log("totalEVCarInsurance" + totalEVCarInsurance);

      const totalCost =
        totalElectricCost + evCarTaxPerYear + totalEVCarInsurance;
      return totalCost;
    };
    setTotalEVCost(calculateEVCarLongTermCost());
  }, [powerConsumption, electricityCost, selectedYear, distanceCompare]);

  const handleBrandChange2 = (event) => {
    setSelectedBrand2(event.target.value);
    setSelectedModel2("");
  };

  const handleModelChange2 = (event) => {
    setSelectedModel2(event.target.value);
  };

  const handleModelChange1 = (event) => {
    setSelectedModel1(event.target.value);
  };
  useEffect(() => {
    const cost = calculateChargingCost();
    setChargingCost(cost);
  }, [batteryCapacity, batteryChargePercentage, electricityCost]);

  useEffect(() => {
    if (selectedModel1) {
      const selectedCar = carData.find((car) => car.Model === selectedModel1);
      if (selectedCar) {
        setBatteryCapacity(selectedCar.Battery || 0);
      }
    }
  }, [selectedModel1, carData]);

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
      const filteredModels = FuelCarData.filter(
        (car) => car.Brand === selectedBrand2
      ).map((car) => car.Model);
      setModels2([...new Set(filteredModels)]);
    } else {
      setModels2([]);
    }
  }, [selectedBrand2, FuelCarData]);

  useEffect(() => {
    if (selectedModel1) {
      const selectedCar = carData.find((car) => car.Model === selectedModel1);
      if (selectedCar) {
        setBatteryCapacity(selectedCar.Battery || 0);
        const efficiency =
          selectedCar.Efficiency || selectedCar.PowerConsumption || 0;
        setPowerConsumption(efficiency / 10);
        setSeats(selectedCar.Seats || 0);
        setWeight(selectedCar.Weight || 0);
        setEVCarInsurance(selectedCar.Insurance_Price || 0);
      }
    }
  }, [selectedModel1]);
  useEffect(() => {
    if (selectedModel2) {
      const selectedCar = FuelCarData.find(
        (car) => car.Model === selectedModel2
      );
      if (selectedCar) {
        const fuelEconomy = selectedCar.Fuel_Economy || 0;
        setFuelConsumption(fuelEconomy);
        const insurance = selectedCar.Insurance_Price || 0;
        setCarInsurance(insurance);
        setCarText(selectedCar.Engine_Displace || 0);
      }
    }
  }, [selectedModel2]);
  const calculateChargingCost = () => {
    if (
      batteryCapacity > 0 &&
      batteryChargePercentage > 0 &&
      electricityCost > 0
    ) {
      const batteryCharge = (batteryChargePercentage / 100) * batteryCapacity;
      const cost = batteryCharge * electricityCost;
      return cost;
    }
    return 0;
  };

  const resetManualInputs = () => {
    setSelectedBrand1("");
    setSelectedBrand2("");
    setBatteryCapacity(0);
    setPowerConsumption(0);
    setElectricityCost(0);
    setFuelConsumption(0);
    setBatteryChargePercentage(0);
    setElectricityCost(0);
    setTotalCost(0);
    setTotalEVCost(0);
    setFuelPrice("");
    setInputMode("carModel");
  };

  const resetManualInputsForManual = () => {
    setSelectedBrand1("");
    setBatteryCapacity(0);
    setPowerConsumption(0);
    setElectricityCost(0);
    setBatteryChargePercentage(0);
    setTravelDistance(0);
    setSelectedBrand2("");
    setFuelConsumption(0);
  };
  const closeModal = () => {
    setIsInfoMaintainance(false);
    setSelectedFormula(null);
    resetManualInputs();
  };
  const closeInfoMaintain = () => {
    setIsInfoMaintainance(false);
  };
  const handleInputModeChange = (mode) => {
    setInputMode(mode);
  };
  const handleBrandChange1 = (event) => {
    setSelectedBrand1(event.target.value);
    setSelectedModel1("");
  };
  return (
    <div className="font-prompt bg-white h-screen w-full  top-0 left-0 fixed">
      <NavBar />

      <div>
        <h1 className="text-center text-2xl mt-24 text-mainblue font-bold">
          สูตรคำนวณที่เกี่ยวข้องกับรถยนต์ไฟฟ้า
        </h1>
      </div>
      <div className="grid grid-cols-2 text-gray-400 align-middle mt-6">
        <div className="flex justify-end">
          <div
            className="transition-transform duration-300 hover:scale-110 hover:text-gray-500 bg-white border shadow-lg m-2 rounded-2xl w-3/4 p-12
         text-center align-middle"
            onClick={() => setSelectedFormula("cargingCostByPercent")}
          >
            <p className="text-lg font-semibold text-mainblue mb-4 text-center">
              การคำนวณค่าชาร์จไฟฟ้า <br /> ตามเปอร์เซ็นต์ (%) ที่ชาร์จไป
            </p>
            <p className="text-gray-500 mt-2">
              ค่าใช้จ่ายในการชาร์จรถยนต์ไฟฟ้าตามเปอร์เซนต์ที่ชาร์จไป
            </p>{" "}
          </div>
        </div>
        <div className="flex justify-start">
          <div
            className="transition-transform duration-300 hover:scale-110 hover:text-gray-500 bg-white border shadow-lg m-2 rounded-2xl w-3/4 p-12 text-center"
            onClick={() => setSelectedFormula("cargingCostByDistance")}
          >
            <p className="text-lg font-semibold text-mainblue mb-4 text-center">
              การคำนวณค่าไฟฟ้า
              <br />
              ตามระยะทางในการเดินทาง
            </p>
            <p className="text-gray-500 mt-2">
              การคำนวณค่าใช้จ่ายในการชาร์จรถยนต์ไฟฟ้าตามระยะทาง
            </p>{" "}
          </div>
        </div>
        <div className="flex justify-end flex-wrap">
          <div
            className="transition-transform duration-300 hover:scale-110 hover:text-gray-500 bg-white border shadow-lg m-2 rounded-2xl w-3/4 p-12
         text-center align-middle"
            onClick={() => setSelectedFormula("compare")}
          >
            <p className="text-lg font-semibold text-mainblue mb-4 text-center">
              สูตรเปรียบเทียบค่าใช้จ่ายในการเดินทาง
              <br />
              ด้วยรถยนต์ไฟฟ้าและรถยนต์น้ำมัน
            </p>
            <p className="text-gray-500 mt-2 ">
              ความคุ้มค่าในการเดินทางด้วยรถยนต์ไฟฟ้าและรถยนต์น้ำมัน
              <br />
              *ความแตกต่างอาจจะขึ้นอยู่กับ ความเร็วในการขับขี่ สภาพถนน
              <br />
              การคำนวณนี้เป็นค่าประมาณเท่านั้น
            </p>{" "}
          </div>
        </div>
        <div className="flex justify-start">
          <div
            className="transition-transform duration-300 hover:scale-110 hover:text-gray-500 bg-white border shadow-lg m-2 rounded-2xl w-3/4 p-12 text-center"
            onClick={() => setSelectedFormula("MaintenanceCostComparison")}
          >
            <p className="text-lg font-semibold text-mainblue mb-4 text-center">
              การคำนวณค่าใช้จ่ายในการบำรุงรักษา
              <br />
              เปรียบเทียบระหว่างรถยนต์น้ำมันและรถยนต์ไฟฟ้า
            </p>
            <p className="text-gray-500 mt-2">
              การคำนวณค่าใช้จ่ายในการบำรุงรักษาเปรียบเทียบระหว่างรถยนต์น้ำมันและรถยนต์ไฟฟ้าโดยประมาณค่าจากค่า้จ่ายต่าง
              ๆ เช่น ค่าภาษีประจำปี, ค่าบำรุงรักษา, ค่าใช้จ่ายเชื้อเพลิง/พลังงาน
              และค่าใช้จ่ายแฝงอื่น ๆ ต่อปี
            </p>{" "}
          </div>
        </div>
      </div>
      {selectedFormula === "MaintenanceCostComparison" && (
        <div className="z-1 fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center font-prompt">
          <div
            className="bg-white px-7 py-6 rounded-lg shadow-lg w-4/5 mx-4 overflow-y-auto"
            style={{ maxHeight: "90vh" }}
          >
            {" "}
            <div className="flex flex-row justify-center items-center mb-4">
              <h6 className=" text-xl font-semibold text-mainblue mx-6  text-center">
                สูตรคำนวณค่าใช้จ่ายระยะยาว{" "}
              </h6>
              <button
                className="text-mainblue"
                onClick={() => setIsInfoMaintainance(true)}
              >
                {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 border rounded p-3 mb-4">
              <div>
                <p className="text-gray-600 font-bold">ระยะเวลาในการใช้รถ</p>
                {Object.entries(options).map(([option, year], index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedYear(year)}
                    className={`px-2 my-4 rounded-lg mx-2 transition-colors duration-300 ${
                      selectedYear === year
                        ? "bg-white text-mainblue border border-mainblue"
                        : "bg-mainblue text-white"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div>
                <label
                  htmlFor="distance"
                  className="block text-gray-700 font-bold"
                >
                  ระยะทางที่ขับโดยเฉลี่ยต่อวัน
                </label>
                <input
                  id="distance"
                  type="number"
                  className="border px-2 py-1 rounded w-full mt-2 text-gray-600"
                  value={distanceCompare}
                  onChange={(e) => setDistanceCompare(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <div className="">
                <p className="font-bold">รถยนต์น้ำมัน</p>
                <div className="grid grid-cols-2">
                  <div className="mx-2">
                    <label className="block text-gray-600">เลือกยี่ห้อรถ</label>

                    <select
                      id="brand-select"
                      value={selectedBrand2}
                      onChange={handleBrandChange2}
                      className="border rounded-md p-2 w-full h-10 my-2 text-black"
                    >
                      <option value="">เลือกยี่ห้อรถ</option>
                      {brands2.length > 0 ? (
                        brands2.map((brand, index) => (
                          <option key={`brand-${index}`} value={brand}>
                            {brand}
                          </option>
                        ))
                      ) : (
                        <option value="">ไม่มีข้อมูล</option>
                      )}
                    </select>
                  </div>
                  <div className="mx-2">
                    <label className="block text-gray-600">เลือกรุ่นรถ</label>
                    <select
                      id="model-select"
                      value={selectedModel2}
                      onChange={(event) => {
                        handleModelChange2(event);
                        calculateFuelCost();
                      }}
                      disabled={!selectedBrand2}
                      className="border rounded-md p-2 w-full h-10 my-2 text-black"
                    >
                      <option value="">เลือกรุ่นรถ</option>
                      {models2.map((model, index) => (
                        <option key={`model-${index}`} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mx-2">
                  <label className="block text-gray-600 my-2">
                    ราคาน้ำมันต่อลิตร
                  </label>
                  <select
                    value={fuelPrice}
                    onChange={(e) => {
                      console.log("Selected fuel price:", e.target.value);
                      setFuelPrice(Number(e.target.value));
                    }}
                    className="border p-2 rounded-md w-full"
                  >
                    <option value="">เลือกประเภทเชื้อเพลิง</option>
                    {fuelTypeData.map((fuel) => (
                      <option key={fuel.id} value={fuel.price}>
                        {fuel.fuel_type} - {fuel.price} บาท/ลิตร
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="font-bold">
                  <p>รถยนต์ไฟฟ้า</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-gray-600">
                  <div className="mx-2">
                    <label className="block text-gray-600">เลือกยี่ห้อรถ</label>
                    <select
                      id="brand-select"
                      value={selectedBrand1}
                      onChange={handleBrandChange1}
                      className="border rounded-md p-2 w-full h-10 my-2 text-black"
                    >
                      <option value="">เลือกยี่ห้อรถ</option>
                      {brands1.length > 0 ? (
                        brands1.map((brand, index) => (
                          <option key={`brand-${index}`} value={brand}>
                            {brand}
                          </option>
                        ))
                      ) : (
                        <option value="">ไม่มีข้อมูล</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-600">เลือกรุ่นรถ</label>
                    <select
                      id="model-select"
                      value={selectedModel1}
                      onChange={handleModelChange1}
                      disabled={!selectedBrand1}
                      className="border rounded-md p-2 w-full h-10 my-2 text-black"
                    >
                      <option value="">เลือกรุ่นรถ</option>
                      {models1.map((model, index) => (
                        <option key={`model-${index}`} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-2 text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mx-2">
                      <label className="block text-gray-600">
                        เลือกผู้ให้บริการชาร์จ
                      </label>
                      <select
                        value={chargingStation}
                        onChange={(e) => {
                          console.log("Selected fuel price:", e.target.value);
                          setChargingStation(e.target.value);
                        }}
                        className="mt-1 border p-2 rounded-md w-full"
                      >
                        <option value="">เลือกผู้ให้บริการชาร์จ</option>
                        {electricTypeData
                          .map((electric) => electric.Distributor)
                          .filter(
                            (value, index, self) =>
                              self.indexOf(value) === index
                          )
                          .map((distributor, index) => (
                            <option key={index} value={distributor}>
                              {distributor}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="">
                      <label className="block text-gray-600">
                        เลือกอัตรากำลังไฟฟ้า
                      </label>
                      <select
                        value={electricityCost}
                        onChange={(e) => {
                          console.log("Selected fuel price:", e.target.value);
                          setElectricityCost(Number(e.target.value));
                        }}
                        className="mt-1 border p-2 rounded-md w-full"
                      >
                        <option value="">เลือกอัตรากำลังไฟฟ้า</option>
                        {electricTypeData
                          .filter(
                            (electric) =>
                              electric.Distributor === chargingStation
                          )
                          .map((electric) => (
                            <option
                              key={electric.Power_ID}
                              value={
                                electric.Peak_Rates__including_VAT___baht_unit_
                              }
                            >
                              {electric.Type_Power} |{" "}
                              {electric.Peak_Rates__including_VAT___baht_unit_}{" "}
                              บาท
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="flex justify-center">
                <div className="mt-2 border border-gray-300 rounded-lg p-2 w-1/2 bg-mainblue text-center shadow-md">
                  <h6 className="text-base text-white mb-2 font-prompt">
                    ค่าใช้จ่ายรถยนต์น้ำมัน
                    <p className="text-lg text-mainblue bg-white rounded-lg">
                      {totalCost.toFixed(2)} บาท
                    </p>
                  </h6>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="mt-2 border border-gray-300 rounded-lg p-2 w-1/2 bg-mainblue text-center shadow-md">
                  <h6 className="text-base text-white mb-2 font-prompt">
                    ค่าใช้จ่ายรถยนต์ไฟฟ้า
                    <p className="text-lg text-mainblue bg-white rounded-lg">
                      {totalEVCost.toFixed(2)} บาท
                    </p>
                  </h6>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button
                className="text-white bg-mainred hover:bg-red-600 px-4 py-2 rounded"
                onClick={closeModal}
              >
                ปิด
              </button>
            </div>{" "}
          </div>
        </div>
      )}
      {selectedFormula === "cargingCostByPercent" ? (
        <div>
          {" "}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center font-prompt">
            <div
              className="bg-white px-7 py-4 rounded-lg shadow-lg max-w-4xl w-11/12"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <h6 className="text-xl font-semibold text-mainblue my-4 text-center">
                การคำนวณค่าชาร์จไฟฟ้าตามเปอร์เซ็นต์ (%) ที่ชาร์จไป
              </h6>
              <div className="flex items-center justify-center mb-6">
                <button
                  className={`px-4 py-2 rounded-l ${
                    inputMode === "carModel"
                      ? "bg-mainblue text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                  onClick={() => {
                    setInputMode("carModel");
                    handleInputModeChange("carModel");
                    resetManualInputs();
                  }}
                >
                  เลือกยี่ห้อรถ
                </button>
                <button
                  className={`px-4 py-2 rounded-r ${
                    inputMode === "manual"
                      ? "bg-mainblue text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                  onClick={() => {
                    setInputMode("manual");
                    handleInputModeChange("manual");
                    resetManualInputsForManual();
                  }}
                >
                  พิมพ์ข้อมูลด้วยตนเอง
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="pr-4">
                  {inputMode === "carModel" ? (
                    <div>
                      <label className="block text-gray-600">
                        เลือกยี่ห้อรถ
                      </label>
                      <select
                        id="brand-select"
                        value={selectedBrand1}
                        onChange={handleBrandChange1}
                        className="border rounded-md p-2 w-full h-10 my-2 text-black"
                      >
                        <option value="">เลือกยี่ห้อรถ</option>
                        {brands1.length > 0 ? (
                          brands1.map((brand, index) => (
                            <option key={`brand-${index}`} value={brand}>
                              {brand}
                            </option>
                          ))
                        ) : (
                          <option value="">ไม่มีข้อมูล</option>
                        )}
                      </select>

                      <label className="block text-gray-600 my-2">
                        เลือกรุ่นรถ
                      </label>
                      <select
                        id="model-select"
                        value={selectedModel1}
                        onChange={handleModelChange1}
                        disabled={!selectedBrand1}
                        className="border rounded-md p-2 w-full h-10 text-black"
                      >
                        <option value="">เลือกรุ่นรถ</option>
                        {models1.map((model, index) => (
                          <option key={`model-${index}`} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <div>
                        <label className="block text-gray-600">
                          ความจุของbattery
                        </label>
                        <input
                          type="number"
                          value={batteryCapacity}
                          onChange={(e) =>
                            setBatteryCapacity(Number(e.target.value))
                          }
                          className="mt-2 p-2 w-full border rounded text-black"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div>
                    <label className="block text-gray-600">
                      เปอร์เซ็นต์แบตเตอรี่ที่ชาร์จ (%)
                    </label>
                    <input
                      type="number"
                      value={batteryChargePercentage}
                      onChange={(e) =>
                        setBatteryChargePercentage(Number(e.target.value))
                      }
                      className="mt-2 p-2 w-full border border-gray-300 rounded text-black"
                    />
                  </div>
                  <div className="my-4">
                    <label className="block text-gray-600">
                      อัตราสิ้นเปลืองไฟฟ้า (kWh/100 km)
                    </label>
                    <input
                      type="number"
                      value={powerConsumption}
                      onChange={(e) =>
                        setPowerConsumption(Number(e.target.value))
                      }
                      className="mt-2 p-2 w-full border border-gray-300 rounded text-black"
                    />
                  </div>
                  <div className="my-4 text-gray-600">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="mr-1">
                        <label className="block text-gray-600">
                          เลือกผู้ให้บริการชาร์จ
                        </label>
                        <select
                          value={chargingStation}
                          onChange={(e) => {
                            console.log("Selected fuel price:", e.target.value);
                            setChargingStation(e.target.value);
                          }}
                          className="mt-1 border p-2 rounded-md w-full"
                        >
                          <option value="">เลือกผู้ให้บริการชาร์จ</option>
                          {electricTypeData
                            .map((electric) => electric.Distributor)
                            .filter(
                              (value, index, self) =>
                                self.indexOf(value) === index
                            )
                            .map((distributor, index) => (
                              <option key={index} value={distributor}>
                                {distributor}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="mxl-1">
                        <label className="block text-gray-600">
                          เลือกอัตรากำลังไฟฟ้า
                        </label>
                        <select
                          value={electricityCost}
                          onChange={(e) => {
                            console.log("Selected fuel price:", e.target.value);
                            setElectricityCost(Number(e.target.value));
                          }}
                          className="mt-1 border p-2 rounded-md w-full"
                        >
                          <option value="">เลือกอัตรากำลังไฟฟ้า</option>
                          {electricTypeData
                            .filter(
                              (electric) =>
                                electric.Distributor === chargingStation
                            )
                            .map((electric) => (
                              <option
                                key={electric.Power_ID}
                                value={
                                  electric.Peak_Rates__including_VAT___baht_unit_
                                }
                              >
                                {electric.Type_Power} |{" "}
                                {
                                  electric.Peak_Rates__including_VAT___baht_unit_
                                }{" "}
                                บาท
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center">
                <div className="border border-gray-300 rounded-lg p-2 w-1/2 bg-mainblue text-center shadow-md">
                  <h6 className="text-base text-white mb-2 font-prompt">
                    ค่าชาร์จรถยนต์ไฟฟ้า
                  </h6>
                  <p className="text-lg text-mainblue bg-white p-2 rounded-lg">
                    {calculateChargingCost().toFixed(2)} บาท
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  className="text-white bg-mainred hover:bg-red-600 px-4 py-2 rounded"
                  onClick={closeModal}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {selectedFormula === "cargingCostByDistance" ? (
        <div>
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center font-prompt">
            <div
              className="bg-white px-6 py-6 rounded-lg shadow-lg max-w-4xl w-11/12"
              style={{
                maxHeight: "90vh",
                overflowY: "auto",
                minHeight: "500px",
              }}
            >
              <h6 className="text-xl font-semibold text-mainblue mb-4 text-center">
                สูตรการคำนวณค่าไฟตามระยะทาง
              </h6>

              <div className="flex items-center justify-center mb-6">
                <button
                  className={`px-4 py-2 rounded-l ${
                    inputMode === "carModel"
                      ? "bg-mainblue text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                  onClick={() => {
                    setInputMode("carModel");
                    handleInputModeChange("carModel");
                    resetManualInputs();
                  }}
                >
                  เลือกยี่ห้อรถ
                </button>
                <button
                  className={`px-4 py-2 rounded-r ${
                    inputMode === "manual"
                      ? "bg-mainblue text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                  onClick={() => {
                    setInputMode("manual");
                    handleInputModeChange("manual");
                    resetManualInputsForManual();
                  }}
                >
                  พิมพ์ข้อมูลด้วยตนเอง
                </button>
              </div>

              <div className="pr-4">
                {inputMode === "carModel" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600">
                        ระยะทาง (กิโลเมตร)
                      </label>
                      <input
                        type="number"
                        value={travelDistance}
                        onChange={(e) =>
                          setTravelDistance(Number(e.target.value))
                        }
                        className="mt-1 p-2 w-full border border-gray-300 rounded text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600">
                        อัตราสิ้นเปลืองไฟฟ้า (kWh/100 km)
                      </label>
                      <input
                        type="number"
                        value={powerConsumption}
                        onChange={(e) =>
                          setPowerConsumption(Number(e.target.value))
                        }
                        className="mt-1 p-2 w-full border border-gray-300 rounded text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600">
                        เลือกยี่ห้อรถ
                      </label>
                      <select
                        id="brand-select"
                        value={selectedBrand1}
                        onChange={handleBrandChange1}
                        className="mt-1 border rounded-md p-2 w-full h-10 text-black"
                      >
                        <option value="">เลือกยี่ห้อรถ</option>
                        {brands1.length > 0 ? (
                          brands1.map((brand, index) => (
                            <option key={`brand-${index}`} value={brand}>
                              {brand}
                            </option>
                          ))
                        ) : (
                          <option value="">ไม่มีข้อมูล</option>
                        )}
                      </select>

                      <label className="mt-2 block text-gray-600">
                        เลือกรุ่นรถ
                      </label>
                      <select
                        id="model-select"
                        value={selectedModel1}
                        onChange={handleModelChange1}
                        disabled={!selectedBrand1}
                        className="mt-1 border rounded-md p-2 w-full h-10 text-black"
                      >
                        <option value="">เลือกรุ่นรถ</option>
                        {models1.map((model, index) => (
                          <option key={`model-${index}`} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mr-1">
                          <label className="block text-gray-600">
                            เลือกผู้ให้บริการชาร์จ
                          </label>
                          <select
                            value={chargingStation}
                            onChange={(e) => {
                              console.log(
                                "Selected fuel price:",
                                e.target.value
                              );
                              setChargingStation(e.target.value);
                            }}
                            className="mt-1 border p-2 rounded-md w-full"
                          >
                            <option value="">เลือกผู้ให้บริการชาร์จ</option>
                            {electricTypeData
                              .map((electric) => electric.Distributor)
                              .filter(
                                (value, index, self) =>
                                  self.indexOf(value) === index
                              )
                              .map((distributor, index) => (
                                <option key={index} value={distributor}>
                                  {distributor}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="mxl-1">
                          <label className="block text-gray-600">
                            เลือกอัตรากำลังไฟฟ้า
                          </label>
                          <select
                            value={electricityCost}
                            onChange={(e) => {
                              console.log(
                                "Selected fuel price:",
                                e.target.value
                              );
                              setElectricityCost(Number(e.target.value));
                            }}
                            className="mt-1 border p-2 rounded-md w-full"
                          >
                            <option value="">เลือกอัตรากำลังไฟฟ้า</option>
                            {electricTypeData
                              .filter(
                                (electric) =>
                                  electric.Distributor === chargingStation
                              )
                              .map((electric) => (
                                <option
                                  key={electric.Power_ID}
                                  value={
                                    electric.Peak_Rates__including_VAT___baht_unit_
                                  }
                                >
                                  {electric.Type_Power} |{" "}
                                  {
                                    electric.Peak_Rates__including_VAT___baht_unit_
                                  }{" "}
                                  บาท
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-600">
                        ระยะทาง (กิโลเมตร)
                      </label>
                      <input
                        type="number"
                        value={travelDistance}
                        onChange={(e) =>
                          setTravelDistance(Number(e.target.value))
                        }
                        className="mt-1 p-2 w-full border border-gray-300 rounded text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600">
                        อัตราสิ้นเปลืองไฟฟ้า (kWh/100 km)
                      </label>
                      <input
                        type="number"
                        value={powerConsumption}
                        onChange={(e) =>
                          setPowerConsumption(Number(e.target.value))
                        }
                        className="mt-1 p-2 w-full border border-gray-300 rounded text-black"
                      />
                    </div>
                    <div className="my-4 text-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mr-1">
                          <label className="block text-gray-600">
                            เลือกผู้ให้บริการชาร์จ
                          </label>
                          <select
                            value={chargingStation}
                            onChange={(e) => {
                              console.log(
                                "Selected fuel price:",
                                e.target.value
                              );
                              setChargingStation(e.target.value);
                            }}
                            className="mt-1 border p-2 rounded-md w-full"
                          >
                            <option value="">เลือกผู้ให้บริการชาร์จ</option>
                            {electricTypeData
                              .map((electric) => electric.Distributor)
                              .filter(
                                (value, index, self) =>
                                  self.indexOf(value) === index
                              )
                              .map((distributor, index) => (
                                <option key={index} value={distributor}>
                                  {distributor}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="mxl-1">
                          <label className="block text-gray-600">
                            เลือกอัตรากำลังไฟฟ้า
                          </label>
                          <select
                            value={electricityCost}
                            onChange={(e) => {
                              console.log(
                                "Selected fuel price:",
                                e.target.value
                              );
                              setElectricityCost(Number(e.target.value));
                            }}
                            className="mt-1 border p-2 rounded-md w-full"
                          >
                            <option value="">เลือกอัตรากำลังไฟฟ้า</option>
                            {electricTypeData
                              .filter(
                                (electric) =>
                                  electric.Distributor === chargingStation
                              )
                              .map((electric) => (
                                <option
                                  key={electric.Power_ID}
                                  value={
                                    electric.Peak_Rates__including_VAT___baht_unit_
                                  }
                                >
                                  {electric.Type_Power} |{" "}
                                  {
                                    electric.Peak_Rates__including_VAT___baht_unit_
                                  }{" "}
                                  บาท
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center mt-6">
                <div className="border border-gray-300 rounded-lg p-2 w-1/2 bg-mainblue text-center shadow-md">
                  <h6 className="text-base text-white mb-2 font-prompt">
                    ค่าชาร์จรถยนต์ไฟฟ้า
                  </h6>
                  <p className="text-lg text-mainblue bg-white p-2 rounded-lg">
                    {calculateElectricityUsed().toFixed(2)} บาท
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  className="text-white bg-red-500 hover:bg-mainred px-4 py-2 rounded"
                  onClick={closeModal}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {selectedFormula === "compare" ? (
        <div>
          <div className="z-1 fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center font-prompt">
            <div
              className="bg-white px-6 py-4 rounded-lg shadow-lg w-4/5 overflow-y-auto"
              style={{ maxHeight: "90vh" }}
            >
              <h6 className="text-xl font-semibold text-mainblue mt-6 mb-3 text-center">
                สูตรเปรียบเทียบค่าใช้จ่ายในการเดินทางด้วยรถยนต์ไฟฟ้าและรถยนต์น้ำมัน
              </h6>
              <div className="flex flex-col justify-center items-center mb-4">
                <label className="block text-gray-600">
                  ระยะทางในการเดินทาง (กม.)
                </label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="mt-2 p-2 w-1/2 border border-gray-300 rounded text-black"
                  placeholder="กรุณากรอกระยะทาง"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="pr-4">
                  <p className="text-lg font-bold text-gray-600">
                    การเดินทางด้วยรถยนต์น้ำมัน
                  </p>
                  <div>
                    <label className="block text-gray-600">เลือกยี่ห้อรถ</label>
                    <select
                      id="brand-select"
                      value={selectedBrand2}
                      onChange={handleBrandChange2}
                      className="border rounded-md p-2 w-full h-10 my-2 text-black"
                    >
                      <option value="">เลือกยี่ห้อรถ</option>
                      {brands2.length > 0 ? (
                        brands2.map((brand, index) => (
                          <option key={`brand-${index}`} value={brand}>
                            {brand}
                          </option>
                        ))
                      ) : (
                        <option value="">ไม่มีข้อมูล</option>
                      )}
                    </select>

                    <label className="block text-gray-600">เลือกรุ่นรถ</label>
                    <select
                      id="model-select"
                      value={selectedModel2}
                      onChange={handleModelChange2}
                      disabled={!selectedBrand2}
                      className="border rounded-md p-2 w-full h-10 text-black"
                    >
                      <option value="">เลือกรุ่นรถ</option>
                      {models2.map((model, index) => (
                        <option key={`model-${index}`} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="mt-2 mx-2">
                      <label className="block text-gray-600 my-2">
                        อัตราสิ้นเปลืองน้ำมัน (km/L)
                      </label>
                      <input
                        type="number"
                        value={fuelConsumption}
                        onChange={(e) =>
                          setFuelConsumtion(Number(e.target.value))
                        }
                        className="p-2 w-full border border-gray-300 rounded text-black"
                        disabled
                      />
                    </div>
                    <div className="mt-2 mx-2 text-gray-600">
                      <label className="block text-gray-600 my-2">
                        ราคาน้ำมันต่อลิตร
                      </label>
                      <select
                        value={fuelPrice}
                        onChange={(e) => {
                          console.log("Selected fuel price:", e.target.value);
                          setFuelPrice(Number(e.target.value));
                        }}
                        className="border p-2 rounded-md w-full"
                      >
                        <option value="">เลือกประเภทเชื้อเพลิง</option>
                        {fuelTypeData.map((fuel) => (
                          <option key={fuel.id} value={fuel.price}>
                            {fuel.fuel_type} - {fuel.price} บาท/ลิตร
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="border-r pr-4">
                  <p className="text-lg font-bold text-gray-600">
                    การเดินทางด้วยรถยนต์ไฟฟ้า
                  </p>
                  {inputMode === "carModel" ? (
                    <div>
                      <label className="block text-gray-600">
                        เลือกยี่ห้อรถ
                      </label>
                      <select
                        id="brand-select"
                        value={selectedBrand1}
                        onChange={handleBrandChange1}
                        className="border rounded-md p-2 w-full h-10 my-2 text-black"
                      >
                        <option value="">เลือกยี่ห้อรถ</option>
                        {brands1.length > 0 ? (
                          brands1.map((brand, index) => (
                            <option key={`brand-${index}`} value={brand}>
                              {brand}
                            </option>
                          ))
                        ) : (
                          <option value="">ไม่มีข้อมูล</option>
                        )}
                      </select>

                      <label className="block text-gray-600">เลือกรุ่นรถ</label>
                      <select
                        id="model-select"
                        value={selectedModel1}
                        onChange={handleModelChange1}
                        disabled={!selectedBrand1}
                        className="border rounded-md p-2 w-full h-10 text-black"
                      >
                        <option value="">เลือกรุ่นรถ</option>
                        {models1.map((model, index) => (
                          <option key={`model-${index}`} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mt-2 text-gray-600">
                      <label className="block text-gray-600">
                        เลือกผู้ให้บริการชาร์จ
                      </label>
                      <select
                        value={chargingStation}
                        onChange={(e) => {
                          console.log("Selected fuel price:", e.target.value);
                          setChargingStation(e.target.value);
                        }}
                        className="mt-1 border p-2 rounded-md w-full"
                      >
                        <option value="">เลือกผู้ให้บริการชาร์จ</option>
                        {electricTypeData
                          .map((electric) => electric.Distributor)
                          .filter(
                            (value, index, self) =>
                              self.indexOf(value) === index
                          )
                          .map((distributor, index) => (
                            <option key={index} value={distributor}>
                              {distributor}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="mt-2 text-gray-600">
                      <label className="block text-gray-600">
                        เลือกอัตรากำลังไฟฟ้า
                      </label>
                      <select
                        value={electricityCost}
                        onChange={(e) => {
                          console.log("Selected fuel price:", e.target.value);
                          setElectricityCost(Number(e.target.value));
                        }}
                        className="mt-1 border p-2 rounded-md w-full"
                      >
                        <option value="">เลือกอัตรากำลังไฟฟ้า</option>
                        {electricTypeData
                          .filter(
                            (electric) =>
                              electric.Distributor === chargingStation
                          )
                          .map((electric) => (
                            <option
                              key={electric.Power_ID}
                              value={
                                electric.Peak_Rates__including_VAT___baht_unit_
                              }
                            >
                              {electric.Type_Power} |{" "}
                              {electric.Peak_Rates__including_VAT___baht_unit_}{" "}
                              บาท
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 mx-2">
                    <label className="block text-gray-600 my-2">
                      อัตราสิ้นเปลืองไฟฟ้า (kWh/100 km)
                    </label>
                    <input
                      type="number"
                      value={powerConsumption}
                      onChange={(e) =>
                        setPowerConsumption(Number(e.target.value))
                      }
                      className="p-2 w-full border border-gray-300 rounded text-black"
                      disabled
                    />
                  </div>{" "}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-3">
                <div className="flex justify-center">
                  <div className="mt-2 border border-gray-300 rounded-lg p-2 w-1/2 bg-mainblue text-center shadow-md">
                    <h6 className="text-base text-white mb-2 font-prompt">
                      ค่าใช้จ่ายรถยนต์น้ำมัน
                      <p className="text-lg text-mainblue bg-white rounded-lg">
                        {calculateFuelCost().toFixed(2)} บาท
                      </p>
                    </h6>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="mt-2 border border-gray-300 rounded-lg p-2 w-1/2 bg-mainblue text-center shadow-md">
                    <h6 className="text-base text-white mb-2 font-prompt">
                      ค่าใช้จ่ายรถยนต์ไฟฟ้า{" "}
                      <p className="text-lg text-mainblue bg-white rounded-lg">
                        {calculateElectricCost().toFixed(2)} บาท
                      </p>
                    </h6>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-3">
                <button
                  className="text-white bg-mainred hover:bg-red-600 px-4 py-2 rounded"
                  onClick={() => {
                    closeModal();
                    resetManualInputsForManual();
                  }}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {isInfoMaintainance && (
        <div className="font-prompt text-gray-600 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border p-6 w-1/4 rounded-lg shadow-lg">
          <p className="text-center text-2xl">การคำนวณนี้คำนวณจาก</p>
          <div className="border-2 rounded-xl p-3 m-3">
            <ol className="list-decimal pl-6">
              <li> รายการภาษีที่ต้องจ่าย</li>
              <li> พรบ.</li>
              <li> ประกัน</li>
              <li> ค่าใช้จ่ายเกี่ยวกับเชื้อเพลิง</li>
            </ol>
          </div>
          <div className="m-3 text-gray-500">
            <p className="mt-4">หมายเหตุ :</p>
            <ul className="list-disc pl-6">
              <li>
                การคำนวณประกันรถยนต์น้ำมัน คำนวณจากประกันชั้น 1 ซ่อมห้างเท่านั้น
              </li>
              <li>
                รายการทุกอย่างเป็นค่าเฉลี่ย โปรดหาข้อมูลที่สนใจเพิ่มเติมอีกครั้ง
              </li>
            </ul>
          </div>

          <div className="flex justify-center mt-8">
            <button
              className="text-white bg-mainred hover:bg-red-600 px-4 py-2 rounded"
              onClick={() => {
                closeInfoMaintain();
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
