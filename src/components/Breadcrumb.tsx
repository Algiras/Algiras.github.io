import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumbs, Text, Anchor } from '@mantine/core';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return null;
  }

  // Parse the current path into breadcrumb items
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      let label = segment;
      if (segment === 'finance') label = 'Finance';
      else if (segment === 'documents') label = 'Documents';
      else if (segment === 'games') label = 'Games';
      else if (segment === 'akotchi') label = 'Akotchi';
      else if (segment === 'share') label = 'Share';
      else if (segment === 'investment-calculator') label = 'Investment Calculator';
      else if (segment === 'investment-tracker') label = 'Investment Tracker';
      else if (segment === 'loan-comparison') label = 'Loan Comparison';
      else if (segment === 'mortgage-calculator') label = 'Mortgage Calculator';
      else if (segment === 'retirement-planner') label = 'Retirement Planner';
      else if (segment === 'roi-calculator') label = 'ROI Calculator';
      else if (segment === 'markdown-to-pdf') label = 'Markdown to PDF';
      else {
        // Capitalize first letter and replace hyphens with spaces
        label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }
      
      breadcrumbs.push({
        label,
        path: currentPath,
        icon: index === 0 ? <Home size={16} /> : undefined
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  // Don't show breadcrumbs if there's only one segment
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  const items = breadcrumbItems.map((item, index) => {
    const isLast = index === breadcrumbItems.length - 1;
    
    if (isLast) {
      return (
        <Text key={item.path} size="sm" c="dimmed">
          {item.icon && <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>}
          {item.label}
        </Text>
      );
    }
    
    return (
      <Anchor
        key={item.path}
        component={Link}
        to={item.path}
        size="sm"
        c="blue"
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          textDecoration: 'none',
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.7';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        {item.icon && <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>}
        {item.label}
      </Anchor>
    );
  });

  return (
    <Breadcrumbs
      separator={<ChevronRight size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
      style={{ 
        padding: '0.75rem 0',
        marginBottom: '0.75rem',
        borderBottom: '1px solid var(--mantine-color-default-border)'
      }}
    >
      {items}
    </Breadcrumbs>
  );
};

export default Breadcrumb;
