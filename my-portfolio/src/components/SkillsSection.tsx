import { useState, useEffect } from 'react';
import { ChatGroq } from '@langchain/groq';
import { type Skill } from '../utils/skillsData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Code, Database, Globe, Server, TestTube, Wrench } from 'lucide-react';

interface SkillCategory {
  category: string;
  skills: Skill[];
}

interface SkillsSectionProps {
  data: any;
}

const llm = new ChatGroq({
  model: "llama3-8b-8192",
  temperature: 0.2,
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('frontend') || categoryLower.includes('ui')) return <Globe className="h-5 w-5" />;
  if (categoryLower.includes('backend') || categoryLower.includes('api')) return <Server className="h-5 w-5" />;
  if (categoryLower.includes('database') || categoryLower.includes('db')) return <Database className="h-5 w-5" />;
  if (categoryLower.includes('devops') || categoryLower.includes('deployment')) return <Wrench className="h-5 w-5" />;
  if (categoryLower.includes('test') || categoryLower.includes('testing')) return <TestTube className="h-5 w-5" />;
  return <Code className="h-5 w-5" />;
};

const SkillsSection = ({ data }: SkillsSectionProps) => {
  const [categorizedSkills, setCategorizedSkills] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const categorizeSkills = async () => {
      let skillList: { name: string }[] = [];
      if (data?.skills) {
        skillList = data.skills;
      } else if (data?.experience) {
        const extractedSkills = data.experience.reduce((acc: string[], exp: any) => {
          if (exp.skills && Array.isArray(exp.skills)) {
            return [...acc, ...exp.skills];
          }
          return acc;
        }, []);
        
        const uniqueSkillNames = [...new Set(extractedSkills)];
        skillList = uniqueSkillNames.map((name: any) => ({ name: name as string }));
      }

      if (!skillList || skillList.length === 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      if (!import.meta.env.VITE_GROQ_API_KEY) {
        console.warn("Groq API key is missing. Displaying skills without categorization.");
        setCategorizedSkills([{ category: "All Skills", skills: skillList }]);
        setIsLoading(false);
        return;
      }

      const skillNames = skillList.map(s => s.name).join(', ');
      const prompt = `You are an expert tech hiring manager. Your task is to categorize a list of software development skills into logical groups.\n      Given the list of skills: [${skillNames}].\n      Categorize them into relevant groups such as \"Frontend\", \"Backend\", \"Languages\", \"Databases\", \"DevOps\", \"Testing\", and \"Tools\".\n      You MUST return ONLY a single valid JSON object in the following format: { \"categories\": [{ \"category\": \"CategoryName\", \"skills\": [{ \"name\": \"SkillName\" }] }] }.\n      Do NOT include any introductory text, backticks, or explanations outside of the JSON object.\n      Do NOT omit any closing brackets or braces. Only output valid JSON. Also from the projects if you get another skills feel free to mention`;

      try {
        const response = await llm.invoke(prompt);
        let content = response.content as string;
        console.log("Raw LLM Content:", content);

        const startIndex = content.indexOf('{');
        const endIndex = content.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
          throw new Error("No valid JSON object found in LLM response.");
        }

        let jsonString = content.substring(startIndex, endIndex + 1);
        console.log("JSON String being parsed:", jsonString);

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

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-16" id="skills">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">My Skills</h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="text-muted-foreground">Categorizing skills...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16" id="skills">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">My Skills</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive overview of my technical skills and expertise across various domains
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categorizedSkills.map((category, idx) => (
            <Card key={category.category + idx} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  {getCategoryIcon(category.category)}
                  <span>{category.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIdx) => (
                    <Badge key={skill.name + skillIdx} variant="secondary" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Proficiency</span>
                    <span className="font-medium">{Math.floor(Math.random() * 30) + 70}%</span>
                  </div>
                  <Progress value={Math.floor(Math.random() * 30) + 70} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
