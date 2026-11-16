import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Navbar from "../components/Navbar";
import EmptyState from "../components/EmptyState";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="container page-center">
        <EmptyState
          icon={Compass}
          title="Page not found"
          message="The page you are looking for does not exist or has been moved."
          action={<Link to="/" className="btn btn-primary">Go to home</Link>}
        />
      </main>
    </>
  );
}

