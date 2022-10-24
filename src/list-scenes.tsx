import { List, LocalStorage } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { Scene } from "./types/scene";

export default function Command() {
  const { data: scenes, isLoading } = usePromise(async () => {
    const scenes = await LocalStorage.allItems();

    return Object.entries(scenes)
      .filter(([key]) => key.startsWith("scene-"))
      .map(([_, value]) => JSON.parse(value) as Scene);
  }, []);

  return (
    <List isLoading={isLoading}>
      {scenes?.map((scene) => (
        <List.Item
          key={scene.name}
          title={scene.name}
          subtitle={scene.description}
          accessories={[{ text: `${scene.applications.length} apps` }]}
        />
      ))}
    </List>
  );
}
