// js/progress.js - Progress indicators, reading time, scroll tracking, and user progress functionality

// ============================================
// PROGRESS MODULE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Progress module initialized');
    
    // Initialize all progress components
    initScrollProgressBar();
    initReadingTimeIndicator();
    initReadingProgressTracker();
    initContentProgressIndicators();
    initGoalTracking();
    initProgressAnalytics();
    
    // Setup progress event listeners
    setupProgressListeners();
    
    // Restore saved progress if available
    restoreUserProgress();
});

// ============================================
// SCROLL PROGRESS BAR
// ============================================

/**
 * Initialize scroll progress bar
 */
function initScrollProgressBar() {
    // Create scroll progress bar if it doesn't exist
    if (!document.querySelector('.scroll-progress-bar')) {
        createScrollProgressBar();
    }
    
    // Update progress on initial load
    updateScrollProgress();
    
    // Setup scroll event listener
    window.addEventListener('scroll', throttle(updateScrollProgress, 100));
}

/**
 * Create scroll progress bar element
 */
function createScrollProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress-container';
    progressContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: transparent;
        z-index: 10000;
        pointer-events: none;
    `;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    progressBar.style.cssText = `
        height: 100%;
        background: linear-gradient(90deg, #007bff, #0056b3);
        width: 0%;
        transition: width 0.1s ease;
        position: relative;
        overflow: hidden;
    `;
    
    // Add shimmer effect
    const shimmer = document.createElement('div');
    shimmer.className = 'progress-shimmer';
    shimmer.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
    `;
    
    progressBar.appendChild(shimmer);
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
    
    // Add CSS animation for shimmer
    if (!document.querySelector('#progress-animations')) {
        const style = document.createElement('style');
        style.id = 'progress-animations';
        style.textContent = `
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Update scroll progress bar
 */
function updateScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) return;
    
    const scrollTop = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    
    // Update progress bar width
    progressBar.style.width = `${scrollPercent}%`;
    
    // Update ARIA attributes for accessibility
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute('aria-label', `Page scroll progress: ${Math.round(scrollPercent)}%`);
    
    // Track reading progress milestones
    trackScrollMilestones(scrollPercent);
    
    // Update page title with progress (optional)
    updatePageTitleProgress(scrollPercent);
}

/**
 * Track scroll milestones for analytics
 */
function trackScrollMilestones(scrollPercent) {
    const milestones = [25, 50, 75, 90, 100];
    
    milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !window[`progressMilestone${milestone}`]) {
            window[`progressMilestone${milestone}`] = true;
            trackProgressEvent('scroll_milestone', {
                milestone: milestone,
                scroll_percent: Math.round(scrollPercent),
                page_url: window.location.href,
                page_title: document.title
            });
            
            // Show milestone notification (optional)
            if (milestone >= 50) {
                showProgressNotification(`You've read ${milestone}% of this content`);
            }
        }
    });
}

/**
 * Update page title with progress indicator
 */
function updatePageTitleProgress(scrollPercent) {
    if (scrollPercent > 5 && scrollPercent < 95) {
        const originalTitle = document.title.replace(/^\[\d+%\]\s*/, '');
        document.title = `[${Math.round(scrollPercent)}%] ${originalTitle}`;
    } else if (scrollPercent >= 95 && document.title.startsWith('[')) {
        // Remove progress indicator when near completion
        document.title = document.title.replace(/^\[\d+%\]\s*/, '');
    }
}

// ============================================
// READING TIME INDICATOR
// ============================================

/**
 * Initialize reading time estimation
 */
