import React from "react";
import { StatsSection } from "../../components/StatsSection";
import { FeaturedJournalsSection } from "../../components/FeaturedJournalsSection";
import { NewsSection } from "../../components/NewsSection";

export const HomePage = () => {
  return (
    <>
      <FeaturedJournalsSection />
      <StatsSection />
      <NewsSection />
    </>
  );
};
