import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ACHIEVEMENTS_CATALOG, AchievementBadge, checkBadgeUnlocked } from '../data/achievementsCatalog';

export function useAchievementCelebration() {
  const { user, profile, stats } = useAuth();
  const [unlockedQueue, setUnlockedQueue] = useState<AchievementBadge[]>([]);
  const isInitialSyncRef = useRef<boolean>(true);

  // Evaluate newly unlocked badges
  const checkNewAchievements = useCallback(() => {
    if (!user || user.role !== 'VOLUNTEER') return;

    const approvedMinutes = stats?.approved_minutes || profile?.approved_minutes || 0;
    const approvedHours = approvedMinutes / 60;
    const totalSubmissions = stats?.total_submissions || profile?.total_submissions || 0;
    const reviewsCount = (profile as any)?.reviews_count || 0;
    const ratingAvg = (profile as any)?.rating_avg || 5.0;

    const statsObj = {
      approvedHours,
      approvedMinutes,
      totalSubmissions,
      reviewsCount,
      ratingAvg,
    };

    // Calculate all badges that are currently unlocked
    const currentlyUnlocked = ACHIEVEMENTS_CATALOG.filter((badge) =>
      checkBadgeUnlocked(badge, statsObj)
    );

    const storageKey = `dmps_seen_badges_${user.id}`;
    const rawStored = localStorage.getItem(storageKey);

    if (rawStored === null) {
      // First time user opens the app: if they already have badges (e.g. initial demo state),
      // mark them as seen so we don't spam 10 modals on first load,
      // UNLESS they just reached 160h or have 1 specific badge.
      const currentIds = currentlyUnlocked.map((b) => b.id);
      localStorage.setItem(storageKey, JSON.stringify(currentIds));
      return;
    }

    try {
      const seenIds: string[] = JSON.parse(rawStored) || [];
      const newBadges = currentlyUnlocked.filter((b) => !seenIds.includes(b.id));

      if (newBadges.length > 0) {
        // Queue celebration modal
        setUnlockedQueue((prev) => {
          const existingIds = new Set(prev.map((b) => b.id));
          const toAdd = newBadges.filter((b) => !existingIds.has(b.id));
          return [...prev, ...toAdd];
        });

        // Update stored list
        const updatedIds = Array.from(new Set([...seenIds, ...newBadges.map((b) => b.id)]));
        localStorage.setItem(storageKey, JSON.stringify(updatedIds));
      }
    } catch (e) {
      console.error('Error checking new achievements:', e);
    }
  }, [user, profile, stats]);

  useEffect(() => {
    checkNewAchievements();
  }, [checkNewAchievements]);

  const clearQueue = useCallback(() => {
    setUnlockedQueue([]);
  }, []);

  const triggerCelebration = useCallback((badge: AchievementBadge) => {
    setUnlockedQueue([badge]);
  }, []);

  return {
    unlockedQueue,
    clearQueue,
    triggerCelebration,
    checkNewAchievements,
  };
}
