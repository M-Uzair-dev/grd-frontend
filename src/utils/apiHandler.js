import { clearAuthCookies } from './auth';
import { useRouter } from 'next/navigation';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const handleApiResponse = async (response, router) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle unauthorized or invalid token errors
    if (response.status === 401 || response.status === 403) {
      clearAuthCookies();
      // If router is provided, use it for navigation
      if (router) {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/partner')) {
          router.push('/partner');
        } else if (currentPath.startsWith('/admin')) {
          router.push('/admin');
        } else {
          router.push('/partner');
        }
      }
    }
    
    throw new ApiError(data.message || 'Something went wrong', response.status);
  }
  
  return data;
};

export const fetchWithAuth = async (url, options = {}, router = null) => {
  try {
    const response = await fetch(url, options);
    return await handleApiResponse(response, router);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}; 