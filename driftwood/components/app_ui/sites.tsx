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
        console.log("Sites response:", response);
        if (!response || response === '') {
          setError('No sites found');
          return;
        }
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
      <h1 className="text-4xl pb-2">Your sites</h1>
        <div id="sites" className="w-full flex flex-wrap gap-8 justify-start">
        </div>
    </div>
  );
}