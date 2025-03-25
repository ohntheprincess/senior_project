"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Car,
  Battery,
  Zap,
  Gauge,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  User,
  Briefcase,
  Heart,
  Home,
  Shield,
  Sparkles,
  LightbulbIcon,
  BatteryCharging,
  MapPin,
  Banknote,
  Info,
  X,
  HelpCircle,
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { motion, AnimatePresence } from "framer-motion"

// ข้อมูลปัจจัยต่างๆ ที่ใช้ในการแนะนำรถยนต์ไฟฟ้า
const factors = [
  {
    name: "battery",
    icon: <Battery className="w-6 h-6" />,
    title: "แบตเตอรี่",
    description: "ความจุและเทคโนโลยีของแบตเตอรี่มีผลต่อระยะทางและอายุการใช้งาน",
    questions: [
      {
        label: "คุณมักจะให้ความสำคัญกับเทคโนโลยีของแบตเตอรี่รถยนต์ไฟฟ้า",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 9 },
          { label: "เห็นด้วย", score: 8 },
          { label: "ค่อนข้างเห็นด้วย", score: 7 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 3 },
          { label: "ไม่เห็นด้วย", score: 2 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 1 },
        ],
      },
      {
        label: "รถยนต์ไฟฟ้าที่ดีควรมีแบตเตอรี่ที่จุได้เยอะ",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 9 },
          { label: "เห็นด้วย", score: 8 },
          { label: "ค่อนข้างเห็นด้วย", score: 7 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 3 },
          { label: "ไม่เห็นด้วย", score: 2 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 1 },
        ],
      },
    ],
  },
  {
    name: "range",
    icon: <Gauge className="w-6 h-6" />,
    title: "ระยะทาง",
    description: "ระยะทางที่สามารถขับได้ต่อการชาร์จหนึ่งครั้ง",
    questions: [
      {
        label: "คุณชอบรถที่สามารถเดินทางได้ไกลในหนึ่งการชาร์จ",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 9 },
          { label: "เห็นด้วย", score: 8 },
          { label: "ค่อนข้างเห็นด้วย", score: 7 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 3 },
          { label: "ไม่เห็นด้วย", score: 2 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 1 },
        ],
      },
      {
        label: "คุณมักจะเดินทางไกลอยู่บ่อยครั้ง",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 9 },
          { label: "เห็นด้วย", score: 8 },
          { label: "ค่อนข้างเห็นด้วย", score: 7 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 3 },
          { label: "ไม่เห็นด้วย", score: 2 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 1 },
        ],
      },
    ],
  },
  {
    name: "accelarate",
    icon: <Zap className="w-6 h-6" />,
    title: "อัตราเร่ง",
    description: "ความเร็วในการเร่งจาก 0-100 กม./ชม.",
    questions: [
      {
        label: "คุณมักจะแซงรถยนต์คันข้างหน้าเมื่อมีโอกาส",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 9 },
          { label: "เห็นด้วย", score: 8 },
          { label: "ค่อนข้างเห็นด้วย", score: 7 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 3 },
          { label: "ไม่เห็นด้วย", score: 2 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 1 },
        ],
      },
      {
        label: "การขับรถที่ดีคือการขับอย่างใจเย็นและระมัดระวัง",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 1 },
          { label: "เห็นด้วย", score: 2 },
          { label: "ค่อนข้างเห็นด้วย", score: 3 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 7 },
          { label: "ไม่เห็นด้วย", score: 8 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 9 },
        ],
      },
    ],
  },
  {
    name: "top_speed",
    icon: <Clock className="w-6 h-6" />,
    title: "ความเร็วสูงสุด",
    description: "ความเร็วสูงสุดที่รถสามารถทำได้",
    questions: [
      {
        label: "คุณเป็นคนรีบร้อนในการขับขี่",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 9 },
          { label: "เห็นด้วย", score: 8 },
          { label: "ค่อนข้างเห็นด้วย", score: 7 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 3 },
          { label: "ไม่เห็นด้วย", score: 2 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 1 },
        ],
      },
      {
        label: "ความเร็วไม่ใช่คำตอบสำหรับการขับขี่ที่ปลอดภัย",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 1 },
          { label: "เห็นด้วย", score: 2 },
          { label: "ค่อนข้างเห็นด้วย", score: 3 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 7 },
          { label: "ไม่เห็นด้วย", score: 8 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 9 },
        ],
      },
    ],
  },
  {
    name: "efficiency",
    icon: <LightbulbIcon className="w-6 h-6" />,
    title: "ประสิทธิภาพ",
    description: "ประสิทธิภาพในการใช้พลังงานไฟฟ้า",
    questions: [
      {
        label: "รถยนต์ไฟฟ้าที่ดีควรเป็นรถที่ประหยัดพลังงาน",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 9 },
          { label: "เห็นด้วย", score: 8 },
          { label: "ค่อนข้างเห็นด้วย", score: 7 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 3 },
          { label: "ไม่เห็นด้วย", score: 2 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 1 },
        ],
      },
      {
        label: "คุณจะซื้อรถยนต์ไฟฟ้าเพราะคิดว่ารถยนต์ไฟฟ้าจะประหยัดค่าใช้จ่ายได้ดีกว่ารถยนต์น้ำมัน",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 9 },
          { label: "เห็นด้วย", score: 8 },
          { label: "ค่อนข้างเห็นด้วย", score: 7 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 3 },
          { label: "ไม่เห็นด้วย", score: 2 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 1 },
        ],
      },
    ],
  },
  {
    name: "estimated_thb_value",
    icon: <Banknote className="w-6 h-6" />,
    title: "ราคา",
    description: "งบประมาณและความคุ้มค่าในการลงทุน",
    questions: [
      {
        label: "คุณมักจะซื้อของโดยไม่คำนึงถึงราคา",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 1 },
          { label: "เห็นด้วย", score: 2 },
          { label: "ค่อนข้างเห็นด้วย", score: 3 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 7 },
          { label: "ไม่เห็นด้วย", score: 8 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 9 },
        ],
      },
      {
        label: "คุณเป็นคนสบาย ๆ ใช้รถยี่ห้อไหนก็ได้ขอแค่ราคาถูกและจับต้องได้",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 9 },
          { label: "เห็นด้วย", score: 8 },
          { label: "ค่อนข้างเห็นด้วย", score: 7 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 3 },
          { label: "ไม่เห็นด้วย", score: 2 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 1 },
        ],
      },
    ],
  },
  {
    name: "fastcharge",
    icon: <BatteryCharging className="w-6 h-6" />,
    title: "ชาร์จเร็ว",
    description: "ความเร็วในการชาร์จแบตเตอรี่",
    questions: [
      {
        label: "คุณไม่ค่อยชอบการรอคอยสิ่งต่าง ๆ เป็นเวลานาน",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 9 },
          { label: "เห็นด้วย", score: 8 },
          { label: "ค่อนข้างเห็นด้วย", score: 7 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 3 },
          { label: "ไม่เห็นด้วย", score: 2 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 1 },
        ],
      },
      {
        label: "ก่อนออกจากบ้านทุกครั้ง คุณมักจะเตรียมพร้อมเสมอ",
        options: [
          { label: "เห็นด้วยอย่างยิ่ง", score: 1 },
          { label: "เห็นด้วย", score: 2 },
          { label: "ค่อนข้างเห็นด้วย", score: 3 },
          { label: "เฉยๆ", score: 5 },
          { label: "ค่อนข้างไม่เห็นด้วย", score: 7 },
          { label: "ไม่เห็นด้วย", score: 8 },
          { label: "ไม่เห็นด้วยอย่างยิ่ง", score: 9 },
        ],
      },
    ],
  },
]

