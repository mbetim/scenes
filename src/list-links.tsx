import { List, LocalStorage } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { Link } from "./types/scene";

export default function Command() {
  const { data: links, isLoading } = usePromise(async () => {
    const savedItems = await LocalStorage.allItems();
    const filteredLinks: Link[] = [];

    for (const [key, value] of Object.entries(savedItems)) {
      if (!key.startsWith("link-")) continue;

      filteredLinks.push(JSON.parse(value));
    }

    return filteredLinks.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <List isLoading={isLoading}>
      {links?.map((link) => (
        <List.Item key={link.name} id={link.name} title={link.name} accessoryTitle={link.path} />
      ))}
    </List>
  );
}
