import React from 'react';
import ExperienceItem from './ExperienceItem';
import type { Experience } from '../utils/Experience';
import './styles/ExperienceSection.css';

interface ExperienceSectionProps {
  experienceData: Experience[];
}

// Helper function to group experiences by company
const groupExperienceByCompany = (experiences: Experience[]) => {
  if (!experiences) {
    return [];
  }

  const grouped = experiences.reduce((acc, exp) => {
    const companyName = exp.company || 'Unknown Company';
    if (!acc[companyName]) {
      acc[companyName] = {
        company: companyName,
        logo: exp.company_logo_url || '',
        roles: []
      };
    }
    acc[companyName].roles.push(exp);
    // Sort roles by start date, newest first
    acc[companyName].roles.sort((a, b) => {
      const dateA = new Date(a.start_date.year, a.start_date.month ? a.start_date.month - 1 : 0);
      const dateB = new Date(b.start_date.year, b.start_date.month ? b.start_date.month - 1 : 0);
      return dateB.getTime() - dateA.getTime();
    });
    return acc;
  }, {} as Record<string, { company: string; logo: string; roles: Experience[] }>);
  
  return Object.values(grouped);
};

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experienceData }) => {
  const groupedExperience = groupExperienceByCompany(experienceData);

  return (
    <section className="experience-section" id="experience">
      <h2 className="experience-title">Experience</h2>
      <div className="timeline-container animated-section">
        <div className="timeline-line"></div>
        <div className="timeline-content">
          {groupedExperience.map((companyGroup, index) => (
            <div className="timeline-item" key={index}>
              <div className="timeline-dot"></div>
              <div className="company-panel">
                <div className="company-info">
                  {companyGroup.logo && <img src={companyGroup.logo} alt={`${companyGroup.company} logo`} className="company-logo" />}
                  <h3 className="company-name">{companyGroup.company}</h3>
                </div>
                <div className="roles-container">
                  {companyGroup.roles.map((exp, roleIndex) => (
                    <ExperienceItem
                      key={roleIndex}
                      experience={exp}
                      isLastRole={roleIndex === companyGroup.roles.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;