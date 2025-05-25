export type Application = {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  stage: 'applied' | 'interview' | 'offer' | 'rejected';
  status: 'pending' | 'processing' | 'success' | 'failed';
  salary?: number;
};
