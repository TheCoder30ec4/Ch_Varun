import { skills } from "../utils/skillsData";
import  "./styles/SkillsSection.css"; 
const SkillsSection = () =>{
    return(
        <section className="skills-section">
            <h2 className="skills-title">Skills</h2>
            <div className="skills-grid">
                {skills.map((skill,index) =>(
                    <div className="skill-card" key={index}>
                        <div className="skill-icon">{skill.icon}</div>
                        <div className="skill-name">{skill.name}</div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default SkillsSection