function initReadingTimeIndicator() {
    const readingTimeElements = document.querySelectorAll('.reading-time-indicator');
    const content = document.querySelector('.post-content') || document.querySelector('article') || document.body;
    
    if (!content) return;
    
    // Calculate reading time
    const readingTime = calculateReadingTime(content);
    
    // Update existing elements
    readingTimeElements.forEach(element => {
        element.textContent = `${readingTime} min read`;
        element.setAttribute('aria-label', `Estimated reading time: ${readingTime} minutes`);
    });
    
    // Create indicator if none exists
    if (readingTimeElements.length === 0) {
        createReadingTimeIndicator(readingTime);
    }
    
    // Store reading time for tracking
    window.pageReadingTime = readingTime;
    
    // Track reading time calculation
    trackProgressEvent('reading_time_calculated', {
        reading_time: readingTime,
        word_count: getWordCount(content),
        page_url: window.location.href
    });
}

/**
 * Calculate reading time from content
 */
function calculateReadingTime(contentElement) {
    const text = contentElement.textContent || '';
    const wordCount = text.trim().split(/\s+/).length;
    
    // Average reading speed: 200-250 words per minute
    const wordsPerMinute = 200;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    
    return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Get word count from content
 */
function getWordCount(contentElement) {
    const text = contentElement.textContent || '';
    return text.trim().split(/\s+/).length;
}

/**
 * Create reading time indicator
 */
function createReadingTimeIndicator(readingTime) {
    // Check if we should add to article header
    const articleHeader = document.querySelector('.article-header, .post-header');
    
    if (articleHeader) {
        const timeElement = document.createElement('div');
        timeElement.className = 'reading-time-indicator';
        timeElement.innerHTML = `
            <span class="time-icon">⏱️</span>
            <span class="time-text">${readingTime} min read</span>
        `;
        timeElement.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 14px;
            color: #666;
            margin-left: 10px;
        `;
        
        articleHeader.appendChild(timeElement);
    }
}

// ============================================
// READING PROGRESS TRACKER
// ============================================

/**
 * Initialize reading progress tracking
 */
function initReadingProgressTracker() {
    // Only track on content pages
    if (!document.querySelector('.post-content, article')) return;
    
    // Setup visibility tracking
    setupVisibilityTracking();
    
    // Setup time-based tracking
    setupTimeTracking();
    
    // Setup section-based tracking
    setupSectionTracking();
    
    // Save progress periodically
    setInterval(saveReadingProgress, 30000); // Every 30 seconds
}

/**
 * Setup visibility change tracking
 */
function setupVisibilityTracking() {
    let lastVisibleTime = Date.now();
    let totalVisibleTime = 0;
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page became hidden
            const visibleDuration = Date.now() - lastVisibleTime;
            totalVisibleTime += visibleDuration;
            
            trackProgressEvent('reading_paused', {
                duration_ms: visibleDuration,
                total_visible_ms: totalVisibleTime,
                scroll_percent: getScrollPercent()
            });
            
        } else {
            // Page became visible again
            lastVisibleTime = Date.now();
            
            trackProgressEvent('reading_resumed', {
                total_visible_ms: totalVisibleTime,
                scroll_percent: getScrollPercent()
            });
        }
    });
    
    // Track total reading time on unload
    window.addEventListener('beforeunload', () => {
        if (!document.hidden) {
            totalVisibleTime += Date.now() - lastVisibleTime;
        }
        
        trackProgressEvent('reading_session_end', {
            total_reading_ms: totalVisibleTime,
            scroll_percent: getScrollPercent(),
            estimated_reading_time: window.pageReadingTime * 60000 // Convert to milliseconds
        });
        
        saveFinalProgress(totalVisibleTime);
    });
}

/**
 * Setup time-based reading tracking
 */
function setupTimeTracking() {
    let readingStartTime = Date.now();
    let isReading = false;
    
    // Check if user is actively reading (scrolling or recent interaction)
    const activityEvents = ['scroll', 'mousemove', 'keydown', 'touchstart'];
    
    activityEvents.forEach(event => {
        window.addEventListener(event, debounce(() => {
            if (!isReading) {
                isReading = true;
                readingStartTime = Date.now();
                trackProgressEvent('reading_started', {
                    scroll_percent: getScrollPercent()
                });
            }
            
            // Reset reading timer on activity
            clearTimeout(window.readingTimeout);
            window.readingTimeout = setTimeout(() => {
                if (isReading) {
                    const readingDuration = Date.now() - readingStartTime;
                    isReading = false;
                    
                    trackProgressEvent('reading_stopped', {
                        duration_ms: readingDuration,
                        scroll_percent: getScrollPercent()
                    });
                }
            }, 10000); // 10 seconds of inactivity
        }, 500));
    });
}

/**
 * Setup section-based progress tracking
 */
function setupSectionTracking() {
    const sections = document.querySelectorAll('section, h2, h3');
    const observedSections = new Set();
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id || entry.target.textContent.substring(0, 50);
                
                if (!observedSections.has(sectionId)) {
                    observedSections.add(sectionId);
                    
                    trackProgressEvent('section_read', {
                        section_id: sectionId,
                        section_title: entry.target.textContent.substring(0, 100),
                        scroll_percent: getScrollPercent(),
                        section_index: Array.from(sections).indexOf(entry.target)
                    });
                }
            }
        });
    }, {
        threshold: 0.5, // 50% of section visible
        rootMargin: '0px 0px -50px 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Get current scroll percentage
 */
function getScrollPercent() {
    const scrollTop = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    return scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
}

// ============================================
// CONTENT PROGRESS INDICATORS
// ============================================

/**
 * Initialize content progress indicators
 */
function initContentProgressIndicators() {
    // Progress bars for multi-step content
    initMultiStepProgress();
    
    // Progress indicators for lists and collections
    initCollectionProgress();
    
    // Progress for interactive elements
    initInteractiveProgress();
}

/**
 * Initialize multi-step progress indicators
 */
function initMultiStepProgress() {
    const multiStepContainers = document.querySelectorAll('[data-steps], .multi-step');
    
    multiStepContainers.forEach(container => {
        const steps = container.querySelectorAll('.step, [data-step]');
        const progressBar = container.querySelector('.steps-progress') || createStepsProgressBar(steps.length);
        
        if (!container.contains(progressBar)) {
            container.insertBefore(progressBar, container.firstChild);
        }
        
        // Update progress based on current step
        updateStepsProgress(container, steps, progressBar);
        
        // Listen for step changes
        container.addEventListener('stepchange', (e) => {
            updateStepsProgress(container, steps, progressBar);
        });
    });
}

/**
 * Create steps progress bar
 */
function createStepsProgressBar(totalSteps) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'steps-progress';
    progressContainer.style.cssText = `
        width: 100%;
        height: 6px;
        background: #e9ecef;
        border-radius: 3px;
        margin-bottom: 20px;
        overflow: hidden;
    `;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'steps-progress-bar';
    progressBar.style.cssText = `
        height: 100%;
        background: #28a745;
        width: 0%;
        transition: width 0.3s ease;
    `;
    
    const stepsIndicator = document.createElement('div');
    stepsIndicator.className = 'steps-indicator';
    stepsIndicator.style.cssText = `
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        font-size: 12px;
        color: #666;
    `;
    
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(stepsIndicator);
    
    return progressContainer;
}

/**
 * Update steps progress
 */
function updateStepsProgress(container, steps, progressBar) {
    const currentStep = container.querySelector('.step.active, [data-step].active');
    const currentIndex = currentStep ? Array.from(steps).indexOf(currentStep) : 0;
    const progressPercent = ((currentIndex + 1) / steps.length) * 100;
    
    progressBar.querySelector('.steps-progress-bar').style.width = `${progressPercent}%`;
    
    // Update steps indicator
    const stepsIndicator = progressBar.querySelector('.steps-indicator');
    stepsIndicator.innerHTML = '';
    
    steps.forEach((step, index) => {
        const stepDot = document.createElement('span');
        stepDot.textContent = index + 1;
        stepDot.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${index <= currentIndex ? '#28a745' : '#e9ecef'};
            color: ${index <= currentIndex ? 'white' : '#666'};
            font-weight: ${index === currentIndex ? 'bold' : 'normal'};
        `;
        stepsIndicator.appendChild(stepDot);
    });
}

