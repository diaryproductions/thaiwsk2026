import React from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { CountdownTimer } from '../components/CountdownTimer';
import { QuickActions } from '../components/QuickActions';
import { AboutSection } from '../components/AboutSection';
import { AwardCriteria } from '../components/AwardCriteria';
import { ScheduleSection } from '../components/ScheduleSection';
import { AnnouncementsSection } from '../components/AnnouncementsSection';
import { SiteContent } from '../config/defaultContent';
import { NavTab } from '../components/Navbar';

interface HomePageProps {
  content: SiteContent;
  onSelectTab: (tab: NavTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ content, onSelectTab }) => {
  return (
    <div className="space-y-0">
      {/* 1. Hero Banner with Image Slider */}
      <HeroSlider
        slides={content.heroSlides}
        onNavigate={(tab) => onSelectTab(tab)}
      />

      {/* 2. Countdown Timer */}
      <CountdownTimer
        targetDateIso={content.siteMeta.countdownTarget}
        label={content.siteMeta.countdownLabel}
      />

      {/* 3. Three Quick Action Cards */}
      <QuickActions onSelectTab={onSelectTab} />

      {/* 4. About the Academic Project */}
      <AboutSection about={content.about} />

      {/* 5. Award Criteria */}
      <AwardCriteria criteria={content.awardCriteria} />

      {/* 6. Important Schedule */}
      <ScheduleSection schedule={content.schedule} />

      {/* 7. Announcements */}
      <AnnouncementsSection announcements={content.announcements} />
    </div>
  );
};
