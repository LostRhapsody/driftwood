"use client";
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import SitesList from '@/components/app_ui/site_card';

type Site = {
  name: string;
  domain: string;
  id: string;
  ssl: boolean;
  url: string;
  screenshot_url: string;
  required: boolean;
};

export default function Sites() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Site[] | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const response = await invoke<string>("list_sites");
        console.log("Sites response:", response);
        if (!response || response === '') {
          setError('No sites found');
          return;
        }

        // Parse and set the site data
        const parsedData: Site[] = JSON.parse(response);
        setData(parsedData);

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
    <div className="w-full">
      <h1 className="text-4xl pb-2">Your sites</h1>
         {/* Ensure data is not null before passing to SitesList */}
         {data && <SitesList sites={data} />}
    </div>
  );
}
