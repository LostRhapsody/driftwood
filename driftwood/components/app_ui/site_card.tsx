import type React from 'react';

type Site = {
  name: string;
  domain: string;
  id: string;
  ssl: boolean;
  url: string;
  screenshot_url: string;
  required: boolean;
};

type SitesListProps = {
  sites: Site[];
};

const SitesList: React.FC<SitesListProps> = ({ sites }) => {
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
              <a href={site.url} className="card__link">
                {site.name}
              </a>
              <a href={`https://app.netlify.com/sites/${site.name}/deploys`}>
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
