import { useMemo } from 'react';

import { useApolloClient } from '@apollo/client';

import type { Company } from './useSearchCompanies';

const SEARCH_COMPANIES_QUERY_NAME = 'searchCompanies';

/**
 * Hook for searching through cached companies to find exact matches
 * Uses Apollo Client cache to search through previously fetched companies
 */
export const useCachedCompanySearch = () => {
  const client = useApolloClient();

  const findExactCompanyMatch = useMemo(() => {
    return (companyName: string): Company | null => {
      if (!companyName || companyName.trim().length === 0) {
        return null;
      }

      const cache = client.cache;
      const normalizedName = companyName.trim().toLowerCase();

      try {
        // Get all cached entries
        const cacheData = cache.extract();

        // Look through all cached search results for companies
        for (const [key, value] of Object.entries(cacheData)) {
          // Check if this is a ROOT_QUERY entry containing searchCompanies results
          if (key === 'ROOT_QUERY' && value && typeof value === 'object') {
            const rootQuery = value as Record<string, any>;

            // Look for any searchCompanies fields in the ROOT_QUERY
            for (const [fieldKey, fieldValue] of Object.entries(rootQuery)) {
              if (
                fieldKey.startsWith(SEARCH_COMPANIES_QUERY_NAME) &&
                Array.isArray(fieldValue)
              ) {
                // This is a cached searchCompanies result containing __ref pointers
                for (const companyRef of fieldValue) {
                  if (
                    companyRef &&
                    typeof companyRef === 'object' &&
                    '__ref' in companyRef
                  ) {
                    // Follow the reference to get the actual company data
                    const companyId = companyRef.__ref as string;
                    const companyData = (cacheData as Record<string, any>)[
                      companyId
                    ];

                    if (
                      companyData &&
                      typeof companyData === 'object' &&
                      'name' in companyData &&
                      'id' in companyData &&
                      companyData.name &&
                      typeof companyData.name === 'string' &&
                      companyData.name.toLowerCase() === normalizedName
                    ) {
                      return {
                        id: companyData.id as string,
                        name: companyData.name as string
                      };
                    }
                  }
                }
              }
            }
          }
        }

        return null;
      } catch (error) {
        console.warn('Error searching cached companies:', error);
        return null;
      }
    };
  }, [client.cache]);

  return {
    findExactCompanyMatch
  };
};
