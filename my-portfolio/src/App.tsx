import { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import ProfileSection from './components/ProfileSection';
import get_data from './utils/DataScraper/ApifyClient';
import SkillsSection from './components/SkillsSection';
import ExperienceSection from './components/ExperienceSection';
import ProjectGrid from './components/ProjectsGrid';
import CertificateGrid from './components/CertificateGrid';
import ContactSection from './components/Contact';
import ContactForm from './components/ContactForm';
import { fallbackData } from './utils/fallbackData.ts';

function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 120000)
        );
        
        const dataPromise = get_data();
        const result: any = await Promise.race([dataPromise, timeoutPromise]);
        
        if (result && result.length > 0) {
          setData(result[0]);
        } else {
          throw new Error("No data received from API.");
        }
      } catch (err: any) {
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const DataString = JSON.stringify(data);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-foreground/70">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground">Oops! Something went wrong.</h2>
          <p className="text-foreground/70">Could not load the portfolio data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="space-y-0">
        <ProfileSection
          profile_image_url={data.basic_info.profile_picture_url}
          about={data.basic_info.about}
          linkedin={String(DataString)}
        >
          <h1 className="profile-name">{data.basic_info.name}</h1>
          <p className="profile-title">Software Developer @ HashedIn by Deloitte</p>
        </ProfileSection>
        <SkillsSection data={data} />
        <ExperienceSection experienceData={data.experience}/>
        <ProjectGrid projects={data.projects}/>
        <CertificateGrid certifications={data.certifications}/>
        <ContactForm/>
        <ContactSection/>
      </main>
    </div>
  );
}

export default App;
