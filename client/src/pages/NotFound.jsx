import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-[#f8faf7] dark:bg-gray-900 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <SearchX className="w-16 h-16 mx-auto text-green-600 mb-5" />
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-3">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          to="/"
          className="inline-flex mt-8 rounded-full bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
