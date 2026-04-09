// data_input.js - Data input and upload functionality for Table Tennis Statistics Dashboard

// Data input state and configuration
const DataInputState = {
    currentForm: 'manual',
    uploadProgress: 0,
    validationErrors: [],
    templateData: [],
    isUploading: false,
    batchSize: 50,
    currentBatch: 0
};

// Initialize data input when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-page="upload"]')) {
        initializeDataInput();
    }
});

// Listen for upload page loaded event
document.addEventListener('uploadLoaded', () => {
    initializeDataInput();
});

// Core data input initialization
function initializeDataInput() {
    console.log('Initializing Data Input Module...');
    
    // Initialize all data input components
    initializeDataInputComponents();
    
    // Set up event listeners
    setupDataInputEventListeners();
    
    // Load template data
    loadTemplateData();
    
    // Initialize form validation
    initializeFormValidation();
    
    console.log('Data Input Module initialized successfully');
}

// Initialize all data input components
function initializeDataInputComponents() {
    // Initialize file upload component
    initializeFileUpload();
    
    // Initialize manual data entry form
    initializeManualEntryForm();
    
    // Initialize data validation feedback
    initializeValidationFeedback();
    
    // Initialize upload progress indicator
    initializeProgressIndicator();
    
    // Initialize sample template download
    initializeTemplateDownload();
    
    // Initialize quick actions
    initializeDataInputQuickActions();
}

// Setup data input event listeners
function setupDataInputEventListeners() {
    // Form tab switching
    document.addEventListener('click', (e) => {
        if (e.target.matches('.form-tab') || e.target.closest('.form-tab')) {
            const tab = e.target.dataset.tab || e.target.closest('.form-tab').dataset.tab;
            switchInputForm(tab);
        }
    });
    
    // File upload events
    document.addEventListener('change', (e) => {
        if (e.target.matches('#file-upload-input')) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    // Drag and drop events
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleFileDrop);
    }
    
    // Manual form submission
    const manualForm = document.getElementById('manual-entry-form');
    if (manualForm) {
        manualForm.addEventListener('submit', handleManualFormSubmit);
    }
    
    // Batch processing controls
    document.addEventListener('click', (e) => {
        if (e.target.matches('.batch-control')) {
            handleBatchControl(e.target.dataset.action);
        }
    });
    
    // Template download
    document.addEventListener('click', (e) => {
        if (e.target.matches('.template-download')) {
            downloadTemplate(e.target.dataset.format);
        }
    });
    
    // Data validation events
    document.addEventListener('validationComplete', (e) => {
        displayValidationResults(e.detail);
    });
}

// Initialize file upload component
function initializeFileUpload() {
    const uploadComponent = document.getElementById('file-upload-component');
    if (!uploadComponent) return;
    
    // Create file input if it doesn't exist
    if (!document.getElementById('file-upload-input')) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'file-upload-input';
        fileInput.accept = '.csv,.json,.xlsx,.txt';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }
    
    // Initialize upload button
    const uploadBtn = document.getElementById('upload-trigger');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            document.getElementById('file-upload-input').click();
        });
    }
    
    // Initialize drag and drop zone
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.innerHTML = `
            <div class="drop-zone-content">
                <i class="upload-icon"></i>
                <p>Drag and drop files here or</p>
                <button type="button" class="btn btn-outline" id="browse-files">Browse Files</button>
                <p class="file-types">Supported formats: CSV, JSON, XLSX</p>
            </div>
        `;
        
        dropZone.querySelector('#browse-files').addEventListener('click', () => {
            document.getElementById('file-upload-input').click();
        });
    }
}

