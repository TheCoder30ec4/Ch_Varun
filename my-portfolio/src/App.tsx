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

function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // The result is expected to be an array: [ { basic_info: ... } ]
                const result: any = await get_data();
                
                // FIX: Check if the result is valid and access the first element
                if (result && result.length > 0) {
                    setData(result[0]); // Set the object, not the array, to state
                } else {
                   throw new Error("No data received from API.");
                }
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message || "Failed to fetch portfolio data.");
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

  if (error || !data) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2 className="error-title">Oops! Something went wrong.</h2>
          <p className="error-message">{error || "Could not load the portfolio data. Please try again later."}</p>
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
