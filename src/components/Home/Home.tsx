import React, { useState } from "react";
import "./Home.css";
import FileProcessorComponent from "../FileProcessor";
import { InputFile } from "../InputFile";

const Home: React.FC = () => {
  const [generatedPDF, setGeneratedPDF] = useState<Uint8Array | null>(null);
  const [showAlert, setShowAlert] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const downloadPDF = () => {
    if (!generatedPDF)
      setShowAlert("Selecione um arquivo e o converta antes de baixar");
    if (generatedPDF) {
      const blob = new Blob([generatedPDF], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "output.pdf";
      link.click();
    }
  };

  return (
    <div className="home-container">
      <header>
        <nav>
          <div className="logo">CodeToPDF</div>
          <div className="menu"></div>
        </nav>
      </header>
      <main>
        <section className="converter">
          <h1>Conversor de Codigo para PDF</h1>
          <p>Converta seus projetos e codigos para PDF online e grátis</p>
          <p>
            Uma das partes mais uteis da conversão para PDF é para usar o
            CHATGPT ou similares com o contexto do projeto inteiro para resolver
            as suas duvidas
          </p>

          <div className="file-types">
            <div className="file-type">
              <h2>Project.zip</h2>
              <p>
                Insira ou arraste seu projeto .zip aqui e clique em processar
              </p>
              <InputFile setSelectedFiles={setSelectedFiles} />
              {selectedFiles.length > 0 && (
                <>
                  <p>Arquivos selecionados: </p>
                  <p className="selected-files">
                    {selectedFiles.map((file) => {
                      const conc = selectedFiles.length > 1 ? ", " : " ";
                      return file.name + conc;
                    })}
                  </p>
                </>
              )}
              <FileProcessorComponent
                setGeneratedPDF={setGeneratedPDF}
                setShowAlert={setShowAlert}
                selectedFiles={selectedFiles}
              />
            </div>
            <div className="file-type">
              <h2>Project.pdf</h2>
              <p>Projeto convertido para PDF</p>

              <button onClick={downloadPDF}>Baixar Pdf</button>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="footer-content">
          <p>
            Visit my personal website:{" "}
            <a href="http://luizbrugnera.com" target="_blank">
              luizbrugnera.com
            </a>
          </p>
          <p>Created by Luiz Ricardo Brugnera</p>
          <p>Contact me: 54 9927-6395</p>
        </div>
      </footer>
      {showAlert && (
        <div className="alert-modal">
          <div className="alert-content">
            <p>{showAlert}</p>
            <button onClick={() => setShowAlert("")}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