/**
 * Initialize collection progress tracking
 */
function initCollectionProgress() {
    const collections = document.querySelectorAll('.collection, [data-total-items]');
    
    collections.forEach(collection => {
        const totalItems = parseInt(collection.dataset.totalItems) || 
                          collection.querySelectorAll('.collection-item, li').length;
        
        if (totalItems > 1) {
            const progressIndicator = createCollectionProgressIndicator(totalItems);
            collection.insertBefore(progressIndicator, collection.firstChild);
            
            // Update progress as items are viewed
            setupCollectionProgressTracking(collection, progressIndicator);
        }
    });
}

/**
 * Create collection progress indicator
 */
function createCollectionProgressIndicator(totalItems) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'collection-progress';
    progressContainer.style.cssText = `
        margin-bottom: 15px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 5px;
    `;
    
    progressContainer.innerHTML = `
        <div class="progress-text" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span class="progress-label">Progress</span>
            <span class="progress-count">0/${totalItems}</span>
        </div>
        <div class="progress-bar" style="height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
            <div class="progress-fill" style="height: 100%; background: #17a2b8; width: 0%; transition: width 0.3s ease;"></div>
        </div>
    `;
    
    return progressContainer;
}

/**
 * Setup collection progress tracking
 */
function setupCollectionProgressTracking(collection, progressIndicator) {
    const items = collection.querySelectorAll('.collection-item, li');
    const totalItems = items.length;
    const viewedItems = new Set();
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const itemIndex = Array.from(items).indexOf(item);
                
                if (!viewedItems.has(itemIndex)) {
                    viewedItems.add(itemIndex);
                    updateCollectionProgress(progressIndicator, viewedItems.size, totalItems);
                    
                    // Track item view
                    trackProgressEvent('collection_item_viewed', {
                        item_index: itemIndex,
                        total_items: totalItems,
                        collection_id: collection.id || 'unknown'
                    });
                }
            }
        });
    }, {
        threshold: 0.5
    });
    
    items.forEach(item => {
        observer.observe(item);
    });
}

