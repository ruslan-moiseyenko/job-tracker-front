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
  color?: string;
};

export type CompanyInputType =
  | {
      existingCompanyId: string;
    }
  | {
      newCompany: {
        name: string;
        website?: string;
        description?: string;
      };
    };

export interface CreateJobApplicationInput {
  currentStageId?: string;
  customColor?: string;
  jobDescription?: string;
  jobSearchId: string;
  positionTitle: string;
  salary?: number;
  company: CompanyInputType;
  jobLinks: string[];
}

export interface JobApplication {
  id: string;
  positionTitle: string;
  jobDescription?: string;
  customColor?: string;
  applicationDate: string;
  jobLinks: string[];
  salary?: number;
  updatedAt: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
  };
  currentStage: {
    id: string;
    name: string;
    order: number;
    color: string;
  };
}
