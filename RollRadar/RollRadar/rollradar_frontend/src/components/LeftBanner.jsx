export default function LeftBanner({ categories }) {
  return (
    <aside className="w-1/4 p-4 bg-gray-100 dark:bg-gray-800 dark:text-gray-100 shadow-md transition-colors duration-300">
      <h2 className="font-bold text-lg mb-4">Categories</h2>
      <ul>
        {categories.map((category) => (
          <li key={category} className="py-2 hover:text-blue-500 cursor-pointer">
            {category}
          </li>
        ))}
      </ul>
    </aside>
  );
}