// ประเภทของระบบขับเคลื่อน
const driveTypes = [
  {
    id: "ระบบขับเคลื่อนล้อหน้า",
    label: "ขับเคลื่อนล้อหน้า",
    description: "เหมาะสำหรับการขับขี่ในเมืองและประหยัดพลังงาน",
    icon: <Car className="w-10 h-10 text-mainblue" />,
  },
  {
    id: "ระบบขับเคลื่อนล้อหลัง",
    label: "ขับเคลื่อนล้อหลัง",
    description: "ให้ความรู้สึกสปอร์ตและการทรงตัวที่ดี",
    icon: <Car className="w-10 h-10 text-mainblue" />,
  },
  {
    id: "ระบบขับเคลื่อนสี่ล้อแบบอัตโนมัติ",
    label: "ขับเคลื่อน 4 ล้อ",
    description: "เหมาะกับทุกสภาพถนนและให้ความมั่นใจสูงสุด",
    icon: <Car className="w-10 h-10 text-mainblue" />,
  },
]

// ตัวเลือกจำนวนที่นั่ง
const seatOptions = [
  { value: 2, label: "2 ที่นั่ง", description: "รถสปอร์ต 2 ที่นั่ง" },
  { value: 4, label: "4 ที่นั่ง", description: "รถยนต์ขนาดเล็ก-กลาง" },
  { value: 5, label: "5 ที่นั่ง", description: "รถยนต์ขนาดกลาง-ใหญ่" },
  { value: 7, label: "7 ที่นั่ง", description: "รถอเนกประสงค์ครอบครัว" },
]

// ข้อมูลผู้ใช้
const genderOptions = [
  { value: "male", label: "ชาย", icon: <User className="w-5 h-5" /> },
  { value: "female", label: "หญิง", icon: <User className="w-5 h-5" /> },
  { value: "other", label: "อื่นๆ", icon: <User className="w-5 h-5" /> },
]

