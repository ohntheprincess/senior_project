"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Evcardata() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [allbrand, setAllBrand] = useState([]);
  const [brand, setBrand] = useState("");

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedCarID, setSelectedCarID] = useState([]);

  const [isCompared, setIsCompared] = useState(1);

  const carsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = selectedBrand
    ? data.filter((car) => car.Brand === selectedBrand)
    : data.filter((item) => brand === "" || item.Brand === brand);

  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredData.slice(indexOfFirstCar, indexOfLastCar);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const buttonRef = useRef(null);
  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.click();
    }
  }, []);

  useEffect(() => {
    if (isCompared == 2) {
      clickCarData();
    }
  }, [isCompared]);
  const clickCarData = () => {
    setTimeout(() => {
      document
        .getElementById("section-cardata")
        .scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  useEffect(() => {
    if (isCompared == 3) {
      setTimeout(() => {
        const section = document.getElementById("section-comparefromdata");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [isCompared]);

  useEffect(() => {
    fetch("/api/allCar")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        console.log("Fetched car data:", data);
      })
      .catch((error) => console.error("Error fetching car data:", error));

    fetch("/api/allBrand")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((allbrand) => {
        setAllBrand(allbrand);
        console.log("Fetched brand data:", allbrand);
      })
      .catch((error) => console.error("Error fetching brand data:", error));
  }, []);

  useEffect(() => {
    console.log(selectedBrand);
  }, [selectedBrand]);
  useEffect(() => {
    console.log("carselected:" + selectedCarID);
  }, [selectedCarID]);
  const handleSelectCar = (car) => {
    setSelectedCar(car);
    console.log(selectedCar);
  };
  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  };
  const handleCheckboxChange = (car) => (event) => {
    setSelectedCarID((prev) => {
      const updatedPrev = prev || [];
      if (event.target.checked) {
        if (updatedPrev.length >= 3) return updatedPrev;
        return [...updatedPrev, car];
      } else {
        return updatedPrev.filter((c) => c.Model_ID !== car.Model_ID);
      }
    });
  };
  const handleDeSelectCarID = (car) => {
    setSelectedCarID((prev) => {
      const updatedList = prev.filter((c) => c.Model_ID !== car.Model_ID);

      if (updatedList.length === 1 || updatedList.length === 0) {
        setIsCompared(2);
      }

      return updatedList;
    });

    console.log("รถที่ถูกลบ:", car.model);
  };

  const handleDeSelected = () => {
    setSelectedCarID([]);
    setIsCompared(1);
  };

  const brandOptions =
    data.length > 0 ? [...new Set(data.map((item) => item.Brand))] : [];
  return (
    <div
      className="min-h-screen bg-white text-black font-prompt pt-12"
      id="section-cardata"
    >
      <div className="grid grid-cols-4 p-4">
        <div className="ml-6">
          <div className="bg-white h-screen">
            <div className="flex flex-col items-center py-6 overflow-y-auto h-[600px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
              <button
                ref={buttonRef}
                onClick={() => handleSelectBrand("")}
                className="flex flex-row justify-center hover:shadow-md hover:text-mainblue items-center bg-white text-black p-4 rounded-lg transition-all"
              >
                <p className="text-center mx-2">รถยนต์ไฟฟ้าทุกแบรนด์</p>
              </button>

              <div className="flex flex-col w-full gap-2">
                {allbrand.map((brand) => (
                  <button
                    key={`${brand.Brand_ID}-${brand.BrandImg}`}
                    onClick={() => handleSelectBrand(brand.Brand)}
                    className="flex flex-row justify-center items-center bg-white text-black p-3 rounded-lg hover:shadow-md transition-all"
                  >
                    <img
                      src={brand.BrandImg}
                      alt={brand.Brand}
                      className="w-[40px] h-[30px] object-contain"
                    />
                    <p className="text-center mx-2">{brand.Brand}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-white col-span-3  h-screen ml-6 p-6">
          {selectedBrand ? (
            <h1 className="text-2xl font-bold mb-3 text-mainblue">
              ข้อมูลรถยนต์ไฟฟ้าแบรนด์ {selectedBrand}
            </h1>
          ) : (
            <h1 className="text-2xl font-bold mb-3 text-mainblue">
              ข้อมูลรถยนต์ไฟฟ้าทุกแบรนด์
            </h1>
          )}
          {currentCars.map((car) => (
            <div key={car.Model_ID}>
              <div className="relative w-full h-auto">
                <table className="w-full text-lg text-center text-gray-500 table-fixed">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="w-1/5 text-center align-middle">
                        <input
                          id="checkbox"
                          type="checkbox"
                          onChange={handleCheckboxChange(car)}
                          checked={selectedCarID.some(
                            (c) => c.Model_ID === car.Model_ID
                          )}
                          className="absolute top-7 left-10 w-4 h-4 bg-gray-100 border-gray-300 rounded-sm focus:ring-mainblue dark:focus:ring-mainblue dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          disabled={
                            !selectedCarID.includes(car.Model_ID) &&
                            selectedCarID.length >= 4
                          }
                        />
                        <label htmlFor="checkbox" className="sr-only">
                          checkbox
                        </label>
                        <img
                          src={car.EV_Image_URL}
                          alt={car.Model}
                          className="w-[140px] h-[120px] object-contain mx-auto"
                        />
                      </td>
                      <td className="w-1/5 text-gray-500 text-center align-middle">
                        {car.Brand}
                      </td>
                      <td className="w-2/5 text-center align-middle">
                        <div className="flex flex-col">
                          <span>{car.Model}</span>
                          <span className="text-sm text-mainblue mt-2">
                            {Math.round(car.Estimated_THB_Value).toLocaleString(
                              "th-TH"
                            )}{" "}
                            บาท
                          </span>
                        </div>
                      </td>
                      <td className="text-sm">
                        <div className="flex flex-col">
                          <button
                            className="shadow-lg mb-2 text-mainblue rounded border"
                            onClick={() => handleSelectCar(car)}
                          >
                            ข้อมูลเพิ่มเติม
                          </button>
                          <div className="flex flex-row shadow-lg justify-center items-center bg-mainblue text-white rounded">
                            <a className="" href={car.Website}>
                              ไปยังเว็บไซต์
                            </a>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="size-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                              />
                            </svg>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-2">
            {currentPage > 1 && (
              <button
                className="px-4 py-2 rounded m-2 text-mainblue"
                onClick={() => paginate(currentPage - 1)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
            )}
            {indexOfLastCar < filteredData.length && (
              <button
                className="px-4 py-2 rounded m-2  text-mainblue"
                onClick={() => paginate(currentPage + 1)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {selectedCar ? (
        <div className="font-prompt fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border p-6 w-3/4 rounded-lg shadow-lg">
          <div className="grid grid-cols-2">
            <div className="">
              <p className="text-xl font-bold">{selectedCar.Brand}</p>
              <p className="text-lg mb-3">{selectedCar.Model}</p>
              <img src={selectedCar.EV_Image_URL}></img>
              <a
                className="inline-flex items-center space-x-2 m-2 text-gray-400"
                href={selectedCar.Website}
              >
                <span>ไปยังเว็บไซต์</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                  />
                </svg>
              </a>
            </div>
            <div className="p-6">
              <table className="table-auto w-full border-collapse">
                <tbody>
                  <tr className="border-b">
                    <td className="px-2 py-2 text-mainblue">แบตเตอรี่</td>
                    <td className="px-2 py-2 text-gray-600">
                      {selectedCar.Battery}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-2 py-2 text-mainblue">real_range</td>
                    <td className="px-2 py-2 text-gray-600">
                      {selectedCar.Real_Range}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-2 py-2 text-mainblue">fastcharge</td>
                    <td className="px-2 py-2 text-gray-600">
                      {selectedCar.Fastcharge}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-2 py-2 text-mainblue">
                      drive configuration
                    </td>
                    <td className="px-2 py-2 text-gray-600 ">
                      {selectedCar.Drive_Configuration}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-2 py-2 text-mainblue">effieciency</td>
                    <td className="px-2 py-2 text-gray-600">
                      {selectedCar.Efficiency}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-2 py-2 text-mainblue">accerlarate</td>
                    <td className="px-2 py-2 text-gray-600">
                      {selectedCar.Accelarate}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-mainblue">tow hitch</td>
                    <td className="px-2 py-2 text-gray-600">
                      {selectedCar.Tow_Hitch}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="grid grid-cols-2 mt-4">
                <div className="border border-gray-300 rounded-lg mx-2 p-2 bg-mainblue text-center shadow-md">
                  <span className="block text-white">ราคาโดยประมาณ</span>
                  <p className="text-lg text-mainblue bg-white rounded-lg">
                    {Math.round(selectedCar.Estimated_THB_Value).toLocaleString(
                      "th-TH"
                    )}
                    {""}บาท
                  </p>
                </div>
                <div className="border border-gray-300 rounded-lg  mx-2 p-2 bg-mainblue text-center shadow-md">
                  <span className="block text-white">จำนวนที่นั่ง</span>
                  <p className="text-lg text-mainblue bg-white rounded-lg">
                    {" "}
                    {selectedCar.Seats}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-400">
                *ราคาที่ระบุเป็นเพียงประมาณการเบื้องต้น
                กรุณาตรวจสอบราคาและข้อมูลที่แน่นอนจากเว็บไซต์เพื่อความถูกต้องและความแม่นยำ{" "}
                <a href={selectedCar.Website}>ไปที่เว็บไซต์</a>
              </span>
            </div>
          </div>

          <div className="flex justify-center items-center mt-2">
            <button
              className="bg-red-500 text-white p-2 rounded-lg"
              onClick={() => setSelectedCar(null)}
            >
              ปิด
            </button>
          </div>
        </div>
      ) : (
        <div></div>
      )}
      {selectedCarID.length > 0 && (
        <div className="fixed  bottom-0 left-1/2 -translate-x-1/2 w-3/4 bg-white shadow-lg rounded-lg border p-4 mx-4 my-3 text-gray-600">
          <div className="flex flex-row justify-between items-center">
            <h3>
              รถยนต์ไฟฟ้าที่เลือก
              <span className="text-gray-500">(เลือกได้แค่ 3 คันเท่านั้น)</span>
            </h3>
            <button
              className="bg-white text-gray-700 rounded-lg"
              onClick={handleDeSelected}
            >
              ล้างการเลือก
            </button>
          </div>
          <div className="flex flex-row items-center justify-between">
            {selectedCarID.map((car, index) => (
              <button
                key={index}
                className="m-2 p-2 border rounded-lg"
                onClick={() => handleDeSelectCarID(car)}
              >
                {car.Model}
              </button>
            ))}
            <button
              className="p-2 bg-mainblue text-white rounded-lg"
              onClick={() => {
                setIsCompared(3);
              }}
            >
              เปรียบเทียบ
            </button>
          </div>
        </div>
      )}
      {isCompared == 3 && (
        <div
          className="bg-white w-5/6 h-full pt-20 mx-auto"
          id="section-comparefromdata"
        >
          <div className="flex flex-row text-gray-600">
            {selectedCarID.map((car) => (
              <div
                key={car.Model_ID}
                className="px-6 py-3 border w-[400px] mx-auto"
              >
                <div className="flex flex-row justify-end text-gray-600">
                  <button onClick={() => handleDeSelectCarID(car)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-center text-2xl text-mainblue">
                  {car.Brand}
                </p>

                <p className="text-center text-xl text-mainblue">{car.Model}</p>

                <p className="text-center bg-mainblue rounded-lg ml-3 mt-3 text-lg text-white">
                  {Math.round(car.Estimated_THB_Value).toLocaleString("th-TH")}{" "}
                  บาท
                </p>
                <img
                  src={car.EV_Image_URL}
                  className="w-30 h-30 object-cover mx-auto my-3"
                ></img>
                <div className="grid grid-cols-2 border-b">
                  <p className="text-mainblue font-bold  my-2">จำนวนที่นั่ง</p>
                  <p className="ml-6 my-2">{car?.Seats ?? "N/A"} ที่นั่ง</p>
                </div>
                <div className="grid grid-cols-2 border-b my-2">
                  <p className="text-mainblue font-bold  my-2">แบตเตอรี่</p>
                  <p className="ml-6  my-2">
                    {car?.Battery ?? "N/A"} กิโลวัตต์/ชั่วโมง
                  </p>
                </div>
                <div className="grid grid-cols-2 border-b my-2">
                  <p className="text-mainblue font-bold  my-2">
                    อัตราเร่ง (0 to 100 กม/ชม)
                  </p>
                  <p className="ml-6  my-2">
                    {car?.Accelarate ?? "N/A"} วินาที
                  </p>
                </div>

                <div className="grid grid-cols-2 border-b my-2">
                  <p className="text-mainblue font-bold">ระบบขับเคลื่อน</p>
                  <p className="ml-6">{car?.Drive_Configuration ?? "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 border-b my-2">
                  <p className="text-mainblue font-bold">
                    อัตราสิ้นเปลืองไฟฟ้า
                  </p>
                  <p className="ml-6">
                    {car?.Efficiency ?? "N/A"} Wh/ต่อกิโลเมตร
                  </p>
                </div>
                <div className="grid grid-cols-2 border-b my-2">
                  <p className="text-mainblue font-bold">ชาร์จเร็ว</p>
                  <p className="ml-6">{car?.Fastcharge ?? "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 border-b my-2">
                  <p className="text-mainblue font-bold">
                    ระยะทางที่รถสามารถวิ่งได้
                  </p>
                  <p className="ml-6">
                    {Math.round(car.Real_Range) ?? "N/A"} กิโลเมตร
                  </p>
                </div>
                <div className="grid grid-cols-2 border-b my-2">
                  <p className="text-mainblue font-bold">ความเร็วสูงสุด</p>
                  <p className="ml-6">
                    {car?.Top_Speed ?? "N/A"} กิโลเมตร/ชั่วโมง
                  </p>
                </div>
                <div className="grid grid-cols-2 my-2">
                  <p className="text-mainblue font-bold">อุปกรณ์ลากจูง</p>
                  <p className="ml-6">{car?.Tow_Hitch ?? "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
