export default function NewsFeed({ uploads }) {
  return (
    <section className="p-4 bg-white dark:bg-gray-900 dark:text-gray-100 shadow-md transition-colors duration-300">
      <h2 className="font-bold text-lg mb-4">Latest News</h2>
      {uploads.map((upload) => (
        <div key={upload.title} className="mb-4 p-2 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold">{upload.title}</h3>
          <p>{upload.description}</p>
        </div>
      ))}
    </section>
  );
}
