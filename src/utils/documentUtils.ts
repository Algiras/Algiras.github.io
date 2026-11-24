import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

export const useRouteBasedTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    // Generate title based on current route
    let title = 'Algimantas Krasauskas';

    if (pathname === '/') {
      title = 'Algimantas Krasauskas - Author & Software Engineer';
    } else if (pathname.startsWith('/finance')) {
      if (pathname === '/finance') {
        title = 'Finance Tools - Algimantas Krasauskas';
      } else if (pathname.includes('investment-calculator')) {
        title = 'Investment Calculator - Finance Tools';
      } else if (pathname.includes('investment-tracker')) {
        title = 'Investment Tracker - Finance Tools';
      } else if (pathname.includes('loan-comparison')) {
        title = 'Loan Comparison - Finance Tools';
      } else if (pathname.includes('mortgage-calculator')) {
        title = 'Mortgage Calculator - Finance Tools';
      } else if (pathname.includes('retirement-planner')) {
        title = 'Retirement Planner - Finance Tools';
      } else if (pathname.includes('roi-calculator')) {
        title = 'ROI Calculator - Finance Tools';
      }
    } else if (pathname.startsWith('/documents')) {
      if (pathname === '/documents') {
        title = 'Document Tools - Algimantas Krasauskas';
      } else if (pathname.includes('markdown-to-pdf')) {
        title = 'Markdown to PDF - Document Tools';
      }
    } else if (pathname.startsWith('/games')) {
      if (pathname === '/games') {
        title = 'Games - Algimantas Krasauskas';
      } else if (pathname.includes('akotchi')) {
        title = 'Akotchi Game - Games';
      }
    } else if (pathname.startsWith('/ai')) {
      title = 'AI Voice Assistant - Algimantas Krasauskas';
    }

    document.title = title;
  }, [location.pathname]);
};
