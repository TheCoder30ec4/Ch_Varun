import { useEffect, useState } from 'react';
import './App.css';
import NavBar from './components/NavBar';
import ProfileSection from './components/ProfileSection';
import get_data from './utils/DataScraper/ApifyClient';
import SkillsSection from './components/SkillsSection';
import ExperienceSection from './components/ExperienceSection';
import ProjectGrid from './components/ProjectsGrid';
import CertificateGrid from './components/CertificateGrid';
import ContactSection from './components/Contact';
import ContactForm from './components/ContactForm';
import { fallbackData } from './utils/fallbackData';

function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try to fetch data from API with a timeout
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('API timeout')), 15000)
                );
                
                const dataPromise = get_data();
                const result: any = await Promise.race([dataPromise, timeoutPromise]);
                
                // Check if the result is valid and access the first element
                if (result && result.length > 0) {
                    setData(result[0]); // Set the object, not the array, to state
                } else {
                   throw new Error("No data received from API.");
                }
            } catch (err: any) {
                console.warn("API failed, using fallback data:", err.message);
                // Use fallback data instead of showing error
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
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2 className="error-title">Oops! Something went wrong.</h2>
          <p className="error-message">Could not load the portfolio data. Please try again later.</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <NavBar />
      <main>
        <ProfileSection
          profile_image_url={data.basic_info.profile_picture_url}
          about={data.basic_info.about}
          linkedin={String(DataString)}
        />
        <SkillsSection/>
        <ExperienceSection experienceData={data.experience}/>
        <ProjectGrid projects={data.projects}/>
        <CertificateGrid certifications={data.certifications}/>
        <ContactForm/>
        <ContactSection/>

      </main>
    </>
  );
}

export default App;