// Initialize manual data entry form
function initializeManualEntryForm() {
    const form = document.getElementById('manual-entry-form');
    if (!form) return;
    
    // Set up form structure
    form.innerHTML = `
        <div class="form-section">
            <h3>Match Information</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="match-date">Date *</label>
                    <input type="date" id="match-date" required>
                </div>
                <div class="form-group">
                    <label for="match-opponent">Opponent</label>
                    <input type="text" id="match-opponent" placeholder="Optional">
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3>Serve Analysis</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="serve-type">Serve Type *</label>
                    <select id="serve-type" required>
                        <option value="">Select serve type</option>
                        <option value="Pendulum">Pendulum</option>
                        <option value="Chop">Chop</option>
                        <option value="Tomahawk">Tomahawk</option>
                        <option value="Forehand">Forehand</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="serve-success">Successful Serves *</label>
                    <input type="number" id="serve-success" min="0" max="100" required>
                </div>
                <div class="form-group">
                    <label for="serve-total">Total Serves *</label>
                    <input type="number" id="serve-total" min="1" max="100" required>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3>Stroke Analysis</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="stroke-type">Stroke Type *</label>
                    <select id="stroke-type" required>
                        <option value="">Select stroke type</option>
                        <option value="Backhand loop">Backhand loop</option>
                        <option value="Forehand loop">Forehand loop</option>
                        <option value="Backhand Serve">Backhand Serve</option>
                        <option value="Forehand Serve">Forehand Serve</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="stroke-success">Successful Strokes</label>
                    <input type="number" id="stroke-success" min="0" max="100">
                </div>
                <div class="form-group">
                    <label for="stroke-total">Total Strokes</label>
                    <input type="number" id="stroke-total" min="0" max="100">
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3>Focus Analysis</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="focus-side">Focus Side *</label>
                    <select id="focus-side" required>
                        <option value="">Select focus side</option>
                        <option value="Right">Right</option>
                        <option value="Left">Left</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="points-scored">Points Scored *</label>
                    <input type="number" id="points-scored" min="0" max="21" required>
                </div>
                <div class="form-group">
                    <label for="match-duration">Match Duration (minutes)</label>
                    <input type="number" id="match-duration" min="1" max="120">
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h3>Additional Notes</h3>
            <div class="form-group">
                <label for="match-notes">Notes</label>
                <textarea id="match-notes" placeholder="Any additional observations or comments..." rows="3"></textarea>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="clear-form">Clear Form</button>
            <button type="submit" class="btn btn-primary" id="submit-form">Add Record</button>
        </div>
    `;
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    form.querySelector('#match-date').value = today;
    
    // Add real-time success rate calculation
    const serveSuccess = form.querySelector('#serve-success');
    const serveTotal = form.querySelector('#serve-total');
    const successRateDisplay = document.createElement('div');
    successRateDisplay.className = 'success-rate-display';
    serveTotal.parentNode.appendChild(successRateDisplay);
    
    function updateSuccessRate() {
        const success = parseInt(serveSuccess.value) || 0;
        const total = parseInt(serveTotal.value) || 0;
        const rate = total > 0 ? Math.round((success / total) * 100) : 0;
        successRateDisplay.textContent = `Success Rate: ${rate}%`;
        successRateDisplay.className = `success-rate-display ${rate >= 80 ? 'high' : rate >= 60 ? 'medium' : 'low'}`;
    }
    
    serveSuccess.addEventListener('input', updateSuccessRate);
    serveTotal.addEventListener('input', updateSuccessRate);
    
    // Clear form handler
    form.querySelector('#clear-form').addEventListener('click', clearManualForm);
}

// Initialize data validation feedback
function initializeValidationFeedback() {
    const feedbackContainer = document.getElementById('data-validation-feedback');
    if (!feedbackContainer) return;
    
    feedbackContainer.innerHTML = `
        <div class="validation-header">
            <h3>Data Validation</h3>
            <span class="validation-status" id="validation-status">Ready</span>
        </div>
        <div class="validation-results" id="validation-results">
            <p class="validation-message">No data validated yet</p>
        </div>
        <div class="validation-actions" id="validation-actions" style="display: none;">
            <button class="btn btn-warning" id="fix-errors">Fix Errors</button>
            <button class="btn btn-success" id="import-valid">Import Valid Data</button>
        </div>
    `;
}

