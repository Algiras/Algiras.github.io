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
    let title = 'Algimantas Krasnauskas';

    if (pathname === '/') {
      title = 'Algimantas Krasnauskas - Software Engineer';
    } else if (pathname.startsWith('/finance')) {
      if (pathname === '/finance') {
        title = 'Finance Tools - Algimantas Krasnauskas';
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
        title = 'Document Tools - Algimantas Krasnauskas';
      } else if (pathname.includes('markdown-to-pdf')) {
        title = 'Markdown to PDF - Document Tools';
      }
    } else if (pathname.startsWith('/games')) {
      if (pathname === '/games') {
        title = 'Games - Algimantas Krasnauskas';
      } else if (pathname.includes('akotchi')) {
        title = 'Akotchi Game - Games';
      }
    } else if (pathname.startsWith('/ai')) {
      title = 'AI Voice Assistant - Algimantas Krasnauskas';
    }

    document.title = title;
  }, [location.pathname]);
};
