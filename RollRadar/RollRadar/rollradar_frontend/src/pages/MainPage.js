import React from "react";
import TopBanner from "../components/TopBanner";
import LeftBanner from "../components/LeftBanner";
import NewsFeed from "../components/NewsFeed";
import Footer from "../components/Footer";
import "../style/MainPage.css";

function MainPage() {
  const categories = ["Bowling balls", "Bowling alleys", "Bowling series", "Users"];
  const uploads = [
    { title: "New Bowling Alley Review", description: "Check out this cool place!" },
    { title: "Top 10 Bowling Balls of 2024", description: "Our best picks this year." },
  ];

  return (
    <div className="flex flex-col h-screen">
      <TopBanner />
      <div className="flex flex-1 overflow-hidden">
        <LeftBanner categories={categories} />
        <main className="flex-1 p-4 overflow-y-auto">
          <NewsFeed uploads={uploads} />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default MainPage;