// Initialize upload progress indicator
function initializeProgressIndicator() {
    const progressContainer = document.getElementById('upload-progress-indicator');
    if (!progressContainer) return;
    
    progressContainer.innerHTML = `
        <div class="progress-container" style="display: none;">
            <div class="progress-header">
                <h4>Upload Progress</h4>
                <span class="progress-percentage">0%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-details">
                <span class="file-name">No file selected</span>
                <span class="upload-speed">-</span>
            </div>
            <div class="progress-actions">
                <button class="btn btn-secondary" id="cancel-upload">Cancel</button>
            </div>
        </div>
    `;
}

// Initialize template download
function initializeTemplateDownload() {
    const templateSection = document.getElementById('sample-data-template-download');
    if (!templateSection) return;
    
    templateSection.innerHTML = `
        <div class="template-section">
            <h3>Download Sample Templates</h3>
            <p>Use these templates to ensure your data is formatted correctly:</p>
            <div class="template-options">
                <button class="btn btn-outline template-download" data-format="csv">
                    <i class="download-icon"></i>
                    Download CSV Template
                </button>
                <button class="btn btn-outline template-download" data-format="json">
                    <i class="download-icon"></i>
                    Download JSON Template
                </button>
                <button class="btn btn-outline template-download" data-format="xlsx">
                    <i class="download-icon"></i>
                    Download Excel Template
                </button>
            </div>
            <div class="template-preview">
                <h4>Template Structure Preview</h4>
                <pre><code>date,serveType,strokeType,focus,successRate,points
2024-01-15,Pendulum,Forehand Serve,Right,85,11
2024-01-15,Chop,Backhand Serve,Left,72,9</code></pre>
            </div>
        </div>
    `;
}

// Initialize data input quick actions
function initializeDataInputQuickActions() {
    const quickActions = document.getElementById('data-upload-quick-action');
    if (!quickActions) return;
    
    quickActions.innerHTML = `
        <div class="quick-actions-grid">
            <button class="quick-action" data-action="add-single">
                <i class="add-icon"></i>
                <span>Add Single Record</span>
            </button>
            <button class="quick-action" data-action="upload-batch">
                <i class="upload-icon"></i>
                <span>Upload Batch Data</span>
            </button>
            <button class="quick-action" data-action="download-template">
                <i class="download-icon"></i>
                <span>Get Template</span>
            </button>
            <button class="quick-action" data-action="validate-data">
                <i class="validate-icon"></i>
                <span>Validate Data</span>
            </button>
        </div>
    `;
    
    // Add event listeners to quick actions
    quickActions.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', () => {
            handleQuickAction(btn.dataset.action);
        });
    });
}

// Switch between input forms
function switchInputForm(formType) {
    if (DataInputState.currentForm === formType) return;
    
    // Hide current form
    const currentForm = document.querySelector(`.input-form.active`);
    if (currentForm) {
        App.utils.fadeOut(currentForm, 200);
        currentForm.classList.remove('active');
    }
    
    // Show new form
    const newForm = document.querySelector(`.input-form[data-form="${formType}"]`);
    if (newForm) {
        setTimeout(() => {
            newForm.classList.add('active');
            App.utils.fadeIn(newForm, 200);
            DataInputState.currentForm = formType;
            
            // Update active tab
            document.querySelectorAll('.form-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === formType);
            });
        }, 200);
    }
}

// Handle file selection
function handleFileSelection(file) {
    if (!file) return;
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['csv', 'json', 'xlsx', 'txt'];
    
    if (!validExtensions.includes(fileExtension)) {
        App.showNotification('Invalid file format. Please upload CSV, JSON, or XLSX files.', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        App.showNotification('File size too large. Maximum size is 10MB.', 'error');
        return;
    }
    
    // Show file info and start processing
    showFileInfo(file);
    processUploadedFile(file);
}

// Handle drag and drop events
function handleDragOver(e) {
    e.preventDefault();
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.classList.add('dragover');
    }
}

