export interface Link {
  name: string;
  path: string;
}

export interface CodeProject {
  name: string;
  rootPath: string;
  tags: string[];
  enabled: boolean;
}

export interface Scene {
  name: string;
  description: string;
  applications: string[];
  codeProjects?: string[];
  openInBrowser?: string[];
  openInTerminal?: string[];
}
