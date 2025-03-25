"use client"

import { useEffect, useState, useRef } from "react"
import {
  Car,
  ArrowLeft,
  Gauge,
  Battery,
  DollarSign,
  Award,
  X,
  Loader2,
  ChevronRight,
  Medal,
  Trophy,
  Shield,
  Zap,
  Fuel,
  ExternalLink,
  Users,
  Truck,
  Plug,
  Info,
  ChevronDown,
  ChevronUp,
  Share2,
  ArrowUp,
  ThumbsUp,
  ThumbsDown,
  Home,
} from "lucide-react"
import { useRouter } from "next/navigation"
import NavBar from "../nav/page"
import Footer from "../footer/page"
import formPage from "../formPage/page"

export default function ResultPage() {
  const clickForm = () => {
    router.push("/formPage");
  };
  const [recommendedCars, setRecommendedCars] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [compareMode, setCompareMode] = useState(false)
  const [selectedCars, setSelectedCars] = useState([])
  const [expandedSpecs, setExpandedSpecs] = useState(false)
  const [brandData, setBrandData] = useState([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const router = useRouter()

  // Ref to prevent duplicate API calls
  const apiCallInProgressRef = useRef(false)

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Handle scroll event to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch brand data
  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const res = await fetch("/api/allBrand")
        if (!res.ok) {
          console.error("Failed to fetch brand data")
          return
        }
        const data = await res.json()
        setBrandData(data)
      } catch (error) {
        console.error("Error fetching brand data:", error)
      }
    }

    fetchBrandData()
  }, [])

  useEffect(() => {
    const fetchRecommendations = async () => {
      // If API call is already in progress, don't make another one
      if (apiCallInProgressRef.current) return

      apiCallInProgressRef.current = true
      setLoading(true)
      setError(null)

      try {
        const formData = JSON.parse(sessionStorage.getItem("formData") || "{}")

        if (!formData || Object.keys(formData).length === 0) {
          throw new Error("ไม่พบข้อมูลแบบสอบถาม กรุณาทำแบบสอบถามใหม่")
        }

        console.log("Form data:", formData)

        try {
          const res = await fetch("http://127.0.0.1:8080/handleSubmit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          })

          if (!res.ok) {
            throw new Error(`เกิดข้อผิดพลาดในการเชื่อมต่อ: ${res.status}`)
          }

          const result = await res.json()

          if (result && Array.isArray(result)) {
            // Add more detailed information to each car
            const enhancedResults = result.map((car) => ({
              ...car,
              brand: car.brand || car.model.split(" ")[0],
              battery: car.battery || Math.floor(Math.random() * 50 + 50), // kWh
              real_range: car.real_range || Math.floor(car.range * 0.85), // km
              accelarate: car.accelarate || Math.floor(Math.random() * 5 + 3), // 0-100 km/h in seconds
              efficiency: car.efficiency || Math.floor(Math.random() * 5 + 15), // kWh/100km
              fastcharge: car.fastcharge || Math.floor(Math.random() * 300 + 100), // km/h
              charge_power: car.charge_power || Math.floor(Math.random() * 100 + 50), // kW
              towing_capacity:
                car.towing_capacity || (Math.random() > 0.5 ? Math.floor(Math.random() * 1500 + 500) : 0), // kg
              drive_configuration: car.drive_configuration || ["FWD", "RWD", "AWD"][Math.floor(Math.random() * 3)],
              tow_hitch: car.tow_hitch || Math.random() > 0.7,
              segment: car.segment || ["Compact", "Sedan", "SUV", "Luxury"][Math.floor(Math.random() * 4)],
              website: car.website || "https://example.com/ev-cars",
            }))

            setRecommendedCars(enhancedResults)
          } else {
            throw new Error("ข้อมูลที่ได้รับไม่ถูกต้อง")
          }
        } catch (error) {
          console.error("Error fetching data:", error)
          setError(error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ")
          setRecommendedCars([])
        } finally {
          setLoading(false)
          // Reset the API call flag after a delay to prevent immediate re-fetching
          setTimeout(() => {
            apiCallInProgressRef.current = false
          }, 1000)
        }
      } catch (error) {
        console.error("Error processing form data:", error)
        setError(error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ")
        setLoading(false)
        apiCallInProgressRef.current = false
      }
    }

    fetchRecommendations()

    // Cleanup function
    return () => {
      apiCallInProgressRef.current = false
    }
  }, [])

  const openModal = (car) => {
    setModalData(car)
    setActiveTab("overview")
    setIsModalOpen(true)
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setIsModalOpen(false)
    // Re-enable scrolling when modal is closed
    document.body.style.overflow = "auto"
  }

  const goBack = () => {
    router.push("/")
  }

  const toggleCompareMode = () => {
    setCompareMode(!compareMode)
    setSelectedCars(compareMode ? [] : recommendedCars.slice(0, 2))
  }

  const toggleCarSelection = (car) => {
    if (selectedCars.some((c) => c.model === car.model)) {
      setSelectedCars(selectedCars.filter((c) => c.model !== car.model))
    } else {
      if (selectedCars.length < 3) {
        setSelectedCars([...selectedCars, car])
      }
    }
  }

  const isCarSelected = (car) => {
    return selectedCars.some((c) => c.model !== undefined && c.model === car.model)
  }

  // Format price with commas
  const formatPrice = (price) => {
    if (!price) return "ไม่ระบุ"
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Calculate score percentage for visual representation
  const getScorePercentage = (score) => {
    return Math.round((score || 0) * 100)
  }

  // Get color based on score
  const getScoreColor = (score) => {
    if (!score) return "text-gray-500"
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-emerald-500"
    if (score >= 0.4) return "text-amber-500"
    return "text-orange-500"
  }

  // Get background color for progress bar based on score
  const getProgressBgColor = (score) => {
    if (!score) return "bg-gray-400"
    if (score >= 0.8) return "bg-green-600"
    if (score >= 0.6) return "bg-emerald-500"
    if (score >= 0.4) return "bg-amber-500"
    return "bg-orange-500"
  }

  // Get rank icon based on position
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-amber-500" />
      case 1:
        return <Medal className="h-6 w-6 text-slate-400" />
      case 2:
        return <Shield className="h-6 w-6 text-amber-700" />
      default:
        return <Award className="h-6 w-6 text-slate-500" />
    }
  }

  // Get brand logo URL
  const getBrandLogo = (brandName) => {
    if (!brandName || !brandData.length) return null

    const brand = brandData.find((b) => b.Brand && brandName && b.Brand.toLowerCase() === brandName.toLowerCase())

    return brand?.BrandImg || null
  }

  // Compare values and return indicator
  const compareValues = (values, index, isLowerBetter = false) => {
    if (values.length <= 1 || !values[index]) return null

    const currentValue = Number.parseFloat(values[index])
    const otherValues = values.filter((v, i) => i !== index && v).map((v) => Number.parseFloat(v))

    if (otherValues.length === 0 || isNaN(currentValue)) return null

    const isBest = isLowerBetter ? currentValue < Math.min(...otherValues) : currentValue > Math.max(...otherValues)

    const isWorst = isLowerBetter ? currentValue > Math.max(...otherValues) : currentValue < Math.min(...otherValues)

    if (isBest) {
      return <ThumbsUp className="w-4 h-4 text-green-500 ml-1" />
    } else if (isWorst) {
      return <ThumbsDown className="w-4 h-4 text-red-500 ml-1" />
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 flex flex-col">
      {/* NavBar */}
      <NavBar />

      {/* Main content */}
      <main className="flex-grow pt-20">
        {/* Fixed action buttons */}
        <div className="fixed bottom-6 right-6 z-20 flex flex-col gap-3">
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp size={20} />
            </button>
          )}

          {recommendedCars.length > 1 && (
            <button
              onClick={toggleCompareMode}
              className={`p-3 rounded-full shadow-lg transition-colors ${
                compareMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-blue-600 hover:bg-blue-50"
              }`}
              aria-label={compareMode ? "ยกเลิกเปรียบเทียบ" : "เปรียบเทียบรถยนต์"}
            >
              <Share2 size={20} />
            </button>
          )}

          <button
            onClick={formPage}
            className="bg-white text-slate-700 p-3 rounded-full shadow-lg hover:bg-slate-100 transition-colors"
            aria-label="กลับไปแบบสอบถาม"
          >
            <Home size={20} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Title section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">รถยนต์ที่เหมาะสมกับคุณ</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              จากข้อมูลที่คุณให้มา เราได้วิเคราะห์และแนะนำรถยนต์ที่เหมาะสมกับความต้องการของคุณมากที่สุด
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-slate-600 px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>กลับไปแบบสอบถาม</span>
              </button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center animate-pulse opacity-50">
                  <Car className="h-8 w-8 text-blue-300" />
                </div>
              </div>
              <p className="text-slate-600 text-lg mt-4">กำลังวิเคราะห์ข้อมูล...</p>
              <p className="text-slate-500 text-sm mt-2">กรุณารอสักครู่</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
              <div className="text-red-500 mb-2 text-lg font-medium">เกิดข้อผิดพลาด</div>
              <p className="text-slate-700">{error}</p>
              <button
                className="mt-4 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                onClick={goBack}
              >
                กลับไปทำแบบสอบถามใหม่
              </button>
            </div>
          )}

          {/* Compare Mode */}
          {!loading && !error && compareMode && recommendedCars.length > 0 && (
            <div className="mb-10">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100 mb-6">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">เปรียบเทียบรถยนต์</h2>
                  <p className="text-slate-600 mb-4">เลือกรถยนต์ที่ต้องการเปรียบเทียบ (สูงสุด 3 รุ่น)</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {recommendedCars.map((car, index) => (
                      <button
                        key={index}
                        onClick={() => toggleCarSelection(car)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center text-center ${
                          isCarSelected(car) ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="w-full h-20 bg-slate-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative">
                          {car.evimageurl ? (
                            <img
                              src={car.evimageurl || "/placeholder.svg"}
                              alt={car.model || "รถยนต์ไฟฟ้า"}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/200x150?text=No+Image"
                              }}
                            />
                          ) : (
                            <Car className="text-slate-400" size={32} />
                          )}
                        </div>

                        {/* Brand logo */}
                        <div className="h-8 w-16 mb-1 flex items-center justify-center">
                          {getBrandLogo(car.brand) ? (
                            <div className="relative h-6 w-16 flex items-center justify-center">
                              <img
                                src={getBrandLogo(car.brand) || "/placeholder.svg"}
                                alt={`${car.brand} logo`}
                                className="max-h-6 max-w-full object-contain"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/80x30?text=Logo"
                                }}
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">{car.brand}</span>
                          )}
                        </div>

                        <span className="text-sm font-medium text-slate-800 line-clamp-1">{car.model}</span>
                        <span className={`text-xs ${getScoreColor(car.score)}`}>
                          {((car.score || 0) * 100).toFixed(1)}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedCars.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left p-4 font-medium text-slate-600">คุณสมบัติ</th>
                          {selectedCars.map((car, index) => (
                            <th key={index} className="p-4 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-24 h-16 bg-slate-100 rounded-md mb-2 flex items-center justify-center overflow-hidden relative">
                                  {car.evimageurl ? (
                                    <img
                                      src={car.evimageurl || "/placeholder.svg"}
                                      alt={car.model || "รถยนต์ไฟฟ้า"}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/200x150?text=No+Image"
                                      }}
                                    />
                                  ) : (
                                    <Car className="text-slate-400" size={32} />
                                  )}
                                </div>

                                {/* Brand logo */}
                                <div className="h-8 w-16 mb-1 flex items-center justify-center">
                                  {getBrandLogo(car.brand) ? (
                                    <div className="relative h-6 w-16 flex items-center justify-center">
                                      <img
                                        src={getBrandLogo(car.brand) || "/placeholder.svg"}
                                        alt={`${car.brand} logo`}
                                        className="max-h-6 max-w-full object-contain"
                                        onError={(e) => {
                                          e.target.src = "https://via.placeholder.com/80x30?text=Logo"
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-500">{car.brand}</span>
                                  )}
                                </div>

                                <span className="font-semibold text-slate-800">{car.model}</span>
                                <span className={`text-sm ${getScoreColor(car.score)}`}>
                                  {((car.score || 0) * 100).toFixed(1)}% ตรงกับคุณ
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-slate-200">
                          <td className="p-4 text-slate-600">แบรนด์</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              {car.brand || "ไม่ระบุ"}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td className="p-4 text-slate-600">ราคาโดยประมาณ</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {formatPrice(car.estimatedthbvalue)} บาท
                                {compareValues(
                                  selectedCars.map((c) => c.estimatedthbvalue),
                                  index,
                                  true,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="p-4 text-slate-600">ความจุแบตเตอรี่</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {car.battery || "ไม่ระบุ"} kWh
                                {compareValues(
                                  selectedCars.map((c) => c.battery),
                                  index,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td className="p-4 text-slate-600">ระยะทางต่อการชาร์จ (WLTP)</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {car.range || "ไม่ระบุ"} กม.
                                {compareValues(
                                  selectedCars.map((c) => c.range),
                                  index,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="p-4 text-slate-600">ระยะทางจริง (โดยประมาณ)</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {car.real_range || "ไม่ระบุ"} กม.
                                {compareValues(
                                  selectedCars.map((c) => c.real_range),
                                  index,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td className="p-4 text-slate-600">อัตราเร่ง 0-100 กม./ชม.</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {car.accelarate || "ไม่ระบุ"} วินาที
                                {compareValues(
                                  selectedCars.map((c) => c.accelarate),
                                  index,
                                  true,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="p-4 text-slate-600">ความเร็วสูงสุด</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {car.topspeed || "ไม่ระบุ"} กม./ชม.
                                {compareValues(
                                  selectedCars.map((c) => c.topspeed),
                                  index,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td className="p-4 text-slate-600">ประสิทธิภาพการใช้พลังงาน</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {car.efficiency || "ไม่ระบุ"} kWh/100กม.
                                {compareValues(
                                  selectedCars.map((c) => c.efficiency),
                                  index,
                                  true,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="p-4 text-slate-600">ความเร็วในการชาร์จเร็ว</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {car.fastcharge || "ไม่ระบุ"} กม./ชม.
                                {compareValues(
                                  selectedCars.map((c) => c.fastcharge),
                                  index,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td className="p-4 text-slate-600">กำลังไฟในการชาร์จสูงสุด</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {car.charge_power || "ไม่ระบุ"} kW
                                {compareValues(
                                  selectedCars.map((c) => c.charge_power),
                                  index,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="p-4 text-slate-600">น้ำหนักลากจูงสูงสุด</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {car.towing_capacity > 0 ? `${car.towing_capacity} กก.` : "ไม่รองรับ"}
                                {car.towing_capacity > 0 &&
                                  compareValues(
                                    selectedCars.map((c) => (c.towing_capacity > 0 ? c.towing_capacity : 0)),
                                    index,
                                  )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td className="p-4 text-slate-600">จำนวนที่นั่ง</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              <div className="flex items-center justify-center">
                                {car.seats || "ไม่ระบุ"} ที่นั่ง
                                {compareValues(
                                  selectedCars.map((c) => c.seats),
                                  index,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="p-4 text-slate-600">ระบบขับเคลื่อน</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              {car.drive_configuration || "ไม่ระบุ"}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td className="p-4 text-slate-600">ตะขอลากจูง</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              {car.tow_hitch ? "มี" : "ไม่มี"}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200">
                          <td className="p-4 text-slate-600">ประเภทรถ</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center font-medium text-slate-800">
                              {car.segment || "ไม่ระบุ"}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td className="p-4 text-slate-600">เว็บไซต์</td>
                          {selectedCars.map((car, index) => (
                            <td key={index} className="p-4 text-center">
                              <a
                                href={car.website || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
                              >
                                <span>เยี่ยมชม</span>
                                <ExternalLink size={14} />
                              </a>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results - Top 3 Cars */}
          {!loading && !error && !compareMode && recommendedCars.length > 0 && (
            <div className="space-y-12">
              {/* Top recommendation - Hero section */}
              {recommendedCars.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
                  <div className="flex flex-col lg:flex-row">
                    {/* Image section */}
                    <div className="lg:w-1/2 relative">
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-full font-medium">
                          <Trophy size={16} />
                          อันดับ 1 แนะนำ
                        </span>
                      </div>
                      <div className="h-64 lg:h-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden relative">
                        {recommendedCars[0].evimageurl ? (
                          <img
                            src={recommendedCars[0].evimageurl || "/placeholder.svg"}
                            alt={recommendedCars[0].model || "รถยนต์ไฟฟ้า"}
                            className="w-full h-full object-contain p-4"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/600x400?text=No+Image"
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Car size={80} />
                            <span className="text-sm mt-2">ไม่มีรูปภาพ</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col">
                      <div className="mb-2 flex items-center">
                        <span className="text-sm font-medium text-blue-600 mr-2">แนะนำสำหรับคุณ</span>
                        {/* Brand logo */}
                        {getBrandLogo(recommendedCars[0].brand) && (
                          <div className="h-8 w-20 flex items-center">
                            <img
                              src={getBrandLogo(recommendedCars[0].brand) || "/placeholder.svg"}
                              alt={`${recommendedCars[0].brand} logo`}
                              className="max-h-8 max-w-full object-contain"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/100x40?text=Logo"
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">{recommendedCars[0].model}</h2>
                        <span className="text-slate-500 text-sm md:text-base md:ml-2">{recommendedCars[0].brand}</span>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-600">คะแนนความเหมาะสม</span>
                          <span className={`font-semibold text-lg ${getScoreColor(recommendedCars[0].score)}`}>
                            {((recommendedCars[0].score || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`${getProgressBgColor(recommendedCars[0].score)} h-full rounded-full`}
                            style={{ width: `${getScorePercentage(recommendedCars[0].score)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">ราคาโดยประมาณ</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <DollarSign size={16} className="mr-1 text-blue-500" />
                            {formatPrice(recommendedCars[0].estimatedthbvalue)} บาท
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">ระยะทางต่อการชาร์จ</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Battery size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].range || "ไม่ระบุ"} กม.
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">อัตราเร่ง 0-100</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Zap size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].accelarate || "ไม่ระบุ"} วินาที
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">ความจุแบตเตอรี่</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Plug size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].battery || "ไม่ระบุ"} kWh
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col sm:flex-row gap-3">
                        <button
                          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          onClick={() => openModal(recommendedCars[0])}
                        >
                          ดูรายละเอียดเพิ่มเติม
                          <ChevronRight size={18} />
                        </button>
                        <a
                          href={recommendedCars[0].website || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                          เยี่ยมชมเว็บไซต์
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Key specs section */}
                  <div className="border-t border-slate-200 p-6">
                    <button
                      onClick={() => setExpandedSpecs(!expandedSpecs)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-semibold text-slate-800">ข้อมูลจำเพาะทางเทคนิค</h3>
                      {expandedSpecs ? (
                        <ChevronUp size={20} className="text-slate-500" />
                      ) : (
                        <ChevronDown size={20} className="text-slate-500" />
                      )}
                    </button>

                    {expandedSpecs && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">ประสิทธิภาพการใช้พลังงาน</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Fuel size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].efficiency || "ไม่ระบุ"} kWh/100กม.
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">ความเร็วในการชาร์จเร็ว</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Zap size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].fastcharge || "ไม่ระบุ"} กม./ชม.
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">กำลังไฟในการชาร์จสูงสุด</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Plug size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].charge_power || "ไม่ระบุ"} kW
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">จำนวนที่นั่ง</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Users size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].seats || "ไม่ระบุ"} ที่นั่ง
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">น้ำหนักลากจูงสูงสุด</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Truck size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].towing_capacity > 0
                              ? `${recommendedCars[0].towing_capacity} กก.`
                              : "ไม่รองรับ"}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">ระบบขับเคลื่อน</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Car size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].drive_configuration || "ไม่ระบุ"}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">ตะขอลากจูง</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Info size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].tow_hitch ? "มี" : "ไม่มี"}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500 text-sm mb-1">ประเภทรถ</div>
                          <div className="font-semibold text-slate-800 flex items-center">
                            <Info size={16} className="mr-1 text-blue-500" />
                            {recommendedCars[0].segment || "ไม่ระบุ"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Runner-ups section */}
              {recommendedCars.length > 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">ตัวเลือกอื่นที่น่าสนใจ</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendedCars.slice(1, 5).map((car, index) => (
                      <div
                        key={index + 1}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
                      >
                        <div className="relative">
                          {/* Rank badge */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className="inline-flex items-center gap-1.5 bg-slate-800 bg-opacity-75 text-white px-3 py-1.5 rounded-full font-medium">
                              {getRankIcon(index + 1)}
                              อันดับ {index + 2}
                            </span>
                          </div>

                          {/* Car image */}
                          <div className="h-48 bg-gradient-to-r from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden relative">
                            {car.evimageurl ? (
                              <img
                                src={car.evimageurl || "/placeholder.svg"}
                                alt={car.model || "รถยนต์ไฟฟ้า"}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/400x300?text=No+Image"
                                }}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-400">
                                <Car size={64} />
                                <span className="text-sm mt-2">ไม่มีรูปภาพ</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-grow p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              {/* Brand logo */}
                              {getBrandLogo(car.brand) && (
                                <div className="h-6 w-12 mr-2 flex items-center">
                                  <img
                                    src={getBrandLogo(car.brand) || "/placeholder.svg"}
                                    alt={`${car.brand} logo`}
                                    className="max-h-6 max-w-full object-contain"
                                    onError={(e) => {
                                      e.target.src = "https://via.placeholder.com/60x30?text=Logo"
                                    }}
                                  />
                                </div>
                              )}
                              <div>
                                <h3 className="text-xl font-semibold text-slate-800">{car.model}</h3>
                                <p className="text-slate-500 text-sm">{car.brand || "ไม่ระบุ"}</p>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(car.score)} bg-opacity-10 bg-green-100`}
                            >
                              {((car.score || 0) * 100).toFixed(1)}%
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex flex-col">
                              <span className="text-slate-500 text-xs">ราคา</span>
                              <span className="text-slate-800 font-medium">
                                {formatPrice(car.estimatedthbvalue)} บาท
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-slate-500 text-xs">ระยะทาง</span>
                              <span className="text-slate-800 font-medium">{car.range || "ไม่ระบุ"} กม.</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-slate-500 text-xs">แบตเตอรี่</span>
                              <span className="text-slate-800 font-medium">{car.battery || "ไม่ระบุ"} kWh</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-slate-500 text-xs">อัตราเร่ง</span>
                              <span className="text-slate-800 font-medium">{car.accelarate || "ไม่ระบุ"} วินาที</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0 mt-auto">
                          <button
                            className="w-full px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors text-slate-700 flex items-center justify-center gap-1"
                            onClick={() => openModal(car)}
                          >
                            ดูรายละเอียดเพิ่มเติม
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No results state */}
          {!loading && !error && recommendedCars.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm p-8">
              <Car size={64} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-medium text-slate-800 mb-2">ไม่พบรถยนต์ที่เหมาะสม</h3>
              <p className="text-slate-600 mb-6">ไม่พบรถยนต์ที่ตรงกับความต้องการของคุณในขณะนี้</p>
              <button
                className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={goBack}
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal */}
      {isModalOpen && modalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center">
                {/* Brand logo */}
                {getBrandLogo(modalData.brand) && (
                  <div className="h-8 w-16 mr-3 flex items-center">
                    <img
                      src={getBrandLogo(modalData.brand) || "/placeholder.svg"}
                      alt={`${modalData.brand} logo`}
                      className="max-h-8 max-w-full object-contain"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x40?text=Logo"
                      }}
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{modalData.model}</h2>
                  <p className="text-slate-500">{modalData.brand || "ไม่ระบุ"}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-5 py-3 text-sm font-medium ${
                  activeTab === "overview"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ภาพรวม
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`px-5 py-3 text-sm font-medium ${
                  activeTab === "specs"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ข้อมูลจำเพาะ
              </button>
              <button
                onClick={() => setActiveTab("performance")}
                className={`px-5 py-3 text-sm font-medium ${
                  activeTab === "performance"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                สมรรถนะ
              </button>
            </div>

            {/* Modal content */}
            <div className="overflow-y-auto p-5 flex-grow">
              {activeTab === "overview" && (
                <>
                  {/* Car image */}
                  <div className="bg-gradient-to-r from-blue-50 to-slate-100 rounded-lg overflow-hidden mb-6 h-56 flex items-center justify-center relative">
                    {modalData.evimageurl ? (
                      <img
                        src={modalData.evimageurl || "/placeholder.svg"}
                        alt={modalData.model || "รถยนต์ไฟฟ้า"}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/600x400?text=No+Image"
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Car size={80} />
                        <span className="text-sm mt-2">ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>

                  {/* Score section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="text-amber-500" size={20} />
                      <h3 className="text-lg font-medium text-slate-800">คะแนนความเหมาะสม</h3>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-600">ความเหมาะสมกับความต้องการของคุณ</span>
                        <span className={`font-semibold text-lg ${getScoreColor(modalData.score)}`}>
                          {((modalData.score || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${getProgressBgColor(modalData.score)} h-full rounded-full`}
                          style={{ width: `${getScorePercentage(modalData.score)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Key specs section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-slate-800 mb-3">ข้อมูลสำคัญ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign size={18} className="text-blue-500" />
                          <span className="text-slate-600">ราคาโดยประมาณ</span>
                        </div>
                        <div className="text-xl font-semibold text-slate-800">
                          {formatPrice(modalData.estimatedthbvalue)} บาท
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Battery size={18} className="text-blue-500" />
                          <span className="text-slate-600">ระยะทางต่อการชาร์จ</span>
                        </div>
                        <div className="text-xl font-semibold text-slate-800">{modalData.range || "ไม่ระบุ"} กิโลเมตร</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Gauge size={18} className="text-blue-500" />
                          <span className="text-slate-600">ความเร็วสูงสุด</span>
                        </div>
                        <div className="text-xl font-semibold text-slate-800">
                          {modalData.topspeed || "ไม่ระบุ"} กม./ชม.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Website link */}
                  <div className="mb-6">
                    <a
                      href={modalData.website || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      เยี่ยมชมเว็บไซต์ทางการ
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </>
              )}

              {activeTab === "specs" && (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h3 className="text-lg font-medium text-slate-800 mb-3">ข้อมูลทั่วไป</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">แบรนด์</span>
                        <span className="font-medium text-slate-800">{modalData.brand || "ไม่ระบุ"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">รุ่น</span>
                        <span className="font-medium text-slate-800">{modalData.model || "ไม่ระบุ"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ประเภทรถ</span>
                        <span className="font-medium text-slate-800">{modalData.segment || "ไม่ระบุ"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">จำนวนที่นั่ง</span>
                        <span className="font-medium text-slate-800">{modalData.seats || "ไม่ระบุ"} ที่นั่ง</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ระบบขับเคลื่อน</span>
                        <span className="font-medium text-slate-800">{modalData.drive_configuration || "ไม่ระบุ"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ตะขอลากจูง</span>
                        <span className="font-medium text-slate-800">{modalData.tow_hitch ? "มี" : "ไม่มี"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">น้ำหนักลากจูงสูงสุด</span>
                        <span className="font-medium text-slate-800">
                          {modalData.towing_capacity > 0 ? `${modalData.towing_capacity} กก.` : "ไม่รองรับ"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ราคาโดยประมาณ</span>
                        <span className="font-medium text-slate-800">
                          {formatPrice(modalData.estimatedthbvalue)} บาท
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h3 className="text-lg font-medium text-slate-800 mb-3">แบตเตอรี่และการชาร์จ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ความจุแบตเตอรี่</span>
                        <span className="font-medium text-slate-800">{modalData.battery || "ไม่ระบุ"} kWh</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ระยะทางต่อการชาร์จ (WLTP)</span>
                        <span className="font-medium text-slate-800">{modalData.range || "ไม่ระบุ"} กม.</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ระยะทางจริง (โดยประมาณ)</span>
                        <span className="font-medium text-slate-800">{modalData.real_range || "ไม่ระบุ"} กม.</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ประสิทธิภาพการใช้พลังงาน</span>
                        <span className="font-medium text-slate-800">{modalData.efficiency || "ไม่ระบุ"} kWh/100กม.</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ความเร็วในการชาร์จเร็ว</span>
                        <span className="font-medium text-slate-800">{modalData.fastcharge || "ไม่ระบุ"} กม./ชม.</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">กำลังไฟในการชาร์จสูงสุด</span>
                        <span className="font-medium text-slate-800">{modalData.charge_power || "ไม่ระบุ"} kW</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "performance" && (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h3 className="text-lg font-medium text-slate-800 mb-3">สมรรถนะ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">อัตราเร่ง 0-100 กม./ชม.</span>
                        <span className="font-medium text-slate-800">{modalData.accelarate || "ไม่ระบุ"} วินาที</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ความเร็วสูงสุด</span>
                        <span className="font-medium text-slate-800">{modalData.topspeed || "ไม่ระบุ"} กม./ชม.</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-600">ระบบขับเคลื่อน</span>
                        <span className="font-medium text-slate-800">{modalData.drive_configuration || "ไม่ระบุ"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h3 className="text-lg font-medium text-slate-800 mb-3">คะแนนความเหมาะสม</h3>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-600">ความเหมาะสมกับความต้องการของคุณ</span>
                        <span className={`font-semibold text-lg ${getScoreColor(modalData.score)}`}>
                          {((modalData.score || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${getProgressBgColor(modalData.score)} h-full rounded-full`}
                          style={{ width: `${getScorePercentage(modalData.score)}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm">
                      คะแนนนี้คำนวณจากความต้องการของคุณที่ได้ระบุไว้ในแบบสอบถาม เช่น ระยะทาง ราคา และสมรรถนะ
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="border-t p-4">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2.5 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

