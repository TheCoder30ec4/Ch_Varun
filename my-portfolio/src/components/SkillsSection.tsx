import { useState, useEffect, useRef } from 'react';
import { ChatGroq } from '@langchain/groq';
import { type Skill } from '../utils/skillsData'; // Keep Skill type for consistency with LLM output
import './styles/SkillsSection.css';
import { z } from 'zod';

// Define the structure for categorized skills (TypeScript interface)
interface SkillCategory {
  category: string;
  skills: Skill[];
}

// The Zod schemas are no longer strictly needed for `withStructuredOutput`
// but can remain for type validation if desired elsewhere.
const SkillSchema = z.object({
  name: z.string(),
});

const SkillCategorySchema = z.object({
  category: z.string(),
  skills: z.array(SkillSchema),
});

const CategorizedSkillsOutputSchema = z.object({
  categories: z.array(SkillCategorySchema),
});

// Initialize the LLM without withStructuredOutput
const llm = new ChatGroq({
  model: "llama3-8b-8192",
  temperature: 0.2,
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});


interface SkillsSectionProps {
  data: any; // Now accepting the full data object
}

const SkillsSection = ({ data }: SkillsSectionProps) => {
  const [categorizedSkills, setCategorizedSkills] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const categorizeSkills = async () => {
      // Extract skills from the passed data object
      let skillList: { name: string }[] = [];
      if (data?.skills) {
        // This handles the structure of the fallbackData
        skillList = data.skills;
      } else if (data?.experience) {
        // This handles the structure of the live API data
        const extractedSkills = data.experience.reduce((acc: string[], exp: any) => {
          if (exp.skills && Array.isArray(exp.skills)) {
            return [...acc, ...exp.skills];
          }
          return acc;
        }, []);
        
        // Remove duplicates and map to the required { name: string } format
        const uniqueSkillNames = [...new Set(extractedSkills)];
        skillList = uniqueSkillNames.map((name: any) => ({ name: name as string }));
      }

      if (!skillList || skillList.length === 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      // If the API key is missing, skip categorization and display all skills.
      if (!import.meta.env.VITE_GROQ_API_KEY) {
        console.warn("Groq API key is missing. Displaying skills without categorization.");
        setCategorizedSkills([{ category: "All Skills", skills: skillList }]);
        setIsLoading(false);
        return;
      }

      const skillNames = skillList.map(s => s.name).join(', ');
      // Re-add explicit JSON formatting instructions to the prompt
      const prompt = `You are an expert tech hiring manager. Your task is to categorize a list of software development skills into logical groups.\n      Given the list of skills: [${skillNames}].\n      Categorize them into relevant groups such as \"Frontend\", \"Backend\", \"Languages\", \"Databases\", \"DevOps\", \"Testing\", and \"Tools\".\n      You MUST return ONLY a single valid JSON object in the following format: { \"categories\": [{ \"category\": \"CategoryName\", \"skills\": [{ \"name\": \"SkillName\" }] }] }.\n      Do NOT include any introductory text, backticks, or explanations outside of the JSON object.\n      Do NOT omit any closing brackets or braces. Only output valid JSON. Also from the projects if you get another skills feel free to mention`;

      try {
        const response = await llm.invoke(prompt);
        let content = response.content as string;
        console.log("Raw LLM Content:", content);

        // Robustly extract the main JSON object from the content.
        const startIndex = content.indexOf('{');
        const endIndex = content.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
          throw new Error("No valid JSON object found in LLM response.");
        }

        let jsonString = content.substring(startIndex, endIndex + 1);
        console.log("JSON String being parsed:", jsonString);

        // --- Auto-repair for missing closing brackets/braces ---
        const openCurly = (jsonString.match(/{/g) || []).length;
        const closeCurly = (jsonString.match(/}/g) || []).length;
        const openSquare = (jsonString.match(/\[/g) || []).length;
        const closeSquare = (jsonString.match(/\]/g) || []).length;
        if (openCurly > closeCurly) {
          jsonString += '}'.repeat(openCurly - closeCurly);
        }
        if (openSquare > closeSquare) {
          jsonString += ']'.repeat(openSquare - closeSquare);
        }

        const jsonResponse = JSON.parse(jsonString);
        
        if (jsonResponse.categories && jsonResponse.categories.length > 0) {
          setCategorizedSkills(jsonResponse.categories);
        } else {
          throw new Error("Invalid JSON structure from LLM.");
        }
      } catch (e) {
        console.error("Failed to categorize skills:", e);
        setError("Could not categorize skills. Displaying in a simple list.");
        setCategorizedSkills([{ category: "All Skills", skills: skillList }]);
      } finally {
        setIsLoading(false);
      }
    };

    categorizeSkills();
  }, [data]);

  // Calculate SVG lines after render
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  useEffect(() => {
    if (!treeRef.current) return;
    const root = treeRef.current.querySelector('.tree-root') as HTMLElement;
    const categories = Array.from(treeRef.current.querySelectorAll('.tree-category')) as HTMLElement[];
    if (!root || categories.length === 0) return;
    const rootRect = root.getBoundingClientRect();
    const treeRect = treeRef.current.getBoundingClientRect();
    const newLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    categories.forEach((cat) => {
      const catRect = cat.getBoundingClientRect();
      newLines.push({
        x1: rootRect.left + rootRect.width / 2 - treeRect.left,
        y1: rootRect.bottom - treeRect.top,
        x2: catRect.left + catRect.width / 2 - treeRect.left,
        y2: catRect.top - treeRect.top,
      });
    });
    setLines(newLines);
  }, [categorizedSkills, isLoading]);

  if (isLoading) {
    return (
      <section className="skills-section" id="skills">
        <div className="skills-tree-vertical" ref={treeRef}>
          <div className="tree-root">MY SKILLS</div>
          <div className="tree-loading">Categorizing skills...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="skills-section" id="skills">
      <div className="skills-simple-container animated-section">
        <div className="skills-title-simple">MY SKILLS</div>
        {error && <p className="skills-error">{error}</p>}
        <div className="skills-category-grid">
          {categorizedSkills.map((cat, idx) => (
            <div className="skills-category-card" key={cat.category + idx}>
              <div className="skills-category-header">{cat.category}</div>
              <div className="skills-tag-list">
                {cat.skills.map((skill, skillIdx) => (
                  <span className="skill-tag-simple" key={skill.name + skillIdx}>{skill.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
