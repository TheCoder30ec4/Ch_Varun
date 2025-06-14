export interface Project {
  name: string;
  description: string;
  associated_with?: string;
  is_current?: boolean;
  image?: string; // for preview
}
