import type React from 'react';
import { Button } from "@/components/ui/button"
import { open } from "@tauri-apps/plugin-shell";
type Site = {
  name: string;
  domain: string;
  id: string;
  ssl: boolean;
  url: string;
  screenshot_url: string;
  required: string;
};

type SitesListProps = {
  sites: Site[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onEditClick:any;
};

const SitesList: React.FC<SitesListProps> = ({ sites, onEditClick }) => {
  console.log('onEditClick site card:', onEditClick);
  return (
    <div className="w-full flex flex-wrap gap-8 justify-start">
      {sites.map((site) => (
        <div className="card" key={site.id}>
          <img
            src={site.screenshot_url}
            alt={site.name}
            className="card__image"
          />
          <div className="card__overlay">
            <h2 className="card__title">
              <Button onClick={() => onEditClick(site.id)} className="card__link">
                {site.name}
              </Button>
              <a href={`https://app.netlify.com/sites/${site.name}/deploys`} onClick={(e) => {e.preventDefault(); open(`https://app.netlify.com/sites/${site.name}/deploys`)}}>
                <img
                  src={`https://api.netlify.com/api/v1/badges/${site.id}/deploy-status`}
                  alt="Netlify Status"
                />
              </a>
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SitesList;
