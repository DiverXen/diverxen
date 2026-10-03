export interface WorkProject {
  id: string;
  title: string;
  category: "ui-ux" | "branding" | "all";
  tag: string;
  description: string;
  imageSrc: string;
  aspectRatio?: string;
}

export const WORK_PROJECTS_ALL: WorkProject[] = [
  {
    id: "sintech",
    title: "Title for the project here",
    category: "ui-ux",
    tag: "Websites",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work/card-front-sintech.png",
  },
  {
    id: "cybersabra",
    title: "Title for the project here",
    category: "ui-ux",
    tag: "Applications",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work/card-crimson-frame.png",
  },
  {
    id: "belter",
    title: "Title for the project here",
    category: "branding",
    tag: "Branding",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work/card-green-pattern.png",
  },
];

export const WORK_PROJECTS_UI_UX: WorkProject[] = [
  {
    id: "uiux-cybersabra-1",
    title: "Title for the project here",
    category: "ui-ux",
    tag: "Applications",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work/card-crimson-frame.png",
  },
  {
    id: "uiux-sintech-2",
    title: "Title for the project here",
    category: "ui-ux",
    tag: "Websites",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work/card-front-sintech.png",
  },
  {
    id: "uiux-cybersabra-3",
    title: "Title for the project here",
    category: "ui-ux",
    tag: "Applications",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work/card-crimson-frame.png",
  },
];

export const WORK_PROJECTS_BRANDING: WorkProject[] = [
  {
    id: "branding-belter-1",
    title: "Title for the project here",
    category: "branding",
    tag: "Branding",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work/card-green-pattern.png",
  },
  {
    id: "branding-cybersabra-2",
    title: "Title for the project here",
    category: "branding",
    tag: "Identity",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work/card-crimson-frame.png",
  },
  {
    id: "branding-getec-3",
    title: "Title for the project here",
    category: "branding",
    tag: "Visual Design",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    imageSrc: "/images/work/card-dark-slab.png",
  },
];

export interface FilterTabConfig {
  id: "all" | "ui-ux" | "branding";
  label: string;
  href: string;
}

export const WORK_FILTER_TABS: FilterTabConfig[] = [
  { id: "all", label: "All Projects", href: "/work" },
  { id: "ui-ux", label: "UI/UX Designing", href: "/work/ui-ux" },
  { id: "branding", label: "Branding", href: "/work/branding" },
];
