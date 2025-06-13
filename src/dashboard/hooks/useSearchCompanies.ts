import { useEffect, useState } from 'react';

import { useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';

import { SEARCH_DEBOUNCE_DELAY } from '@/dashboard/dashboard.constants';

const SEARCH_COMPANIES_QUERY = gql`
  query searchCompanies($name: String!) {
    searchCompanies(name: $name) {
      id
      name
    }
  }
`;

export interface Company {
  id: string;
  name: string;
}

export const useSearchCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [latestSearchTerm, setLatestSearchTerm] = useState('');

  const [searchCompanies, { loading, error }] = useLazyQuery(
    SEARCH_COMPANIES_QUERY,
    {
      onCompleted: (data) => {
        // Only update results if this matches our latest search term
        // This prevents stale results from overwriting newer ones
        if (data.searchCompanies && searchTerm === latestSearchTerm) {
          setCompanies(data.searchCompanies || []);
        }
      },
      onError: () => {
        // Only clear if this was for the current search term
        if (searchTerm === latestSearchTerm) {
          setCompanies([]);
        }
      },
      fetchPolicy: 'cache-first'
    }
  );

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      // Update the latest search term before making the request
      setLatestSearchTerm(searchTerm.trim());

      const timeoutId = setTimeout(() => {
        searchCompanies({
          variables: { name: searchTerm.trim() }
        });
      }, SEARCH_DEBOUNCE_DELAY);

      return () => clearTimeout(timeoutId);
    } else {
      setCompanies([]);
      setLatestSearchTerm('');
    }
  }, [searchTerm, searchCompanies]);

  return {
    companies,
    loading,
    error,
    searchTerm,
    setSearchTerm
  };
};
