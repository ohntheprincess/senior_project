"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { utils, writeFile } from "xlsx"

export default function Dashboard() {
  const [userProfiles, setUserProfiles] = useState([])
  const [carModels, setCarModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [hoverCard, setHoverCard] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profiles data
        const userResponse = await fetch("/api/userprofiles")
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user profiles data")
        }
        const userData = await userResponse.json()
        setUserProfiles(userData)

        // Fetch car models data
        const carResponse = await fetch("/api/allCar")
        if (!carResponse.ok) {
          throw new Error("Failed to fetch car models data")
        }
        const carData = await carResponse.json()
        setCarModels(carData)

        setLoading(false)
      } catch (err) {
        setError("Error fetching data. Please try again later.")
        setLoading(false)
        console.error(err)
      }
    }

    fetchData()
  }, [])

  // Function to export data to Excel
  const exportToExcel = async (dataType) => {
    setExportLoading(true)
    try {
      let dataToExport = []
      let fileName = ""

      switch (dataType) {
        case "userProfiles":
          dataToExport = userProfiles
          fileName = "user-profiles-data.xlsx"
          break
        case "carModels":
          dataToExport = carModels
          fileName = "car-models-data.xlsx"
          break
        case "topModels":
          dataToExport = topModels
          fileName = "top-models-data.xlsx"
          break
        case "preferences":
          dataToExport = calculateAverageWeights()
          fileName = "user-preferences-data.xlsx"
          break
        case "demographics":
          // Combine all demographic data
          dataToExport = {
            gender: genderData,
            age: ageData,
            income: incomeData,
            vehicleStatus: vehicleStatusData,
          }
          fileName = "demographics-data.xlsx"
          break
        default:
          // Export all data in different sheets
          const workbook = utils.book_new()

          // Add user profiles sheet
          const userProfilesSheet = utils.json_to_sheet(userProfiles)
          utils.book_append_sheet(workbook, userProfilesSheet, "User Profiles")

          // Add car models sheet
          const carModelsSheet = utils.json_to_sheet(carModels)
          utils.book_append_sheet(workbook, carModelsSheet, "Car Models")

          // Add top models sheet
          const topModelsSheet = utils.json_to_sheet(topModels)
          utils.book_append_sheet(workbook, topModelsSheet, "Top Models")

          // Add preferences sheet
          const preferencesSheet = utils.json_to_sheet(calculateAverageWeights())
          utils.book_append_sheet(workbook, preferencesSheet, "User Preferences")

          // Add demographics sheets
          const genderSheet = utils.json_to_sheet(genderData)
          utils.book_append_sheet(workbook, genderSheet, "Gender Distribution")

          const ageSheet = utils.json_to_sheet(ageData)
          utils.book_append_sheet(workbook, ageSheet, "Age Distribution")

          const incomeSheet = utils.json_to_sheet(incomeData)
          utils.book_append_sheet(workbook, incomeSheet, "Income Distribution")

          writeFile(workbook, "ev-dashboard-data.xlsx")
          setExportLoading(false)
          return
      }

      // For single sheet exports
      if (dataType === "demographics") {
        // Create a workbook with multiple sheets for demographics
        const workbook = utils.book_new()

        const genderSheet = utils.json_to_sheet(genderData)
        utils.book_append_sheet(workbook, genderSheet, "Gender Distribution")

        const ageSheet = utils.json_to_sheet(ageData)
        utils.book_append_sheet(workbook, ageSheet, "Age Distribution")

        const incomeSheet = utils.json_to_sheet(incomeData)
        utils.book_append_sheet(workbook, incomeSheet, "Income Distribution")

        const vehicleStatusSheet = utils.json_to_sheet(vehicleStatusData)
        utils.book_append_sheet(workbook, vehicleStatusSheet, "Vehicle Status")

        writeFile(workbook, fileName)
      } else {
        // Create a worksheet from the data
        const worksheet = utils.json_to_sheet(dataToExport)
        const workbook = utils.book_new()
        utils.book_append_sheet(workbook, worksheet, "Data")

        // Write to file
        writeFile(workbook, fileName)
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่อีกครั้ง")
    } finally {
      setExportLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-white rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-mainblue mx-auto"></div>
          <p className="mt-3 text-base font-kanit text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-white rounded-xl">
        <div className="text-center">
          <div className="text-mainred text-xl mb-3">⚠️</div>
          <p className="text-base font-kanit text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  // Calculate top 3 selected models
  const modelCounts = userProfiles.reduce((acc, profile) => {
    if (profile.selected_model) {
      acc[profile.selected_model] = (acc[profile.selected_model] || 0) + 1
    }
    return acc
  }, {})

  const topModels = Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([model, count]) => {
      // Find the car model details
      const carDetails = carModels.find((car) => car.Model === model) || {}
      return {
        model,
        count,
        image: carDetails.EV_Image_URL,
        brand: carDetails.Brand,
        price: carDetails.Estimated_THB_Value,
        range: carDetails.Range,
        battery: carDetails.Battery,
        acceleration: carDetails.Accelarate,
        seats: carDetails.Seats,
        drive: carDetails.Drive_Configuration,
        topSpeed: carDetails.Top_Speed,
        efficiency: carDetails.Efficiency,
        fastcharge: carDetails.Fastcharge,
      }
    })

  // Calculate average weights for different factors
  const calculateAverageWeights = () => {
    const sum = {
      battery: 0,
      range: 0,
      acceleration: 0,
      topSpeed: 0,
      efficiency: 0,
      fastCharge: 0,
      price: 0,
    }

    userProfiles.forEach((profile) => {
      sum.battery += profile.battery_weight || 0
      sum.range += profile.range_weight || 0
      sum.acceleration += profile.accelarate_weight || 0
      sum.topSpeed += profile.topspeed_weight || 0
      sum.efficiency += profile.efficiency_weight || 0
      sum.fastCharge += profile.fastcharge_weight || 0
      sum.price += profile.price_weight || 0
    })

    const count = userProfiles.length || 1

    return [
      { name: "แบตเตอรี่", value: sum.battery / count },
      { name: "ระยะทาง", value: sum.range / count },
      { name: "ความเร่ง", value: sum.acceleration / count },
      { name: "ความเร็วสูงสุด", value: sum.topSpeed / count },
      { name: "ประสิทธิภาพ", value: sum.efficiency / count },
      { name: "ชาร์จเร็ว", value: sum.fastCharge / count },
      { name: "ราคา", value: sum.price / count },
    ]
  }

  // Demographics data
  const genderDistribution = userProfiles.reduce((acc, profile) => {
    if (profile.gender) {
      acc[profile.gender] = (acc[profile.gender] || 0) + 1
    }
    return acc
  }, {})

  const genderData = Object.entries(genderDistribution).map(([name, value]) => ({
    name: name === "male" ? "ชาย" : name === "female" ? "หญิง" : name,
    value,
  }))

  const ageDistribution = userProfiles.reduce((acc, profile) => {
    if (profile.age_range) {
      acc[profile.age_range] = (acc[profile.age_range] || 0) + 1
    }
    return acc
  }, {})

  const ageData = Object.entries(ageDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  const incomeDistribution = userProfiles.reduce((acc, profile) => {
    if (profile.income_range) {
      acc[profile.income_range] = (acc[profile.income_range] || 0) + 1
    }
    return acc
  }, {})

  const incomeData = Object.entries(incomeDistribution).map(([name, value]) => ({
    name:
      name === "very_high"
        ? "สูงมาก"
        : name === "high"
          ? "สูง"
          : name === "medium"
            ? "ปานกลาง"
            : name === "low"
              ? "ต่ำ"
              : name,
    value,
  }))

  // Calculate average satisfaction score
  const avgSatisfaction =
    userProfiles.reduce((sum, profile) => sum + (profile.satisfaction_score || 0), 0) /
    (userProfiles.filter((p) => p.satisfaction_score !== undefined).length || 1)

  // Calculate vehicle status distribution
  const vehicleStatusDist = userProfiles.reduce((acc, profile) => {
    if (profile.vehicle_status) {
      acc[profile.vehicle_status] = (acc[profile.vehicle_status] || 0) + 1
    }
    return acc
  }, {})

  const vehicleStatusData = Object.entries(vehicleStatusDist).map(([name, value]) => ({
    name: name === "don't_have" ? "ไม่มีรถยนต์" : name === "have" ? "มีรถยนต์" : name ,
    value,
  }))

  // Calculate drive configuration preferences
  const driveConfigDist = userProfiles.reduce((acc, profile) => {
    if (profile.driveCon) {
      acc[profile.driveCon] = (acc[profile.driveCon] || 0) + 1
    }
    return acc
  }, {})

  const driveConfigData = Object.entries(driveConfigDist).map(([name, value]) => ({
    name,
    value,
  }))

  // Calculate seat preferences
  const seatsDist = userProfiles.reduce((acc, profile) => {
    if (profile.seats) {
      acc[profile.seats] = (acc[profile.seats] || 0) + 1
    }
    return acc
  }, {})

  const seatsData = Object.entries(seatsDist).map(([name, value]) => ({
    name: `${name} ที่นั่ง`,
    value,
  }))

  // Colors for charts
  const COLORS = ["#2973B2", "#D32F2F", "#4CAF50", "#FFC107", "#9C27B0", "#FF5722"]

  // Format number with commas
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "N/A"
  }

  // Prepare radar data for top models comparison
  const prepareRadarData = () => {
    const factors = ["range", "battery", "acceleration", "topSpeed", "efficiency", "fastcharge"]
    const maxValues = {}

    // Find max values for normalization
    topModels.forEach((model) => {
      factors.forEach((factor) => {
        if (!maxValues[factor] || (model[factor] && model[factor] > maxValues[factor])) {
          maxValues[factor] = model[factor] || 0
        }
      })
    })

    // Normalize and prepare data
    return factors.map((factor) => {
      const item = {
        factor:
          factor === "acceleration"
            ? "ความเร่ง"
            : factor === "range"
              ? "ระยะทาง"
              : factor === "battery"
                ? "แบตเตอรี่"
                : factor === "topSpeed"
                  ? "ความเร็วสูงสุด"
                  : factor === "efficiency"
                    ? "ประสิทธิภาพ"
                    : factor === "fastcharge"
                      ? "ชาร์จเร็ว"
                      : factor,
      }

      topModels.forEach((model) => {
        // For acceleration, lower is better, so invert the normalization
        if (factor === "acceleration") {
          const value = model[factor] ? (maxValues[factor] / model[factor]) * 100 : 0
          item[model.model] = Math.min(value, 100)
        } else {
          const value = maxValues[factor] ? (model[factor] / maxValues[factor]) * 100 : 0
          item[model.model] = value
        }
      })

      return item
    })
  }

  const radarData = prepareRadarData()

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Dashboard Header - Minimal */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 font-kanit">ข้อมูลเชิงลึกการเลือกรถยนต์ไฟฟ้า</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            ข้อมูลจากผู้ใช้งาน {userProfiles.length} คน เพื่อช่วยในการตัดสินใจเลือกรถยนต์ไฟฟ้าที่เหมาะกับคุณ
          </p>

          {/* Export Button */}
          <div className="mt-4 flex justify-center">
            <div className="relative inline-block">
              <button
                onClick={() => document.getElementById("export-dropdown").classList.toggle("hidden")}
                className="flex items-center px-4 py-2 bg-mainblue text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    กำลังส่งออกข้อมูล...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    ดาวน์โหลดข้อมูล
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
              <div
                id="export-dropdown"
                className="hidden absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              >
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => {
                      document.getElementById("export-dropdown").classList.add("hidden")
                      exportToExcel("all")
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    ดาวน์โหลดข้อมูลทั้งหมด
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById("export-dropdown").classList.add("hidden")
                      exportToExcel("userProfiles")
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    ข้อมูลผู้ใช้งาน
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById("export-dropdown").classList.add("hidden")
                      exportToExcel("carModels")
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    ข้อมูลรถยนต์ไฟฟ้า
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById("export-dropdown").classList.add("hidden")
                      exportToExcel("topModels")
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    ข้อมูลรถยนต์ยอดนิยม
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById("export-dropdown").classList.add("hidden")
                      exportToExcel("preferences")
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    ข้อมูลความต้องการผู้ใช้
                  </button>
                  <button
                    onClick={() => {
                      document.getElementById("export-dropdown").classList.add("hidden")
                      exportToExcel("demographics")
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    ข้อมูลประชากร
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs - Minimal */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "overview" ? "bg-white text-mainblue shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ภาพรวม
            </button>
            <button
              onClick={() => setActiveTab("top-models")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "top-models" ? "bg-white text-mainblue shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              รถยนต์ยอดนิยม
            </button>
            <button
              onClick={() => setActiveTab("user-preferences")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "user-preferences"
                  ? "bg-white text-mainblue shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ความต้องการผู้ใช้
            </button>
            <button
              onClick={() => setActiveTab("demographics")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "demographics" ? "bg-white text-mainblue shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ข้อมูลประชากร
            </button>
          </div>
        </div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Total Users Card */}
              <div
                className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ${
                  hoverCard === "users" ? "transform -translate-y-1 shadow-md border-mainblue/20" : ""
                }`}
                onMouseEnter={() => setHoverCard("users")}
                onMouseLeave={() => setHoverCard(null)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">จำนวนผู้ใช้</h3>
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-mainblue"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-800">{userProfiles.length}</div>
              </div>

              {/* Average Satisfaction Card */}
              <div
                className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ${
                  hoverCard === "satisfaction" ? "transform -translate-y-1 shadow-md border-mainblue/20" : ""
                }`}
                onMouseEnter={() => setHoverCard("satisfaction")}
                onMouseLeave={() => setHoverCard(null)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">ความพึงพอใจ</h3>
                  <div className="p-1.5 bg-red-50 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-mainred"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-800">{avgSatisfaction.toFixed(2)}</div>
              </div>

              {/* Most Important Factor Card */}
              <div
                className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ${
                  hoverCard === "factor" ? "transform -translate-y-1 shadow-md border-mainblue/20" : ""
                }`}
                onMouseEnter={() => setHoverCard("factor")}
                onMouseLeave={() => setHoverCard(null)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">ปัจจัยสำคัญ</h3>
                  <div className="p-1.5 bg-green-50 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-green-600"
                    >
                      <circle cx="12" cy="12" r="8"></circle>
                      <path d="M12 2v2"></path>
                      <path d="M12 20v2"></path>
                      <path d="M2 12h2"></path>
                      <path d="M20 12h2"></path>
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-xl font-bold text-gray-800 truncate">
                  {calculateAverageWeights().sort((a, b) => b.value - a.value)[0]?.name || "N/A"}
                </div>
              </div>

              {/* Top Selected Model Card */}
              <div
                className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ${
                  hoverCard === "model" ? "transform -translate-y-1 shadow-md border-mainblue/20" : ""
                }`}
                onMouseEnter={() => setHoverCard("model")}
                onMouseLeave={() => setHoverCard(null)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">รุ่นยอดนิยม</h3>
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-purple-600"
                    >
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"></path>
                      <circle cx="7" cy="17" r="2"></circle>
                      <circle cx="17" cy="17" r="2"></circle>
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-xl font-bold text-gray-800 truncate">{topModels[0]?.model || "N/A"}</div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Top 3 Selected EV Models Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">รถยนต์ไฟฟ้า 3 อันดับแรก</h3>
                </div>
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={topModels}
                      margin={{
                        top: 5,
                        right: 20,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="model" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          border: "none",
                        }}
                      />
                      <Legend />
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2973B2" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#2973B2" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <Bar dataKey="count" name="จำนวนการเลือก" fill="url(#colorCount)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Preferences Weights Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">ปัจจัยสำคัญในการเลือกรถ</h3>
                </div>
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={calculateAverageWeights()}
                      margin={{
                        top: 5,
                        right: 20,
                        left: 10,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" domain={[0, 15]} />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          border: "none",
                        }}
                      />
                      <Legend />
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#FF8A80" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <Bar dataKey="value" name="ค่าเฉลี่ยน้ำหนัก" fill="url(#colorValue)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Gender Distribution Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">การกระจายตามเพศ</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Vehicle Status Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">สถานะการมีรถยนต์</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={vehicleStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vehicleStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Income Distribution Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">การกระจายตามรายได้</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={incomeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Top Models Tab Content */}
        {activeTab === "top-models" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {topModels.map((model, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
                >
                  <div className="relative">
                    <div className="absolute top-2 left-2 bg-mainblue text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
                      อันดับ {index + 1}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <div className="text-white">
                        <p className="font-bold text-sm">{model.model}</p>
                        <p className="text-xs opacity-90">{model.brand || "N/A"}</p>
                      </div>
                    </div>
                    <img
                      src={model.image || "/placeholder.svg?height=200&width=400"}
                      alt={model.model}
                      className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="text-base font-bold text-gray-800">{model.model}</h4>
                    <p className="text-xs text-gray-500 mb-2">{model.brand || "N/A"}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-gray-50 p-1.5 rounded-lg">
                        <p className="text-gray-500 text-xs">ราคา</p>
                        <p className="font-medium">{formatNumber(model.price)} บาท</p>
                      </div>
                      <div className="bg-gray-50 p-1.5 rounded-lg">
                        <p className="text-gray-500 text-xs">ระยะทาง</p>
                        <p className="font-medium">{model.range || "N/A"} กม.</p>
                      </div>
                      <div className="bg-gray-50 p-1.5 rounded-lg">
                        <p className="text-gray-500 text-xs">แบตเตอรี่</p>
                        <p className="font-medium">{model.battery || "N/A"} kWh</p>
                      </div>
                      <div className="bg-gray-50 p-1.5 rounded-lg">
                        <p className="text-gray-500 text-xs">อัตราเร่ง</p>
                        <p className="font-medium">{model.acceleration || "N/A"} วินาที</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-gray-500">จำนวนที่เลือก:</span>
                        <span className="ml-1 font-bold text-mainblue">{model.count}</span>
                      </div>
                      <div className="text-gray-500">{model.seats || "N/A"} ที่นั่ง</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">การเปรียบเทียบจำนวนการเลือก</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={topModels}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 10,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="colorCount2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2973B2" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2973B2" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="count" name="จำนวนการเลือก" fill="url(#colorCount2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">การเปรียบเทียบคุณสมบัติ</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart outerRadius={80} data={radarData}>
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    {topModels.map((model, index) => (
                      <Radar
                        key={model.model}
                        name={model.model}
                        dataKey={model.model}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* User Preferences Tab Content */}
        {activeTab === "user-preferences" && (
          <div className="space-y-6">
            {/* User Preferences Weights Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-3">
                <h3 className="text-base font-medium text-gray-800">ปัจจัยสำคัญในการเลือกรถยนต์ไฟฟ้า</h3>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={calculateAverageWeights()}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 10,
                      bottom: 5,
                    }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 15]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="colorValue2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#2973B2" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#90CAF9" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="value" name="ค่าเฉลี่ยน้ำหนัก" fill="url(#colorValue2)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Seat Preference Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">ความต้องการจำนวนที่นั่ง</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={seatsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {seatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Driving Conditions Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">ระบบขับเคลื่อนที่ต้องการ</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={driveConfigData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {driveConfigData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Demographics Tab Content */}
        {activeTab === "demographics" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Gender Distribution Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">การกระจายตามเพศ</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Age Distribution Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">การกระจายตามช่วงอายุ</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={ageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Income Distribution Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-800">การกระจายตามรายได้</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={incomeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Small footer with data info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            ข้อมูลจาก {userProfiles.length} ผู้ใช้งาน • อัพเดทล่าสุด: {new Date().toLocaleDateString("th-TH")}
          </p>
        </div>
      </div>
    </section>
  )
}

