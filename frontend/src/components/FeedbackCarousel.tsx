import React, { useState, useEffect } from "react";

interface Feedback {
  id: string | number;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  timestamp?: string;
}

interface FeedbackCarouselProps {
  feedbacks: Feedback[];
  intervalMs?: number; // auto-advance interval in milliseconds (default 1500)
}

const FeedbackCarousel = ({ feedbacks, intervalMs = 1500 }: FeedbackCarouselProps) => {
  const [index, setIndex] = useState(0);
  const items =
    feedbacks && feedbacks.length
      ? feedbacks
      : [{ id: 0, text: "No feedback yet", sentiment: "neutral", timestamp: "" }];

  // auto-advance every intervalMs (default 1.5s)
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  // keep index in-range if items change
  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  const cur = items[index];

  const formattedDate = cur.timestamp
    ? new Date(cur.timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) // e.g. 29 Oct 2025
    : "";

  return (
    <div className="w-full">
      {/* relative + extra bottom padding so bottom-positioned arrows don't cover content */}
      <div className="bg-white rounded-xl p-4 pb-12 shadow-sm relative overflow-hidden">
        <div className="flex items-start justify-between mb-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              cur.sentiment === "positive"
                ? "bg-green-100 text-green-700"
                : cur.sentiment === "negative"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {cur.sentiment.charAt(0).toUpperCase() + cur.sentiment.slice(1)}
          </span>
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </div>

        <div className="text-sm md:text-base text-gray-800 min-h-[72px]">{cur.text}</div>

        {/* arrows positioned at bottom corners, closer to edges */}
        <button
          onClick={prev}
          aria-label="Previous feedback"
          className="absolute left-3 bottom-3 p-2 rounded-full bg-white/95 hover:bg-white shadow-sm border border-gray-100 z-20"
        >
          ‹
        </button>

        <button
          onClick={next}
          aria-label="Next feedback"
          className="absolute right-3 bottom-3 p-2 rounded-full bg-white/95 hover:bg-white shadow-sm border border-gray-100 z-20"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default FeedbackCarousel;
