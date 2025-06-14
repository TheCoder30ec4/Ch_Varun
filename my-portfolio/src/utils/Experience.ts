export interface ExperienceDate {
    year: number;
    month: string;
}

export interface Experience {
    description: any;
    location: string;
    duration: string;
    title: string;
    company:string;
    end_date?:ExperienceDate;
    is_current:boolean;
    company_linkedin_url:string;
    company_logo_url?: string;
    employment_type?:string;
    company_id:string;
    location_type?: string;
    skills?: string[];
    skills_url?: string;
}


