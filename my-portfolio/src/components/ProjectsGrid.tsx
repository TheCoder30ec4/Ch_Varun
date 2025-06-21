import ProjectCard from './ProjectCard';
import './styles/ProjectGrid.css'; // Main container styles
import './styles/ProjectCard.css'; // Individual card styles
import type { Project } from '../utils/Project';

interface Props {
  projects: Project[];
}

const ProjectGrid = ({ projects }: Props) => {
  return (
    <section className="projects-section" id="projects">
      <h2 className="section-title">My Projects</h2>
      <p className="section-subtitle">
        Here are some of the projects I've worked on. Feel free to explore them.
      </p>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </section>
  );
};

export default ProjectGrid;