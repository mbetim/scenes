import { Action, ActionPanel, Form, LocalStorage, popToRoot, showHUD, showToast, Toast } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";

interface FormData {
  name: string;
  path: string;
}

export default function CreateLink() {
  const { handleSubmit, itemProps } = useForm<FormData>({
    onSubmit: async (values) => {
      const toast = await showToast(Toast.Style.Animated, "Creating link...");

      const isNameInuse = await LocalStorage.getItem(`link-${values.name}`);

      if (isNameInuse) {
        toast.title = "Link name is already in use";
        toast.style = Toast.Style.Failure;
        return false;
      }

      await LocalStorage.setItem(`link-${values.name}`, JSON.stringify(values));
      showHUD("✅ Link created successfully");
      popToRoot({ clearSearchBar: true });
    },
    validation: {
      name: FormValidation.Required,
      path: FormValidation.Required,
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
      <Form.Description text="Create a new scene link" />

      <Form.TextField title="Name" placeholder="Google" {...itemProps.name} />

      <Form.TextField
        title="Path"
        placeholder="https://google.com"
        info="URL or file/folder path"
        {...itemProps.path}
      />
    </Form>
  );
}
