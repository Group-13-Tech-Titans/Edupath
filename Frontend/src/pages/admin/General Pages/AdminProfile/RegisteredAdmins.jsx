import React, { useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const RegisteredAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("edupath_token");
        const res = await fetch(`${API_URL}/api/admin/admins`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched admins:", data.admins);
          setAdmins(data.admins || []);
        } else {
          console.error("Error fetching admins:", await res.text());
        }
      } catch (err) {
        console.error("Failed to fetch admins", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="rounded-[28px] border border-black/5 bg-white/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur h-full">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-text-dark">Registered Admins</h3>
      </div>
      
      {isLoading ? (
        <div className="flex h-20 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
        </div>
      ) : admins.length === 0 ? (
        <div className="flex h-20 items-center justify-center text-xs text-muted">
          No admins found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {admins.map((admin) => (
            <div key={admin._id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-black/5 transition-colors">
              <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                {getInitials(admin.name || admin.profile?.fullName || admin.email)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {admin.name || admin.profile?.fullName || "Unknown"}
                </p>
                <p className="truncate text-xs text-slate-500">{admin.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegisteredAdmins;
