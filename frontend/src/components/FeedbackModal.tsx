import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeedbackCarousel from "./FeedbackCarousel";
import SentimentChart from "./SentimentChart";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FeedbackItem {
  id: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  category?: string;
  timestamp?: string;
}

interface FeedbackModalProps {
  category: string;
  categoryName: string;
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSubmitted?: () => void; // <--- new optional callback
  refreshKey?: number; // <--- new optional refreshKey passed from parent
}

const FeedbackModal = ({
  category,
  categoryName,
  isOpen,
  onClose,
  onFeedbackSubmitted,
  refreshKey,
}: FeedbackModalProps) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!isOpen) return;
    fetch(`${apiBase}/api/feedback?category=${encodeURIComponent(category || "")}`)
      .then((r) => r.json())
      .then((data) => setFeedbacks(Array.isArray(data) ? data : []))
      .catch((e) => console.warn("Failed load feedbacks", e));
  }, [isOpen, category]);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      console.warn("Please enter feedback");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Sign in required to submit feedback");
      onClose();
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiBase}/api/sentiment/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: feedbackText,
          section: category,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Prediction failed:", data || res.statusText);
        setIsSubmitting(false);
        return;
      }

      // refresh feedback list
      const listRes = await fetch(`${apiBase}/api/feedback?category=${encodeURIComponent(category || "")}`);
      const listData = await listRes.json().catch(() => []);

      setFeedbacks(Array.isArray(listData) ? listData : []);
      setFeedbackText("");

      // notify parent to refresh charts/others
      if (typeof onFeedbackSubmitted === "function") {
        onFeedbackSubmitted();
      }

      console.log("Feedback submitted and parent notified to refresh chart.");
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-2xl font-semibold">{categoryName} Feedback</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <FeedbackCarousel feedbacks={feedbacks} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-semibold mb-2">Share Feedback</h3>
              <Textarea
                placeholder="Write your feedback here..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full min-h-[100px] resize-none"
              />
              <div className="mt-4 flex justify-center">
                <Button onClick={handleSubmit} disabled={isSubmitting} className="px-6">
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm p-4 flex-1 min-h-[320px]">
              <h3 className="font-semibold mb-2">Sentiment Trend</h3>
              {/* pass refreshKey down so chart refetches when parent bumps it */}
              <SentimentChart category={category} refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