function handleDragLeave(e) {
    e.preventDefault();
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.classList.remove('dragover');
    }
}

function handleFileDrop(e) {
    e.preventDefault();
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.classList.remove('dragover');
    }
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
}

// Show file information
function showFileInfo(file) {
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.innerHTML = `
            <div class="file-info">
                <i class="file-icon"></i>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                    <div class="file-type">${file.type || 'Unknown'}</div>
                </div>
                <button class="btn btn-sm btn-outline" id="change-file">Change</button>
            </div>
        `;
        
        dropZone.querySelector('#change-file').addEventListener('click', () => {
            document.getElementById('file-upload-input').click();
        });
    }
}

// Process uploaded file
function processUploadedFile(file) {
    DataInputState.isUploading = true;
    DataInputState.uploadProgress = 0;
    
    // Show progress indicator
    showUploadProgress(file.name);
    
    // Simulate file processing (in real app, this would be actual file processing)
    const progressInterval = setInterval(() => {
        DataInputState.uploadProgress += Math.random() * 10;
        
        if (DataInputState.uploadProgress >= 100) {
            DataInputState.uploadProgress = 100;
            clearInterval(progressInterval);
            completeFileUpload(file);
        }
        
        updateProgressIndicator();
    }, 200);
    
    // Cancel upload handler
    document.getElementById('cancel-upload').addEventListener('click', () => {
        clearInterval(progressInterval);
        cancelUpload();
    });
}

// Show upload progress
function showUploadProgress(fileName) {
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'block';
        progressContainer.querySelector('.file-name').textContent = fileName;
    }
}

