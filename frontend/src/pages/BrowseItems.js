import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PackageSearch, RotateCcw } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FormField from "../components/FormField";
import ItemCard from "../components/ItemCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import itemService from "../services/itemService";
import publicService from "../services/publicService";
import { errorMessage } from "../utils/helpers";
import { useDebounce } from "../utils/hooks";

const TABS = [
  { key: "", label: "All Items" },
  { key: "LOST", label: "Lost" },
  { key: "FOUND", label: "Found" },
];

const STATUS_OPTIONS = [
  ["", "All statuses"],
  ["ACTIVE", "Active"],
  ["CLAIMED", "Claimed"],
  ["RECOVERED", "Recovered"],
];

const EMPTY_FILTERS = { keyword: "", category: "", location: "", status: "" };

export default function BrowseItems() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // The landing-page search sends ?keyword=..., other links may send ?type=LOST|FOUND
  const typeParam = searchParams.get("type");
  const [tab, setTab] = useState(
    ["LOST", "FOUND"].includes(typeParam) ? typeParam : "",
  );
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    keyword: searchParams.get("keyword") || "",
  });
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // Wait until the user stops typing before calling the API
  const debounced = useDebounce(filters, 350);

  useEffect(() => {
    publicService
      .categories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    itemService
      .list({ type: tab, ...debounced })
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, debounced, reload]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
  };

  const hasFilters = Object.values(filters).some(Boolean);
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <>
      <Navbar />
      <main className="container">
        <div className="page-head">
          <h1>Browse items</h1>
          <p>Search every lost and found report on campus.</p>
        </div>

        {!user && (
          <div className="alert alert-info">
            <Link to="/login">Log in</Link> to view full details and submit
            claims.
          </div>
        )}

        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key || "all"}
              role="tab"
              aria-selected={tab === t.key}
              className={`tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="filter-bar">
          <FormField
            label="Search by item name"
            name="keyword"
            placeholder="e.g. umbrella"
            value={filters.keyword}
            onChange={handleChange}
          />
          <FormField
            as="select"
            label="Category"
            name="category"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FormField>
          <FormField
            label="Location"
            name="location"
            placeholder="e.g. library"
            value={filters.location}
            onChange={handleChange}
          />
          <FormField
            as="select"
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleChange}
          >
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormField>
          <button
            className="btn btn-outline"
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            <RotateCcw size={16} /> Clear
          </button>
        </div>

        {loading ? (
          <Loader text="Loading items…" />
        ) : error ? (
          <div className="alert alert-error">
            {error}{" "}
            <button
              className="link-btn"
              onClick={() => setReload((n) => n + 1)}
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No items found"
            message={
              hasFilters
                ? "No reports match your filters. Try changing or clearing them."
                : "Nothing has been reported here yet."
            }
            action={
              hasFilters ? (
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear filters
                </button>
              ) : (
                <Link to="/report/lost" className="btn btn-primary">
                  Report an item
                </Link>
              )
            }
          />
        ) : (
          <>
            <p className="result-count">
              {items.length} {items.length === 1 ? "item" : "items"} found
            </p>
            <div className="item-grid">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}