const ageOptions = [
  { value: "18-24", label: "18-24 ปี" },
  { value: "25-34", label: "25-34 ปี" },
  { value: "35-44", label: "35-44 ปี" },
  { value: "45-54", label: "45-54 ปี" },
  { value: "55-64", label: "55-64 ปี" },
  { value: "65+", label: "65 ปีขึ้นไป" },
]

const occupationOptions = [
  { value: "student", label: "นักเรียน/นักศึกษา", icon: <Briefcase className="w-5 h-5" /> },
  { value: "employed", label: "พนักงาน/ลูกจ้าง", icon: <Briefcase className="w-5 h-5" /> },
  { value: "self-employed", label: "ธุรกิจส่วนตัว", icon: <Briefcase className="w-5 h-5" /> },
  { value: "unemployed", label: "ว่างงาน", icon: <Briefcase className="w-5 h-5" /> },
  { value: "retired", label: "เกษียณ", icon: <Briefcase className="w-5 h-5" /> },
  { value: "officer", label: "ข้าราชการ", icon: <Briefcase className="w-5 h-5" /> },
]

const maritalOptions = [
  { value: "single", label: "โสด", icon: <Heart className="w-5 h-5" /> },
  { value: "married", label: "แต่งงาน", icon: <Heart className="w-5 h-5" /> },
  { value: "divorced", label: "หย่าร้าง", icon: <Heart className="w-5 h-5" /> },
  { value: "widowed", label: "หม้าย", icon: <Heart className="w-5 h-5" /> },
]

const familyOptions = [
  { value: "no_children", label: "ไม่มีบุตร", icon: <Home className="w-5 h-5" /> },
  { value: "with_children", label: "มีบุตร", icon: <Home className="w-5 h-5" /> },
]

const incomeOptions = [
  { value: "low", label: "ต่ำกว่า 15,000 บาท", icon: <DollarSign className="w-5 h-5" /> },
  { value: "medium", label: "15,000 - 30,000 บาท", icon: <DollarSign className="w-5 h-5" /> },
  { value: "high", label: "30,001 - 50,000 บาท", icon: <DollarSign className="w-5 h-5" /> },
  { value: "very_high", label: "50,000 บาทขึ้นไป", icon: <DollarSign className="w-5 h-5" /> },
]

const vehicleOptions = [
  { value: "have", label: "มี", icon: <Car className="w-5 h-5" /> },
  { value: "don't_have", label: "ไม่มี", icon: <Car className="w-5 h-5" /> },
]

// คอมโพเนนต์ย่อยสำหรับแสดงคำแนะนำ
const InfoTooltip = ({ text }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        className="text-gray-400 hover:text-gray-600 transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle size={16} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-700 left-0 top-full mt-1">
          {text}
          <div className="absolute -top-2 left-0 w-3 h-3 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
        </div>
      )}
    </div>
  )
}

