import type { Project } from '../utils/Project';
import './styles/ProjectCard.css'

interface Props {
  project: Project;
}

const ProjectCard = ({ project }: Props) => {
  return (
    <div className="project-card">
      <h3 className="title">{project.name}</h3>

      {project.associated_with && (
        <p className="subtitle">Associated with: {project.associated_with}</p>
      )}

      <p className="description">{project.description}</p>

      <div className="buttons">
        <a
          href="https://github.com/TheCoder30ec4"
          className="cta-btn"
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub
        </a>

        <a
          href="https://github.com/TheCoder30ec4"
          className="cta-btn secondary"
          target="_blank"
          rel="noreferrer"
        >
          View More Projects →
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
