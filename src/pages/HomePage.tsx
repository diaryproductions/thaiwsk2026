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
import { DynamicSectionImages } from '../components/DynamicSectionImages';
import { SiteContent } from '../config/defaultContent';
import { NavTab } from '../components/Navbar';

interface HomePageProps {
  content: SiteContent;
  onSelectTab: (tab: NavTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ content, onSelectTab }) => {
  const otherImages = (content.siteImageItems || []).filter(
    (img) => img.section === 'other' && img.isVisible !== false && img.url?.trim()
  );

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

      {/* 5. About the Academic Project */}
      <RevealSection>
        <AboutSection
          about={content.about}
          managedImages={content.siteImageItems}
        />
      </RevealSection>

      {/* 6. Award Criteria */}
      <RevealSection>
        <AwardCriteria criteria={content.awardCriteria} />
      </RevealSection>

      {/* 7. Important Schedule & Activity Visuals */}
      <RevealSection>
        <ScheduleSection
          schedule={content.schedule}
          managedImages={content.siteImageItems}
        />
      </RevealSection>

      {/* 8. Announcements */}
      <RevealSection>
        <AnnouncementsSection
          announcements={content.announcements}
          managedImages={content.siteImageItems}
        />
      </RevealSection>

      {/* 9. Custom Admin-placed Images ('other' section) */}
      {otherImages.length > 0 && (
        <RevealSection>
          <section className="py-10 px-4 bg-[#FAF8FD] border-t border-[#D6AF55]/25">
            <div className="max-w-7xl mx-auto">
              <DynamicSectionImages
                items={content.siteImageItems}
                section="other"
              />
            </div>
          </section>
        </RevealSection>
      )}
    </div>
  );
};
