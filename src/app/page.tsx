"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import GlobalForecast from "./components/mainPage/GlobalForecast";
import GaugeIcon from "../assets/gauge-icon.png";
import HistoryGraph from "./components/mainPage/HistoryGraph";
import HistoryGraphLegend from "./components/mainPage/HistoryGraphLegend";
import { KpPoint } from "./types/forecast";
export default function Home() {
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [kpHistory, setKpHistory] = useState<KpPoint[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude);
        setLon(longitude);
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const geoData = await geoRes.json();
          const cityName =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.county ||
            "Unknown";
          setCity(cityName);
          setReady(true);
          const kpHistoryRes = await fetch("/api/kp-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const kpHistoryData = await kpHistoryRes.json();
          setKpHistory(kpHistoryData.data);
        } catch (err) {
          console.error(err);
          setError("Failed to load data");
        }
      },
      () => {
        setError("Unable to retrieve location");
      },
    );
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center text-white px-4">
      <GlobalForecast lat={lat} lon={lon} city={city} />
      {ready ? (
        <div className="flex items-start mt-2 space-x-2 mt-4 max-w-xl">
          <Image
            className="-mt-2"
            src={GaugeIcon}
            width={30}
            height={30}
            alt="Gauge Icon"
          />
          <div className="flex flex-col">
            <p className="text-xs">
              The Kp index is a simple measure of geomagnetic activity, ranging
              from 0 (calm) to 9 (very disturbed).
            </p>
            <p className="text-xs mt-1">
              We combine it with various NOAA data and weather forecasts to let
              our AI calculate the probability of seeing an aurora.
            </p>
            <p className="text-xs mt-1">
              Note: Aurora forecasts are only estimates. Nature is
              unpredictable, and real conditions may vary. Even if nothing is
              visible, try a long-exposure photo, your camera may capture what
              the eye can’t.
            </p>
          </div>
        </div>
      ) : null}
      <div className="mt-8">
        <h3 className="text-lg font-bold">Kp Index History</h3>
      </div>
      <HistoryGraph data={kpHistory} />
      <div className="mt-2">
        <h5 className="text-ms">History from the last 30 days</h5>
      </div>
      <HistoryGraphLegend />
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
