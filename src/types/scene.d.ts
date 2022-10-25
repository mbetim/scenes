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
  codeProjects: string[];
}
