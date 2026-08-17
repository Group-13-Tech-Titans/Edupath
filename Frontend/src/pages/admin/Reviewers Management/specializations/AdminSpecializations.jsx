import React, { useState } from "react";
import PageShell from "../../../../components/PageShell.jsx";
import AdminFooter from "../../../../components/layouts/admin-layouts/AdminFooter.jsx";

//import components
import SpecializationsHeader from "./SpecializationsHeader";
import AddSpecializationForm from "./AddSpecializationForm";
import SpecializationsList from "./SpecializationsList";

export default function AdminSpecializations() {
  const [toast, setToast] = useState(null);
  
  const [refreshKey, setRefreshKey] = useState(0); 

  // Security token helper
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("edupath_token")}` }
  });

  // Popup message 
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000); // Clear the toast after 3 seconds
  };

  // Triggers the list to fetch data again
  const triggerRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1); 
  };

  return (
    <PageShell>
      {/* succussfully added/error notification*/}
      {toast && (
        <div className="fixed right-4 top-20 z-50">
          <div className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur bg-white/80 ${
            toast.type === "success" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-600"
          }`}>
            {toast.text}
          </div>
        </div>
      )}

      <div className="space-y-6">
        
        {/*  Header component */}
        <SpecializationsHeader />

        {/* add Form component */}
        <AddSpecializationForm 
          getAuthHeader={getAuthHeader} 
          showToast={showToast} 
          onSuccess={triggerRefresh} // When successful, call triggerRefresh for show new data in the list
        />

        {/* show List component */}
        <SpecializationsList 
          getAuthHeader={getAuthHeader} 
          showToast={showToast} 
          refreshKey={refreshKey} // Watches this key to know when to refresh
        />
        
      </div>
      
      <div className="mt-8">
        {/* Footer */}
        <AdminFooter />
      </div>
    </PageShell>
  );
}