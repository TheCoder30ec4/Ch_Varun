import ProjectCard  from "./ProjectCard";
import type { Project } from "../utils/Project";
import './styles/ProjectGrid.css'

interface Props{
    projects: Project[];
}

const ProjectGrid = ({ projects }:Props)=>{
    return (
    <section className="projects-section">
      <h2 className="section-title">Projects</h2>
      <div className="projects-grid">
        {projects.map((proj, idx) => (
          <ProjectCard key={idx} project={proj} />
        ))}
      </div>
    </section>
  );
};
export default ProjectGrid;