/**
 * Update collection progress display
 */
function updateCollectionProgress(progressIndicator, viewedCount, totalCount) {
    const progressFill = progressIndicator.querySelector('.progress-fill');
    const progressCount = progressIndicator.querySelector('.progress-count');
    
    const progressPercent = (viewedCount / totalCount) * 100;
    
    progressFill.style.width = `${progressPercent}%`;
    progressCount.textContent = `${viewedCount}/${totalCount}`;
    
    // Add completion celebration
    if (viewedCount === totalCount) {
        progressIndicator.style.background = '#d4edda';
        progressFill.style.background = '#28a745';
        
        showProgressNotification(`Completed ${totalCount} items!`, 'success');
        
        trackProgressEvent('collection_completed', {
            total_items: totalCount,
            collection_id: progressIndicator.closest('[id]')?.id || 'unknown'
        });
    }
}

/**
 * Initialize interactive progress tracking
 */
function initInteractiveProgress() {
    // Track form completion progress
    setupFormProgressTracking();
    
    // Track quiz/completion progress
    setupQuizProgressTracking();
    
    // Track video/watch progress
    setupMediaProgressTracking();
}

// ============================================
// GOAL TRACKING
// ============================================

/**
 * Initialize goal tracking functionality
 */
function initGoalTracking() {
    // Reading goals
    setupReadingGoals();
    
    // Learning goals
    setupLearningGoals();
    
    // Completion goals
    setupCompletionGoals();
}

/**
 * Setup reading goals
 */
