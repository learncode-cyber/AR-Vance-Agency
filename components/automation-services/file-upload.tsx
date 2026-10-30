"use client";

import { useState, useRef } from "react";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  error?: string;
}

export default function FileUploadComponent({
  onFileChange,
  error,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }
    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      alert(validationError);
      return;
    }

    setFile(selectedFile);
    onFileChange(selectedFile);

    // Generate preview
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type === "application/pdf") {
      setPreview("pdf");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const replaceFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          } ${error ? "border-red-500 bg-red-50" : ""}`}
        >
          <div className="space-y-3">
            <div className="text-4xl">📁</div>
            <div>
              <p className="font-semibold text-gray-900">
                Drag and drop your file here
              </p>
              <p className="text-sm text-gray-600">or</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Click to browse
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Accepted formats: JPG, PNG, PDF (Max 5MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      ) : null}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* File Preview */}
      {file && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="space-y-4">
            {/* Image Preview */}
            {preview && preview !== "pdf" && (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* PDF Preview */}
            {preview === "pdf" && (
              <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                <div className="text-4xl">📄</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}

            {/* File Info */}
            {preview && preview !== "pdf" && (
              <div className="text-sm text-gray-600">
                <p><strong>File:</strong> {file.name}</p>
                <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={removeFile}
                className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
              >
                Remove File
              </button>
              <button
                type="button"
                onClick={replaceFile}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
              >
                Replace File
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