// Update progress indicator
function updateProgressIndicator() {
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    
    if (progressFill) {
        progressFill.style.width = `${DataInputState.uploadProgress}%`;
    }
    
    if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(DataInputState.uploadProgress)}%`;
    }
}

// Complete file upload
function completeFileUpload(file) {
    DataInputState.isUploading = false;
    
    // Parse file based on type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let parsedData;
            
            switch(fileExtension) {
                case 'csv':
                    parsedData = parseCSVData(e.target.result);
                    break;
                case 'json':
                    parsedData = JSON.parse(e.target.result);
                    break;
                case 'xlsx':
                    parsedData = parseExcelData(e.target.result);
                    break;
                default:
                    throw new Error('Unsupported file format');
            }
            
            // Validate parsed data
            validateUploadedData(parsedData);
            
        } catch (error) {
            App.showNotification(`Error processing file: ${error.message}`, 'error');
            resetUploadState();
        }
    };
    
    reader.onerror = function() {
        App.showNotification('Error reading file', 'error');
        resetUploadState();
    };
    
    if (fileExtension === 'xlsx') {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
}

// Parse CSV data
function parseCSVData(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV file is empty or invalid');
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;
        
        const record = {};
        headers.forEach((header, index) => {
            record[header] = values[index];
        });
        data.push(record);
    }
    
    return data;
}

// Parse Excel data (simplified - in real app, use a library like SheetJS)
function parseExcelData(arrayBuffer) {
    // This is a simplified version - in production, use a proper Excel parsing library
    console.log('Excel parsing would be implemented with a library like SheetJS');
    return [
        { date: '2024-01-15', serveType: 'Pendulum', strokeType: 'Forehand Serve', focus: 'Right', successRate: 85, points: 11 },
        { date: '2024-01-15', serveType: 'Chop', strokeType: 'Backhand Serve', focus: 'Left', successRate: 72, points: 9 }
    ];
}

// Validate uploaded data
function validateUploadedData(data) {
    DataInputState.validationErrors = [];
    
    if (!Array.isArray(data)) {
        DataInputState.validationErrors.push('Data must be an array of records');
        displayValidationResults();
        return;
    }
    
    const requiredFields = ['date', 'serveType', 'strokeType', 'focus', 'successRate', 'points'];
    
    data.forEach((record, index) => {
        const recordErrors = [];
        
        // Check required fields
        requiredFields.forEach(field => {
            if (!(field in record) || record[field] === '' || record[field] == null) {
                recordErrors.push(`Missing required field: ${field}`);
            }
        });
        
        // Validate field types and values
        if (record.date) {
            if (!isValidDate(record.date)) {
                recordErrors.push('Invalid date format (expected YYYY-MM-DD)');
            }
        }
        
        if (record.serveType) {
            const validServeTypes = ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'];
            if (!validServeTypes.includes(record.serveType)) {
                recordErrors.push(`Invalid serve type: ${record.serveType}`);
            }
        }
        
        if (record.strokeType) {
            const validStrokeTypes = ['Backhand loop', 'Forehand loop', 'Backhand Serve', 'Forehand Serve'];
            if (!validStrokeTypes.includes(record.strokeType)) {
                recordErrors.push(`Invalid stroke type: ${record.strokeType}`);
            }
        }
        
        if (record.focus) {
            if (!['Right', 'Left'].includes(record.focus)) {
                recordErrors.push('Focus must be "Right" or "Left"');
            }
        }
        
        if (record.successRate) {
            const rate = parseInt(record.successRate);
            if (isNaN(rate) || rate < 0 || rate > 100) {
                recordErrors.push('Success rate must be between 0 and 100');
            }
        }
        
        if (record.points) {
            const points = parseInt(record.points);
            if (isNaN(points) || points < 0) {
                recordErrors.push('Points must be a positive number');
            }
        }
        
        if (recordErrors.length > 0) {
            DataInputState.validationErrors.push({
                recordIndex: index,
                record: record,
                errors: recordErrors
            });
        }
    });
    
    displayValidationResults();
}

// Display validation results
function displayValidationResults() {
    const validationContainer = document.getElementById('validation-results');
    const statusElement = document.getElementById('validation-status');
    const actionsElement = document.getElementById('validation-actions');
    
    if (!validationContainer || !statusElement) return;
    
    const totalRecords = DataInputState.validationErrors.reduce((acc, error) => {
        return Math.max(acc, error.recordIndex + 1);
    }, 0);
    
    const errorCount = DataInputState.validationErrors.length;
    const validCount = totalRecords - errorCount;
    
    if (errorCount === 0 && totalRecords > 0) {
        statusElement.textContent = 'Valid';
        statusElement.className = 'validation-status valid';
        validationContainer.innerHTML = `
            <div class="validation-success">
                <i class="success-icon"></i>
                <p>All ${totalRecords} records are valid and ready for import!</p>
            </div>
        `;
        actionsElement.style.display = 'block';
    } else if (errorCount > 0) {
        statusElement.textContent = 'Errors Found';
        statusElement.className = 'validation-status error';
        validationContainer.innerHTML = `
            <div class="validation-errors">
                <i class="error-icon"></i>
                <p>Found ${errorCount} records with errors out of ${totalRecords} total records.</p>
                <div class="error-list">
                    ${DataInputState.validationErrors.map(error => `
                        <div class="error-item">
                            <strong>Record ${error.recordIndex + 1}:</strong>
                            <ul>
                                ${error.errors.map(err => `<li>${err}</li>`).join('')}
                            </ul>
                            <pre>${JSON.stringify(error.record, null, 2)}</pre>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        actionsElement.style.display = 'block';
    } else {
        statusElement.textContent = 'Ready';
        statusElement.className = 'validation-status ready';
        validationContainer.innerHTML = '<p class="validation-message">No data validated yet</p>';
        actionsElement.style.display = 'none';
    }
    
    // Set up action buttons
    const fixErrorsBtn = document.getElementById('fix-errors');
    const importValidBtn = document.getElementById('import-valid');
    
    if (fixErrorsBtn) {
        fixErrorsBtn.onclick = showErrorCorrectionInterface;
    }
    
    if (importValidBtn) {
        importValidBtn.onclick = importValidData;
    }
}

// Show error correction interface
function showErrorCorrectionInterface() {
    const modal = document.getElementById('error-correction-modal') || createErrorCorrectionModal();
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Correct Data Errors</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="error-correction-interface">
                    <div class="error-navigation">
                        <button class="btn btn-sm" id="prev-error">Previous</button>
                        <span class="error-counter">Error 1 of ${DataInputState.validationErrors.length}</span>
                        <button class="btn btn-sm" id="next-error">Next</button>
                    </div>
                    <div class="error-form" id="error-form">
                        <!-- Error correction form will be populated here -->
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary close-modal">Cancel</button>
                <button class="btn btn-primary" id="save-correction">Save Correction</button>
            </div>
        </div>
    `;
    
    App.utils.fadeIn(modal);
    loadErrorCorrectionForm(0);
}

// Load error correction form for specific error
function loadErrorCorrectionForm(errorIndex) {
    const error = DataInputState.validationErrors[errorIndex];
    if (!error) return;
    
    const formContainer = document.getElementById('error-form');
    formContainer.innerHTML = `
        <h4>Record ${error.recordIndex + 1}</h4>
        <div class="correction-form">
            ${Object.keys(error.record).map(field => `
                <div class="form-group">
                    <label for="correct-${field}">${field}</label>
                    <input type="text" id="correct-${field}" value="${error.record[field]}" 
                           class="${error.errors.some(e => e.includes(field)) ? 'error-field' : ''}">
                </div>
            `).join('')}
        </div>
        <div class="error-messages">
            <h5>Errors to fix:</h5>
            <ul>
                ${error.errors.map(err => `<li>${err}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Update navigation
    document.querySelector('.error-counter').textContent = `Error ${errorIndex + 1} of ${DataInputState.validationErrors.length}`;
}

// Import valid data
function importValidData() {
    // Filter out records with errors
    const errorIndices = new Set(DataInputState.validationErrors.map(error => error.recordIndex));
    const validData = DataInputState.templateData.filter((_, index) => !errorIndices.has(index));
    
    if (validData.length === 0) {
        App.showNotification('No valid data to import', 'warning');
        return;
    }
    
    // Add valid data to main dataset
    validData.forEach(record => {
        const newId = App.state.dataset.length > 0 ? 
            Math.max(...App.state.dataset.map(item => item.id)) + 1 : 1;
        
        App.state.dataset.push({
            id: newId,
            date: record.date,
            serveType: record.serveType,
            strokeType: record.strokeType,
            focus: record.focus,
            successRate: parseInt(record.successRate),
            points: parseInt(record.points)
        });
    });
    
    App.showNotification(`Successfully imported ${validData.length} records`, 'success');
    
    // Refresh dashboard if it's active
    if (App.state.currentPage === 'dashboard' && window.Dashboard) {
        window.Dashboard.refresh();
    }
    
    // Reset upload state
    resetUploadState();
}

// Handle manual form submission
function handleManualFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate form
    const errors = validateManualForm(formData);
    
    if (errors.length > 0) {
        showFormErrors(errors);
        return;
    }
    
    // Create new record
    const newRecord = {
        id: App.state.dataset.length > 0 ? 
            Math.max(...App.state.dataset.map(item => item.id)) + 1 : 1,
        date: form.querySelector('#match-date').value,
        serveType: form.querySelector('#serve-type').value,
        strokeType: form.querySelector('#stroke-type').value,
        focus: form.querySelector('#focus-side').value,
        successRate: parseInt(form.querySelector('#serve-success').value),
        points: parseInt(form.querySelector('#points-scored').value)
    };
    
    // Add to dataset
    App.state.dataset.push(newRecord);
    
    // Show success message
    App.showNotification('Record added successfully!', 'success');
    
    // Clear form
    clearManualForm();
    
    // Refresh dashboard if it's active
    if (App.state.currentPage === 'dashboard' && window.Dashboard) {
        window.Dashboard.refresh();
    }
}

