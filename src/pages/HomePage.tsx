import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { CountdownTimer } from '../components/CountdownTimer';
import { QuickActions } from '../components/QuickActions';
import { StudyResourcesSection } from '../components/StudyResourcesSection';
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
    <div className="space-y-0 pb-8">
      {/* 1. Hero Section (Static Prominent Project Logo, No Slideshow) */}
      <HeroSection
        content={content}
        onNavigate={(tab) => onSelectTab(tab)}
      />

      {/* 2. Countdown Timer */}
      <CountdownTimer
        targetDateIso={content.siteMeta.countdownTarget}
        label={content.siteMeta.countdownLabel}
      />

      {/* 3. Three Quick Action Cards */}
      <QuickActions onSelectTab={onSelectTab} />

      {/* 4. Study & Review Resources (ม.ต้น & ม.ปลาย: PDF & YouTube) */}
      <StudyResourcesSection materials={content.studyMaterials || []} />

      {/* 5. About the Academic Project */}
      <AboutSection about={content.about} />

      {/* 6. Award Criteria */}
      <AwardCriteria criteria={content.awardCriteria} />

      {/* 7. Important Schedule */}
      <ScheduleSection schedule={content.schedule} />

      {/* 8. Announcements */}
      <AnnouncementsSection announcements={content.announcements} />
    </div>
  );
};
