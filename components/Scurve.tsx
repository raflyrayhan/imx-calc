"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Scurve({
  labels,
  pv,
  ev,
  dev
}: {
  labels: string[];
  pv: number[];
  ev: number[];
  dev: number[];
}) {
  const data = {
    labels,
    datasets: [
      {
        label: "Planned (PV)",
        data: pv,
        borderColor: "#1E40AF",
        backgroundColor: "#1E40AF",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Actual (EV)",
        data: ev,
        borderColor: "#16A34A",
        backgroundColor: "#16A34A",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Deviation",
        data: dev,
        borderColor: "#DC2626",
        backgroundColor: "#DC2626",
        borderDash: [5, 5],
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#000", 
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#000" },
      },
      y: {
        ticks: { color: "#000" },
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return <Line data={data} options={options} />;
}
