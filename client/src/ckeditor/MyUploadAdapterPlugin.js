import MyUploadAdapter from './MyUploadAdapter';

export default function MyUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => {
    return new MyUploadAdapter(loader);
  };
}
