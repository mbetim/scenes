import { LocalStorage } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { Link } from "../types/scene";

export const useLinks = () => {
  return usePromise(async () => {
    const savedLinks = await LocalStorage.allItems();
    const filteredLinks: Link[] = [];

    for (const [key, value] of Object.entries(savedLinks)) {
      if (!key.startsWith("link-")) continue;

      filteredLinks.push(JSON.parse(value));
    }

    return filteredLinks.sort((a, b) => a.name.localeCompare(b.name));
  }, []);
};
