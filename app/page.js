"use client";
import Evcardata from "./evcardata/page";
import Compare from "./compare_page/page";
import { useState } from "react";
import CalculatePage from "./calculate_page/page";
import NavBar from "./nav/page";
import HomePage from "./homepage/page";
import Footer from "./footer/page";
import MapPage from "./MapPage/page";
import Dashboard from "./dashboardPage/page";

import { useRouter } from "next/navigation";

export default function Home() {

  return (
    <div className="bg-white h-screen">
      <NavBar />


         <HomePage />
         <Dashboard />
          <Evcardata />
          <Compare />
     
     <Footer/>
    </div>
  );
}
