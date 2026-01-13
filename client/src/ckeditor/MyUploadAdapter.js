export default class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file
      .then(file => {
        // Validate file size trước khi upload
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error('File quá lớn. Kích thước tối đa là 5MB');
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Chỉ chấp nhận file ảnh');
        }

        const data = new FormData();
        data.append('file', file);

        // Sử dụng biến môi trường hoặc relative URL
        const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:3000';
        
        return fetch(`${apiUrl}/api/uploads`, {
          method: 'POST',
          body: data
        })
          .then(res => {
            if (!res.ok) {
              return res.json().then(err => {
                throw new Error(err.message || 'Upload thất bại');
              });
            }
            return res.json();
          })
          .then(res => {
            if (!res.url) {
              throw new Error('Server không trả về URL của ảnh');
            }
            return {
              default: res.url
            };
          });
      })
      .catch(error => {
        console.error('Upload error:', error);
        throw error;
      });
  }

  abort() {
    // Có thể implement AbortController nếu cần
  }
}