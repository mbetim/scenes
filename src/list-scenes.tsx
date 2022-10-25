import {
  Action,
  ActionPanel,
  confirmAlert,
  getApplications,
  Icon,
  List,
  LocalStorage,
  open,
  showToast,
  Toast,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { exec } from "child_process";
import tildify from "tildify";
import CreateScene from "./create-scene";
import { Scene } from "./types/scene";
import { getCodeProjects } from "./utils/getCodeProjects";

const openApplication = async (applicationPath: string) => exec(`open ${applicationPath}`);

const openCodeProject = async (codeProjectPath: string) => {
  const path = tildify(codeProjectPath);
  return await open(path, "Visual Studio Code");
};

const makeAccessoryText = (scene: Scene) => {
  const { applications, codeProjects } = scene;
  const accessoryText = [];

  if (applications.length > 0) {
    accessoryText.push(`${applications.length} app${applications.length > 1 ? "s" : ""}`);
  }

  if (codeProjects && codeProjects.length > 0) {
    accessoryText.push(`${codeProjects.length} project${codeProjects.length > 1 ? "s" : ""}`);
  }

  return accessoryText.join(" and ");
};

export default function Command() {
  const {
    data: scenes,
    isLoading,
    revalidate,
  } = usePromise(async () => {
    const savedScenes = await LocalStorage.allItems();
    const filteredScenes: Scene[] = [];

    for (const [key, value] of Object.entries(savedScenes)) {
      if (!key.startsWith("scene-")) continue;

      filteredScenes.push(JSON.parse(value));
    }

    return filteredScenes.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const runScene = async (scene: Scene) => {
    const toast = await showToast(Toast.Style.Animated, "Running Scene...");

    const computerApplications = await getApplications();
    const codeProjects = getCodeProjects();

    const filteredApplications = computerApplications.filter((application) =>
      scene.applications.includes(application.name)
    );
    const filteredCodeProjects = codeProjects.filter((codeProject) => scene.codeProjects?.includes(codeProject.name));

    await Promise.all([
      ...filteredApplications.map((application) => openApplication(application.path)),
      ...filteredCodeProjects.map((codeProject) => openCodeProject(codeProject.rootPath)),
    ]);
    toast.title = "Scene ran successfully";
    toast.style = Toast.Style.Success;
  };

  const deleteScene = async (scene: Scene) => {
    if (
      await confirmAlert({
        title: "Delete Scene",
        message: `Are you sure you want to delete the scene "${scene.name}"?`,
      })
    ) {
      await LocalStorage.removeItem(`scene-${scene.name}`);
      await revalidate();
      showToast(Toast.Style.Success, "Scene deleted successfully");
    }
  };

  return (
    <List isLoading={isLoading}>
      {scenes?.map((scene) => (
        <List.Item
          key={scene.name}
          title={scene.name}
          subtitle={scene.description}
          accessories={[{ text: makeAccessoryText(scene) }]}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action title="Run scene" icon={Icon.Play} onAction={() => runScene(scene)} />

                <Action.Push
                  title="Create scene"
                  icon={Icon.Plus}
                  shortcut={{ modifiers: ["cmd"], key: "n" }}
                  target={<CreateScene />}
                />

                <Action
                  title="Delete scene"
                  icon={Icon.Trash}
                  onAction={() => deleteScene(scene)}
                  shortcut={{ modifiers: ["ctrl"], key: "x" }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
