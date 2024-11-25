import React from "react";
import { useParams } from "react-router-dom";

function NewsPage() {
  const { category } = useParams(); // Get category from the URL params
  return (
    <div>
      <h1>News in {category}</h1>
      <p>This is the news page for the {category} category.</p>
    </div>
  );
}

export default NewsPage;
