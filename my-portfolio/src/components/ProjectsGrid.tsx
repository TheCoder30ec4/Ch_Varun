import type { Project } from '../utils/Project';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';

interface Props {
  projects: Project[];
}

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            {project.associated_with && (
              <p className="text-sm text-muted-foreground">
                Associated with: {project.associated_with}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            Project
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a
              href="https://github.com/TheCoder30ec4"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2"
            >
              <Github className="h-4 w-4" />
              <span>View on GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
          
          <Button variant="outline" asChild size="sm">
            <a
              href="https://github.com/TheCoder30ec4"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2"
            >
              <span>View More Projects</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectGrid = ({ projects }: Props) => {
  return (
    <section className="container mx-auto px-4 py-16" id="projects">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">My Projects</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Here are some of the projects I've worked on. Feel free to explore them and see my work in action.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectGrid;