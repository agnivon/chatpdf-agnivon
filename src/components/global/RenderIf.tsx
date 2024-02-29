import React from "react";

export default function RenderIf({
  children,
  isTrue,
}: {
  children?: React.ReactNode;
  isTrue: boolean;
}) {
  return isTrue ? children : null;
}
