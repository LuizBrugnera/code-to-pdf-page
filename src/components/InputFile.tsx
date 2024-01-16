import { file } from "jszip";
import React, { useEffect, useRef, useState } from "react";

type props = {
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

export const InputFile: React.FC<props> = ({ setSelectedFiles }) => {
  const [ShowDropZone, setShowDropZone] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlerDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowDropZone(false);
    if (event.dataTransfer.files) {
      setSelectedFiles(Array.from(event.dataTransfer.files));
    }
  };

  useEffect(() => {
    const onWindowDragOver = (event: DragEvent) => {
      event.preventDefault();
      setShowDropZone(true);
    };

    const onWindowDragLeave = (event: DragEvent) => {
      event.preventDefault();
      if (
        event.clientX === 0 ||
        event.clientY === 0 ||
        event.clientX === window.innerWidth ||
        event.clientY === window.innerHeight
      ) {
        setShowDropZone(false);
      }
    };

    window.addEventListener("dragover", onWindowDragOver);
    window.addEventListener("dragleave", onWindowDragLeave);

    return () => {
      window.removeEventListener("dragover", onWindowDragOver);
      window.removeEventListener("dragleave", onWindowDragLeave);
    };
  }, []);

  return (
    <>
      <p>
        <button onClick={onButtonClick}>Escolher Ficheiros</button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </p>
      {ShowDropZone && (
        <div id="drop_zone" onDrop={handlerDrop}>
          Arraste seu arquivo aqui
        </div>
      )}
    </>
  );
};
