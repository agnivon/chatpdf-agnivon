"use client";

import { ChatDocument } from "@/types";
import React from "react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "../ui/select";
import Iframe from "react-iframe";
import { EyeIcon } from "lucide-react";

type DocumentViewerProps = {
  documents: ChatDocument[];
};

export default function DocumentViewer(props: DocumentViewerProps) {
  const [selectedDocumentUrl, setSelectedDocumentUrl] = React.useState<string>(
    props.documents.length ? props.documents[0].url : ""
  );

  return (
    <div className="relative h-full w-full p-4 overflow-y-auto bg-white bg-opacity-10">
      {props.documents.length > 0 ? (
        <div className="h-full w-full">
          <div className="mb-2 flex items-center justify-center p-4">
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
          <Iframe
            url={`https://docs.google.com/gview?url=${selectedDocumentUrl}&embedded=true`}
            className="w-full h-full rounded-md mb-4"
          ></Iframe>
        </div>
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex text-gray-500">
          <EyeIcon className="h-7 w-7 mr-2" />
          <span className="text-lg font-bold">PREVIEW</span>
        </div>
      )}
    </div>
  );
}
