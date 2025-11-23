// frontend/src/components/HomePage.tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, UtensilsCrossed, Bus, Coffee, Calendar } from "lucide-react";
import FeedbackModal from "./FeedbackModal";
import { useNavigate } from "react-router-dom";

const categories = [
	{ id: "academics", name: "Academics", icon: BookOpen, color: "from-blue-500 to-blue-600" },
	{ id: "hostel", name: "Hostel", icon: Home, color: "from-purple-500 to-purple-600" },
	{ id: "hostel_mess", name: "Hostel Mess", icon: UtensilsCrossed, color: "from-orange-500 to-orange-600" },
	{ id: "transport", name: "Transport", icon: Bus, color: "from-green-500 to-green-600" },
	{ id: "canteens", name: "Canteens", icon: Coffee, color: "from-pink-500 to-pink-600" },
	{ id: "events", name: "Events", icon: Calendar, color: "from-indigo-500 to-indigo-600" },
];

const HomePage = () => {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	// NEW: refreshKey toggles to tell charts to refetch
	const [refreshKey, setRefreshKey] = useState(0);
	const navigate = useNavigate();

	const handleLogout = () => {
		try {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
		} catch (err) {
			console.warn("Error clearing localStorage on logout:", err);
		}
		// force full-page navigation to the public landing (ensures app loads the root route)
		window.location.href = "/";
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b bg-card shadow-sm">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
								HAPPY INDEX
							</h1>
							<p className="text-muted-foreground mt-1">
								Your voice matters - Share your feedback
							</p>
						</div>

						{/* Logout button: uses your Button component and blue hover */}
						<Button
							onClick={handleLogout}
							className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
						>
							Logout
						</Button>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-12">
				<div className="text-center mb-12">
					<h2 className="text-2xl font-semibold mb-2">Select a Category</h2>
					<p className="text-muted-foreground">
						Choose an area to share your feedback
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{categories.map((category) => {
						const Icon = category.icon;
						return (
							<Card
								key={category.id}
								className="group cursor-pointer transition-smooth hover:shadow-lg hover:-translate-y-1"
								onClick={() => setSelectedCategory(category.id)}
							>
								<CardContent className="p-6">
									<div
										className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth shadow-md`}
									>
										<Icon className="w-8 h-8 text-white" />
									</div>
									<h3 className="text-xl font-semibold mb-2">
										{category.name}
									</h3>
									<p className="text-sm text-muted-foreground">
										Click to view feedback and share yours
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</main>

			{selectedCategory && (
				<FeedbackModal
					category={selectedCategory}
					categoryName={
						categories.find((c) => c.id === selectedCategory)?.name || ""
					}
					isOpen={!!selectedCategory}
					onClose={() => setSelectedCategory(null)}
					// NEW: allow modal to trigger chart refresh
					onFeedbackSubmitted={() => setRefreshKey((k) => k + 1)}
					refreshKey={refreshKey} // <-- pass refreshKey down
				/>
			)}
		</div>
	);
};

export default HomePage;
