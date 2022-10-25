import { homedir } from "node:os";
import fs from "node:fs";
import { CodeProject } from "../types/scene";

export const getCodeProjects = (): CodeProject[] => {
  const projectManagerPath = `${homedir()}/Library/Application Support/Code/User/globalStorage/alefragnani.project-manager`;

  if (!fs.existsSync(projectManagerPath)) return [];

  return JSON.parse(fs.readFileSync(`${projectManagerPath}/projects.json`, "utf8"));
};
