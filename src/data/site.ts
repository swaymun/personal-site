export const devices = [
  { id: 'gba', label: 'GBA SP', name: 'Game Boy Advance SP', color: 'Cobalt blue', year: '2003', game: 'Cloudstep', genre: 'A little platform adventure', instructions: 'Move with ← → or A/D. A / Z / Space jumps. Reach the flag in all three stages. Yellow diamonds are worth 10 points; the halfway flag is a checkpoint.', width: 360, height: 640, screen: [48, 58, 264, 176] },
  { id: 'psp', label: 'PSP', name: 'PlayStation Portable', color: 'Piano black · PSP-3000', year: '2004', game: 'Ash & Bronze', genre: 'One arena. Three waves. One guardian.', instructions: 'Move with arrows or WASD. × / Z attacks. ○ / X dodges. Defeat three waves and the guardian. Dodge through danger; collect the green healing drops.', width: 900, height: 390, screen: [190,  54, 520, 294] },
  { id: 'ipod', label: 'iPod', name: 'iPod touch', color: '4th generation · iOS 6', year: '2010', game: 'Margin Hopper', genre: 'How high can a doodle go?', instructions: 'Jumping is automatic. Move left and right with arrows, A/D, or the touch buttons. Wrap around the sides. Land on platforms and keep climbing.', width: 320, height: 610, screen: [34, 89, 252, 378] },
  { id: '3ds', label: '3DS', name: 'Nintendo 3DS', color: 'Midnight purple', year: '2011', game: 'Pocket Ruins', genre: 'Three rooms and a hidden key', instructions: 'Move with arrows or WASD. A / Z swings your sword. Clear each room, travel through the right doorway, collect the key in room two, and unlock the last exit.', width: 520, height: 630, screen: [140, 350, 240, 180] },
  { id: 'switch', label: 'Switch', name: 'Nintendo Switch', color: 'Animal Crossing edition', year: '2017', game: 'Tidepool', genre: 'A quiet afternoon by the water', instructions: 'Move along the shore with arrows or WASD. A / Z casts. Wait for BITE!, then press A again to reel in. Catch five fish. Three missed bites end the session.', width: 1000, height: 440, screen: [172,  36, 656, 369] },
] as const;
export type DeviceId = typeof devices[number]['id'];
export const sections = ['home','work','movies','music','games','writing','links'] as const;
export type Section = typeof sections[number];
export const apps = [...sections, 'notes', 'settings'] as const;
export type AppId = typeof apps[number];
export const titles: Record<AppId,string> = {home:'Home',work:'Work',movies:'Movies',music:'Music',games:'Games',writing:'Writing',links:'Links',notes:'Notes',settings:'Settings'};
export const bio = "I'm a software engineer at Meta based in New York. Previously I was at Cash App and Amazon. Outside of work, I enjoy learning about agentic coding tools through vibe coding, playing tennis, and watching movies.";
export const experience = [
 ['Meta','Software Engineer','Jun 2024 – Present','AI Glasses'],
 ['Block','Software Engineer','Jan 2022 – Mar 2024','Cash App Account Security'],
 ['Amazon','Software Development Engineer','Jul 2020 – Dec 2021','AWS Service Catalog / Fire TV'],
 ['PNC','Software Engineering Intern','May 2019 – Aug 2019','DevOps Team'],
 ['John Deere','Software Engineering Intern','May 2018 – Aug 2018','Seeding Group'],
];
export const movies = [
 ['After Hours','1985','after-hours'], ['Catch Me If You Can','2002','catch-me-if-you-can-2002'],
 ['Infernal Affairs','2002','infernal-affairs'], ['Rope','1948','rope'],
];
export const links = [
 ['Email','mailto:saimun.shahee@gmail.com','saimun.shahee@gmail.com'],
 ['GitHub','https://github.com/swaymun','swaymun'],
 ['LinkedIn','https://linkedin.com/in/saimunshahee','saimunshahee'],
 ['X','https://x.com/saimunshahee','saimunshahee'],
 ['Letterboxd','https://letterboxd.com/swaymun/','swaymun'],
];
export const project = { title:'System Design Excalidraws', url:'https://github.com/swaymun/system-design-excalidraws', description:'Collection of diagrams and notes for system design interviews, covering Netflix, WhatsApp, Google Maps, and more.' };
