"use client";

import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

export default function Sites() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const response = await invoke<string>("list_sites");
        const sites_elemnt = document.getElementById('sites');
        if (sites_elemnt) {
          sites_elemnt.innerHTML = response;
        }
      } catch (err) {
        setError('Failed to load sites');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSites();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl underline">Your sites</h1>
      <div className="overflow-auto max-h-[50vh] w-full">
        <div id="sites" className="grid grid-cols-3 gap-4 w-full object-cover">
        </div>
      </div>
    </div>
  );
}