export interface ResumeData {
  name: string;
  title: string;
  contact: {
    phone: string;
    email: string;
    location: string;
    website: string;
    linkedin?: string;
    github?: string;
  };
  profile: string;
  skills: string[];
  education: {
    period: string;
    institution: string;
    degree: string;
  }[];
  languages: string[];
  keyAchievements: string[];
  technicalExpertise: string[];
  workExperience: {
    company: string;
    period: string;
    role: string;
    responsibilities: string[];
  }[];
}

export interface ResumeAnalytics {
  previousAtsScore: number;
  updatedAtsScore: number;
  matchingScore: number;
  matchingKeywords: string[];
  missingKeywords: string[];
}
