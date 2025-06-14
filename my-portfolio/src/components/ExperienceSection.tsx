import type { Experience } from "../utils/Experience";
import ExperienceItem from "./ExperienceItem";
import './styles/ExperienceSection.css'
interface Props {
  experienceData: Experience[];
}

const ExperienceSection = ({ experienceData }: Props) => {
  return (
    <section className="vertical-timeline-section">
      <h2 className="timeline-title">Experience</h2>
      <div className="vertical-timeline">
        {experienceData.map((exp, idx) => (
          <ExperienceItem key={idx} experience={exp} />
        ))}
      </div>
    </section>
  );
};

export default ExperienceSection;