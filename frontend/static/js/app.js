document.addEventListener('DOMContentLoaded', () => {
    // JD Elements
    const jdDropzone = document.getElementById('jd-dropzone');
    const jdFileInput = document.getElementById('jd-file');
    const jdPreview = document.getElementById('jd-preview');
    const jdFilename = document.getElementById('jd-filename');
    const jdFilesize = document.getElementById('jd-filesize');
    const removeJdBtn = document.getElementById('remove-jd');

    // CV Elements
    const cvDropzone = document.getElementById('cv-dropzone');
    const cvFileInput = document.getElementById('cv-files');
    const cvPreviewContainer = document.getElementById('cv-preview-container');
    const cvCountBadge = document.getElementById('cv-count');

    // State
    let jdFile = null;
    let cvFiles = [];

    // Form Action
    const matchBtn = document.getElementById('match-btn');
    const errorMessage = document.getElementById('error-message');
    const loadingState = document.getElementById('loading-state');
    
    // Results Area
    const resultsDashboard = document.getElementById('results-dashboard');
    const resultsContainer = document.getElementById('results-container');
    const resetBtn = document.getElementById('reset-btn');

    // Utils
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const updateMatchButton = () => {
        if (jdFile && cvFiles.length > 0) {
            matchBtn.removeAttribute('disabled');
        } else {
            matchBtn.setAttribute('disabled', 'true');
        }
    };

    // --- JD File Handling ---
    const handleJdFile = (file) => {
        if (file && file.type === 'application/pdf') {
            jdFile = file;
            jdFilename.textContent = file.name;
            jdFilesize.textContent = formatBytes(file.size);
            jdDropzone.classList.add('hidden');
            jdPreview.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            updateMatchButton();
        } else {
            alert('Please upload a PDF file for the Job Description.');
        }
    };

    jdFileInput.addEventListener('change', (e) => handleJdFile(e.target.files[0]));
    
    // Drag & Drop for JD
    jdDropzone.addEventListener('dragover', (e) => { e.preventDefault(); jdDropzone.classList.add('border-brand-500', 'bg-slate-800/50'); });
    jdDropzone.addEventListener('dragleave', () => { jdDropzone.classList.remove('border-brand-500', 'bg-slate-800/50'); });
    jdDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        jdDropzone.classList.remove('border-brand-500', 'bg-slate-800/50');
        if(e.dataTransfer.files.length > 0) handleJdFile(e.dataTransfer.files[0]);
    });

    removeJdBtn.addEventListener('click', () => {
        jdFile = null;
        jdFileInput.value = '';
        jdDropzone.classList.remove('hidden');
        jdPreview.classList.add('hidden');
        updateMatchButton();
    });

    // --- CV Files Handling ---
    const renderCvList = () => {
        cvPreviewContainer.innerHTML = '';
        if (cvFiles.length > 0) {
            cvPreviewContainer.classList.remove('hidden');
            cvCountBadge.textContent = `${cvFiles.length} selected`;
            
            cvFiles.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors';
                item.innerHTML = `
                    <div class="flex items-center min-w-0 flex-1">
                        <svg class="w-6 h-6 text-indigo-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path></svg>
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-slate-200 truncate">${file.name}</p>
                            <p class="text-xs text-slate-500">${formatBytes(file.size)}</p>
                        </div>
                    </div>
                    <button type="button" class="ml-4 text-slate-500 hover:text-red-400 p-1" onclick="removeCv(${index})">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                `;
                cvPreviewContainer.appendChild(item);
            });
        } else {
            cvPreviewContainer.classList.add('hidden');
            cvCountBadge.textContent = '0 selected';
        }
        updateMatchButton();
    };

    window.removeCv = (index) => {
        cvFiles.splice(index, 1);
        renderCvList();
    };

    const handleCvFiles = (files) => {
        const newFiles = Array.from(files).filter(file => file.type === 'application/pdf');
        
        if (newFiles.length !== files.length) {
            alert('Only PDF files are accepted.');
        }
        
        // Prevent duplicates based on filename and size
        newFiles.forEach(newFile => {
            if (!cvFiles.some(f => f.name === newFile.name && f.size === newFile.size)) {
                cvFiles.push(newFile);
            }
        });
        
        renderCvList();
    };

    cvFileInput.addEventListener('change', (e) => {
        handleCvFiles(e.target.files);
        cvFileInput.value = ''; // Reset to allow same file upload if removed
    });

    // Drag & Drop for CV
    cvDropzone.addEventListener('dragover', (e) => { e.preventDefault(); cvDropzone.classList.add('border-indigo-400', 'bg-slate-800/50'); });
    cvDropzone.addEventListener('dragleave', () => { cvDropzone.classList.remove('border-indigo-400', 'bg-slate-800/50'); });
    cvDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        cvDropzone.classList.remove('border-indigo-400', 'bg-slate-800/50');
        if(e.dataTransfer.files.length > 0) handleCvFiles(e.dataTransfer.files);
    });

    // --- API Call and Results ---
    const renderCard = (result) => {
        // We expect result to have: candidate_name, match_score, key_strengths, missing_skills, ai_summary
        const scoreColor = result.match_score >= 80 ? 'text-green-400' : (result.match_score >= 50 ? 'text-yellow-400' : 'text-red-400');
        const scoreBarColor = result.match_score >= 80 ? 'bg-green-500' : (result.match_score >= 50 ? 'bg-yellow-500' : 'bg-red-500');
        
        const strengthsHtml = result.key_strengths.map(s => `<li class="flex items-start"><svg class="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="text-sm text-slate-300">${s}</span></li>`).join('');
        const missingHtml = result.missing_skills.map(s => `<li class="flex items-start"><svg class="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg><span class="text-sm text-slate-300">${s}</span></li>`).join('');

        return `
            <div class="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col h-full transform transition hover:-translate-y-1 hover:shadow-xl hover:border-slate-500/50">
                <div class="absolute top-0 right-0 p-4">
                    <div class="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 font-bold text-lg border-2 ${result.match_score >= 80 ? 'border-green-500/50' : 'border-slate-700'} ${scoreColor}">
                        ${result.match_score}
                    </div>
                </div>
                
                <h3 class="text-xl font-bold mb-1 pr-16 truncate">${result.candidate_name}</h3>
                
                <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 mb-3 text-slate-300 w-fit">
                    AI Decision:&nbsp;<span class="font-bold ${scoreColor}">${result.recommendation || 'N/A'}</span>
                </div>
                
                <p class="text-xs text-slate-400 mb-4 whitespace-normal line-clamp-3">${result.ai_summary}</p>
                
                <div class="w-full bg-slate-700/50 rounded-full h-1.5 mb-6">
                    <div class="${scoreBarColor} h-1.5 rounded-full" style="width: ${result.match_score}%"></div>
                </div>
                
                <div class="grid grid-cols-1 gap-4 flex-grow">
                    <div>
                        <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Strengths</h4>
                        <ul class="space-y-1.5 min-h-[60px]">${strengthsHtml || '<li class="text-sm text-slate-500 italic">None specifically noted</li>'}</ul>
                    </div>
                    <div>
                        <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Missing/Weak</h4>
                        <ul class="space-y-1.5 min-h-[60px]">${missingHtml || '<li class="text-sm text-slate-500 italic">No major gaps identified</li>'}</ul>
                    </div>
                </div>
            </div>
        `;
    };

    matchBtn.addEventListener('click', async () => {
        if (!jdFile || cvFiles.length === 0) return;

        // UI Changes
        matchBtn.classList.add('hidden');
        document.querySelector('main').classList.add('hidden'); // Hide upload section
        loadingState.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        
        const loaderText = document.getElementById('loading-text');

        // Form Data
        const formData = new FormData();
        formData.append('jd_file', jdFile);
        cvFiles.forEach((file) => {
            formData.append('cv_files', file);
        });

        try {
            loaderText.textContent = "Uploading files and analyzing with Gemini AI...";
            
            const response = await fetch('/api/match', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'An error occurred during matching.');
            }

            const data = await response.json();
            
            // Build Results UI
            loadingState.classList.add('hidden');
            resultsDashboard.classList.remove('hidden');
            
            // Sort results by score descending
            const sortedResults = data.results.sort((a, b) => b.match_score - a.match_score);
            
            resultsContainer.innerHTML = sortedResults.map(res => renderCard(res)).join('');

        } catch (error) {
            console.error('Match error:', error);
            loadingState.classList.add('hidden');
            matchBtn.classList.remove('hidden');
            document.querySelector('main').classList.remove('hidden'); // Restore upload section
            
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        }
    });

    resetBtn.addEventListener('click', () => {
        // Reset everything
        jdFile = null;
        cvFiles = [];
        
        jdFileInput.value = '';
        jdDropzone.classList.remove('hidden');
        jdPreview.classList.add('hidden');
        
        cvPreviewContainer.innerHTML = '';
        cvPreviewContainer.classList.add('hidden');
        cvCountBadge.textContent = '0 selected';
        
        updateMatchButton();
        
        resultsDashboard.classList.add('hidden');
        document.querySelector('main').classList.remove('hidden');
        matchBtn.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    });
});
