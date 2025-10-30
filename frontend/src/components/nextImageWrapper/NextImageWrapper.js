import NextImage from "next/image"; // importing Image as NextImage to avoid name conflict
import React from "react";

export default function Image(props) {
  const {
    fill = true,
    className = "object-cover",
    alt = "",
    ...rest
  } = props;

  return (
    // <div className="relative aspect-square">
      <NextImage
        alt={alt}
        fill={fill}
        className={className}
        {...rest}
      />
    // </div>
  );
}