// คอมโพเนนต์หลัก
export default function CustomForm() {
  const router = useRouter()
  const [currentFactorIndex, setCurrentFactorIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [weights, setWeights] = useState(() =>
    factors.reduce(
      (acc, factor) => ({
        ...acc,
        [factor.name]: Array(factor.questions.length).fill(null),
      }),
      {},
    ),
  )
  const [step, setStep] = useState("welcome") // "welcome", "profile", "questions", "seats", "drive", "summary"
  const [numSeats, setNumSeats] = useState(null)
  const [driveType, setDriveType] = useState(null)
  const [userProfile, setUserProfile] = useState({
    gender: "",
    age_range: "",
    occupation: "",
    marital_status: "",
    family_status: "",
    income_range: "",
    vehicle_status: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slideDirection, setSlideDirection] = useState("right")
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipContent, setTooltipContent] = useState("")
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [showHelpModal, setShowHelpModal] = useState(false)

  // Ref to track if form is being submitted
  const isSubmittingRef = useRef(false)

  const totalQuestions = factors.reduce((sum, factor) => sum + factor.questions.length, 0)

  const currentStepNumber =
    factors.slice(0, currentFactorIndex).reduce((sum, f) => sum + f.questions.length, 0) + currentQuestionIndex + 1

  // คำนวณเปอร์เซ็นต์ความคืบหน้า
  let progressPercentage
  if (step === "welcome") {
    progressPercentage = 0
  } else if (step === "profile") {
    progressPercentage = 10
  } else if (step === "questions") {
    progressPercentage = 10 + Math.round((currentStepNumber / totalQuestions) * 70)
  } else if (step === "seats") {
    progressPercentage = 80
  } else if (step === "drive") {
    progressPercentage = 90
  } else {
    progressPercentage = 100
  }

  // ตรวจสอบว่าข้อมูลผู้ใช้กรอกครบหรือไม่
  const isProfileComplete = Object.values(userProfile).every((value) => value !== "")

  // ตรวจสอบว่าตอบคำถามครบหรือไม่
  const questionsCompleted = Object.values(weights).every((values) => values.every((val) => val !== null))

  // ตรวจสอบว่าข้อมูลทั้งหมดครบหรือไม่
  const isFormComplete = questionsCompleted && numSeats !== null && driveType !== null && isProfileComplete

  // เริ่มต้นแบบฟอร์ม
  const startForm = () => {
    setSlideDirection("left")
    setTimeout(() => {
      setStep("profile")
      setSlideDirection("right")
    }, 300)
  }

  // จัดการเมื่อกรอกข้อมูลผู้ใช้เสร็จ
  const handleProfileComplete = () => {
    if (!isProfileComplete) return

    setSlideDirection("left")
    setTimeout(() => {
      setStep("questions")
      setSlideDirection("right")
    }, 300)
  }

  // จัดการเมื่อเลือกคำตอบ
  const handleSelect = (score) => {
    const currentFactor = factors[currentFactorIndex]
    const newWeights = [...weights[currentFactor.name]]
    newWeights[currentQuestionIndex] = score

    setWeights((prev) => ({
      ...prev,
      [currentFactor.name]: newWeights,
    }))

    // ไปยังคำถามถัดไปหรือปัจจัยถัดไป
    if (currentQuestionIndex < currentFactor.questions.length - 1) {
      setSlideDirection("left")
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
        setSlideDirection("right")
      }, 300)
    } else if (currentFactorIndex < factors.length - 1) {
      setSlideDirection("left")
      setTimeout(() => {
        setCurrentFactorIndex((prev) => prev + 1)
        setCurrentQuestionIndex(0)
        setSlideDirection("right")
      }, 300)
    } else {
      // ตอบคำถามครบแล้ว ไปยังขั้นตอนเลือกจำนวนที่นั่ง
      setSlideDirection("left")
      setTimeout(() => {
        setStep("seats")
        setSlideDirection("right")
      }, 300)
    }
  }

  // จัดการเมื่อกดปุ่มย้อนกลับ
  const handleBack = () => {
    setSlideDirection("right")

    setTimeout(() => {
      if (step === "profile") {
        // กลับไปหน้าแรก
        setStep("welcome")
      } else if (step === "questions" && currentQuestionIndex === 0 && currentFactorIndex === 0) {
        // กลับไปหน้าข้อมูลส่วนตัว
        setStep("profile")
      } else if (step === "seats") {
        // กลับไปหน้าคำถาม
        setStep("questions")
        setCurrentFactorIndex(factors.length - 1)
        setCurrentQuestionIndex(factors[factors.length - 1].questions.length - 1)
      } else if (step === "drive") {
        // กลับไปหน้าเลือกจำนวนที่นั่ง
        setStep("seats")
      } else if (step === "summary") {
        // กลับไปหน้าเลือกระบบขับเคลื่อน
        setStep("drive")
      } else if (currentQuestionIndex > 0) {
        // กลับไปคำถามก่อนหน้า
        setCurrentQuestionIndex((prev) => prev - 1)
      } else if (currentFactorIndex > 0) {
        // กลับไปปัจจัยก่อนหน้า
        const prevFactor = factors[currentFactorIndex - 1]
        setCurrentFactorIndex((prev) => prev - 1)
        setCurrentQuestionIndex(prevFactor.questions.length - 1)
      }

      setSlideDirection("left")
    }, 300)
  }

  // จัดการเมื่อกดปุ่มถัดไป
  const handleNext = () => {
    setSlideDirection("left")

    setTimeout(() => {
      if (step === "seats" && numSeats !== null) {
        setStep("drive")
      } else if (step === "drive" && driveType !== null) {
        setStep("summary")
      }

      setSlideDirection("right")
    }, 300)
  }

  // จัดการเมื่อกดปุ่มส่งแบบฟอร์ม
  const handleSubmit = async (event) => {
    event.preventDefault()

    // ป้องกันการส่งซ้ำ
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      // คำนวณคะแนนรวม
      const summedWeight = Object.fromEntries(
        Object.entries(weights).map(([key, values]) => [key, values.reduce((acc, val) => acc + (val || 0), 0)]),
      )

      // สร้างข้อมูลผู้ใช้โดยใช้ค่าดั้งเดิม
      const unmappedUserProfile = {
        gender: userProfile.gender,
        age_range: userProfile.age_range,
        occupation: userProfile.occupation,
        marital_status: userProfile.marital_status,
        family_status: userProfile.family_status,
        income_range: userProfile.income_range,
        user_id: userProfile.user_id || uuidv4(),
        vehicle_status: userProfile.vehicle_status,
      }

      const data = {
        userProfile: unmappedUserProfile,
        numSeats,
        driveCon: driveType,
        summedWeight,
      }

      sessionStorage.setItem("formData", JSON.stringify(data))
      router.push("/resultpage")
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  // จัดการเมื่อเปลี่ยนข้อมูลผู้ใช้
  const handleProfileChange = (field, value) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // แสดงคำแนะนำเมื่อเลื่อนเมาส์ไปที่ไอคอน
  const handleShowTooltip = (content, event) => {
    setTooltipContent(content)
    setTooltipPosition({ x: event.clientX, y: event.clientY })
    setShowTooltip(true)
  }

  // ซ่อนคำแนะนำ
  const handleHideTooltip = () => {
    setShowTooltip(false)
  }

  const currentFactor = factors[currentFactorIndex]
  const currentQuestion = currentFactor?.questions[currentQuestionIndex]

  // Animation variants
  const variants = {
    hidden: {
      opacity: 0,
      x: slideDirection === "right" ? 100 : -100,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      x: slideDirection === "right" ? -100 : 100,
      transition: {
        ease: "easeInOut",
      },
    },
  }

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-creame/30 to-white">
      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-semibold text-slate-800">คำแนะนำการใช้งาน</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">เกี่ยวกับแบบทดสอบนี้</h3>
                  <p className="text-gray-600">
                    แบบทดสอบนี้จะช่วยวิเคราะห์ความต้องการและไลฟ์สไตล์ของคุณ เพื่อแนะนำรถยนต์ไฟฟ้าที่เหมาะสมที่สุด โดยพิจารณาจากปัจจัยต่างๆ เช่น
                    แบตเตอรี่ ระยะทาง อัตราเร่ง ราคา และอื่นๆ
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">ขั้นตอนการทำแบบทดสอบ</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>กรอกข้อมูลส่วนตัวเพื่อการวิเคราะห์ที่แม่นยำยิ่งขึ้น</li>
                    <li>ตอบคำถามเกี่ยวกับความชอบและไลฟ์สไตล์การใช้รถยนต์</li>
                    <li>เลือกจำนวนที่นั่งที่ต้องการ</li>
                    <li>เลือกระบบขับเคลื่อนที่เหมาะกับการใช้งานของคุณ</li>
                    <li>ตรวจสอบข้อมูลและดูผลการวิเคราะห์</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">คำแนะนำเพิ่มเติม</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>ตอบคำถามตามความเป็นจริงเพื่อผลลัพธ์ที่แม่นยำ</li>
                    <li>คุณสามารถย้อนกลับไปแก้ไขคำตอบได้ตลอดเวลา</li>
                    <li>ผลการวิเคราะห์จะแสดงรถยนต์ไฟฟ้าที่เหมาะสมกับคุณมากที่สุด</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="border-t p-4">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full px-4 py-2.5 bg-mainblue text-white rounded-md hover:bg-mainblue/80 transition-colors"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-50 max-w-xs"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
          }}
        >
          <p className="text-sm text-gray-700">{tooltipContent}</p>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="relative w-16 h-16 md:w-20 md:h-20">
              <div className="absolute inset-0 bg-mainblue rounded-full opacity-20 animate-ping"></div>
              <div className="relative flex items-center justify-center bg-mainblue text-white rounded-full w-16 h-16 md:w-20 md:h-20">
                <Car className="w-8 h-8 md:w-10 md:h-10" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-mainblue mb-2">แบบทดสอบรถยนต์ไฟฟ้าที่เหมาะกับคุณ</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">ตอบคำถามเพื่อค้นหารถยนต์ไฟฟ้าที่เหมาะกับไลฟ์สไตล์และความต้องการของคุณ</p>
          <button
            onClick={() => setShowHelpModal(true)}
            className="mt-3 inline-flex items-center text-mainblue hover:text-mainblue/80 transition-colors"
          >
            <Info className="w-4 h-4 mr-1" />
            <span>คำแนะนำการใช้งาน</span>
          </button>
        </header>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center gap-4 w-full">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-mainblue h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-sm font-medium text-mainblue whitespace-nowrap">{progressPercentage}%</div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <div className={`${step === "welcome" || step === "profile" ? "text-mainblue font-medium" : ""}`}>
              ข้อมูลส่วนตัว
            </div>
            <div className={`${step === "questions" ? "text-mainblue font-medium" : ""}`}>คำถาม</div>
            <div className={`${step === "seats" ? "text-mainblue font-medium" : ""}`}>จำนวนที่นั่ง</div>
            <div className={`${step === "drive" ? "text-mainblue font-medium" : ""}`}>ระบบขับเคลื่อน</div>
            <div className={`${step === "summary" ? "text-mainblue font-medium" : ""}`}>สรุปผล</div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Welcome Step */}
            {step === "welcome" && (
              <motion.div
                key="welcome"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="relative h-48 bg-gradient-to-r from-mainblue to-mainblue/70 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-pattern"></div>
                  <div className="relative z-10 text-white text-center px-6">
                    <h2 className="text-2xl font-bold mb-2">ค้นหารถยนต์ไฟฟ้าที่ใช่สำหรับคุณ</h2>
                    <p>ใช้เวลาเพียง 5 นาทีเพื่อค้นพบรถยนต์ไฟฟ้าที่เหมาะกับไลฟ์สไตล์ของคุณ</p>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <motion.div
                      className="bg-creame/50 p-4 rounded-lg flex flex-col items-center text-center"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      custom={0}
                    >
                      <div className="bg-creame p-3 rounded-full mb-3">
                        <Sparkles className="w-6 h-6 text-mainblue" />
                      </div>
                      <h3 className="font-medium mb-1">แบบทดสอบที่ปรับแต่ง</h3>
                      <p className="text-sm text-gray-600">วิเคราะห์ความต้องการและไลฟ์สไตล์ของคุณ</p>
                    </motion.div>

                    <motion.div
                      className="bg-creame/50 p-4 rounded-lg flex flex-col items-center text-center"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      custom={1}
                    >
                      <div className="bg-creame p-3 rounded-full mb-3">
                        <Shield className="w-6 h-6 text-mainblue" />
                      </div>
                      <h3 className="font-medium mb-1">ข้อมูลที่เชื่อถือได้</h3>
                      <p className="text-sm text-gray-600">ข้อมูลจากผู้เชี่ยวชาญและแหล่งที่เชื่อถือได้</p>
                    </motion.div>

                    <motion.div
                      className="bg-creame/50 p-4 rounded-lg flex flex-col items-center text-center"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      custom={2}
                    >
                      <div className="bg-creame p-3 rounded-full mb-3">
                        <MapPin className="w-6 h-6 text-mainblue" />
                      </div>
                      <h3 className="font-medium mb-1">ผลลัพธ์ที่แม่นยำ</h3>
                      <p className="text-sm text-gray-600">แนะนำรถยนต์ไฟฟ้าที่เหมาะสมกับคุณมากที่สุด</p>
                    </motion.div>
                  </div>

                  <div className="flex flex-col items-center">
                    <button
                      onClick={startForm}
                      className="w-full md:w-auto px-8 py-3 bg-mainblue text-white rounded-lg hover:bg-mainblue/80 transition-colors flex items-center justify-center gap-2 mb-4"
                    >
                      เริ่มแบบทดสอบ
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <p className="text-sm text-gray-500">ใช้เวลาประมาณ 5 นาที</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Step */}
            {step === "profile" && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                key="profile"
                className="bg-white rounded-xl shadow-lg p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-creame p-2 rounded-full">
                    <User className="w-6 h-6 text-mainblue" />
                  </div>
                  <h2 className="text-xl font-semibold text-mainblue">ข้อมูลส่วนตัว</h2>
                </div>

                <p className="text-gray-600 mb-6">กรุณากรอกข้อมูลส่วนตัวเพื่อการวิเคราะห์ที่แม่นยำยิ่งขึ้น</p>

                <div className="space-y-6">
                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <User className="w-4 h-4 mr-1 text-mainblue" />
                      เพศ
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {genderOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleProfileChange("gender", option.value)}
                          className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                            userProfile.gender === option.value
                              ? "bg-mainblue text-white"
                              : "bg-white border border-gray-300 hover:border-mainblue hover:bg-creame/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Users className="w-4 h-4 mr-1 text-mainblue" />
                      ช่วงอายุ
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ageOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleProfileChange("age_range", option.value)}
                          className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                            userProfile.age_range === option.value
                              ? "bg-mainblue text-white"
                              : "bg-white border border-gray-300 hover:border-mainblue hover:bg-creame/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Occupation */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Briefcase className="w-4 h-4 mr-1 text-mainblue" />
                      อาชีพ
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {occupationOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleProfileChange("occupation", option.value)}
                          className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                            userProfile.occupation === option.value
                              ? "bg-mainblue text-white"
                              : "bg-white border border-gray-300 hover:border-mainblue hover:bg-creame/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marital Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Heart className="w-4 h-4 mr-1 text-mainblue" />
                      สถานภาพ
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {maritalOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleProfileChange("marital_status", option.value)}
                          className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                            userProfile.marital_status === option.value
                              ? "bg-mainblue text-white"
                              : "bg-white border border-gray-300 hover:border-mainblue hover:bg-creame/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Family Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Home className="w-4 h-4 mr-1 text-mainblue" />
                      สถานะครอบครัว
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {familyOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleProfileChange("family_status", option.value)}
                          className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                            userProfile.family_status === option.value
                              ? "bg-mainblue text-white"
                              : "bg-white border border-gray-300 hover:border-mainblue hover:bg-creame/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Income Range */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-mainblue" />
                      ช่วงรายได้
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {incomeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleProfileChange("income_range", option.value)}
                          className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                            userProfile.income_range === option.value
                              ? "bg-mainblue text-white"
                              : "bg-white border border-gray-300 hover:border-mainblue hover:bg-creame/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Car className="w-4 h-4 mr-1 text-mainblue" />
                      คุณมีรถยนต์แล้วหรือยัง
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {vehicleOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleProfileChange("vehicle_status", option.value)}
                          className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                            userProfile.vehicle_status === option.value
                              ? "bg-mainblue text-white"
                              : "bg-white border border-gray-300 hover:border-mainblue hover:bg-creame/50"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 px-4 py-2 text-mainblue hover:bg-creame/70 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      ย้อนกลับ
                    </button>

                    <button
                      onClick={handleProfileComplete}
                      disabled={!isProfileComplete}
                      className={`flex items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                        !isProfileComplete
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-mainblue text-white hover:bg-mainblue/80"
                      }`}
                    >
                      ถัดไป
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Questions Step */}
            {step === "questions" && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                key={`question-${currentFactorIndex}-${currentQuestionIndex}`}
                className="bg-white rounded-xl shadow-lg p-6 md:p-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-creame p-2 rounded-full">{currentFactor.icon}</div>
                    <div>
                      <h2 className="text-xl font-semibold text-mainblue">{currentFactor.title}</h2>
                      <p className="text-sm text-gray-500">{currentFactor.description}</p>
                    </div>
                  </div>

                  <div className="bg-creame/50 p-5 rounded-lg">
                    <h3 className="text-lg font-medium mb-6 text-center">{currentQuestion.label}</h3>

                    <div className="grid grid-cols-1 gap-3">
                      {currentQuestion.options.map((option) => (
                        <button
                          key={option.score}
                          onClick={() => handleSelect(option.score)}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            weights[currentFactor.name][currentQuestionIndex] === option.score
                              ? "bg-mainblue text-white"
                              : "bg-white border border-gray-300 hover:border-mainblue hover:bg-creame/50"
                          }`}
                        >
                          <span>{option.label}</span>
                          {weights[currentFactor.name][currentQuestionIndex] === option.score && (
                            <Check className="w-5 h-5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 px-4 py-2 text-mainblue hover:bg-creame/70 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      ย้อนกลับ
                    </button>
                    <div className="text-sm text-gray-500">
                      คำถามที่ {currentStepNumber} จาก {totalQuestions}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Seats Selection Step */}
            {step === "seats" && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                key="seats"
                className="bg-white rounded-xl shadow-lg p-6 md:p-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-creame p-2 rounded-full">
                      <Users className="w-6 h-6 text-mainblue" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-mainblue">เลือกจำนวนที่นั่ง</h2>
                      <p className="text-sm text-gray-500">จำนวนที่นั่งมีผลต่อขนาดและประเภทของรถยนต์ไฟฟ้า</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seatOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setNumSeats(option.value)}
                        className={`flex flex-col items-center p-6 rounded-lg border-2 transition-all relative ${
                          numSeats === option.value
                            ? "border-mainblue bg-creame/50"
                            : "border-gray-200 hover:border-mainblue/70"
                        }`}
                      >
                        <div className="flex items-center justify-center bg-creame p-3 rounded-full w-16 h-16 mb-3">
                          <Users className="w-8 h-8 text-mainblue" />
                        </div>
                        <h3 className="text-lg font-medium">{option.label}</h3>
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>

                        {numSeats === option.value && (
                          <div className="absolute top-3 right-3 bg-mainblue text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 px-4 py-2 text-mainblue hover:bg-creame/70 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      ย้อนกลับ
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={numSeats === null}
                      className={`flex items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                        numSeats === null
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-mainblue text-white hover:bg-mainblue/80"
                      }`}
                    >
                      ถัดไป
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Drive Type Selection Step */}
            {step === "drive" && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                key="drive"
                className="bg-white rounded-xl shadow-lg p-6 md:p-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-creame p-2 rounded-full">
                      <Car className="w-6 h-6 text-mainblue" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-mainblue">เลือกระบบขับเคลื่อน</h2>
                      <p className="text-sm text-gray-500">ระบบขับเคลื่อนมีผลต่อสมรรถนะและความรู้สึกในการขับขี่</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {driveTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setDriveType(type.id)}
                        className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                          driveType === type.id
                            ? "border-mainblue bg-creame/50"
                            : "border-gray-200 hover:border-mainblue/70"
                        }`}
                      >
                        <div className="flex items-center justify-center bg-creame p-3 rounded-full w-12 h-12 mr-4">
                          {type.icon}
                        </div>

                        <div className="text-left">
                          <h3 className="text-lg font-medium">{type.label}</h3>
                          <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                        </div>

                        {driveType === type.id && (
                          <div className="ml-auto bg-mainblue text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 px-4 py-2 text-mainblue hover:bg-creame/70 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      ย้อนกลับ
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={driveType === null}
                      className={`flex items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                        driveType === null
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-mainblue text-white hover:bg-mainblue/80"
                      }`}
                    >
                      ถัดไป
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Summary Step */}
            {step === "summary" && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                key="summary"
                className="bg-white rounded-xl shadow-lg p-6 md:p-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-creame p-2 rounded-full">
                      <Check className="w-6 h-6 text-mainblue" />
                    </div>
                    <h2 className="text-xl font-semibold text-mainblue">สรุปข้อมูลของคุณ</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-creame/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <User className="w-5 h-5 mr-2 text-mainblue" />
                        ข้อมูลส่วนตัว
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          เพศ: {userProfile.gender === "male" ? "ชาย" : userProfile.gender === "female" ? "หญิง" : "อื่นๆ"}
                        </div>
                        <div>อายุ: {userProfile.age_range}</div>
                        <div>
                          อาชีพ:{" "}
                          {userProfile.occupation === "student"
                            ? "นักเรียน/นักศึกษา"
                            : userProfile.occupation === "employed"
                              ? "พนักงาน/ลูกจ้าง"
                              : userProfile.occupation === "self-employed"
                                ? "ธุรกิจส่วนตัว"
                                : userProfile.occupation === "unemployed"
                                  ? "ว่างงาน"
                                  : "เกษียณ"}
                        </div>
                        <div>
                          สถานภาพ:{" "}
                          {userProfile.marital_status === "single"
                            ? "โสด"
                            : userProfile.marital_status === "married"
                              ? "แต่งงาน"
                              : userProfile.marital_status === "divorced"
                                ? "หย่าร้าง"
                                : "หม้าย"}
                        </div>
                        <div>ครอบครัว: {userProfile.family_status === "no_children" ? "ไม่มีบุตร" : "มีบุตร"}</div>
                        <div>
                          รายได้:{" "}
                          {userProfile.income_range === "low"
                            ? "ต่ำกว่า 15,000 บาท"
                            : userProfile.income_range === "medium"
                              ? "15,000 - 30,000 บาท"
                              : userProfile.income_range === "high"
                                ? "30,001 - 50,000 บาท"
                                : "50,000 บาทขึ้นไป"}
                        </div>
                        <div>
                          สถานะการครอบครองรถยนต์:{" "}
                          {userProfile.vehicle_status === "don't_have" ? "ไม่มีรถยนต์ไว้ในครอบครอง" : "มีรถยนต์ไว้ในครอบครอง"}
                        </div>
                      </div>
                    </div>

                    <div className="bg-creame/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-mainblue" />
                        ความชอบและไลฟ์สไตล์
                      </h3>
                      <p className="text-sm text-gray-600">
                        คุณได้ตอบคำถามทั้งหมด {totalQuestions} ข้อเกี่ยวกับความชอบและไลฟ์สไตล์การใช้รถยนต์ไฟฟ้า
                      </p>
                    </div>

                    <div className="bg-creame/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-mainblue" />
                        จำนวนที่นั่ง
                      </h3>
                      <p className="text-sm text-gray-600">
                        {numSeats === 2 && "รถสปอร์ต 2 ที่นั่ง"}
                        {numSeats === 4 && "รถยนต์ขนาดเล็ก-กลาง 4 ที่นั่ง"}
                        {numSeats === 5 && "รถยนต์ขนาดกลาง-ใหญ่ 5 ที่นั่ง"}
                        {numSeats === 7 && "รถอเนกประสงค์ครอบครัว 7 ที่นั่ง"}
                      </p>
                    </div>

                    <div className="bg-creame/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Car className="w-5 h-5 mr-2 text-mainblue" />
                        ระบบขับเคลื่อน
                      </h3>
                      <p className="text-sm text-gray-600">
                        {driveType === "ระบบขับเคลื่อนล้อหน้า" && "ขับเคลื่อนล้อหน้า - เหมาะสำหรับการขับขี่ในเมืองและประหยัดพลังงาน"}
                        {driveType === "ระบบขับเคลื่อนล้อหลัง" && "ขับเคลื่อนล้อหลัง - ให้ความรู้สึกสปอร์ตและการทรงตัวที่ดี"}
                        {driveType === "ระบบขับเคลื่อนสี่ล้อแบบอัตโนมัติ" && "ขับเคลื่อน 4 ล้อ - เหมาะกับทุกสภาพถนนและให้ความมั่นใจสูงสุด"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 px-4 py-2 text-mainblue hover:bg-creame/70 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      ย้อนกลับ
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={!isFormComplete || isSubmitting}
                      className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-colors ${
                        !isFormComplete || isSubmitting
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-mainblue text-white hover:bg-mainblue/80"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          กำลังประมวลผล...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5" />
                          ดูผลการวิเคราะห์
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

