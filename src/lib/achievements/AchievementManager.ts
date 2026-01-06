// Xbox 360 Achievement Manager
import { achievements, type Achievement } from './achievements';
import { audioManager } from '../audio/AudioManager';

interface AchievementState {
  unlocked: string[];
  visitedSections: string[];
  interactions: Record<string, number>;
  startTime: number;
}

class AchievementManager {
  private static instance: AchievementManager | null = null;
  private state: AchievementState;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.state = this.loadState();
    this.startTimeTracking();
  }

  static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  private loadState(): AchievementState {
    if (typeof localStorage === 'undefined') {
      return this.getDefaultState();
    }

    const saved = localStorage.getItem('xbox-achievements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...this.getDefaultState(),
          ...parsed,
          startTime: Date.now(), // Reset start time each session
        };
      } catch {
        return this.getDefaultState();
      }
    }
    return this.getDefaultState();
  }

  private getDefaultState(): AchievementState {
    return {
      unlocked: [],
      visitedSections: [],
      interactions: {},
      startTime: Date.now(),
    };
  }

  private saveState(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('xbox-achievements', JSON.stringify(this.state));
  }

  private startTimeTracking(): void {
    if (typeof window === 'undefined') return;

    // Check time-based achievements every 10 seconds
    this.checkInterval = setInterval(() => {
      this.checkAchievements();
    }, 10000);
  }

  trackSectionVisit(section: string): void {
    if (!this.state.visitedSections.includes(section)) {
      this.state.visitedSections.push(section);
      this.saveState();
      this.checkAchievements();
    }
  }

  trackInteraction(action: string): void {
    this.state.interactions[action] = (this.state.interactions[action] || 0) + 1;
    this.saveState();
    this.checkAchievements();
  }

  private checkAchievements(): void {
    for (const achievement of achievements) {
      if (this.state.unlocked.includes(achievement.id)) continue;

      if (this.checkTrigger(achievement)) {
        this.unlock(achievement);
      }
    }
  }

  private checkTrigger(achievement: Achievement): boolean {
    const trigger = achievement.trigger;

    switch (trigger.type) {
      case 'first-visit':
        // Unlock on first visit (only if not already unlocked)
        return true;

      case 'visit':
        return this.state.visitedSections.includes(trigger.section);

      case 'visit-all':
        return trigger.sections.every((s) => this.state.visitedSections.includes(s));

      case 'time-spent':
        const elapsed = (Date.now() - this.state.startTime) / 1000;
        return elapsed >= trigger.seconds;

      case 'interaction':
        return (this.state.interactions[trigger.action] || 0) > 0;

      case 'custom':
        // Custom triggers handled externally
        return false;

      default:
        return false;
    }
  }

  private unlock(achievement: Achievement): void {
    if (this.state.unlocked.includes(achievement.id)) return;

    this.state.unlocked.push(achievement.id);
    this.saveState();

    // Play achievement sound
    audioManager.play('achievement');

    // Dispatch event for toast notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('achievement-unlocked', {
          detail: achievement,
        })
      );
    }

    // Update gamerscore display
    this.updateGamerscoreDisplay();
  }

  private updateGamerscoreDisplay(): void {
    if (typeof document === 'undefined') return;

    const display = document.getElementById('gamerscore-display');
    if (display) {
      display.textContent = String(this.getTotalGamerscore());
    }
  }

  getUnlockedAchievements(): Achievement[] {
    return achievements.filter((a) => this.state.unlocked.includes(a.id));
  }

  getTotalGamerscore(): number {
    return this.getUnlockedAchievements().reduce((sum, a) => sum + a.gamerscore, 0);
  }

  isUnlocked(achievementId: string): boolean {
    return this.state.unlocked.includes(achievementId);
  }

  // Initialize on page load
  init(): void {
    // Check first visit achievement
    this.checkAchievements();

    // Update gamerscore display
    this.updateGamerscoreDisplay();
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

export const achievementManager = AchievementManager.getInstance();
