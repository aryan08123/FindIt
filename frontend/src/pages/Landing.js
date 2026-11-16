import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  Key,
  PackageSearch,
  Search,
  ShieldCheck,
  Smartphone,
  UserPlus,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ItemCard from "../components/ItemCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import AnimatedNumber from "../components/AnimatedNumber";
import { homePath, useAuth } from "../context/AuthContext";
import publicService from "../services/publicService";
import { errorMessage } from "../utils/helpers";

const STEPS = [
  { icon: UserPlus, title: "Create an account", text: "Register with your college email and student ID in under a minute." },
  { icon: ClipboardList, title: "Report an item", text: "Lost or found something? Post a report with a photo and the details." },
  { icon: Search, title: "Search and match", text: "Browse and filter every report on campus to spot your belongings." },
  { icon: ShieldCheck, title: "Claim and recover", text: "Submit a claim with proof. An administrator verifies it before the item is handed over." },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hash } = useLocation();

  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(null);
  const [recentError, setRecentError] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    publicService.recentItems().then(setRecent).catch((e) => setRecentError(errorMessage(e)));
    publicService.stats().then(setStats).catch(() => {});
  }, []);

  // "How It Works" in the navbar links to /#how-it-works
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, [hash]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/browse?keyword=${encodeURIComponent(q)}` : "/browse");
  };

  const statItems = [
    ["Items reported lost", stats?.totalLost],
    ["Items reported found", stats?.totalFound],
    ["Items recovered", stats?.totalRecovered],
    ["Registered students", stats?.totalStudents],
  ];

  return (
    <>
      <Navbar />

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow"><ShieldCheck size={16} /> Campus Lost &amp; Found Portal</span>
            <h1>
              Lost Something? <span className="text-gradient">Find It Here.</span>
            </h1>
            <p className="hero-text">
              FindIt connects students who lost belongings with the people who found them. Report an
              item, search every report on campus and claim what is yours, all in one place.
            </p>

            <form className="hero-search" onSubmit={handleSearch} role="search">
              <div className="hero-search-field">
                <Search size={20} className="hero-search-icon" />
                <input
                  type="text"
                  placeholder="Search for a lost item, e.g. umbrella, wallet, ID card"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search items"
                />
              </div>
              <button className="btn btn-primary btn-lg">Search</button>
            </form>

            <div className="hero-actions">
              <Link to="/report/lost" className="btn btn-outline">Report Lost Item</Link>
              <Link to="/report/found" className="btn btn-ghost">
                Report Found Item <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="float-card fc-1">
              <span className="fc-icon"><Briefcase size={20} /></span>
              <div><strong>Black Backpack</strong><small>Found · Central Library</small></div>
            </div>
            <div className="float-card fc-2">
              <span className="fc-icon fc-purple"><Key size={20} /></span>
              <div><strong>Room Keys</strong><small>Lost · Block C</small></div>
            </div>
            <div className="float-card fc-3">
              <span className="fc-icon fc-green"><Smartphone size={20} /></span>
              <div><strong>Phone returned</strong><small>Recovered · Just now</small></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Recently reported ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Recently reported items</h2>
            <p>The latest lost and found reports from across campus.</p>
          </div>

          {recentError ? (
            <div className="alert alert-error">{recentError}</div>
          ) : !recent ? (
            <Loader text="Loading recent reports…" />
          ) : recent.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No reports yet"
              message="Be the first to report a lost or found item."
              action={<Link to="/report/lost" className="btn btn-primary">Report an item</Link>}
            />
          ) : (
            <>
              <div className="item-grid">
                {recent.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
              <div className="center-row">
                <Link to="/browse" className="btn btn-outline">
                  View all items <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section section-soft" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <h2>How it works</h2>
            <p>Four simple steps from lost to found.</p>
          </div>
          <div className="steps">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <div className="step" key={title}>
                <span className="step-num">{index + 1}</span>
                <div className="step-icon"><Icon size={26} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Statistics ---------- */}
      <section className="stats-band">
        <div className="container stats-grid">
          {statItems.map(([label, value]) => (
            <div key={label}>
              <strong>{value == null ? "–" : <AnimatedNumber value={value} />}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Call to action ---------- */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to get your belongings back?</h2>
            <p>Join your fellow students and make our campus a place where nothing stays lost.</p>
            {user ? (
              <Link to={homePath(user)} className="btn btn-primary btn-lg">Go to my dashboard</Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">Create a free account</Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