function setupReadingGoals() {
    const readingGoals = document.querySelectorAll('[data-reading-goal]');
    
    readingGoals.forEach(goalElement => {
        const goalType = goalElement.dataset.readingGoal; // 'time', 'words', 'pages'
        const goalValue = parseInt(goalElement.dataset.goalValue) || 1;
        
        // Create goal tracker
        const tracker = createGoalTracker(goalType, goalValue);
        goalElement.appendChild(tracker);
        
        // Update progress based on user activity
        updateGoalProgress(tracker, goalType, goalValue);
    });
}

/**
 * Create goal tracker element
 */
function createGoalTracker(goalType, goalValue) {
    const tracker = document.createElement('div');
    tracker.className = 'goal-tracker';
    tracker.style.cssText = `
        margin-top: 10px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 5px;
        border-left: 4px solid #007bff;
    `;
    
    const goalLabels = {
        'time': 'minutes',
        'words': 'words',
        'pages': 'pages'
    };
    
    tracker.innerHTML = `
        <div class="goal-header" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span class="goal-label" style="font-weight: bold;">Reading Goal</span>
            <span class="goal-target">0/${goalValue} ${goalLabels[goalType] || ''}</span>
        </div>
        <div class="goal-progress" style="height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
            <div class="goal-progress-bar" style="height: 100%; background: #007bff; width: 0%; transition: width 0.3s ease;"></div>
        </div>
        <div class="goal-message" style="font-size: 12px; color: #666; margin-top: 5px;"></div>
    `;
    
    return tracker;
}

/**
 * Update goal progress
 */
function updateGoalProgress(tracker, goalType, goalValue) {
    let currentProgress = 0;
    
    const updateProgress = () => {
        const progressBar = tracker.querySelector('.goal-progress-bar');
        const goalTarget = tracker.querySelector('.goal-target');
        const goalMessage = tracker.querySelector('.goal-message');
        
        const progressPercent = (currentProgress / goalValue) * 100;
        progressBar.style.width = `${Math.min(100, progressPercent)}%`;
        goalTarget.textContent = `${currentProgress}/${goalValue} ${goalType === 'time' ? 'min' : goalType}`;
        
        // Update message based on progress
        if (progressPercent >= 100) {
            goalMessage.textContent = 'Goal achieved! 🎉';
            goalMessage.style.color = '#28a745';
            tracker.style.borderLeftColor = '#28a745';
            progressBar.style.background = '#28a745';
            
            trackProgressEvent('goal_achieved', {
                goal_type: goalType,
                goal_value: goalValue,
                actual_value: currentProgress
            });
        } else if (progressPercent >= 75) {
            goalMessage.textContent = 'Almost there!';
        } else if (progressPercent >= 50) {
            goalMessage.textContent = 'Halfway there!';
        }
    };
    
    // Update based on goal type
    switch (goalType) {
        case 'time':
            // Track reading time
            setInterval(() => {
                if (!document.hidden) {
                    currentProgress += 1; // Increment by minute
                    updateProgress();
                }
            }, 60000); // Update every minute
            break;
            
        case 'words':
            // Track words read
            const content = document.querySelector('.post-content') || document.body;
            const observer = new MutationObserver(() => {
                const words = getWordCount(content);
                currentProgress = Math.min(words, goalValue);
                updateProgress();
            });
            
            observer.observe(content, {
                childList: true,
                subtree: true,
                characterData: true
            });
            break;
    }
    
    updateProgress();
}

// ============================================
// PROGRESS ANALYTICS AND PERSISTENCE
// ============================================

/**
 * Initialize progress analytics
 */
function initProgressAnalytics() {
    // Setup progress storage
    setupProgressStorage();
    
    // Setup progress reporting
    setupProgressReporting();
    
    // Setup progress sharing
    setupProgressSharing();
}

/**
 * Setup progress storage
 */
