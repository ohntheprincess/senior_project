import { useState } from "react";

export default function Footer() {
  const [isModalOpen, setIModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    to: "saowalak.pri@kkumail.com,seubsak.s@kkumail.com",
    subject: "",
    text: "",
  });
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setEmailData({ ...emailData, subject: e.target.value });
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setEmailData({ ...emailData, text: e.target.value });
  };

  const handleChecked = () => {
    setIModalOpen(true);
  };

  const closeModal = () => {
    setIModalOpen(false);
    setMessage("");
    setSubject("");
  };

  const sendEmail = async () => {
    if (!subject || !message) {
      setMessage("กรุณากรอกชื่อเรื่องและคำแนะนำก่อนส่ง");
      return;
    }
    try {
      const response = await fetch("/api/sendRecommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (!result) {
        throw new Error("No data received from server");
      }

      setMessage(result.message);
      setIModalOpen(false);
    } catch (error) {
      console.error("Error occurred while sending email:", error);
      setMessage("เกิดข้อผิดพลาดในการส่งอีเมล");
    }
    closeModal();
  };

  return (
    <footer className="bg-mainblue text-white py-6 font-prompt">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Logo & About */}
          <div>
            <h2 className="text-lg md:text-2xl font-bold">Decision Support</h2>
            <p className="mt-1 text-blue4 text-sm md:text-base">
              ระบบสนับสนุนการตัดสินใจในการซื้อรถยนต์ไฟฟ้า
            </p>
          </div>

          {/* Navigation (2 แถว) */}
          <div>
            <h3 className="text-lg font-semibold">เมนู</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1 text-blue3 text-sm">
              {[
                "หน้าแรก",
                "ข้อมูลรถยนต์ไฟฟ้า",
                "เปรียบเทียบข้อมูล",
                "แผนที่จุดชาร์จ",
                "แบบทดสอบ",
                "ติดต่อเรา",
              ].map((item, index) => (
                <a key={index} href="#" className="hover:text-white transition">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Contact & Social Media */}
          <div>
            <h3 className="text-lg font-semibold">ติดต่อเรา</h3>
            <p className="mt-1 text-blue3 text-sm">
              อีเมล: {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
            </p>
            <button
              className="text-base bg-white text-mainblue rounded p-2 px-3 shadow-md mt-2"
              onClick={handleChecked}
            >
              ติดต่อเรา
            </button>
            <div className="flex space-x-3 mt-2">
              <a href="#" className="text-blue3 hover:text-white transition">
                <i className="fab fa-facebook fa-sm"></i>
              </a>
              <a href="#" className="text-blue3 hover:text-white transition">
                <i className="fab fa-twitter fa-sm"></i>
              </a>
              <a href="#" className="text-blue3 hover:text-white transition">
                <i className="fab fa-instagram fa-sm"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-blue2 mt-3 pt-2 text-center text-blue3 text-xs">
          &copy; {new Date().getFullYear()} OhnPriab&PrabPluem. สงวนลิขสิทธิ์.
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-2/5 h-1.2 p-6 rounded-lg shadow-lg">
            <p className="text-mainblue text-2xl font-semibold text-center">
            ติดต่อเรา
            </p>
            <label className="block mt-4 text-gray-700">ชื่อเรื่อง</label>
            <input
              type="text"
              value={subject}
              placeholder="กรอกหัวข้อที่นี่"
              onChange={handleSubjectChange}
              className="w-full p-2 mt-2 border border-gray-300 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainblue"
            />
            <label className="block mt-4 text-gray-700">คำแนะนำ</label>
            <textarea
              rows="4"
              className="w-full p-2 mt-2 border border-gray-300 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainblue resize-none"
              placeholder=""
              value={message}
              onChange={handleMessageChange}
            ></textarea>
            <div className="flex flex-col justify-center items-center">
              <button
                onClick={sendEmail}
                className="mt-4 mx-4 bg-mainblue w-1/4 text-white px-4 py-2 rounded"
              >
                ส่ง
              </button>
              <button
                onClick={closeModal}
                className="mt- bg-mainred w-1/4 text-white px-4 py-2 rounded my-2"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
