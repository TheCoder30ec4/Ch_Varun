import React from 'react';
import type { Experience } from '../utils/Experience';
import './styles/ExperienceItem.css';
import { Clock, MapPin } from 'lucide-react'; // Icons for details

interface ExperienceItemProps {
  experience: Experience;
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({ experience }) => {
  return (
    <div className="role-card">
      <div className="role-card-content">
        <h4 className="role-card-title">{experience.title}</h4>
        <div className="role-card-meta">
          <span className="meta-item">
            <Clock size={14} />
            {experience.duration}
          </span>
          <span className="meta-item">
            <MapPin size={14} />
            {experience.location}
          </span>
        </div>
      </div>
      <div className="glowing-dot"></div>
    </div>
  );
};

export default ExperienceItem; 