import React from 'react';
import type { Experience } from '../utils/Experience';
import { Badge } from './ui/badge';
import { Timeline } from './ui/timeline';
import { Clock, MapPin, Building2, Briefcase } from 'lucide-react';

interface ExperienceSectionProps {
  experienceData: Experience[];
}

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
    acc[companyName].roles.sort((a, b) => {
      const yA = (a as Record<string, unknown>).start_date
        ? ((a as Record<string, unknown>).start_date as { year?: number })?.year ?? 0
        : 0;
      const mA = (a as Record<string, unknown>).start_date
        ? (((a as Record<string, unknown>).start_date as { month?: number })?.month ?? 1) - 1
        : 0;
      const yB = (b as Record<string, unknown>).start_date
        ? ((b as Record<string, unknown>).start_date as { year?: number })?.year ?? 0
        : 0;
      const mB = (b as Record<string, unknown>).start_date
        ? (((b as Record<string, unknown>).start_date as { month?: number })?.month ?? 1) - 1
        : 0;
      const dateA = new Date(yA, Math.max(0, mA));
      const dateB = new Date(yB, Math.max(0, mB));
      return dateB.getTime() - dateA.getTime();
    });
    return acc;
  }, {} as Record<string, { company: string; logo: string; roles: Experience[] }>);

  return Object.values(grouped);
};

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experienceData }) => {
  const groupedExperience = groupExperienceByCompany(experienceData);

  const timelineData = groupedExperience.map((companyGroup) => ({
    title: companyGroup.company,
    content: (
      <div className="space-y-6">
        {companyGroup.logo && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <img
              src={companyGroup.logo}
              alt={`${companyGroup.company} logo`}
              className="h-8 w-8 object-contain"
            />
          </div>
        )}

        {companyGroup.roles.map((exp, roleIndex) => (
          <div key={roleIndex} className="relative">
            {roleIndex > 0 && (
              <div className="absolute left-4 -top-3 h-3 w-px bg-border" />
            )}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow hover:border-primary/20">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base md:text-lg font-semibold text-card-foreground">
                    {exp.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{exp.duration}</span>
                    </div>
                    {exp.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{exp.location}</span>
                      </div>
                    )}
                    {exp.employment_type && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{exp.employment_type}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {exp.description && (
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed ml-12">
                  {exp.description}
                </p>
              )}

              {exp.skills && exp.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 ml-12">
                  {exp.skills.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="outline" className="text-xs px-2 py-0.5">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  }));

  return (
    <section id="experience">
      <Timeline
        data={timelineData}
        title="Experience"
        description="My professional journey and work experience across different companies and roles."
      />
    </section>
  );
};

export default ExperienceSection;
