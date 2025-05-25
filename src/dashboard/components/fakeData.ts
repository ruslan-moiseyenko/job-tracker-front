import type { Application } from '@/dashboard/dashboard.types';
import {
  HandCoins,
  ListStart,
  MessageCircleCode,
  MessageCircleX,
  PersonStanding
} from 'lucide-react';

export const fakeApplicationData: Application[] = [
  {
    id: '1',
    companyName: 'Global Technologies',
    jobTitle: 'Software Engineer',
    jobUrl: 'https://example.com/job/1',
    stage: 'applied',
    status: 'pending',
    salary: 120000
  },
  {
    id: '2',
    companyName: 'GlobalLogic',
    jobTitle: 'Data Scientist',
    jobUrl: 'https://example.com/job/2',
    stage: 'interview',
    status: 'processing'
  },
  {
    id: '3',
    companyName: 'Facebook',
    jobTitle: 'Product Manager',
    jobUrl: 'https://example.com/job/3',
    stage: 'offer',
    status: 'success',
    salary: 4000
  },
  {
    id: '4',
    companyName: 'Google',
    jobTitle: 'UX Designer',
    jobUrl: 'https://example.com/job/4',
    stage: 'rejected',
    status: 'failed'
  }
];

export const fakeStages = [
  {
    value: 'applied',
    label: 'Applied',
    icon: ListStart
  },
  {
    value: 'interview',
    label: 'Interview',
    icon: PersonStanding
  },
  {
    value: 'feedback',
    label: 'Feedback',
    icon: MessageCircleCode
  },
  {
    value: 'offer',
    label: 'Offer',
    icon: HandCoins
  },
  {
    value: 'rejected',
    label: 'Rejected',
    icon: MessageCircleX
  }
];

export const fakeStatuses: {
  value: 'pending' | 'processing' | 'success' | 'failed';
  label: string;
  icon?: any;
}[] = [
  {
    value: 'pending',
    label: 'Pending',
    icon: ListStart
  },
  {
    value: 'processing',
    label: 'Processing',
    icon: PersonStanding
  },
  {
    value: 'success',
    label: 'Success',
    icon: MessageCircleCode
  },
  {
    value: 'failed',
    label: 'Failed',
    icon: HandCoins
  }
];
