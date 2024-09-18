"use client";
// TODO!!!!! Sites doesn't populate, freaking get element by ID doesn't work in v2 for some reason?
import { useState, useEffect, useRef } from 'react';
import { invoke } from "@tauri-apps/api/core";

export default function Sites() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sitesRef = useRef("hi");  // Create a ref for the sites div

  useEffect(() => {
    const loadSites = async () => {
      try {
        // const response = await invoke<string>("list_sites");
        // console.log("Sites response:", response);
        // if (!response || response === '') {
        //   setError('No sites found');
        //   return;
        // }

        // sitesRef.current.innerHTML =  "<h1>Websites!</h1>"; //response; // Use the ref instead of getElementById

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
      <div ref={sitesRef.current} id="sites" className="w-full flex flex-wrap gap-8 justify-start">
        {sitesRef.current}
      </div>
    </div>
  );
}
