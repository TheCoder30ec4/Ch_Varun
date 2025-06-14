import { useState } from "react";
import type { Experience } from "../utils/Experience";
import './styles/ExperienceItem.css'


interface Props {
    experience: Experience;
}

const ExperienceItem = ({ experience}: Props)=>{
    const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`timeline-item ${expanded ? 'expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="timeline-icon">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#4ea1ff"
                viewBox="0 0 24 24"
            >
                <path d="M10 2h4a2 2 0 0 1 2 2v2h5v14H3V6h5V4a2 2 0 0 1 2-2Zm4 4V4h-4v2h4Z" />
            </svg>
        </div>
      <div className="timeline-content">
        <div className="header-row">
          {experience.company_logo_url && (
            <img
              src={experience.company_logo_url}
              alt={`${experience.company} logo`}
              className="company-logo"
            />
          )}
          <div className="title-block">
            <h3 className="title">
              {experience.title}{' '}
              <a
                href={experience.company_linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="company-name"
                onClick={(e) => e.stopPropagation()} // avoid toggle on link click
              >
                @ {experience.company}
              </a>
            </h3>
            <p className="duration">{experience.duration}</p>
            <p className="location">
              {experience.location}
              {experience.location_type ? ` (${experience.location_type})` : ''}
            </p>
          </div>
        </div>

        {expanded && (
          <div className="extra-details">
            {experience.description && (
              <p className="description">{experience.description}</p>
            )}
            {experience.skills && (
              <div className="skills">
                {experience.skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceItem;