export default function FileAttachment({ files, setFiles }) {
    const onChange = (e) => {
      setFiles(Array.from(e.target.files));
    };
  
    const removeFile = (index) => {
      setFiles(files.filter((_, i) => i !== index));
    };
  
    return (
      <div className="mt-3">
        <label className="block font-medium mb-1">File đính kèm</label>
  
        <input
          type="file"
          multiple
          onChange={onChange}
          className="block w-full"
        />
  
        <ul className="mt-2 text-sm">
          {files.map((file, index) => (
            <li key={index} className="flex justify-between">
              {file.name}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500"
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  