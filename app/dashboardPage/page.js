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
} from "recharts"

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
        const carResponse = await fetch("/api/topev")
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

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Dashboard Header - Minimal */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 font-kanit">ข้อมูลเชิงลึกการเลือกรถยนต์ไฟฟ้า</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            ข้อมูลจากผู้ใช้งาน {userProfiles.length} คน เพื่อช่วยในการตัดสินใจเลือกรถยนต์ไฟฟ้าที่เหมาะกับคุณ
          </p>

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
