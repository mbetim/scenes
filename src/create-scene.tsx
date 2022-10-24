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
import { Scene } from "./types/scene";

export default function Command() {
  const { data: computerApplications } = usePromise(getApplications, []);

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
    validation: {
      name: FormValidation.Required,
      applications: (value) => (!value || value.length === 0 ? "Please select at least one application" : undefined),
    },
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

      <Form.TagPicker title="Applications (you can select multiple options)" {...itemProps.applications}>
        {computerApplications?.map((application) => (
          <Form.TagPicker.Item key={application.name} value={application.name} title={application.name} />
        ))}
      </Form.TagPicker>
    </Form>
  );
}
