"use client";
import { MAX_FILE_NUMBER_UPLOAD_LIMIT } from "@/constants/validation.constants";
import useCreateChat from "@/hooks/data/useCreateChat";
import useUploadS3File from "@/hooks/data/useUploadS3File";
import { fileValidator } from "@/lib/utils";
import { S3FileUploadResponse } from "@/types";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  FileIcon,
  InboxIcon,
  Loader2Icon,
  LoaderIcon,
  MessageCircleIcon,
} from "lucide-react";
import React from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { useImmer } from "use-immer";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";

export default function FileUpload() {
  const [uploadedFiles, setUploadedFiles] = useImmer<
    Record<
      string,
      {
        file: File;
        response: Promise<S3FileUploadResponse>;
        status: "uploading" | "uploaded" | "error";
        id: string;
      }
    >
  >({});
  const { mutation: uploadS3File } = useUploadS3File();
  const { mutation: createChat } = useCreateChat(true);

  const uploadedFilesArray = React.useMemo(
    () => Object.values(uploadedFiles),
    [uploadedFiles]
  );

  const handleOnDrop: DropzoneOptions["onDrop"] = async (
    acceptedFiles,
    fileRejections
  ) => {
    await Promise.all(
      acceptedFiles.map(
        (file) =>
          new Promise(async (resolve, reject) => {
            const fileId = uuidv4();

            const toastId = toast.loading(`Uploading ${file.name}`);
            try {
              const payload = new FormData();
              payload.set("file", file);
              const promise = uploadS3File.mutateAsync(payload);
              setUploadedFiles((r) => {
                r[fileId] = {
                  id: fileId,
                  file,
                  response: promise,
                  status: "uploading",
                };
              });
              const data = await promise;
              setUploadedFiles((r) => {
                r[fileId].status = "uploaded";
              });
              toast.success(`${file.name} uploaded successfully`, {
                id: toastId,
              });
              resolve(data);
            } catch (err) {
              console.log(err);
              setUploadedFiles((r) => {
                r[fileId].status = "error";
              });
              toast.error("Something went wrong. Please try again later", {
                id: toastId,
              });
              reject(err);
            }
          })
      )
    );
    fileRejections.forEach((rejects) => {
      toast.error(rejects.errors.map((error) => error.message).join("\n"));
    });
  };

  const handleCreateChat = async () => {
    const data = await Promise.all(uploadedFilesArray.map((f) => f.response));
    const toastId = toast.loading("Creating chat...");
    createChat.mutate(data, {
      onSuccess: ({ chatId }) => {
        toast.success("Chat created. Redirecting...", { id: toastId });
      },
      onError: () => {
        toast.error("Something went wrong", { id: toastId });
      },
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: MAX_FILE_NUMBER_UPLOAD_LIMIT,
    onDrop: handleOnDrop,
    validator: fileValidator,
    disabled: createChat.isPending,
  });

  const thumbs = React.useMemo(() => {
    return uploadedFilesArray.map(({ file, status, id }) => (
      <div
        className="flex items-center border border-secondary-foreground/40 rounded-md w-full p-3 box-border"
        key={id}
      >
        <FileIcon className="h-6 w-6 mr-2 text-secondary-foreground/60 shrink-0" />
        <span className="text-secondary-foreground line-clamp-1 break-all">
          {file.name}
        </span>
        <span className="inline-flex ml-auto shrink-0">
          {status === "uploaded" ? (
            <CheckCircleIcon className="h-5 w-5 text-secondary-foreground/90" />
          ) : status === "error" ? (
            <AlertCircleIcon className="h-5 w-5 text-destructive" />
          ) : (
            <LoaderIcon className="h-5 w-5 animate-spin" />
          )}
        </span>
      </div>
    ));
  }, [uploadedFilesArray]);

  return (
    <div className="p-2 rounded-xl w-[32rem] bg-gradient">
      <div
        {...getRootProps({
          className:
            " border-dashed border-secondary-foreground/60 hover:border-secondary-foreground border rounded-xl cursor-pointer py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        <>
          <InboxIcon className="w-10 h-10 text-accent-foreground" />
          <p className="mt-2 text-sm text-secondary-foreground">
            Drop PDF here
          </p>
        </>
      </div>
      {thumbs.length > 0 && (
        <aside className="flex flex-wrap mt-3 space-y-2">{thumbs}</aside>
      )}
      {uploadedFilesArray.length > 0 && (
        <Button
          className="w-full mt-3 text-base"
          size={"lg"}
          onClick={handleCreateChat}
          disabled={uploadS3File.isPending || createChat.isPending}
        >
          {createChat.isPending ? (
            <Loader2Icon className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <MessageCircleIcon className="h-5 w-5 mr-2" />
          )}
          Create Chat
        </Button>
      )}
    </div>
  );
}