// Validate manual form
function validateManualForm(formData) {
    const errors = [];
    
    // Basic validation
    if (!formData.get('match-date')) errors.push('Date is required');
    if (!formData.get('serve-type')) errors.push('Serve type is required');
    if (!formData.get('stroke-type')) errors.push('Stroke type is required');
    if (!formData.get('focus-side')) errors.push('Focus side is required');
    
    const serveSuccess = parseInt(formData.get('serve-success'));
    const serveTotal = parseInt(formData.get('serve-total'));
    if (serveSuccess > serveTotal) errors.push('Successful serves cannot exceed total serves');
    
    return errors;
}

// Show form errors
function showFormErrors(errors) {
    const errorContainer = document.getElementById('form-errors') || createFormErrorContainer();
    
    errorContainer.innerHTML = `
        <div class="form-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        </div>
    `;
    
    App.utils.fadeIn(errorContainer);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        App.utils.fadeOut(errorContainer);
    }, 5000);
}

function createFormErrorContainer() {
    const container = document.createElement('div');
    container.id = 'form-errors';
    container.className = 'form-error-container';
    document.body.appendChild(container);
    return container;
}

// Clear manual form
function clearManualForm() {
    const form = document.getElementById('manual-entry-form');
    if (form) {
        form.reset();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        form.querySelector('#match-date').value = today;
    }
}

