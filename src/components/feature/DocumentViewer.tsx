"use client";

import { ChatDocument } from "@/types";
import { Worker } from "@react-pdf-viewer/core";
import { EyeIcon } from "lucide-react";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// Import the main component
import { Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import the styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

type DocumentViewerProps = {
  documents: ChatDocument[] | undefined;
};

export default function DocumentViewer(props: DocumentViewerProps) {
  const [selectedDocumentUrl, setSelectedDocumentUrl] = React.useState<string>(
    props.documents?.length ? props.documents[0].url : ""
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if (!props.documents) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex text-gray-500">
        <EyeIcon className="h-7 w-7 mr-2" />
        <span className="text-lg font-bold">PREVIEW</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full p-4 bg-background/80 overflow-y-auto">
      <div className="h-full w-full flex flex-col items-center">
        <div className="mb-3 flex flex-col gap-4 items-center justify-center p-2">
          <Select
            value={selectedDocumentUrl}
            onValueChange={(value) => setSelectedDocumentUrl(value)}
          >
            <SelectTrigger className="w-96 p-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-96">
              {props.documents.map((document) => (
                <SelectItem
                  value={document.url}
                  className=" cursor-pointer"
                  key={document.id}
                >
                  <span className="line-clamp-1 break-all">
                    {document.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-5/6 h-5/6 flex-grow rounded-lg overflow-hidden">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer
              fileUrl={selectedDocumentUrl}
              plugins={[
                // Register plugins
                defaultLayoutPluginInstance,
              ]}
            />
          </Worker>
        </div>
      </div>
    </div>
  );
}
