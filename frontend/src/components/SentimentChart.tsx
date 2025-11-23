// frontend/src/components/SentimentChart.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  category?: string;
  refreshKey?: number;
  days?: number; // how many days to show (default 7)
}

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SentimentChart: React.FC<Props> = ({ category = "", refreshKey = 0, days = 7 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawList, setRawList] = useState<any[]>([]);

  // labels: last `days` days as weekday short names (Mon, Tue, ...)
  const labels = useMemo(() => {
    const out: string[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push(d.toLocaleDateString(undefined, { weekday: "short" })); // Mon, Tue...
    }
    return out;
  }, [days]);

  function toISODate(value: any): string | null {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    // convert to local date-only string so it maps to labels created above
    return d.toDateString();
  }

  // create mapping from date-string -> index to bucket by day
  const labelDateKeys = useMemo(() => {
    const today = new Date();
    const out: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push(d.toDateString());
    }
    const map = new Map<string, number>();
    out.forEach((k, i) => map.set(k, i));
    return map;
  }, [days]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const u = `${apiBase}/api/feedback?category=${encodeURIComponent(category || "")}`;
        const res = await fetch(u);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();
        if (!mounted) return;
        setRawList(Array.isArray(list) ? list : []);
      } catch (err: any) {
        if (!mounted) return;
        setRawList([]);
        setError(String(err?.message || err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [apiBase, category, refreshKey, days]);

  // bucket counts per day then compute daily percentages
  const { posPct, neuPct, negPct, totalCount } = useMemo(() => {
    const pos = new Array(labels.length).fill(0);
    const neu = new Array(labels.length).fill(0);
    const neg = new Array(labels.length).fill(0);

    const tsFields = ["timestamp", "created_at", "createdAt", "date", "time"];

    rawList.forEach((item) => {
      // determine sentiment
      const sRaw = ((item.sentiment || item.sent || item.label) || "").toString().toLowerCase();
      let sentiment: "positive" | "neutral" | "negative" = "neutral";
      if (sRaw.includes("pos")) sentiment = "positive";
      else if (sRaw.includes("neg")) sentiment = "negative";
      else if (sRaw.includes("neu")) sentiment = "neutral";

      // find timestamp-ish value
      let ts: any = null;
      for (const f of tsFields) {
        if (item[f]) {
          ts = item[f];
          break;
        }
      }
      if (!ts && typeof item === "object") {
        for (const k of Object.keys(item)) {
          const v = item[k];
          if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
            ts = v;
            break;
          }
        }
      }
      const key = toISODate(ts) || toISODate(item.date) || toISODate(item.createdAt) || null;
      if (!key) return;
      const idx = labelDateKeys.get(key);
      if (idx == null) return; // outside range
      if (sentiment === "positive") pos[idx] += 1;
      else if (sentiment === "neutral") neu[idx] += 1;
      else neg[idx] += 1;
    });

    const totalCount = pos.reduce((a, b) => a + b, 0) + neu.reduce((a, b) => a + b, 0) + neg.reduce((a, b) => a + b, 0);

    // compute percentages per day (0..100)
    const posPct = pos.map((v, i) => {
      const dayTotal = v + neu[i] + neg[i];
      return dayTotal === 0 ? 0 : +( (v / dayTotal) * 100 ).toFixed(1);
    });
    const neuPct = neu.map((v, i) => {
      const dayTotal = pos[i] + v + neg[i];
      return dayTotal === 0 ? 0 : +( (v / dayTotal) * 100 ).toFixed(1);
    });
    const negPct = neg.map((v, i) => {
      const dayTotal = pos[i] + neu[i] + v;
      return dayTotal === 0 ? 0 : +( (v / dayTotal) * 100 ).toFixed(1);
    });

    return { posPct, neuPct, negPct, totalCount };
  }, [rawList, labels, labelDateKeys]);

  const data = {
    labels,
    datasets: [
      {
        label: "Positive",
        data: posPct,
        fill: false,
        borderColor: "rgba(34,197,94,1)",
        backgroundColor: "rgba(34,197,94,1)",
        tension: 0.3,
        pointRadius: 4,
        borderWidth: 3,
      },
      {
        label: "Neutral",
        data: neuPct,
        fill: false,
        borderColor: "rgba(234,179,8,1)",
        backgroundColor: "rgba(234,179,8,1)",
        tension: 0.3,
        pointRadius: 4,
        borderWidth: 3,
      },
      {
        label: "Negative",
        data: negPct,
        fill: false,
        borderColor: "rgba(239,68,68,1)",
        backgroundColor: "rgba(239,68,68,1)",
        tension: 0.3,
        pointRadius: 4,
        borderWidth: 3,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.dataset.label || "";
            const v = ctx.parsed.y ?? ctx.parsed;
            return `${label}: ${v}%`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { maxRotation: 0, autoSkip: false },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 25, callback: (v: any) => `${v}%` },
        grid: { drawBorder: false },
      },
    },
  };

  return (
    <div className="h-[340px]">
      {loading && <div className="text-sm text-muted-foreground mb-2">Loading chart…</div>}
      {error && <div className="text-sm text-red-600 mb-2">Chart error: {error}</div>}
      {!loading && !error && totalCount === 0 && <div className="text-sm text-muted-foreground mb-2">No feedback yet to plot.</div>}
      <div className="h-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SentimentChart;
