import {
  Action,
  ActionPanel,
  Form,
  getApplications,
  LocalStorage,
  popToRoot,
  showHUD,
  showToast,
  Toast,
} from "@raycast/api";
import { FormValidation, useForm, usePromise } from "@raycast/utils";
import { useMemo } from "react";
import { useLinks } from "./hooks/useLinks";
import { Scene } from "./types/scene";
import { getCodeProjects } from "./utils/getCodeProjects";

export default function CreateScene() {
  const { data: computerApplications } = usePromise(getApplications, []);
  const codeProjects = useMemo(() => getCodeProjects(), []);
  const { data: links } = useLinks();

  const { handleSubmit, itemProps } = useForm({
    onSubmit: async (values: Scene) => {
      const toast = await showToast(Toast.Style.Animated, "Creating Scene...");

      const isSceneNameInUse = await LocalStorage.getItem(`scene-${values.name}`);

      if (isSceneNameInUse) {
        toast.title = "Scene name is already in use";
        toast.style = Toast.Style.Failure;
        return false;
      }

      await LocalStorage.setItem(`scene-${values.name}`, JSON.stringify(values));
      showHUD("✅ Scene created successfully");
      popToRoot({ clearSearchBar: true });
    },
    validation: { name: FormValidation.Required },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="Create a new scene" />

      <Form.TextField title="Name" placeholder="Work" {...itemProps.name} />

      <Form.TextArea title="Description" placeholder="Open all apps required for work" {...itemProps.description} />

      <Form.Separator />

      <Form.TagPicker title="Applications" {...itemProps.applications}>
        {computerApplications?.map((application) => (
          <Form.TagPicker.Item key={application.name} value={application.name} title={application.name} />
        ))}
      </Form.TagPicker>

      <Form.TagPicker title="Code Projects" {...itemProps.codeProjects}>
        {codeProjects?.map((project) => (
          <Form.TagPicker.Item key={project.name} value={project.name} title={project.name} />
        ))}
      </Form.TagPicker>

      <Form.TagPicker title="Open in Terminal" {...itemProps.openInTerminal}>
        {links?.map((link) => (
          <Form.TagPicker.Item key={link.name} value={link.name} title={link.name} />
        ))}
      </Form.TagPicker>

      <Form.TagPicker title="Open in Browser" {...itemProps.openInBrowser}>
        {links?.map((link) => (
          <Form.TagPicker.Item key={link.name} value={link.name} title={link.name} />
        ))}
      </Form.TagPicker>
    </Form>
  );
}
