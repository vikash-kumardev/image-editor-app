import { useState } from "react";

export default function App() {
  const [mode, setMode] = useState("custom");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 230 });
  const [targetSize, setTargetSize] = useState(50);
  const [exam, setExam] = useState("MP ESB");
  const [type, setType] = useState("photo");
  const [isProcessing, setIsProcessing] = useState(false);

  const examPresets = [
    {
      exam: "MP ESB",
      photo: { width: 200, height: 230, minKB: 20, maxKB: 200 },
      signature: { width: 140, height: 60, minKB: 10, maxKB: 50 }
    },
    {
      exam: "BPSSC",
      photo: { width: 200, height: 230, minKB: 20, maxKB: 50 },
      signature: { width: 140, height: 60, minKB: 10, maxKB: 20 }
    },
    {
      exam: "SSC",
      photo: { width: 100, height: 120, minKB: 20, maxKB: 50 },
      signature: { width: 40, height: 60, minKB: 10, maxKB: 20 }
    },
    {
      exam: "UPSC",
      photo: { width: 200, height: 300, minKB: 20, maxKB: 300 },
      signature: { width: 150, height: 60, minKB: 10, maxKB: 40 }
    },
    {
      exam: "IBPS",
      photo: { width: 200, height: 230, minKB: 20, maxKB: 50 },
      signature: { width: 140, height: 60, minKB: 10, maxKB: 20 }
    },
    {
      exam: "RRB",
      photo: { width: 138, height: 177, minKB: 20, maxKB: 50 },
      signature: { width: 140, height: 60, minKB: 10, maxKB: 20 }
    }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resizeAndCompress = async () => {
    if (!image || !preview) return;
    
    setIsProcessing(true);
    
    try {
      const img = new Image();
      img.src = preview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

      // Iterative compression logic
      let quality = 0.9;
      let dataUrl;
      let attempts = 10;

      while (attempts > 0) {
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        const blob = await (await fetch(dataUrl)).blob();
        const currentSizeKB = blob.size / 1024;

        if (currentSizeKB <= targetSize) {
          break;
        }

        quality -= 0.1;
        if (quality < 0.1) quality = 0.1;
        attempts--;
      }
      
      setDownloadUrl(dataUrl);

    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExamChange = (e) => {
    setExam(e.target.value);
    const selectedExam = examPresets.find((preset) => preset.exam === e.target.value);
    const values = selectedExam[type];
    setDimensions({ width: values.width, height: values.height });
    setTargetSize(values.maxKB);
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    const selectedExam = examPresets.find((preset) => preset.exam === exam);
    const values = selectedExam[e.target.value];
    setDimensions({ width: values.width, height: values.height });
    setTargetSize(values.maxKB);
  };

  const getExamDetails = () => {
    const selectedExam = examPresets.find((preset) => preset.exam === exam);
    return selectedExam ? selectedExam[type] : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Image Editor & Exam Preset Tool
          </h1>
          <p className="text-gray-600">
            Resize and compress images for competitive exams
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* ... (rest of your card JSX remains the same) ... */}
           {/* Upload Section */}
         <div className="p-6 border-b border-gray-200">
           <div className="flex items-center gap-2 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
               <polyline points="17 8 12 3 7 8"></polyline>
               <line x1="12" y1="3" x2="12" y2="15"></line>
             </svg>
             <h2 className="text-xl font-semibold text-gray-800">Upload Image</h2>
           </div>
           
           <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
               <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
               <circle cx="12" cy="13" r="4"></circle>
             </svg>
             <p className="text-gray-600 mb-4">
               {image ? "Image uploaded successfully!" : "Drag & drop your image here or click to browse"}
             </p>
             <input
               type="file"
               accept="image/*"
               onChange={handleImageUpload}
               className="hidden"
               id="file-upload"
             />
             <label htmlFor="file-upload" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
               Select Image
             </label>
             
             {preview && (
               <div className="mt-4">
                 <img 
                   src={preview} 
                   alt="Preview" 
                   className="mx-auto max-h-48 object-contain rounded-lg border border-gray-200"
                 />
               </div>
             )}
           </div>
         </div>

         {/* Mode Selection */}
         <div className="p-6 border-b border-gray-200">
           <div className="flex flex-col sm:flex-row gap-4 mb-6">
             <button
               onClick={() => setMode("custom")}
               className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                 mode === "custom"
                   ? "bg-indigo-600 text-white shadow-md"
                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
               }`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                 <line x1="3" y1="9" x2="21" y2="9"></line>
                 <line x1="9" y1="21" x2="9" y2="9"></line>
               </svg>
               <span className="font-medium">Custom Editing</span>
             </button>
             <button
               onClick={() => setMode("preset")}
               className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${
                 mode === "preset"
                   ? "bg-indigo-600 text-white shadow-md"
                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
               }`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path>
                 <polyline points="14 2 14 8 20 8"></polyline>
                 <line x1="16" y1="13" x2="8" y2="13"></line>
                 <line x1="16" y1="17" x2="8" y2="17"></line>
                 <polyline points="10 9 9 9 8 9"></polyline>
               </svg>
               <span className="font-medium">Exam Preset</span>
             </button>
           </div>

           {/* Custom Editing Mode */}
           {mode === "custom" && (
             <div className="space-y-4">
               <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                   <line x1="3" y1="9" x2="21" y2="9"></line>
                   <line x1="9" y1="21" x2="9" y2="9"></line>
                 </svg>
                 Custom Dimensions
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Width (px)
                   </label>
                   <input
                     type="number"
                     value={dimensions.width}
                     onChange={(e) => setDimensions({ ...dimensions, width: parseInt(e.target.value) || 0 })}
                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Enter width"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Height (px)
                   </label>
                   <input
                     type="number"
                     value={dimensions.height}
                     onChange={(e) => setDimensions({ ...dimensions, height: parseInt(e.target.value) || 0 })}
                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Enter height"
                   />
                 </div>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Target Size (KB)
                 </label>
                 <input
                   type="number"
                   value={targetSize}
                   onChange={(e) => setTargetSize(parseInt(e.target.value) || 0)}
                   className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="Enter target size"
                 />
               </div>
             </div>
           )}

           {/* Exam Preset Mode */}
           {mode === "preset" && (
             <div className="space-y-4">
               <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path>
                   <polyline points="14 2 14 8 20 8"></polyline>
                   <line x1="16" y1="13" x2="8" y2="13"></line>
                   <line x1="16" y1="17" x2="8" y2="17"></line>
                   <polyline points="10 9 9 9 8 9"></polyline>
                 </svg>
                 Exam Preset Configuration
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Exam
                   </label>
                   <select
                     value={exam}
                     onChange={handleExamChange}
                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   >
                     {examPresets.map((preset) => (
                       <option key={preset.exam} value={preset.exam}>
                         {preset.exam}
                       </option>
                     ))}
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Type
                   </label>
                   <select
                     value={type}
                     onChange={handleTypeChange}
                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   >
                     <option value="photo">Photo</option>
                     <option value="signature">Signature</option>
                   </select>
                 </div>
               </div>
               
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                 <p className="text-sm text-blue-800">
                   <span className="font-medium">Auto-filled values:</span> 
                   {getExamDetails() && (
                     <>
                       {" "}
                       {getExamDetails().width}×{getExamDetails().height}px, 
                       Max {getExamDetails().maxKB}KB
                     </>
                   )}
                 </p>
               </div>
             </div>
           )}
         </div>

         {/* Action Button */}
         <div className="p-6">
           <button
             onClick={resizeAndCompress}
             disabled={!image || isProcessing}
             className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
               !image || isProcessing
                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                 : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
             }`}
           >
             {isProcessing ? (
               <>
                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                 Processing...
               </>
             ) : (
               <>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"></path>
                   <polyline points="17 8 12 3 7 8"></polyline>
                   <line x1="12" y1="3" x2="12" y2="15"></line>
                 </svg>
                 Apply Resize & Compress
               </>
             )}
           </button>
         </div>

         {/* Result Section */}
         {downloadUrl && (
           <div className="p-6 border-t border-gray-200">
             <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                 <polyline points="17 8 12 3 7 8"></polyline>
                 <line x1="12" y1="3" x2="12" y2="15"></line>
               </svg>
               Processed Image
             </h3>
             
             <div className="flex flex-col md:flex-row gap-6">
               <div className="flex-1">
                 <h4 className="text-sm font-medium text-gray-700 mb-2">Before/After Preview</h4>
                 <div className="border border-gray-200 rounded-lg p-4">
                   <img 
                     src={downloadUrl} 
                     alt="Processed" 
                     className="w-full h-48 object-contain rounded-lg"
                   />
                 </div>
               </div>
               
               <div className="flex-1">
                 <h4 className="text-sm font-medium text-gray-700 mb-2">Download</h4>
                 <a
                   href={downloadUrl}
                   download="edited-image.jpg"
                   className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                     <polyline points="17 8 12 3 7 8"></polyline>
                     <line x1="12" y1="3" x2="12" y2="15"></line>
                   </svg>
                   Download Edited Image
                 </a>
                 
                 <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                   <p className="text-sm text-gray-600">
                     <span className="font-medium">Format:</span> JPEG
                   </p>
                   <p className="text-sm text-gray-600">
                     <span className="font-medium">Dimensions:</span> {dimensions.width}×{dimensions.height}px
                   </p>
                   <p className="text-sm text-gray-600">
                     <span className="font-medium">Size:</span> {targetSize}KB
                   </p>
                 </div>
               </div>
             </div>
           </div>
         )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="mb-4">© {new Date().getFullYear()} Image Editor & Exam Preset Tool.
            <br />
            Made with ❤ by Abhinay.
          </p>
          <div className="flex justify-center items-center space-x-6">
            <a
              href="https://www.linkedin.com/in/justabhinay/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-600 transition-colors duration-300"
              aria-label="LinkedIn Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/just_abhinay/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-600 transition-colors duration-300"
              aria-label="Instagram Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.359-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.359-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}