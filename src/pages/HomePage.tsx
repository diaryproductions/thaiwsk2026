import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { CountdownTimer } from '../components/CountdownTimer';
import { QuickActions } from '../components/QuickActions';
import { StudyResourcesSection } from '../components/StudyResourcesSection';
import { AboutSection } from '../components/AboutSection';
import { AwardCriteria } from '../components/AwardCriteria';
import { ScheduleSection } from '../components/ScheduleSection';
import { AnnouncementsSection } from '../components/AnnouncementsSection';
import { RevealSection } from '../components/RevealSection';
import { SiteContent } from '../config/defaultContent';
import { NavTab } from '../components/Navbar';

interface HomePageProps {
  content: SiteContent;
  onSelectTab: (tab: NavTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ content, onSelectTab }) => {
  return (
    <div className="space-y-0">
      {/* 1. Centered Academic Hero Section */}
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
      <RevealSection>
        <QuickActions onSelectTab={onSelectTab} />
      </RevealSection>

      {/* 4. Study & Review Resources (ม.ต้น & ม.ปลาย: PDF & YouTube) */}
      <RevealSection>
        <StudyResourcesSection materials={content.studyMaterials || []} />
      </RevealSection>

      {/* 5. About the Academic Project (Centered Content Layout) */}
      <RevealSection>
        <AboutSection about={content.about} />
      </RevealSection>

      {/* 6. Award Criteria */}
      <RevealSection>
        <AwardCriteria criteria={content.awardCriteria} />
      </RevealSection>

      {/* 7. Important Schedule */}
      <RevealSection>
        <ScheduleSection schedule={content.schedule} />
      </RevealSection>

      {/* 8. Announcements */}
      <RevealSection>
        <AnnouncementsSection announcements={content.announcements} />
      </RevealSection>
    </div>
  );
};
