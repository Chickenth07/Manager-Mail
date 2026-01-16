import { Plugin, ButtonView } from "ckeditor5";

export default class AttachFilePlugin extends Plugin {
  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add("attachFile", locale => {
      const button = new ButtonView(locale);

      button.set({
        label: "Đính kèm file",
        withText: true,
        tooltip: true,
      });

      button.on("execute", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar";

        input.onchange = () => {
          const files = Array.from(input.files);
          if (!files.length) return;

          editor.fire("attach-files", files);

          editor.model.change(writer => {
            const position =
              editor.model.document.selection.getFirstPosition();

            files.forEach(file => {
              writer.insertText(
                `📎 ${file.name}\n`,
                position
              );
            });
          });
        };

        input.click();
      });

      return button;
    });
  }
}
