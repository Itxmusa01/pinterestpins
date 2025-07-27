import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  const [productTitle, setProductTitle] = useState("");
  const [referenceImage, setReferenceImage] = useState<{
    base64: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    description: string;
    imageUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<{ [key: string]: boolean }>({});

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage({
        base64: (reader.result as string).split(",")[1],
        mimeType: file.type,
        name: file.name || `pasted-image.${file.type.split('/')[1] || 'png'}`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          e.preventDefault();
          return;
        }
      }
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus({ [key]: true });
    setTimeout(() => setCopyStatus({ [key]: false }), 2000);
  };

  const downloadImage = () => {
    if (generatedContent?.imageUrl) {
      const link = document.createElement("a");
      link.href = generatedContent.imageUrl;
      link.download = "pinterest-image.jpeg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleGenerate = async () => {
    if (!productTitle.trim()) {
      setError("Please enter a product title.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const response = await fetch('/.netlify/functions/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productTitle,
          referenceImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }
      
      setGeneratedContent(data);

    } catch (e: any) {
      console.error(e);
      setError(`Failed to generate content: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.375 0-9.375 0" />
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );

  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
  
  const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );

  return (
    <main>
      <header className="header">
        <h1>AI Pinterest Pin Generator</h1>
        <p>Create catchy titles, descriptions, and images for your affiliate pins in seconds.</p>
      </header>

      <section className="card" onPaste={handlePaste}>
        <h2>1. Enter Product Details</h2>
        <div className="form-group">
          <label htmlFor="productTitle">Amazon Product Title</label>
          <textarea
            id="productTitle"
            className="textarea"
            placeholder="e.g., Cozy Fleece-Lined Winter Leggings for Women"
            value={productTitle}
            onChange={(e) => setProductTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Reference Product Image (Optional - Upload or Paste)</label>
          <div className="file-upload-wrapper">
            <UploadIcon/>
            <span>Upload or Paste Image</span>
            {referenceImage && <span className="file-info">{referenceImage.name}</span>}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? <><div className="spinner"></div> Generating...</> : "Generate Pin Content"}
        </button>
        {error && <div className="error-message">{error}</div>}
      </section>

      {generatedContent && (
        <section className="card">
          <h2>2. Your Pin Content</h2>
          <div className="results-grid">
            <div className="generated-image-wrapper">
              <img src={generatedContent.imageUrl} alt="Generated product image" className="generated-image" />
              <button onClick={downloadImage} className="btn btn-secondary download-btn" aria-label="Download Image">
                <DownloadIcon />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: '1.5rem' }}>
              <div className="output-item">
                <h3>Pinterest Title</h3>
                <p>{generatedContent.title}</p>
                <button 
                  onClick={() => copyToClipboard(generatedContent.title, 'title')} 
                  className={`btn btn-secondary copy-btn ${copyStatus.title ? 'btn-success' : ''}`}
                  aria-label="Copy title"
                >
                  {copyStatus.title ? <CheckIcon/> : <CopyIcon/>}
                </button>
              </div>
              <div className="output-item">
                <h3>Pinterest Description</h3>
                <p>{generatedContent.description}</p>
                <button 
                  onClick={() => copyToClipboard(generatedContent.description, 'desc')} 
                  className={`btn btn-secondary copy-btn ${copyStatus.desc ? 'btn-success' : ''}`}
                  aria-label="Copy description"
                >
                  {copyStatus.desc ? <CheckIcon/> : <CopyIcon/>}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);