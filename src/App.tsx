import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { PublicHeader } from './components/PublicHeader';
import { PublicDrawer } from './components/PublicDrawer';

// Public Views
import { HomeHubView } from './views/public/HomeHubView';
import { AboutView } from './views/public/AboutView';
import { AppsView } from './views/public/AppsView';
import { PublicEventsView } from './views/public/PublicEventsView';
import { PublicEventDetailView } from './views/public/PublicEventDetailView';
import { PublicVolunteersRankingView } from './views/public/PublicVolunteersRankingView';
import { VolunteerInfoView } from './views/public/VolunteerInfoView';
import { ResourcesView } from './views/public/ResourcesView';
import { GalleryView } from './views/public/GalleryView';
import { FaqView } from './views/public/FaqView';
import { ContactView } from './views/public/ContactView';

// Auth Views
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ProfileSetupView } from './views/ProfileSetupView';

// Volunteer Views
import { VolunteerDashboard } from './views/volunteer/VolunteerDashboard';
import { SubmitHoursView } from './views/volunteer/SubmitHoursView';
import { MyHoursView } from './views/volunteer/MyHoursView';
import { MyEventsView } from './views/volunteer/MyEventsView';
import { MyApplicationsView } from './views/volunteer/MyApplicationsView';
import { MyCertificatesView } from './views/volunteer/MyCertificatesView';
import { VolunteerProfileView } from './views/volunteer/VolunteerProfileView';
import { SubmissionDetailModal } from './views/volunteer/SubmissionDetailModal';
import { CorrectionModal } from './views/volunteer/CorrectionModal';

// Staff Views
import { StaffDashboard } from './views/staff/StaffDashboard';
import { StaffEventsView } from './views/staff/StaffEventsView';
import { StaffApplicationsView } from './views/staff/StaffApplicationsView';
import { StaffSubmissionsView } from './views/staff/StaffSubmissionsView';
import { StaffVolunteersView } from './views/staff/StaffVolunteersView';
import { StaffStatsView } from './views/staff/StaffStatsView';
import { StaffAuditView } from './views/staff/StaffAuditView';
import { StaffManagementView } from './views/staff/StaffManagementView';

import { api } from './services/api';
import { HourSubmission } from './types';
import { useAchievementCelebration } from './hooks/useAchievementCelebration';
import { AchievementCelebrationModal } from './components/AchievementCelebrationModal';

