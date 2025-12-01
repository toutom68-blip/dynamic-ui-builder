import React from 'react';
import { LoadingSpinner } from '@/modules/shared/components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

interface LoadingPageProps {
  text?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ text }) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size="xl" text={text || t('common.loading')} />
    </div>
  );
};