function setupProgressStorage() {
    // Check for existing progress
    const pageId = getPageId();
    const storedProgress = localStorage.getItem(`progress_${pageId}`);
    
    if (storedProgress) {
        try {
            const progress = JSON.parse(storedProgress);
            window.userProgress = progress;
            
            trackProgressEvent('progress_restored', {
                page_id: pageId,
                scroll_percent: progress.scrollPercent || 0,
                reading_time: progress.readingTime || 0
            });
        } catch (error) {
            console.error('Failed to parse stored progress:', error);
        }
    }
}

/**
 * Save reading progress
 */
function saveReadingProgress() {
    const pageId = getPageId();
    const progress = {
        pageId: pageId,
        url: window.location.href,
        title: document.title,
        scrollPercent: getScrollPercent(),
        readingTime: window.userProgress?.readingTime || 0,
        lastUpdated: Date.now(),
        completedSections: window.completedSections || []
    };
    
    localStorage.setItem(`progress_${pageId}`, JSON.stringify(progress));
    window.userProgress = progress;
    
    // Sync with server if user is logged in
    if (isUserLoggedIn()) {
        syncProgressToServer(progress);
    }
}

/**
 * Save final progress on page unload
 */
function saveFinalProgress(totalReadingTime) {
    const pageId = getPageId();
    const progress = {
        pageId: pageId,
        url: window.location.href,
        title: document.title,
        scrollPercent: getScrollPercent(),
        readingTime: totalReadingTime,
        completed: getScrollPercent() >= 90,
        completedAt: Date.now(),
        lastUpdated: Date.now()
    };
    
    localStorage.setItem(`progress_${pageId}`, JSON.stringify(progress));
    
    // Mark as completed in reading history
    if (progress.completed) {
        addToCompletedContent(pageId);
    }
}

/**
 * Restore user progress
 */
function restoreUserProgress() {
    const pageId = getPageId();
    const progress = window.userProgress;
    
    if (progress && progress.scrollPercent > 10) {
        // Ask user if they want to continue where they left off
        if (confirm(`You were ${Math.round(progress.scrollPercent)}% through this content. Continue from where you left off?`)) {
            window.scrollTo({
                top: (progress.scrollPercent / 100) * (document.documentElement.scrollHeight - window.innerHeight),
                behavior: 'smooth'
            });
            
            showProgressNotification(`Resumed from ${Math.round(progress.scrollPercent)}%`);
        }
    }
}

/**
 * Get unique page identifier
 */
function getPageId() {
    return window.location.pathname.replace(/\//g, '_') + 
           window.location.search.replace(/[?&=]/g, '_');
}

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
    return document.cookie.includes('session=') || localStorage.getItem('auth_token');
}

/**
 * Sync progress to server
 */
async function syncProgressToServer(progress) {
    try {
        const response = await fetch('/api/progress/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(progress)
        });
        
        if (!response.ok) {
            throw new Error('Failed to sync progress');
        }
    } catch (error) {
        console.error('Progress sync failed:', error);
        // Queue for retry later
        queueProgressForSync(progress);
    }
}

/**
 * Track progress event for analytics
 */
