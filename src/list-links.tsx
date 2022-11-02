import { Action, ActionPanel, Clipboard, confirmAlert, Icon, List, LocalStorage, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import CreateLink from "./create-link";
import { Link } from "./types/scene";

export default function ListLinks() {
  const {
    data: links,
    isLoading,
    revalidate,
  } = usePromise(async () => {
    const savedItems = await LocalStorage.allItems();
    const filteredLinks: Link[] = [];

    for (const [key, value] of Object.entries(savedItems)) {
      if (!key.startsWith("link-")) continue;

      filteredLinks.push(JSON.parse(value));
    }

    return filteredLinks.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleCopy = async (link: Link) => {
    await Clipboard.copy(link.path);
    showToast(Toast.Style.Success, "Copied to clipboard");
  };

  const handleDelete = async (link: Link) => {
    if (
      await confirmAlert({
        title: "Delete Link",
        message: `Are you sure you want to delete the link "${link.name}"?\n(All scenes using it will still execute the other actions)`,
      })
    ) {
      await LocalStorage.removeItem(`link-${link.name}`);
      await revalidate();
      showToast(Toast.Style.Success, "Scene deleted successfully");
    }
  };

  return (
    <List isLoading={isLoading}>
      {links?.map((link) => (
        <List.Item
          key={link.name}
          id={link.name}
          title={link.name}
          accessoryTitle={link.path}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action title="Copy" icon={Icon.CopyClipboard} onAction={() => handleCopy(link)} />

                <Action.Push
                  title="Create link"
                  icon={Icon.Plus}
                  shortcut={{ modifiers: ["cmd"], key: "n" }}
                  target={<CreateLink />}
                />

                <Action
                  title="Delete link"
                  icon={Icon.Trash}
                  onAction={() => handleDelete(link)}
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
