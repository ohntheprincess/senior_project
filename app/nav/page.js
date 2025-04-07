import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const [page, setPage] = useState("homepage");
  const router = useRouter();
  const clickCarData = () => {
    router.push("/");
    setTimeout(() => {
      document
        .getElementById("section-cardata")
        .scrollIntoView({ behavior: "smooth" });
    }, 500);
  };
  const clickCompare = () => {
    router.push("/");
    setTimeout(() => {
      document
        .getElementById("section-compare")
        .scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  const clickCalculate = () => {
    router.push("/calculate_page");
  };
  const clickForm = () => {
    router.push("/formPage");
  };

  const clickMapPage = () => {
    router.push("/MapPage");
  };
  const clickDashboard = () => {
    router.push("/");
    setTimeout(() => {
      document
        .getElementById("section-dashboard")
        .scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  const backToHome = () => {
    router.push("/");
  };
  const clickCarCompare = () => {
    document
      .getElementById("section-compare")
      .scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="flex justify-center items-center fixed top-0 left-0 w-full z-20">
      <nav className="bg-black rounded-xl p-4 mt-2 mx-4 text-gray-400 font-prompt antialiased w-4/5">
        <ul className="flex justify-between w-full">
          <li className="mx-4 text-mainblue">
            <button onClick={() => backToHome()}>หน้าแรก</button>
          </li>
          <li className="mx-4">
            <button onClick={()=>clickDashboard()}>แดชบอร์ด</button>
          </li>
          <li className="mx-4">
            <button onClick={clickCarData}>ข้อมูลรถยนต์ไฟฟ้า</button>
          </li>
          <li className="mx-4">
            <button onClick={()=>clickCompare()}>
              เปรียบเทียบข้อมูลรถยนต์ไฟฟ้า
            </button>
          </li>
          <li className="mx-4">
            <button onClick={()=>clickMapPage()}>แผนที่แสดงจุดชาร์จ</button>
          </li>
          <li className="mx-4">
            <button onClick={() => clickCalculate()}>สูตรคำนวณ</button>
          </li>
          <li className="mx-4">
            <button onClick={() => clickForm()}>แบบทดสอบ</button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
