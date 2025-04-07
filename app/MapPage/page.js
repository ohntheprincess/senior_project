"use client";
import NavBar from "../nav/page";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
  MarkerClusterer,
} from "@react-google-maps/api";
import {
  Filter,
  MapPin,
  Battery,
  Zap,
  ChevronDown,
  X,
  Clock,
  DollarSign,
  Info,
} from "lucide-react";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 13.7367,
  lng: 100.5231,
};

const customIcon = {
  url: "/charging-station_green.png",
  scaledSize: { width: 32, height: 32 },
};

const clusterOptions = {
  imagePath:
    "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
  gridSize: 50,
  minimumClusterSize: 3,
  maxZoom: 15,
};

export default function MapPage() {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [connectionType, setConnectionType] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubdistrict, setSelectedSubdistrict] = useState("");
  const [selectedPowers, setSelectedPowers] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mapRef, setMapRef] = useState(null);
  const [powerCosts, setPowerCosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistributor, setSelectedDistributor] = useState("");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  // ดึงข้อมูลสถานีชาร์จ
  const fetchStations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/charging-stations");
      if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลสถานีชาร์จได้");
      const data = await response.json();

      const formattedData = data.map((station) => ({
        ...station,
        displayName: station.Name,
        location: { lat: station.Latitude, lng: station.Longitude },
        connectionTypes: [
          ...(station.acType2 > 0
            ? [{ type: "AC Type 2", count: station.acType2 }]
            : []),
          ...(station.CCS2 > 0 ? [{ type: "CCS2", count: station.CCS2 }] : []),
          ...(station.CHAdeMO > 0
            ? [{ type: "CHAdeMO", count: station.CHAdeMO }]
            : []),
        ],
        powers: [
          ...(station.power25 > 0
            ? [{ power: 25, count: station.power25 }]
            : []),
          ...(station.power50 > 0
            ? [{ power: 50, count: station.power50 }]
            : []),
          ...(station.power120 > 0
            ? [{ power: 120, count: station.power120 }]
            : []),
          ...(station.power300 > 0
            ? [{ power: 300, count: station.power300 }]
            : []),
          ...(station.power360 > 0
            ? [{ power: 360, count: station.power360 }]
            : []),
        ],
      }));

      setStations(formattedData);
      setFilteredStations(formattedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching stations data:", error);
      setError("ไม่สามารถดึงข้อมูลสถานีชาร์จได้");
      setIsLoading(false);
    }
  }, []);

  // ดึงข้อมูลค่าไฟฟ้า
  const fetchPowerCosts = useCallback(async () => {
    try {
      const response = await fetch("/api/powerCost");
      if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลค่าไฟฟ้าได้");
      const data = await response.json();
      setPowerCosts(data);
    } catch (error) {
      console.error("Error fetching power cost data:", error);
      setError("ไม่สามารถดึงข้อมูลค่าไฟฟ้าได้");
    }
  }, []);

  // คำนวณตัวเลือกสำหรับ dropdown
  const provinces = useMemo(
    () => [...new Set(stations.map((s) => s.Province))].sort(),
    [stations]
  );

  const districts = useMemo(
    () =>
      selectedProvince
        ? [
            ...new Set(
              stations
                .filter((s) => s.Province === selectedProvince)
                .map((s) => s.District)
            ),
          ].sort()
        : [],
    [selectedProvince, stations]
  );

  const subdistricts = useMemo(
    () =>
      selectedProvince && selectedDistrict
        ? [
            ...new Set(
              stations
                .filter(
                  (s) =>
                    s.Province === selectedProvince &&
                    s.District === selectedDistrict
                )
                .map((s) => s.Subdistrict)
            ),
          ].sort()
        : [],
    [selectedProvince, selectedDistrict, stations]
  );

  const allConnectionTypes = useMemo(
    () => [
      ...new Set(
        stations.flatMap((s) => s.connectionTypes.map((ct) => ct.type))
      ),
    ],
    [stations]
  );

  const distributors = useMemo(
    () =>
      [...new Set(stations.map((s) => s.Distributor))].filter(Boolean).sort(),
    [stations]
  );

  // ระบบกรองข้อมูล
  useEffect(() => {
    let filtered = stations;

    if (connectionType) {
      filtered = filtered.filter((s) =>
        s.connectionTypes.some((ct) => ct.type === connectionType)
      );
    }

    if (selectedProvince) {
      filtered = filtered.filter((s) => s.Province === selectedProvince);
    }

    if (selectedDistrict) {
      filtered = filtered.filter((s) => s.District === selectedDistrict);
    }

    if (selectedSubdistrict) {
      filtered = filtered.filter((s) => s.Subdistrict === selectedSubdistrict);
    }

    if (selectedPowers.length > 0) {
      filtered = filtered.filter((s) =>
        selectedPowers.some((power) => {
          const powerValue = Number.parseInt(power.replace("kW", ""));
          return s[`power${powerValue}`] > 0;
        })
      );
    }

    if (selectedDistributor) {
      filtered = filtered.filter((s) => s.Distributor === selectedDistributor);
    }

    setFilteredStations(filtered);

    // If we have filtered results and a map reference, fit bounds to show all markers
    if (filtered.length > 0 && filtered.length < stations.length && mapRef) {
      const bounds = new window.google.maps.LatLngBounds();
      filtered.forEach((station) => {
        bounds.extend(station.location);
      });
      mapRef.fitBounds(bounds);
    }
  }, [
    connectionType,
    selectedProvince,
    selectedDistrict,
    selectedSubdistrict,
    selectedPowers,
    selectedDistributor,
    stations,
    mapRef,
  ]);

  useEffect(() => {
    fetchStations();
    fetchPowerCosts();
  }, [fetchStations, fetchPowerCosts]);

  const onMapLoad = useCallback((map) => {
    setMapRef(map);
  }, []);

  const resetFilters = useCallback(() => {
    setConnectionType("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedSubdistrict("");
    setSelectedPowers([]);
    setSelectedDistributor("");
  }, []);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // ฟังก์ชันหาค่าไฟฟ้าตามกำลังไฟและผู้ให้บริการ
  const getPowerCostByPowerAndDistributor = (power, distributor) => {
    if (!powerCosts || powerCosts.length === 0) return null;

    // หาค่าไฟฟ้าที่ตรงกับกำลังไฟและผู้ให้บริการที่ระบุ
    return powerCosts.find((cost) => {
      const powerValue = Number.parseInt(cost.Power);
      return powerValue === power && cost.Distributor === distributor;
    });
  };

  // ฟังก์ชันแสดงข้อมูลค่าไฟฟ้าของสถานี
  const renderPowerCostInfo = (station) => {
    if (
      !station ||
      !station.powers ||
      station.powers.length === 0 ||
      !powerCosts ||
      powerCosts.length === 0
    ) {
      return (
        <p className="text-gray-500 text-sm italic">ไม่มีข้อมูลค่าไฟฟ้า</p>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>กำลังไฟ</span>
          <span>Peak (บาท/หน่วย)</span>
          <span>Off-Peak (บาท/หน่วย)</span>
        </div>
        {station.powers.map((powerInfo, index) => {
          const powerCost = getPowerCostByPowerAndDistributor(
            powerInfo.power,
            station.Distributor
          );
          if (!powerCost) return null;

          return (
            <div
              key={index}
              className="flex justify-between text-sm border-b border-gray-100 pb-1"
            >
              <span className="font-medium">{powerInfo.power} kW</span>
              <span className="text-red-600">
                {powerCost.Peak_Rates__including_VAT___baht_unit_}
              </span>
              <span className="text-green-600">
                {powerCost.Off_Peak_Rates__including_VAT___baht_unit_}
              </span>
            </div>
          );
        })}
        <div className="text-xs text-gray-500 flex items-center mt-1">
          <Info size={12} className="mr-1" />
          <span>Peak: 09.00-22.00 น. | Off-Peak: 22.00-09.00 น.</span>
        </div>
      </div>
    );
  };

  if (!isLoaded) {
    return <LoadingScreen message="กำลังโหลดแผนที่..." />;
  }

  if (isLoading) {
    return <LoadingScreen message="กำลังโหลดข้อมูลสถานีชาร์จ..." />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen mt-20">
      <NavBar />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            <Zap className="inline-block mr-2 text-green-500" size={28} />
            จุดชาร์จรถยนต์ไฟฟ้า
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFilter}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              <span>ตัวกรอง</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {(connectionType ||
              selectedProvince ||
              selectedPowers.length > 0 ||
              selectedDistributor) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
              >
                <X size={16} />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จังหวัด
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedDistrict("");
                    setSelectedSubdistrict("");
                  }}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">ทั้งหมด</option>
                  {provinces.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อำเภอ
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedSubdistrict("");
                  }}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={!selectedProvince}
                >
                  <option value="">ทั้งหมด</option>
                  {districts.map((d, i) => (
                    <option key={i} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ตำบล
                </label>
                <select
                  value={selectedSubdistrict}
                  onChange={(e) => setSelectedSubdistrict(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={!selectedDistrict}
                >
                  <option value="">ทั้งหมด</option>
                  {subdistricts.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภทชาร์จ
                </label>
                <select
                  value={connectionType}
                  onChange={(e) => setConnectionType(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">ทั้งหมด</option>
                  {allConnectionTypes.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ผู้ให้บริการ
                </label>
                <select
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">ทั้งหมด</option>
                  {distributors.map((d, i) => (
                    <option key={i} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Battery className="inline-block mr-1" size={16} /> กำลังไฟ
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {["25kW", "50kW", "120kW", "300kW", "360kW"].map((power) => (
                  <label
                    key={power}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={power}
                      checked={selectedPowers.includes(power)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPowers([...selectedPowers, power]);
                        } else {
                          setSelectedPowers(
                            selectedPowers.filter((p) => p !== power)
                          );
                        }
                      }}
                      className="form-checkbox h-4 w-4 text-green-600 rounded"
                    />
                    <span className="text-sm">{power}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <MapPin className="inline-block mr-1" size={16} />
            พบ{" "}
            <span className="font-semibold text-green-600">
              {filteredStations.length}
            </span>{" "}
            จุดชาร์จ
            {filteredStations.length !== stations.length && (
              <span> จากทั้งหมด {stations.length} จุด</span>
            )}
          </div>

          {filteredStations.length > 0 && (
            <div className="text-xs text-gray-500">
              คลิกที่หมุดเพื่อดูรายละเอียด
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="w-full h-[600px] md:h-[700px] rounded-xl shadow-md overflow-hidden bg-white">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={5}
            center={center}
            onLoad={onMapLoad}
            options={{
              mapTypeControl: false,
              fullscreenControl: true,
              streetViewControl: false,
              zoomControlOptions: {
                position: 7, // RIGHT_CENTER
              },
              // Add these performance optimizations
              maxZoom: 18,
              minZoom: 5,
              gestureHandling: "greedy",
              clickableIcons: false, // Disable clickable POIs for better performance
              disableDefaultUI: false,
              // Optimize rendering
              tilt: 0,
            }}
          >
            <MarkerClusterer
              options={{
                ...clusterOptions,
                minimumClusterSize: filteredStations.length > 500 ? 5 : 3, // Increase cluster size for large datasets
                maxZoom: filteredStations.length > 1000 ? 12 : 15, // Reduce max zoom for very large datasets
              }}
            >
              {(clusterer) => (
                <>
                  {/* Only render markers that are in the current viewport for better performance */}
                  {filteredStations.slice(0, 1000).map((station, index) => (
                    <Marker
                      key={index}
                      position={station.location}
                      title={station.displayName}
                      icon={customIcon}
                      onClick={() => setSelectedStation(station)}
                      clusterer={clusterer}
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>

            {selectedStation && (
              <InfoWindow
                position={selectedStation.location}
                onCloseClick={() => setSelectedStation(null)}
              >
                <div className="p-2 min-w-[320px] max-w-[400px]">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedStation.logo_url ? (
                      <div className="w-10 h-10 relative flex-shrink-0">
                        {/* Using regular img tag instead of Next.js Image component */}
                        <img
                          src={selectedStation.logo_url || "/placeholder.svg"}
                          alt={selectedStation.Distributor || "Logo"}
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap size={20} className="text-green-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-green-700">
                        {selectedStation.displayName}
                      </h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                        {selectedStation.Distributor || "ไม่ระบุผู้ให้บริการ"}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm">
                    {selectedStation.Address}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {selectedStation.Subdistrict}, {selectedStation.District},{" "}
                    {selectedStation.Province}
                  </p>

                  <div className="my-3 border-t border-gray-100 pt-3"></div>

                  <div>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs mb-2 inline-block">
                      ประเภทการชาร์จ
                    </span>
                    <p className="text-gray-700">
                      {selectedStation.connectionTypes
                        .map((ct) => `${ct.type} (${ct.count})`)
                        .join(", ") || "-"}
                    </p>
                  </div>

                  <div className="mt-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs mb-2 inline-block">
                      กำลังการชาร์จ
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: "25kW", value: selectedStation.power25 },
                        { label: "50kW", value: selectedStation.power50 },
                        { label: "120kW", value: selectedStation.power120 },
                        { label: "300kW", value: selectedStation.power300 },
                        { label: "360kW", value: selectedStation.power360 },
                      ]
                        .filter((power) => power.value > 0)
                        .map((power, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {power.label} × {power.value}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* ส่วนแสดงค่าไฟฟ้า */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 mb-2">
                      <DollarSign size={14} className="text-green-600" />
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                        อัตราค่าไฟฟ้า
                      </span>
                      <Clock size={14} className="ml-1 text-blue-600" />
                    </div>
                    {renderPowerCostInfo(selectedStation)}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <a
                      href={`https://www.google.com/maps?q=${selectedStation.Latitude},${selectedStation.Longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                    >
                      <MapPin size={14} className="inline-block mr-1" />
                      นำทางด้วย Google Maps
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ message }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

function ErrorScreen({ error }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
        <div className="text-red-500 mb-4">
          <X size={48} className="mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
}
