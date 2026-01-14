import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from "../ckeditor/editor";

export default function EmailEditor({ value, onChange }) {
  return (
    <CKEditor
      editor={Editor}
      data={value}
      onChange={(event, editor) => {
        onChange(editor.getData());
      }}
    />
  );
}