export function App() {
  const { user, profile, loading, refreshUserData } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Global Automatic Achievement Celebration Watcher
  const { unlockedQueue, clearQueue } = useAchievementCelebration();

  // Modals
  const [detailSubmission, setDetailSubmission] = useState<HourSubmission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [correctionSubmissionId, setCorrectionSubmissionId] = useState<string | null>(null);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  // Helper to open a submission in detail
  const handleOpenSubmissionDetails = async (id: string) => {
    try {
      const res = await api.getSubmissionDetails(id);
      setDetailSubmission(res.submission);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error('Error opening submission details:', err);
    }
  };

  const handleOpenCorrection = (id: string) => {
    setCorrectionSubmissionId(id);
    setIsCorrectionModalOpen(true);
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('public-event-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Cargando DMPS Connect Hub...
        </p>
      </div>
    );
  }

  // Standalone Auth Views (Login / Register)
  if (currentView === 'login') {
    return <LoginView onNavigate={setCurrentView} />;
  }
  if (currentView === 'register') {
    return <RegisterView onNavigate={setCurrentView} />;
  }

  // Profile setup required for volunteers who just registered
  if (user && user.role === 'VOLUNTEER' && (!profile?.profile_completed || currentView === 'profile-setup')) {
    return (
      <div className="min-h-screen bg-[#050A14] text-slate-100 flex flex-col">
        <Navbar currentView={currentView} onNavigate={setCurrentView} />
        <main className="flex-1">
          <ProfileSetupView onNavigate={setCurrentView} />
        </main>
      </div>
    );
  }

  const isStaff = user && (user.role === 'STAFF' || user.role === 'ADMIN');
  const publicViews = [
    'home',
    'about',
    'apps',
    'public-ranking',
    'public-events',
    'public-event-detail',
    'volunteer-info',
    'resources',
    'gallery',
    'faq',
    'contact',
  ];
  const isPublicView = publicViews.includes(currentView);

  // If in public views: show PublicHeader + PublicDrawer + Public Content
  if (isPublicView) {
    return (
      <div className="min-h-screen bg-[#050A14] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
        <PublicHeader
          currentView={currentView}
          onNavigate={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />

        <PublicDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentView={currentView}
          onNavigate={(v) => {
            setCurrentView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <main className="flex-1">
          {currentView === 'home' && (
            <HomeHubView
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectEvent={handleSelectEvent}
            />
          )}
          {currentView === 'public-ranking' && (
            <PublicVolunteersRankingView onNavigate={setCurrentView} />
          )}
          {currentView === 'about' && <AboutView onNavigate={setCurrentView} />}
          {currentView === 'apps' && <AppsView onNavigate={setCurrentView} />}
          {currentView === 'public-events' && (
            <PublicEventsView
              onNavigate={setCurrentView}
              onSelectEvent={handleSelectEvent}
            />
          )}
          {currentView === 'public-event-detail' && selectedEventId && (
            <PublicEventDetailView
              eventId={selectedEventId}
              onNavigate={setCurrentView}
              onBack={() => setCurrentView('public-events')}
            />
          )}
          {currentView === 'volunteer-info' && <VolunteerInfoView onNavigate={setCurrentView} />}
          {currentView === 'resources' && <ResourcesView onNavigate={setCurrentView} />}
          {currentView === 'gallery' && <GalleryView onNavigate={setCurrentView} />}
          {currentView === 'faq' && <FaqView onNavigate={setCurrentView} />}
          {currentView === 'contact' && <ContactView onNavigate={setCurrentView} />}
        </main>
      </div>
    );
  }

  // If we reach here, it's a private view and user is authenticated
  if (!user) {
    return <LoginView onNavigate={setCurrentView} />;
  }

  const effectiveView = currentView;

  return (
    <div className="min-h-screen bg-[#050A14] text-slate-100 flex flex-col">
      {/* Top Navigation Bar for Authenticated Portal */}
      <Navbar
        currentView={effectiveView}
        onNavigate={setCurrentView}
        onOpenSubmission={handleOpenSubmissionDetails}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex pb-16 md:pb-0">
        {/* Desktop Sidebar for Staff/Admin */}
        {isStaff && (
          <div className="hidden md:block">
            <Sidebar
              currentView={
                effectiveView === 'dashboard' ? 'staff-dashboard' : effectiveView
              }
              onNavigate={setCurrentView}
            />
          </div>
        )}

        {/* Dynamic View Rendering */}
        <main className="flex-1 min-w-0">
          {/* Volunteer Views */}
          {!isStaff && (
            <>
              {effectiveView === 'dashboard' && (
                <VolunteerDashboard
                  onNavigate={setCurrentView}
                  onOpenSubmissionDetails={handleOpenSubmissionDetails}
                  onOpenCorrection={handleOpenCorrection}
                />
              )}
              {effectiveView === 'my-events' && (
                <MyEventsView onNavigate={setCurrentView} />
              )}
              {effectiveView === 'my-applications' && (
                <MyApplicationsView onNavigate={setCurrentView} />
              )}
              {effectiveView === 'submit-hours' && (
                <SubmitHoursView
                  onNavigate={setCurrentView}
                  onOpenMyHours={() => setCurrentView('my-hours')}
                />
              )}
              {effectiveView === 'my-hours' && (
                <MyHoursView
                  onNavigate={setCurrentView}
                  onOpenSubmissionDetails={handleOpenSubmissionDetails}
                  onOpenCorrection={handleOpenCorrection}
                />
              )}
              {(effectiveView === 'certificates' || effectiveView === 'my-certificates') && (
                <MyCertificatesView onNavigate={setCurrentView} />
              )}
              {effectiveView === 'profile' && <VolunteerProfileView />}
            </>
          )}

          {/* Staff Views */}
          {isStaff && (
            <>
              {(effectiveView === 'dashboard' || effectiveView === 'staff-dashboard') && (
                <StaffDashboard
                  onNavigate={setCurrentView}
                  onOpenSubmission={handleOpenSubmissionDetails}
                />
              )}
              {effectiveView === 'staff-events' && (
                <StaffEventsView onNavigate={setCurrentView} />
              )}
              {effectiveView === 'staff-applications' && (
                <StaffApplicationsView onNavigate={setCurrentView} />
              )}
              {effectiveView === 'staff-submissions' && <StaffSubmissionsView />}
              {effectiveView === 'staff-volunteers' && <StaffVolunteersView />}
              {effectiveView === 'staff-stats' && <StaffStatsView />}
              {effectiveView === 'staff-audit' && <StaffAuditView />}
              {effectiveView === 'staff-management' && <StaffManagementView />}
              {effectiveView === 'staff-profile' && <VolunteerProfileView />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation for Volunteers */}
      {!isStaff && (
        <BottomNav
          currentView={effectiveView}
          onNavigate={setCurrentView}
          onOpenSubmission={handleOpenSubmissionDetails}
        />
      )}

      {/* Global Modals */}
      <SubmissionDetailModal
        submission={detailSubmission}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailSubmission(null);
        }}
        onOpenCorrection={handleOpenCorrection}
        isStaff={Boolean(isStaff)}
      />

      <CorrectionModal
        submissionId={correctionSubmissionId}
        isOpen={isCorrectionModalOpen}
        onClose={() => {
          setIsCorrectionModalOpen(false);
          setCorrectionSubmissionId(null);
        }}
        onSuccess={() => {
          refreshUserData();
        }}
      />

      {/* Global Achievement & Silver Cord 160h Milestone Unlock Celebration */}
      {unlockedQueue.length > 0 && (
        <AchievementCelebrationModal
          badges={unlockedQueue}
          onClose={clearQueue}
          onNavigateToCertificates={() => {
            clearQueue();
            setCurrentView('my-certificates');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}

export default App;
