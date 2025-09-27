import { useState, useEffect, useCallback } from "react";

export default function App() {
  const [mode, setMode] = useState("preset");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 230 });
  const [targetSize, setTargetSize] = useState(50);
  const [exam, setExam] = useState("MP ESB");
  const [type, setType] = useState("photo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [processedFileSize, setProcessedFileSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(0.9);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    },
    {
      exam: "NEET",
      photo: { width: 200, height: 230, minKB: 10, maxKB: 200 },
      signature: { width: 140, height: 60, minKB: 4, maxKB: 30 }
    },
    {
      exam: "JEE",
      photo: { width: 200, height: 230, minKB: 10, maxKB: 200 },
      signature: { width: 140, height: 60, minKB: 4, maxKB: 30 }
    }
  ];

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleImageUpload = useCallback((file) => {
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
        setOriginalFileSize(Math.round(file.size / 1024));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const resetAll = () => {
    setImage(null);
    setPreview(null);
    setDownloadUrl(null);
    setOriginalFileSize(0);
    setProcessedFileSize(0);
    setDimensions({ width: 200, height: 230 });
    setTargetSize(50);
    setExam("MP ESB");
    setType("photo");
    setCompressionQuality(0.9);
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
      ctx.fillStyle = type === 'signature' ? '#ffffff' : '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      );
      
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      let quality = compressionQuality;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      let blob = await fetch(dataUrl).then(r => r.blob());
      
      // Iteratively reduce quality if file is too large
      while (blob.size / 1024 > targetSize && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        blob = await fetch(dataUrl).then(r => r.blob());
      }
      
      setProcessedFileSize(Math.round(blob.size / 1024));
      setDownloadUrl(dataUrl);
      setIsProcessing(false);
    } catch (error) {
      console.error("Processing error:", error);
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

  const handleDimensionChange = (dimension, value) => {
    if (aspectRatioLocked && preview) {
      const img = new Image();
      img.src = preview;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        if (dimension === 'width') {
          setDimensions({ width: value, height: Math.round(value / aspectRatio) });
        } else {
          setDimensions({ width: Math.round(value * aspectRatio), height: value });
        }
      };
    } else {
      setDimensions({ ...dimensions, [dimension]: value });
    }
  };

  const getExamDetails = () => {
    const selectedExam = examPresets.find((preset) => preset.exam === exam);
    return selectedExam ? selectedExam[type] : null;
  };

  const favoriteExams = ["MP ESB", "UPSC", "IBPS", "NEET", "JEE"];

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'}`}>
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${darkMode ? 'from-purple-400 to-pink-400' : 'from-indigo-600 to-purple-600'} bg-clip-text text-transparent`}>
                Image Editor Pro
              </h1>
              <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-indigo-600'} font-medium mt-1`}>
                Exam Preset Tool
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showAdvanced 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : darkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                }`}
              >
                Advanced
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-full transition-all shadow-lg ${darkMode ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Professional image resizing and compression for competitive exams
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mode Selection Card */}
            <div className={`rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm ${darkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'}`}>
              <div className="p-6">
                <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Mode Selection
                </h2>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setMode("preset")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                      mode === "preset"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                        : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                    </svg>
                    <span className="font-medium">Exam Preset</span>
                  </button>
                  <button
                    onClick={() => setMode("custom")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                      mode === "custom"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105"
                        : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    <span className="font-medium">Custom Mode</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Configuration Card */}
            <div className={`rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm ${darkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'}`}>
              <div className="p-6">
                {mode === "preset" ? (
                  <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Exam Configuration
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Exam
                        </label>
                        <select
                          value={exam}
                          onChange={handleExamChange}
                          className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300 text-gray-700 bg-white'
                          }`}
                        >
                          {examPresets.map((preset) => (
                            <option key={preset.exam} value={preset.exam}>
                              {preset.exam}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Type
                        </label>
                        <select
                          value={type}
                          onChange={handleTypeChange}
                          className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300 text-gray-700 bg-white'
                          }`}
                        >
                          <option value="photo">Photo</option>
                          <option value="signature">Signature</option>
                        </select>
                      </div>
                    </div>
                    
                    {getExamDetails() && (
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-indigo-900/40 border border-indigo-800' : 'bg-indigo-50 border border-indigo-200'}`}>
                        <p className={`text-sm ${darkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
                          <span className="font-medium">Requirements:</span> {getExamDetails().width}×{getExamDetails().height}px, {getExamDetails().minKB}-{getExamDetails().maxKB}KB
                        </p>
                      </div>
                    )}
                    
                    {/* Quick Favorites */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Quick Access
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {favoriteExams.map((favExam) => (
                          <button
                            key={favExam}
                            onClick={() => {
                              setExam(favExam);
                              const selectedExam = examPresets.find(p => p.exam === favExam);
                              if (selectedExam) {
                                const values = selectedExam[type];
                                setDimensions({ width: values.width, height: values.height });
                                setTargetSize(values.maxKB);
                              }
                            }}
                            className={`px-3 py-1 text-xs rounded-full transition-all ${
                              exam === favExam
                                ? "bg-indigo-600 text-white shadow-md"
                                : darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {favExam}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Custom Settings
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Width (px)
                        </label>
                        <input
                          type="number"
                          value={dimensions.width}
                          onChange={(e) => handleDimensionChange('width', parseInt(e.target.value) || 0)}
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300 text-gray-700 bg-white'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Height (px)
                        </label>
                        <input
                          type="number"
                          value={dimensions.height}
                          onChange={(e) => handleDimensionChange('height', parseInt(e.target.value) || 0)}
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'border-gray-300 text-gray-700 bg-white'
                          }`}
                        />
                      </div>
                    </div>

                    {preview && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="aspectRatio"
                          checked={aspectRatioLocked}
                          onChange={(e) => setAspectRatioLocked(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="aspectRatio" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Lock aspect ratio
                        </label>
                      </div>
                    )}
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Target Size (KB)
                      </label>
                      <input
                        type="number"
                        value={targetSize}
                        onChange={(e) => setTargetSize(parseInt(e.target.value) || 0)}
                        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'border-gray-300 text-gray-700 bg-white'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {showAdvanced && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Advanced Settings
                    </h4>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Compression Quality: {Math.round(compressionQuality * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={compressionQuality}
                        onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Upload and Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <div className={`rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm ${darkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'}`}>
              <div className="p-6">
                <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Upload Image
                </h2>
                
                {image ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                      />
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${darkMode ? 'bg-gray-900/80 text-white' : 'bg-white/90 text-gray-800'}`}>
                        {originalFileSize} KB
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={resetAll}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                      >
                        Reset
                      </button>
                      
                      <button
                        onClick={resizeAndCompress}
                        disabled={isProcessing}
                        className={`flex-2 px-6 py-3 rounded-lg transition-all shadow-lg ${
                          isProcessing 
                            ? "bg-gray-400 text-gray-500 cursor-not-allowed" 
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                        }`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </div>
                        ) : (
                          "Process Image"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-105' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-105'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={darkMode ? "#94A3B8" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {isDragging ? "Drop your image here" : "Drop image or click to browse"}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Supports JPG, PNG, WebP formats
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            {downloadUrl && (
              <div className={`rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm ${darkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'}`}>
                <div className="p-6">
                  <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    Processed Result
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Processed Image */}
                    <div>
                      <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Final Image
                      </h3>
                      <div className="relative">
                        <img 
                          src={downloadUrl} 
                          alt="Processed" 
                          className="w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                        />
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${
                          processedFileSize <= targetSize 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {processedFileSize} KB
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats and Download */}
                    <div className="space-y-4">
                      <div>
                        <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Statistics
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Original</p>
                            <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {originalFileSize} KB
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Processed</p>
                            <p className={`font-bold text-lg ${
                              processedFileSize <= targetSize 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              {processedFileSize} KB
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg col-span-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Size Reduction</p>
                            <p className={`font-bold text-lg ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                              {Math.round(((originalFileSize - processedFileSize) / originalFileSize) * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Image Details
                        </h3>
                        <div className={`p-4 rounded-lg space-y-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className="font-medium">Format:</span> JPEG
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className="font-medium">Dimensions:</span> {dimensions.width}×{dimensions.height}px
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className="font-medium">Quality:</span> {Math.round(compressionQuality * 100)}%
                          </p>
                          {mode === "preset" && (
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <span className="font-medium">Exam:</span> {exam} ({type})
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <a
                        href={downloadUrl}
                        download={`${exam}_${type}_${dimensions.width}x${dimensions.height}.jpg`}
                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download Image
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
<footer className={`mt-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
  <div className="flex items-center justify-center gap-4 mb-4">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>Online Tool</span>
    </div>
    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
    <div className="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4"></path>
        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
        <path d="M13 12h3"></path>
        <path d="M11 12H8"></path>
      </svg>
      <span>Privacy Safe</span>
    </div>
  </div>
  <p>© {new Date().getFullYear()} Image Editor Pro | Built for Competitive Exam Success</p>
  <p className="mt-1">Made with ❤ by Vikash Kumar</p>
  <div className="mt-3 flex justify-center gap-4">
    <a 
      href="https://www.instagram.com/_vikash_n_kumar/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-500 hover:text-pink-500 transition-colors"
      aria-label="Instagram"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    </a>
    <a 
      href="https://www.linkedin.com/in/vikash7541/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-500 hover:text-blue-500 transition-colors"
      aria-label="LinkedIn"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    </a>
  </div>
</footer>
      </div>
    </div>
  );
}