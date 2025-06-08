export type ApplicationType = {
  id: string;
  company: Pick<CompanyType, 'id' | 'name'>;
  currentStage: Pick<ApplicationStageType, 'id' | 'name' | 'order' | 'color'>;
  positionTitle: string;
  jobDescription: string;
  customColor: string;
  applicationDate: string;
  jobLinks: string[];
  salary: number | null;
  updatedAt: Date;
  createdAt: Date;
};

export type CompanyType = {
  id: string;
  name: string;
  description: string;
  website: string;
};

export type ApplicationStageType = {
  id: string;
  name: string;
  description: string;
  order: number;
  color: string;
};
