// Xbox 360 Achievement Definitions
export interface Achievement {
  id: string;
  title: string;
  description: string;
  gamerscore: number;
  icon?: string;
  trigger: AchievementTrigger;
}

export type AchievementTrigger =
  | { type: 'first-visit' }
  | { type: 'visit'; section: string }
  | { type: 'visit-all'; sections: string[] }
  | { type: 'time-spent'; seconds: number }
  | { type: 'interaction'; action: string }
  | { type: 'custom'; id: string };

export const achievements: Achievement[] = [
  {
    id: 'first-visit',
    title: 'Welcome!',
    description: 'Visited the portfolio for the first time',
    gamerscore: 10,
    trigger: { type: 'first-visit' },
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Visited all sections of the portfolio',
    gamerscore: 20,
    trigger: { type: 'visit-all', sections: ['home', 'projects', 'resume'] },
  },
  {
    id: 'project-viewer',
    title: 'Project Enthusiast',
    description: 'Checked out the projects section',
    gamerscore: 15,
    trigger: { type: 'visit', section: 'projects' },
  },
  {
    id: 'resume-viewer',
    title: 'Getting to Know You',
    description: 'Checked out the resume section',
    gamerscore: 10,
    trigger: { type: 'visit', section: 'resume' },
  },
  {
    id: 'connect',
    title: 'Making Connections',
    description: 'Clicked on a contact link',
    gamerscore: 15,
    trigger: { type: 'interaction', action: 'contact-click' },
  },
  {
    id: 'dedicated',
    title: 'Dedicated Visitor',
    description: 'Spent 2 minutes exploring the site',
    gamerscore: 25,
    trigger: { type: 'time-spent', seconds: 120 },
  },
  {
    id: 'guide-user',
    title: 'Power User',
    description: 'Opened the guide menu',
    gamerscore: 5,
    trigger: { type: 'interaction', action: 'guide-open' },
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}

export function getTotalPossibleGamerscore(): number {
  return achievements.reduce((sum, a) => sum + a.gamerscore, 0);
}
