import React, { useEffect, useState, useRef, useCallback } from "react";
import PageShell from "../../../../components/PageShell.jsx";
import AdminFooter from "./../../../../components/layouts/admin-layouts/AdminFooter.jsx";
import { Search, Filter, Loader2, User as UserIcon } from "lucide-react";
import EducatorDetailsModal from "./EducatorDetailsModal.jsx";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Avatar = ({ name }) => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
    <UserIcon className="h-5 w-5" />
  </div>
);

const MiniPill = ({ label }) => (
  <span className="rounded-full bg-black/5 px-2 py-0.5 whitespace-nowrap">
    {label}
  </span>
);

// Unused components removed from list view to be clean


const AdminEducatorList = () => {
  const navigate = useNavigate();
  const [educators, setEducators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [selectedEducator, setSelectedEducator] = useState(null);

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, hasMore]);

  const fetchEducators = async (search, currentPage = 1) => {
    if (currentPage === 1) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }
    try {
      const token = localStorage.getItem("edupath_token");
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      queryParams.append("page", currentPage);
      queryParams.append("limit", 20);

      const res = await fetch(`${API_URL}/api/admin/educators?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (currentPage === 1) {
          setEducators(data.educators || []);
        } else {
          setEducators(prev => [...prev, ...(data.educators || [])]);
        }
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Failed to fetch educators", err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  // Fetch initially and when page changes
  useEffect(() => {
    fetchEducators(searchQuery, page);
  }, [page]); 

  const handleSearch = () => {
    setPage(1);
    fetchEducators(searchQuery, 1);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val === "") {
      setPage(1);
      fetchEducators("", 1);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-dark">All Educators</h1>
            <p className="text-sm text-muted">Browse and filter all educators registered on the platform.</p>
          </div>
          <button
            onClick={() => navigate("/admin/verify-educators")}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
          >
            Back to Requests
          </button>
        </div>

        {/* Filters Section */}
        <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or specialization..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="block w-full rounded-2xl border-0 py-2.5 pl-10 pr-4 text-sm bg-black/5 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-4 min-h-[400px]">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
          ) : educators.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm font-semibold text-muted">
              No educators found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {educators.map((ed, index) => {
                const isLast = index === educators.length - 1;
                return (
                  <div 
                    key={ed._id} 
                    ref={isLast ? lastElementRef : null}
                    className="rounded-[22px] border border-black/5 bg-white/80 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        <Avatar name={ed.name || ed.email} />
                        
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-dark flex items-center gap-2">
                            {ed.name || "Unknown"}
                            {ed.status === "VERIFIED" && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Verified</span>}
                            {ed.status === "PENDING_VERIFICATION" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Pending</span>}
                            {ed.status === "REJECTED" && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Rejected</span>}
                          </p>
                          <p className="truncate text-xs text-muted">{ed.email}</p>
                          
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                            <MiniPill label={`Field: ${ed.specializationTag || ed.profile?.specialization || "N/A"}`} />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedEducator(ed)}
                        className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors shrink-0"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
              {isFetchingMore && (
                <div className="flex h-12 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <br/><br/><br/>
      <AdminFooter />
      
      {/* Detail Modal */}
      <EducatorDetailsModal 
        educator={selectedEducator} 
        onClose={() => setSelectedEducator(null)} 
      />
    </PageShell>
  );
};

export default AdminEducatorList;