function trackProgressEvent(eventName, eventData = {}) {
    console.log(`Progress Event: ${eventName}`, eventData);
    
    // Send to analytics
    if (typeof gtag === 'function') {
        gtag('event', eventName, {
            ...eventData,
            page_title: document.title,
            page_url: window.location.href,
            user_id: getUserId()
        });
    }
    
    // Send to custom analytics endpoint
    sendProgressAnalytics(eventName, eventData);
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

/**
 * Setup all progress event listeners
 */
function setupProgressListeners() {
    // Listen for progress-related custom events
    document.addEventListener('progress:update', (e) => {
        if (e.detail && e.detail.type) {
            handleProgressUpdate(e.detail);
        }
    });
    
    // Listen for completion events
    document.addEventListener('content:completed', () => {
        markContentAsCompleted();
    });
    
    // Listen for progress reset
    document.addEventListener('progress:reset', () => {
        resetProgress();
    });
}

/**
 * Handle progress update from custom events
 */
function handleProgressUpdate(detail) {
    switch (detail.type) {
        case 'scroll':
            updateScrollProgress();
            break;
        case 'reading':
            updateReadingProgress(detail.value);
            break;
        case 'completion':
            updateCompletionProgress(detail.value);
            break;
    }
}

/**
 * Mark content as completed
 */
function markContentAsCompleted() {
    const pageId = getPageId();
    const completedContent = JSON.parse(localStorage.getItem('completed_content') || '[]');
    
    if (!completedContent.includes(pageId)) {
        completedContent.push({
            id: pageId,
            url: window.location.href,
            title: document.title,
            completedAt: Date.now()
        });
        
        localStorage.setItem('completed_content', JSON.stringify(completedContent));
        
        // Show completion celebration
        showCompletionCelebration();
        
        trackProgressEvent('content_completed', {
            page_id: pageId,
            total_completed: completedContent.length
        });
    }
}

/**
 * Show completion celebration
 */
function showCompletionCelebration() {
    const celebration = document.createElement('div');
    celebration.className = 'completion-celebration';
    celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    celebration.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
        <h3 style="margin: 0 0 10px 0;">Content Completed!</h3>
        <p style="margin: 0 0 20px 0;">Great job finishing this content!</p>
        <button class="close-celebration" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        ">Continue</button>
    `;
    
    document.body.appendChild(celebration);
    
    // Add CSS animation
    if (!document.querySelector('#celebration-animation')) {
        const style = document.createElement('style');
        style.id = 'celebration-animation';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Close celebration
    celebration.querySelector('.close-celebration').addEventListener('click', () => {
        celebration.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => celebration.remove(), 300);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (celebration.parentNode) {
            celebration.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => celebration.remove(), 300);
        }
    }, 5000);
}

/**
 * Reset progress for current page
 */
function resetProgress() {
    const pageId = getPageId();
    
    // Clear local storage
    localStorage.removeItem(`progress_${pageId}`);
    
    // Reset window variables
    window.userProgress = null;
    window.completedSections = [];
    
    // Reset UI elements
    document.querySelectorAll('.progress-fill, .progress-bar').forEach(el => {
        el.style.width = '0%';
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showProgressNotification('Progress reset successfully');
    
    trackProgressEvent('progress_reset', { page_id: pageId });
}

/**
 * Show progress notification
 */
function showProgressNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `progress-notification progress-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Get user ID for tracking
 */
function getUserId() {
    return localStorage.getItem('user_id') || 'anonymous';
}

/**
 * Send progress analytics to server
 */
async function sendProgressAnalytics(eventName, eventData) {
    try {
        await fetch('/api/analytics/progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event: eventName,
                data: eventData,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`
            })
        });
    } catch (error) {
        console.error('Analytics send failed:', error);
    }
}

/**
 * Queue progress for sync retry
 */
function queueProgressForSync(progress) {
    const queue = JSON.parse(localStorage.getItem('progress_sync_queue') || '[]');
    queue.push(progress);
    localStorage.setItem('progress_sync_queue', JSON.stringify(queue));
    
    // Try to sync queue periodically
    if (!window.syncQueueInterval) {
        window.syncQueueInterval = setInterval(syncProgressQueue, 60000); // Every minute
    }
}

// ============================================
// EXPORT FOR GLOBAL USAGE
// ============================================

// Make progress functions available globally
window.Progress = {
    trackScroll: updateScrollProgress,
    trackReading: (time) => trackProgressEvent('reading_tracked', { time }),
    markComplete: markContentAsCompleted,
    reset: resetProgress,
    getProgress: () => window.userProgress,
    showNotification: showProgressNotification
};

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    initScrollProgressBar();
    initReadingTimeIndicator();
    initReadingProgressTracker();
    setupProgressListeners();
});