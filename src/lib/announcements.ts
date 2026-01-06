// Announcement localStorage utilities

interface AnnouncementState {
  viewedIds: string[];
  lastViewedDate: string | null;
}

const STORAGE_KEY = 'xbox-announcements';

export function getAnnouncementState(): AnnouncementState {
  if (typeof localStorage === 'undefined') {
    return { viewedIds: [], lastViewedDate: null };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { viewedIds: [], lastViewedDate: null };
    }
  }
  return { viewedIds: [], lastViewedDate: null };
}

export function markAsViewed(id: string): void {
  if (typeof localStorage === 'undefined') return;

  const state = getAnnouncementState();
  if (!state.viewedIds.includes(id)) {
    state.viewedIds.push(id);
    state.lastViewedDate = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function markAllAsViewed(ids: string[]): void {
  if (typeof localStorage === 'undefined') return;

  const state = getAnnouncementState();
  for (const id of ids) {
    if (!state.viewedIds.includes(id)) {
      state.viewedIds.push(id);
    }
  }
  state.lastViewedDate = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isViewed(id: string): boolean {
  const state = getAnnouncementState();
  return state.viewedIds.includes(id);
}

export function hasUnviewedAnnouncements(ids: string[]): boolean {
  const state = getAnnouncementState();
  return ids.some((id) => !state.viewedIds.includes(id));
}

export function getUnviewedCount(ids: string[]): number {
  const state = getAnnouncementState();
  return ids.filter((id) => !state.viewedIds.includes(id)).length;
}
