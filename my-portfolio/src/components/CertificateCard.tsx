import type { Certification } from "utils/certificates";
import './styles/CertificateCard.css'


interface Props {
  data: Certification;
}

const CertificationCard = ({ data }: Props) => {
  return (
    <div className="cert-card">
      <h3 className="cert-title">{data.name}</h3>
      <p className="cert-meta">{data.issuer}</p>
      <p className="cert-date">{data.issued_date}</p>
    </div>
  );
};


export default CertificationCard;