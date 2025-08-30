import type { Certification } from "utils/certificates";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Award, Calendar, Building } from 'lucide-react';

interface Props {
  certifications: Certification[];
}

const CertificationCard = ({ data }: { data: Certification }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {data.name}
              </CardTitle>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Building className="h-3 w-3" />
                <span>{data.issuer}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Certified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Issued: {data.issued_date}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const CertificationGrid = ({ certifications }: Props) => {
  return (
    <section className="container mx-auto px-4 py-16" id="certifications">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Certifications</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional certifications and achievements that validate my skills and expertise
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certifications.map((item, i) => (
            <CertificationCard key={i} data={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationGrid;