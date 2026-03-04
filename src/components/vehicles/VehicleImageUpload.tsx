"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, GripVertical } from "lucide-react";

interface VehicleImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function VehicleImageUpload({ images, onChange }: VehicleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const allowed = Array.from(files).filter((f) =>
        ["image/jpeg", "image/png", "image/webp"].includes(f.type)
      );
      if (allowed.length === 0) return;

      setUploading(true);
      try {
        const fd = new FormData();
        allowed.forEach((f) => fd.append("files", f));

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.urls) {
          onChange([...images, ...data.urls]);
        }
      } finally {
        setUploading(false);
      }
    },
    [images, onChange]
  );

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        onClick={() => document.getElementById("vehicle-image-input")?.click()}
      >
        <ImagePlus className="h-8 w-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm text-slate-600">
          {uploading ? "Uploading..." : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WEBP — max 5MB each</p>
        <input
          id="vehicle-image-input"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-md overflow-hidden border">
              <Image src={url} alt={`Vehicle image ${i + 1}`} fill className="object-cover" />
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                  Main
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); remove(i); }}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
