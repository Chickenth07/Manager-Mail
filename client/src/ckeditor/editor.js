import {
    ClassicEditor,
    Autosave,
    Essentials,
    Paragraph,
    Autoformat,
    TextTransformation,
    LinkImage,
    Link,
    ImageBlock,
    ImageToolbar,
    BlockQuote,
    Bold,
    ImageUpload,
    ImageInsert,
    ImageInsertViaUrl,
    AutoImage,
    PictureEditing,
    TableColumnResize,
    Table,
    TableToolbar,
    Emoji,
    Mention,
    Heading,
    ImageTextAlternative,
    ImageCaption,
    ImageResize,
    ImageStyle,
    Indent,
    IndentBlock,
    ImageInline,
    Italic,
    ListProperties,
    List,
    MediaEmbed,
    PasteFromOffice,
    TableCaption,
    TableCellProperties,
    TableProperties,
    TodoList,
    Underline,
    GeneralHtmlSupport
  } from "ckeditor5";
  
  export default class Editor extends ClassicEditor {}
  
  Editor.builtinPlugins = [
    Autoformat,
    AutoImage,
    Autosave,
    BlockQuote,
    Bold,
    Emoji,
    Essentials,
    Heading,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsert,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    List,
    ListProperties,
    MediaEmbed,
    Mention,
    Paragraph,
    PasteFromOffice,
    PictureEditing,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextTransformation,
    TodoList,
    Underline,
    GeneralHtmlSupport
  ];
  
  Editor.defaultConfig = {
    licenseKey: "GPL",
    language: "vi",
  
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "emoji",
        "link",
        "insertImage",
        "mediaEmbed",
        "insertTable",
        "blockQuote",
        "|",
        "bulletedList",
        "numberedList",
        "todoList",
        "outdent",
        "indent"
      ]
    },
  
    image: {
      toolbar: [
        "imageTextAlternative",
        "|",
        "imageStyle:alignLeft",
        "imageStyle:alignCenter",
        "imageStyle:alignRight",
        "|",
        "resizeImage"
      ]
    },
  
    htmlSupport: {
      allow: [
        {
          name: /.*/,
          attributes: true,
          classes: true,
          styles: true
        }
      ]
    }
  };
  