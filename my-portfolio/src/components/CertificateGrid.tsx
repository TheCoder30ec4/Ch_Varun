import type { Certification } from "utils/certificates";
import CertificationCard from "./CertificateCard";
import './styles/CertificateGrid.css'

interface Props {
  certifications: Certification[];
}

const CertificationGrid = ({ certifications }: Props) => {
  return (
    <section className="cert-section">
      <h2 className="section-title">Certifications</h2>
      <div className="cert-grid">
        {certifications.map((item, i) => (
          <CertificationCard key={i} data={item} />
        ))}
      </div>
    </section>
  );
};

export default CertificationGrid;