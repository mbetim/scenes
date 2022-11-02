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
import { Fragment, useMemo } from "react";
import CreateScene from "./create-scene";
import { useLinks } from "./hooks/useLinks";
import { CodeProject, Scene } from "./types/scene";
import { getCodeProjects } from "./utils/getCodeProjects";

const openApplication = async (applicationPath: string) => {
  const formattedPath = applicationPath.replace(/\s/g, "\\ ");
  exec(`open ${formattedPath}`);
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const openCodeProjects = async (codeProjects: CodeProject[]) => {
  for (const codeProject of codeProjects) {
    await open(codeProject.rootPath, "com.microsoft.VSCode");

    // Wait for VSCode to open (otherwise it will open all projects in a single window)
    await wait(250);
  }
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

  const parsedScenes = useMemo(() => {
    if (!scenes) return [];

    return scenes.map((scene) => {
      const details: { title: string; tags: string[] }[] = [];

      if (scene.applications.length > 0) {
        details.push({ title: "Applications", tags: scene.applications });
      }

      if (scene.codeProjects && scene.codeProjects.length > 0) {
        details.push({ title: "Code Projects", tags: scene.codeProjects });
      }

      if (scene.openInTerminal && scene.openInTerminal.length > 0) {
        details.push({ title: "Open in Terminal", tags: scene.openInTerminal });
      }

      if (scene.openInBrowser && scene.openInBrowser.length > 0) {
        details.push({ title: "Open in Browser", tags: scene.openInBrowser });
      }

      return { ...scene, details };
    });
  }, [scenes]);

  const { data: links } = useLinks();

  const runScene = async (scene: Scene) => {
    const toast = await showToast(Toast.Style.Animated, "Running Scene...");

    const computerApplications = await getApplications();
    const codeProjects = getCodeProjects();

    const filteredApplications = computerApplications.filter((application) =>
      scene.applications.includes(application.name)
    );
    const filteredCodeProjects = codeProjects.filter((codeProject) => scene.codeProjects?.includes(codeProject.name));
    const filteredOpenInBrowser = links?.filter((link) => scene.openInBrowser?.includes(link.name)) ?? [];
    const filteredOpenInTerminal = links?.filter((link) => scene.openInTerminal?.includes(link.name)) ?? [];

    await Promise.all([
      filteredApplications.map((application) => openApplication(application.path)),
      openCodeProjects(filteredCodeProjects),
      filteredOpenInBrowser.map(({ path }) => open(path)),
      filteredOpenInTerminal.map(({ path }) => open(path, "iTerm")),
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
    <List isShowingDetail isLoading={isLoading}>
      {parsedScenes.map((scene) => (
        <List.Item
          key={scene.name}
          title={scene.name}
          subtitle={scene.description}
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  {scene.details.map((detail, index) => (
                    <Fragment key={detail.title}>
                      <List.Item.Detail.Metadata.TagList title={detail.title}>
                        {detail.tags.map((tag) => (
                          <List.Item.Detail.Metadata.TagList.Item key={tag} text={tag} />
                        ))}
                      </List.Item.Detail.Metadata.TagList>

                      {index < scene.details.length - 1 ? <List.Item.Detail.Metadata.Separator /> : null}
                    </Fragment>
                  ))}
                </List.Item.Detail.Metadata>
              }
            />
          }
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
