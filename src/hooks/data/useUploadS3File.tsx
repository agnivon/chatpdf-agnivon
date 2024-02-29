import { S3FileUploadResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function useUploadS3File() {
  const mutation = useMutation({
    mutationFn: (payload: FormData) =>
      axios
        .post<S3FileUploadResponse>("/api/s3/upload", payload)
        .then((res) => res.data),
  });

  return { mutation };
}
