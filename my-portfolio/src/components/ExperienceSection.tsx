import React from 'react';
import type { Experience } from '../utils/Experience';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, MapPin, Building2 } from 'lucide-react';

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
      const yA = a.start_date?.year ?? 0;
      const mA = (a.start_date?.month ?? 1) - 1;
      const yB = b.start_date?.year ?? 0;
      const mB = (b.start_date?.month ?? 1) - 1;
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

  return (
    <section className="container mx-auto px-4 py-16" id="experience">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Experience</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            My professional journey and work experience across different companies and roles
          </p>
        </div>

        <div className="space-y-8">
          {groupedExperience.map((companyGroup, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-card">
                <div className="flex items-center space-x-4">
                  {companyGroup.logo && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
                      <img 
                        src={companyGroup.logo} 
                        alt={`${companyGroup.company} logo`} 
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>{companyGroup.company}</span>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {companyGroup.roles.map((exp, roleIndex) => (
                    <div key={roleIndex} className="relative">
                      {roleIndex > 0 && (
                        <div className="absolute left-6 top-0 h-6 w-px bg-border"></div>
                      )}
                      <div className="flex space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <div className="h-3 w-3 rounded-full bg-primary"></div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="text-lg font-semibold">{exp.title}</h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{exp.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{exp.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          {exp.description && (
                            <p className="text-muted-foreground leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                          
                          {exp.skills && exp.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {exp.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;