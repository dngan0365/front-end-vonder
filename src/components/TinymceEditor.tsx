import { Editor } from '@tinymce/tinymce-react';
import { useRef, useState } from 'react';
import { uploadImage } from '../api/upload';

interface TinyMCEEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TinyMCEEditor({ value, onChange }: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleEditorChange = (content: any) => {
    onChange(content);
  };

  const placeCursorAtEnd = () => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus();
      setTimeout(() => {
        if (editor.selection && editor.getBody()) {
          editor.selection.select(editor.getBody(), true);
          editor.selection.collapse(false);
        }
      }, 0);
    }
  };

  return (
    <>
      {uploadError && (
        <div className="text-red-500 mb-2 p-2 bg-red-50 rounded">
          Upload error: {uploadError}
        </div>
      )}
      <Editor
        apiKey="wo5yr5cvm21r10czqjpc8cx0jazms2ld0qx1eexiit6tvx2l"
        onInit={(evt, editor) => {
          editorRef.current = editor;
          placeCursorAtEnd();
        }}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          plugins: [
            'anchor',
            'autolink',
            'charmap',
            'codesample',
            'emoticons',
            'image',
            'lists',
            'media',
            'searchreplace',
            'visualblocks',
            'wordcount',
          ],
          toolbar:
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | checklist numlist bullist indent outdent | align | image media | spellcheckdialog a11ycheck typography | emoticons charmap | removeformat',
          tinycomments_mode: 'embedded',
          tinycomments_author: 'Author name',
          mergetags_list: [
            { value: 'First.Name', title: 'First Name' },
            { value: 'Email', title: 'Email' },
          ],
          ai_request: (request: any, respondWith: any) =>
            respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
          images_upload_handler: async (blobInfo: any, progress: any) => {
            setUploadError(null);
            try {
              const file = new File([blobInfo.blob()], blobInfo.filename(), {
                type: blobInfo.blob().type,
              });

              console.log(`Attempting to upload file: ${file.name}`);
              const response = await uploadImage(file);
              console.log('Upload response:', response);

              if (response.success && response.url) {
                console.log(`Upload successful, returning URL: ${response.url}`);
                return response.url;
              } else {
                const errorMsg = response.error || 'Upload failed';
                console.error(`Upload failed: ${errorMsg}`);
                setUploadError(errorMsg);
                throw new Error(errorMsg);
              }
            } catch (error) {
              console.error('Error in images_upload_handler:', error);
              setUploadError(error instanceof Error ? error.message : 'Unknown upload error');
              throw error;
            }
          },
          automatic_uploads: true,
          file_picker_types: 'image',
          file_picker_callback: (callback: any, value: any, meta: any) => {
            if (meta.filetype === 'image') {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');

              input.addEventListener('change', async (e: any) => {
                setUploadError(null);
                const file = e.target.files[0];

                if (file) {
                  try {
                    console.log(`File picker attempting to upload: ${file.name}`);
                    const response = await uploadImage(file);
                    console.log('File picker upload response:', response);
                    
                    if (response.success && response.url) {
                      console.log(`File picker upload successful: ${response.url}`);
                      callback(response.url, { title: file.name });
                    } else {
                      const errorMsg = response.error || 'Upload failed';
                      console.error(`File picker upload failed: ${errorMsg}`);
                      setUploadError(errorMsg);
                    }
                  } catch (error) {
                    setUploadError(error instanceof Error ? error.message : 'File upload error');
                    console.error('File upload error:', error);
                  }
                }
              });

              input.click();
            }
          },
          images_reuse_filename: true,
          exportpdf_converter_options: {
            format: 'Letter',
            margin_top: '1in',
            margin_right: '1in',
            margin_bottom: '1in',
            margin_left: '1in',
          },
          exportword_converter_options: { document: { size: 'Letter' } },
          importword_converter_options: {
            formatting: { styles: 'inline', resets: 'inline', defaults: 'inline' },
          },
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              font-size: 16px;
              line-height: 1.6;
              color: #374151;
              background-color: #ffffff;
              padding: 1rem;
              margin: 0;
              max-width: 100%;
            }
            p { margin: 0 0 1rem 0; }
            h1, h2, h3, h4, h5, h6 { margin: 1.5rem 0 1rem 0; }
          `,
          width: '100%',
          min_height: 650,
          resize: true,
          autoresize_bottom_margin: 50,
          skin: 'oxide',
          menubar: false,
          branding: false,
          elementpath: false,
          statusbar: true,
          border: false,
          style_formats_autohide: true,
          content_css: 'default',
          placeholder: 'Start writing...',
          setup: (editor: any) => {
            editor.on('init', () => {
              editor.getContainer().style.borderRadius = '0.375rem';
              editor.getContainer().style.border = '1px solid #e5e7eb';
            });

            editor.on('keydown', (e: any) => {
              if (e.key === 'Delete') {
                e.preventDefault();
                editor.execCommand('mceDelete');
              }
            });
          },
        }}
      />
    </>
  );
}