// Handle quick actions
function handleQuickAction(action) {
    switch(action) {
        case 'add-single':
            switchInputForm('manual');
            break;
        case 'upload-batch':
            switchInputForm('upload');
            document.getElementById('file-upload-input').click();
            break;
        case 'download-template':
            downloadTemplate('csv');
            break;
        case 'validate-data':
            validateCurrentData();
            break;
    }
}

// Download template
function downloadTemplate(format) {
    let templateData;
    let mimeType;
    let extension;
    
    switch(format) {
        case 'csv':
            templateData = `date,serveType,strokeType,focus,successRate,points\n2024-01-15,Pendulum,Forehand Serve,Right,85,11\n2024-01-15,Chop,Backhand Serve,Left,72,9`;
            mimeType = 'text/csv';
            extension = 'csv';
            break;
        case 'json':
            templateData = JSON.stringify([
                { date: '2024-01-15', serveType: 'Pendulum', strokeType: 'Forehand Serve', focus: 'Right', successRate: 85, points: 11 },
                { date: '2024-01-15', serveType: 'Chop', strokeType: 'Backhand Serve', focus: 'Left', successRate: 72, points: 9 }
            ], null, 2);
            mimeType = 'application/json';
            extension = 'json';
            break;
        case 'xlsx':
            // In production, generate actual Excel file
            templateData = 'Excel template generation would use a library like SheetJS';
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            extension = 'xlsx';
            break;
    }
    
    const dataUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(templateData)}`;
    const fileName = `table-tennis-template.${extension}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    link.click();
    
    App.showNotification(`Template downloaded as ${format.toUpperCase()}`, 'success');
}

// Validate current data
function validateCurrentData() {
    if (App.state.dataset.length === 0) {
        App.showNotification('No data to validate', 'warning');
        return;
    }
    
    // Perform validation on current dataset
    const errors = [];
    
    App.state.dataset.forEach((record, index) => {
        const recordErrors = [];
        
        // Check for required fields
        if (!record.date) recordErrors.push('Missing date');
        if (!record.serveType) recordErrors.push('Missing serve type');
        if (!record.strokeType) recordErrors.push('Missing stroke type');
        if (!record.focus) recordErrors.push('Missing focus');
        if (record.successRate == null) recordErrors.push('Missing success rate');
        if (record.points == null) recordErrors.push('Missing points');
        
        // Validate values
        if (record.successRate < 0 || record.successRate > 100) {
            recordErrors.push('Invalid success rate');
        }
        
        if (record.points < 0) {
            recordErrors.push('Invalid points value');
        }
        
        if (recordErrors.length > 0) {
            errors.push({
                recordIndex: index,
                record: record,
                errors: recordErrors
            });
        }
    });
    
    if (errors.length > 0) {
        DataInputState.validationErrors = errors;
        displayValidationResults();
        App.showNotification(`Found ${errors.length} records with issues`, 'warning');
    } else {
        App.showNotification('All data is valid!', 'success');
    }
}

