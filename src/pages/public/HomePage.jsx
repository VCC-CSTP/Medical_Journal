import React from 'react'
import { StatsSection } from './StatsSection'
import { FeaturedJournalsSection } from './FeaturedJournalsSection';
import { NewsSection } from './NewsSection';

export const HomePage = () => {
  return (
    <>
      <FeaturedJournalsSection />
      <StatsSection />
      <NewsSection />
    </>
  );
}
