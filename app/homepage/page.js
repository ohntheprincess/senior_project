export default function HomePage() {
  return (
    <div className="grid grid-cols-2 font-prompt flex text-gray-400 w-full">
      <div className="bg-white flex flex-col p-8 justify-center items-center h-screen">
        <h1 className="text-2xl font-bold mb-4 text-black text-center">
          เลือกรถยนต์ไฟฟ้าที่เหมาะสมกับคุณ
        </h1>
        <p className="text-lg text-gray-600 mx-7 text-center">
          หากคุณกำลังมองหารถยนต์ไฟฟ้าแต่ยังไม่แน่ใจว่าจะเลือกรุ่นไหน
          <br />
          ที่จะสามารถตอบโจทย์ความต้องการของคุณที่สุด
          ลองใช้เครื่องมือช่วยเลือกของเรา!
        </p>
        <a href="/formPage">
        <button className="border-2 p-3 mt-12 bg-white rounded-lg w-fit text-sm text-mainblue shadow-lg flex items-center space-x-2">
          <span>ทำแบบทดสอบเลย</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </button></a>
      </div>
      <div>
        <img src="/evcar.jpg" className="h-full"></img>
      </div>
    </div>
  );
}
