"use client";

import { useState, useEffect } from "react";
import TestChart from "../components/dashboard/TestChart";

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard Político</h1>
        <p className="text-gray-600">Panel de inteligencia de negocio</p>
      </header>

      {/* Test Chart to verify Recharts is working */}
      <div className="mb-8">
        <TestChart />
      </div>
    </div>
  );
}