// Initialize form validation
function initializeFormValidation() {
    // Add real-time validation to form fields
    const form = document.getElementById('manual-entry-form');
    if (form) {
        form.querySelectorAll('input, select').forEach(field => {
            field.addEventListener('blur', validateField);
            field.addEventListener('input', clearFieldError);
        });
    }
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Clear previous error
    clearFieldError(e);
    
    // Field-specific validation
    let error = '';
    
    if (field.required && !value) {
        error = 'This field is required';
    } else if (field.type === 'number') {
        const numValue = parseInt(value);
        if (isNaN(numValue)) {
            error = 'Please enter a valid number';
        } else if (field.min && numValue < parseInt(field.min)) {
            error = `Value must be at least ${field.min}`;
        } else if (field.max && numValue > parseInt(field.max)) {
            error = `Value cannot exceed ${field.max}`;
        }
    } else if (field.type === 'date') {
        if (!isValidDate(value)) {
            error = 'Please enter a valid date';
        }
    }
    
    if (error) {
        showFieldError(field, error);
    }
}

function showFieldError(field, error) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = error;
    App.utils.fadeIn(errorElement);
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        App.utils.fadeOut(errorElement);
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function resetUploadState() {
    DataInputState.uploadProgress = 0;
    DataInputState.isUploading = false;
    DataInputState.validationErrors = [];
    DataInputState.templateData = [];
    
    // Reset UI elements
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
    
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.innerHTML = `
            <div class="drop-zone-content">
                <i class="upload-icon"></i>
                <p>Drag and drop files here or</p>
                <button type="button" class="btn btn-outline" id="browse-files">Browse Files</button>
                <p class="file-types">Supported formats: CSV, JSON, XLSX</p>
            </div>
        `;
        
        dropZone.querySelector('#browse-files').addEventListener('click', () => {
            document.getElementById('file-upload-input').click();
        });
    }
}

function cancelUpload() {
    DataInputState.isUploading = false;
    DataInputState.uploadProgress = 0;
    resetUploadState();
    App.showNotification('Upload cancelled', 'info');
}

// Load template data (sample data for demonstration)
function loadTemplateData() {
    DataInputState.templateData = [
        { date: '2024-01-15', serveType: 'Pendulum', strokeType: 'Forehand Serve', focus: 'Right', successRate: 85, points: 11 },
        { date: '2024-01-15', serveType: 'Chop', strokeType: 'Backhand Serve', focus: 'Left', successRate: 72, points: 9 },
        { date: '2024-01-16', serveType: 'Tomahawk', strokeType: 'Forehand Loop', focus: 'Right', successRate: 91, points: 15 },
        { date: '2024-01-16', serveType: 'Forehand', strokeType: 'Backhand Loop', focus: 'Left', successRate: 68, points: 8 }
    ];
}

// Create error correction modal
function createErrorCorrectionModal() {
    const modal = document.createElement('div');
    modal.id = 'error-correction-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
    return modal;
}

// Export data input functionality
window.DataInput = {
    state: DataInputState,
    uploadFile: handleFileSelection,
    addManualRecord: handleManualFormSubmit,
    validateData: validateCurrentData,
    downloadTemplate: downloadTemplate,
    utils: {
        formatFileSize: formatFileSize,
        isValidDate: isValidDate
    }
};