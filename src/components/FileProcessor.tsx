import React from "react";
import { PDFDocument, PDFFont, StandardFonts } from "pdf-lib";
import JSZip from "jszip";

type props = {
  setGeneratedPDF: React.Dispatch<React.SetStateAction<Uint8Array | null>>;
  setShowAlert: React.Dispatch<React.SetStateAction<string>>;
  selectedFiles: File[];
};

const FileProcessorComponent: React.FC<props> = ({
  setGeneratedPDF,
  setShowAlert,
  selectedFiles,
}) => {
  const excludedFolders = [
    ".git",
    ".vscode",
    "coverage",
    "bin",
    "out",
    "__pycache__",
    "node_modules",
    ".idea",
    "venv",
    "env",
    ".vs",
    "build",
    "dist",
  ];
  const excludedFiles = [
    ".gitignore",
    "package-lock.json",
    "README.md",
    "output.pdf",
    "yarn.lock",
    "README.md",
    ".iml",
    ".pyc",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".bmp",
    ".ico",
  ];

  const processZipFile = async (
    file: File,
    doc: PDFDocument,
    font: PDFFont,
    summaryData: { fileCount: number; archiveTypes: Set<string>, lineCount: number}
  ) => {
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(file);
    const fileNames = Object.keys(zipContents.files);

    for (const fileName of fileNames) {
      if (zipContents.files[fileName].dir) continue;

      if (
        excludedFolders.some((folder) => fileName.includes(folder)) ||
        excludedFiles.some((exFile) => fileName.endsWith(exFile))
      ) {
        continue;
      }

      const fileData = await zipContents.files[fileName].async("string");
      const lines = fileData.split("\n");
      summaryData.lineCount += lines.length;
      let currentPage = doc.addPage();
      let currentY = currentPage.getHeight() - 50;
      const text = `Arquivo: ${fileName}\n\n`;
      currentPage.drawText(text, {
        x: 50,
        y: currentY,
        size: 10,
        font: font,
        lineHeight: 14,
        maxWidth: currentPage.getWidth() - 100,
      });
      currentY -= 14 * 3;

      for (const line of lines) {
        const cleanedLine = line.replace(/[^\x20-\x7E\n\t]/g, "");
        if (currentY < 50) {
          currentPage = doc.addPage();
          currentY = currentPage.getHeight() - 50;
        }
        currentPage.drawText(cleanedLine, {
          x: 50,
          y: currentY,
          size: 10,
          font: font,
          lineHeight: 14,
          maxWidth: currentPage.getWidth() - 100,
        });
        currentY -= 14;
      }
      summaryData.fileCount++;
      summaryData.archiveTypes.add(fileName.split(".").pop() || "");
    }
  };

  const processFiles = async () => {
    if (selectedFiles.length === 0)
      return setShowAlert(
        "Por favor, selecione ao menos um arquivo antes de processar."
      );

    const summaryData = {
      fileCount: 0,
      lineCount: 0,
      archiveTypes: new Set<string>(),
    };

    const doc = await PDFDocument.create();

    const font = await doc.embedFont(StandardFonts.Courier);

    for (const file of selectedFiles) {
      if (file.name.endsWith(".zip")) {
        await processZipFile(file, doc, font, summaryData);
      } else {
        let fileContent = await file.text();
        fileContent = fileContent.replace(/[^\x20-\x7E\n\t]/g, "");

        const lines = fileContent.split("\n");
        summaryData.lineCount += lines.length;
        let currentPage = doc.addPage();
        const text = `Arquivo: ${file.name}\n\n`;
        currentPage.drawText(text, {
          x: 50,
          y: currentPage.getHeight() - 50,
          size: 10,
          font: font,
          lineHeight: 14,
          maxWidth: currentPage.getWidth() - 100,
        });

        let currentY = currentPage.getHeight() - 50 - 14 * 3;

        for (const line of lines) {
          const cleanedLine = line.replace(/[^\x20-\x7E\n\t]/g, "");
          if (currentY < 50) {
            currentPage = doc.addPage();
            currentY = currentPage.getHeight() - 50;
          }
          currentPage.drawText(cleanedLine, {
            x: 50,
            y: currentY,
            size: 10,
            font: font,
            lineHeight: 14,
            maxWidth: currentPage.getWidth() - 100,
          });
          currentY -= 14;
        }
        summaryData.fileCount++;
        summaryData.archiveTypes.add(file.name.split(".").pop() || "");
      }
    }

    const summaryPage = doc.addPage();
    const summaryText = `Content Summary\n\nTotal Files: ${
      summaryData.fileCount
    }\n\nArchive Types Found: ${Array.from(summaryData.archiveTypes).join(
      ", "
    )}\n\nTotal Code Lines: ${summaryData.lineCount}\n\n
    Selected Files: ${selectedFiles.map((file) => file.name).join(", ")}`;
    summaryPage.drawText(summaryText, {
      x: 50,
      y: summaryPage.getHeight() - 50,
      size: 12,
      font: font,
      lineHeight: 14,
      maxWidth: summaryPage.getWidth() - 100,
    });

    const pdfBytes = await doc.save();
    setGeneratedPDF(pdfBytes);
  };

  return <button onClick={processFiles}>Converter Código</button>;
};

export default FileProcessorComponent;
