import { Action, ActionPanel, confirmAlert, getApplications, List, LocalStorage, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { Scene } from "./types/scene";
import { exec } from "child_process";

const openApplication = async (applicationPath: string) => {
  return exec(`open ${applicationPath}`);
};

export default function Command() {
  const {
    data: scenes,
    isLoading,
    revalidate,
  } = usePromise(async () => {
    const scenes = await LocalStorage.allItems();

    return Object.entries(scenes)
      .filter(([key]) => key.startsWith("scene-"))
      .map(([_, value]) => JSON.parse(value) as Scene);
  }, []);

  const runScene = async (scene: Scene) => {
    const toast = await showToast(Toast.Style.Animated, "Running Scene...");

    const computerApplications = await getApplications();
    const filteredApplications = computerApplications.filter((application) =>
      scene.applications.includes(application.name)
    );

    await Promise.all(filteredApplications.map((application) => openApplication(application.path)));
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
          accessories={[{ text: `${scene.applications.length} apps` }]}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action title="Run scene" onAction={() => runScene(scene)} />

                <Action
                  title="Delete scene"
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
