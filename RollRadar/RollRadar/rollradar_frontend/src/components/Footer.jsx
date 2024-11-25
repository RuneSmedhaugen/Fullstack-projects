export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-4 dark:bg-gray-900">
      <div className="flex justify-between">
        <span>&copy; {new Date().getFullYear()} RollRadar</span>
        <div className="space-x-4">
          <a href="about" className="hover:underline">About</a>
          <a href="contact" className="hover:underline">Contact</a>
          <a href="privacy" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
