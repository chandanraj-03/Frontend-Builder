// js/post.js - Post related functionality including reading time, TOC, comments, and related posts

// ============================================
// POST MODULE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Post module initialized');
    
    // Initialize all post components
    initReadingTimeIndicator();
    initScrollProgressBar();
    initTableOfContents();
    initSyntaxHighlighting();
    initImageLightboxes();
    initShareButtons();
    initCommentsSystem();
    initAuthorBio();
    initRelatedPosts();
    initNewsletterSignup();
    initSocialLinks();
    
    // Setup post-specific event listeners
    setupPostListeners();
    
    // Generate post-specific structured data
    generatePostStructuredData();
});

// ============================================
// READING TIME INDICATOR
// ============================================

/**
 * Initialize reading time estimation
 */
function initReadingTimeIndicator() {
    const readingTimeElements = document.querySelectorAll('.reading-time-indicator');
    if (readingTimeElements.length === 0) return;
    
    const content = document.querySelector('.post-content');
    if (!content) return;
    
    const text = content.textContent || '';
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    readingTimeElements.forEach(element => {
        element.textContent = `${readingTime} min read`;
        element.setAttribute('aria-label', `Estimated reading time: ${readingTime} minutes`);
    });
    
    // Store reading time for analytics
    window.postReadingTime = readingTime;
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================

/**
 * Initialize scroll progress indicator
 */
function initScrollProgressBar() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) return;
    
    // Create progress bar if it doesn't exist
    if (!progressBar) {
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
        `;
        
        const bar = document.createElement('div');
        bar.className = 'scroll-progress-bar';
        bar.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #007bff, #0056b3);
            width: 0%;
            transition: width 0.1s ease;
        `;
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', '100');
        bar.setAttribute('aria-valuenow', '0');
        
        progressContainer.appendChild(bar);
        document.body.appendChild(progressContainer);
    }
    
    // Initial update
    updateScrollProgress();
    
    // Listen for scroll events
    window.addEventListener('scroll', throttle(updateScrollProgress, 100));
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
    
    progressBar.style.width = `${scrollPercent}%`;
    progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
    
    // Track reading progress for analytics
    if (scrollPercent > 25 && !window.readingProgress25) {
        window.readingProgress25 = true;
        trackReadingProgress(25);
    }
    if (scrollPercent > 50 && !window.readingProgress50) {
        window.readingProgress50 = true;
        trackReadingProgress(50);
    }
    if (scrollPercent > 75 && !window.readingProgress75) {
        window.readingProgress75 = true;
        trackReadingProgress(75);
    }
    if (scrollPercent > 90 && !window.readingProgress90) {
        window.readingProgress90 = true;
        trackReadingProgress(90);
    }
}

/**
 * Track reading progress for analytics
 */
function trackReadingProgress(percent) {
    console.log(`User read ${percent}% of the post`);
    // Implement analytics tracking here
    if (typeof gtag === 'function') {
        gtag('event', 'reading_progress', {
            post_id: window.postId,
            post_title: document.title,
            progress_percent: percent,
            reading_time: window.postReadingTime
        });
    }
}

// ============================================
// TABLE OF CONTENTS
// ============================================

/**
 * Initialize dynamic table of contents
 */
function initTableOfContents() {
    const tocContainer = document.querySelector('.table-of-contents');
    if (!tocContainer) return;
    
    const headings = document.querySelectorAll('.post-content h2, .post-content h3');
    if (headings.length === 0) {
        tocContainer.style.display = 'none';
        return;
    }
    
    // Generate TOC items
    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';
    
    headings.forEach((heading, index) => {
        // Ensure heading has an ID
        if (!heading.id) {
            heading.id = `heading-${index + 1}`;
        }
        
        const listItem = document.createElement('li');
        listItem.className = `toc-item toc-level-${heading.tagName.toLowerCase()}`;
        
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        link.className = 'toc-link';
        link.addEventListener('click', smoothScrollToHeading);
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
    
    tocContainer.appendChild(tocList);
    
    // Add toggle for mobile
    if (window.innerWidth <= 768) {
        addTocToggle(tocContainer);
    }
    
    // Initial highlight
    updateTocHighlighting();
    
    // Listen for scroll to update highlighting
    window.addEventListener('scroll', throttle(updateTocHighlighting, 100));
}

/**
 * Smooth scroll to heading
 */
function smoothScrollToHeading(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80; // Account for fixed header
        
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        // Update URL hash without jumping
        window.history.replaceState(null, null, `#${targetId}`);
    }
}

/**
 * Update TOC highlighting based on scroll position
 */
function updateTocHighlighting() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const headings = document.querySelectorAll('.post-content h2, .post-content h3');
    
    let currentHeading = null;
    const scrollPosition = window.scrollY + 100;
    
    headings.forEach(heading => {
        if (heading.offsetTop <= scrollPosition) {
            currentHeading = heading;
        }
    });
    
    if (currentHeading) {
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentHeading.id}`) {
                link.classList.add('active');
            }
        });
    }
}

/**
 * Add TOC toggle for mobile
 */
function addTocToggle(tocContainer) {
    const toggleButton = document.createElement('button');
    toggleButton.className = 'toc-toggle';
    toggleButton.textContent = 'Table of Contents';
    toggleButton.setAttribute('aria-expanded', 'false');
    
    toggleButton.addEventListener('click', () => {
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        toggleButton.setAttribute('aria-expanded', !isExpanded);
        tocContainer.classList.toggle('expanded');
    });
    
    tocContainer.parentNode.insertBefore(toggleButton, tocContainer);
}

// ============================================
// SYNTAX HIGHLIGHTING
// ============================================

/**
 * Initialize syntax highlighting with Prism.js
 */
function initSyntaxHighlighting() {
    // Check if Prism is available
    if (typeof Prism === 'undefined') {
        console.warn('Prism.js not loaded - syntax highlighting disabled');
        return;
    }
    
    const codeBlocks = document.querySelectorAll('pre code');
    if (codeBlocks.length === 0) return;
    
    // Add copy buttons to code blocks
    codeBlocks.forEach(block => {
        addCopyButton(block);
        
        // Add language label if not present
        const language = block.className.replace('language-', '');
        if (language && !block.parentNode.querySelector('.code-language')) {
            const langLabel = document.createElement('div');
            langLabel.className = 'code-language';
            langLabel.textContent = language;
            langLabel.style.cssText = `
                position: absolute;
                top: 0;
                right: 0;
                background: #333;
                color: white;
                padding: 2px 8px;
                font-size: 12px;
                border-bottom-left-radius: 4px;
            `;
            block.parentNode.style.position = 'relative';
            block.parentNode.appendChild(langLabel);
        }
    });
    
    // Apply Prism highlighting
    Prism.highlightAll();
}

/**
 * Add copy button to code blocks
 */
function addCopyButton(codeBlock) {
    const preElement = codeBlock.parentNode;
    if (preElement.querySelector('.copy-button')) return;
    
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.innerHTML = '📋';
    copyButton.setAttribute('aria-label', 'Copy code');
    copyButton.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255,255,255,0.8);
        border: 1px solid #ddd;
        border-radius: 3px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;
    
    preElement.style.position = 'relative';
    preElement.appendChild(copyButton);
    
    // Show button on hover
    preElement.addEventListener('mouseenter', () => {
        copyButton.style.opacity = '1';
    });
    
    preElement.addEventListener('mouseleave', () => {
        copyButton.style.opacity = '0';
    });
    
    // Copy functionality
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(codeBlock.textContent);
            copyButton.innerHTML = '✅';
            copyButton.disabled = true;
            
            setTimeout(() => {
                copyButton.innerHTML = '📋';
                copyButton.disabled = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
            copyButton.innerHTML = '❌';
            setTimeout(() => {
                copyButton.innerHTML = '📋';
            }, 2000);
        }
    });
}

// ============================================
// IMAGE LIGHTBOXES
// ============================================

/**
 * Initialize image lightbox functionality
 */
function initImageLightboxes() {
    const images = document.querySelectorAll('.post-content img:not([data-no-lightbox])');
    
    images.forEach(img => {
        // Skip very small images
        if (img.width < 100 && img.height < 100) return;
        
        img.style.cursor = 'zoom-in';
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', 'Click to enlarge image');
        
        img.addEventListener('click', () => openImageLightbox(img));
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openImageLightbox(img);
            }
        });
    });
}

/**
 * Open image lightbox
 */
function openImageLightbox(img) {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const imgElement = document.createElement('img');
    imgElement.src = img.src;
    imgElement.alt = img.alt;
    imgElement.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 4px;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'lightbox-close';
    closeButton.setAttribute('aria-label', 'Close lightbox');
    closeButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255,255,255,0.1);
        border: none;
        color: white;
        font-size: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
    `;
    
    const caption = document.createElement('div');
    caption.className = 'lightbox-caption';
    caption.textContent = img.alt || '';
    caption.style.cssText = `
        position: absolute;
        bottom: 20px;
        color: white;
        text-align: center;
        max-width: 80%;
    `;
    
    lightbox.appendChild(imgElement);
    lightbox.appendChild(closeButton);
    lightbox.appendChild(caption);
    document.body.appendChild(lightbox);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => {
        lightbox.style.opacity = '1';
    }, 10);
    
    // Close functionality
    closeButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard close
    document.addEventListener('keydown', function handleEscape(e) {
        if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', handleEscape);
        }
    });
    
    function closeLightbox() {
        lightbox.style.opacity = '0';
        setTimeout(() => {
            lightbox.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// ============================================
// SHARE BUTTONS
// ============================================

/**
 * Initialize share buttons functionality
 */
function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-button');
    if (shareButtons.length === 0) return;
    
    shareButtons.forEach(button => {
        const platform = button.dataset.platform;
        button.addEventListener('click', () => {
            shareContent(platform);
        });
    });
    
    // Add native share button if supported
    if (navigator.share) {
        addNativeShareButton();
    }
}

/**
 * Share content on social platforms
 */
function shareContent(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const text = encodeURIComponent(document.querySelector('meta[name="description"]')?.content || '');
    
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        linkedin: `https://www.linkedin.com/shareArticle?url=${url}&title=${title}`,
        reddit: `https://reddit.com/submit?url=${url}&title=${title}`,
        whatsapp: `https://wa.me/?text=${title}%20${url}`,
        telegram: `https://t.me/share/url?url=${url}&text=${title}`,
        email: `mailto:?subject=${title}&body=${text}%0A%0A${url}`
    };
    
    if (platform === 'copy') {
        copyToClipboard(window.location.href).then(success => {
            if (success) {
                showNotification('Link copied to clipboard!', 'success');
            }
        });
    } else if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

/**
 * Add native share button if Web Share API is supported
 */
function addNativeShareButton() {
    const shareContainer = document.querySelector('.share-buttons');
    if (!shareContainer) return;
    
    const nativeButton = document.createElement('button');
    nativeButton.className = 'share-button native-share';
    nativeButton.innerHTML = '📱';
    nativeButton.setAttribute('aria-label', 'Share using native share dialog');
    nativeButton.title = 'Native Share';
    
    nativeButton.addEventListener('click', async () => {
        try {
            await navigator.share({
                title: document.title,
                text: document.querySelector('meta[name="description"]')?.content || '',
                url: window.location.href
            });
        } catch (err) {
            console.log('Native share cancelled or failed:', err);
        }
    });
    
    shareContainer.appendChild(nativeButton);
}

// ============================================
// COMMENTS SYSTEM
// ============================================

/**
 * Initialize comments system
 */
function initCommentsSystem() {
    const commentsContainer = document.querySelector('.comments-system');
    if (!commentsContainer) return;
    
    // Load comments if not already loaded
    if (commentsContainer.dataset.loaded !== 'true') {
        loadComments();
    }
    
    // Initialize comment form
    initCommentForm();
    
    // Setup reply functionality
    setupReplySystem();
}

/**
 * Load comments from API
 */
async function loadComments() {
    const commentsContainer = document.querySelector('.comments-system');
    if (!commentsContainer) return;
    
    try {
        const postId = commentsContainer.dataset.postId;
        const response = await fetch(`/api/comments?post_id=${postId}`);
        
        if (response.ok) {
            const comments = await response.json();
            displayComments(comments);
            commentsContainer.dataset.loaded = 'true';
        }
    } catch (error) {
        console.error('Failed to load comments:', error);
        showCommentsError();
    }
}

/**
 * Display comments in the container
 */
function displayComments(comments) {
    const commentsContainer = document.querySelector('.comments-system');
    if (!commentsContainer) return;
    
    const commentsList = commentsContainer.querySelector('.comments-list') || document.createElement('div');
    commentsList.className = 'comments-list';
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
    } else {
        commentsList.innerHTML = buildCommentsHTML(comments);
    }
    
    if (!commentsContainer.contains(commentsList)) {
        commentsContainer.appendChild(commentsList);
    }
    
    // Re-initialize reply buttons
    setupReplySystem();
}

/**
 * Build HTML for comments tree
 */
function buildCommentsHTML(comments, level = 0) {
    return comments.map(comment => `
        <div class="comment level-${level}" data-comment-id="${comment.id}">
            <div class="comment-header">
                <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar">
                <div class="comment-meta">
                    <span class="comment-author">${comment.author.name}</span>
                    <span class="comment-date">${formatCommentDate(comment.date)}</span>
                </div>
            </div>
            <div class="comment-content">
                ${comment.content}
            </div>
            <button class="comment-reply" data-comment-id="${comment.id}">
                Reply
            </button>
            ${comment.replies && comment.replies.length > 0 ? 
                `<div class="comment-replies">${buildCommentsHTML(comment.replies, level + 1)}</div>` : ''}
        </div>
    `).join('');
}

/**
 * Format comment date
 */
function formatCommentDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return 'Today';
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

/**
 * Initialize comment form
 */
function initCommentForm() {
    const commentForm = document.querySelector('.comment-form');
    if (!commentForm) return;
    
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(commentForm);
        const commentData = {
            content: formData.get('content'),
            author_name: formData.get('author_name'),
            author_email: formData.get('author_email'),
            parent_id: formData.get('parent_id') || null
        };
        
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentData)
            });
            
            if (response.ok) {
                const newComment = await response.json();
                addNewComment(newComment);
                commentForm.reset();
                
                // Reset reply state if this was a reply
                const replyTo = commentForm.querySelector('[name="parent_id"]');
                if (replyTo && replyTo.value) {
                    replyTo.value = '';
                    commentForm.querySelector('.replying-to')?.remove();
                }
            }
        } catch (error) {
            console.error('Failed to submit comment:', error);
            showNotification('Failed to submit comment. Please try again.', 'error');
        }
    });
}

/**
 * Setup reply system for comments
 */
function setupReplySystem() {
    const replyButtons = document.querySelectorAll('.comment-reply');
    
    replyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentId = this.dataset.commentId;
            const comment = this.closest('.comment');
            const authorName = comment.querySelector('.comment-author').textContent;
            
            setReplyTo(commentId, authorName);
        });
    });
}

/**
 * Set reply target for comment form
 */
function setReplyTo(commentId, authorName) {
    const commentForm = document.querySelector('.comment-form');
    if (!commentForm) return;
    
    // Remove any existing reply indicator
    commentForm.querySelector('.replying-to')?.remove();
    
    // Add reply indicator
    const replyingTo = document.createElement('div');
    replyingTo.className = 'replying-to';
    replyingTo.innerHTML = `
        Replying to <strong>${authorName}</strong>
        <button type="button" class="cancel-reply">Cancel</button>
    `;
    
    commentForm.insertBefore(replyingTo, commentForm.firstChild);
    
    // Set parent ID
    let parentIdField = commentForm.querySelector('[name="parent_id"]');
    if (!parentIdField) {
        parentIdField = document.createElement('input');
        parentIdField.type = 'hidden';
        parentIdField.name = 'parent_id';
        commentForm.appendChild(parentIdField);
    }
    parentIdField.value = commentId;
    
    // Focus comment textarea
    const textarea = commentForm.querySelector('textarea');
    if (textarea) {
        textarea.focus();
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Cancel reply handler
    replyingTo.querySelector('.cancel-reply').addEventListener('click', () => {
        replyingTo.remove();
        parentIdField.value = '';
    });
}

/**
 * Add new comment to the list
 */
function addNewComment(comment) {
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;
    
    // Remove "no comments" message if present
    const noComments = commentsList.querySelector('.no-comments');
    if (noComments) {
        noComments.remove();
    }
    
    // Add new comment
    const commentHTML = buildCommentsHTML([comment]);
    commentsList.insertAdjacentHTML('afterbegin', commentHTML);
    
    // Re-initialize reply button for new comment
    setupReplySystem();
    
    showNotification('Comment submitted successfully!', 'success');
}

/**
 * Show comments error message
 */
function showCommentsError() {
    const commentsContainer = document.querySelector('.comments-system');
    if (!commentsContainer) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'comments-error';
    errorDiv.innerHTML = `
        <p>Failed to load comments. <button class="retry-comments">Retry</button></p>
    `;
    
    commentsContainer.appendChild(errorDiv);
    
    errorDiv.querySelector('.retry-comments').addEventListener('click', loadComments);
}

// ============================================
// AUTHOR BIO
// ============================================

/**
 * Initialize author bio section
 */
function initAuthorBio() {
    const authorBio = document.querySelector('.author-bio');
    if (!authorBio) return;
    
    // Add social links if available
    const socialLinks = authorBio.dataset.socialLinks;
    if (socialLinks) {
        try {
            const socialData = JSON.parse(socialLinks);
            addSocialLinksToBio(authorBio, socialData);
        } catch (error) {
            console.error('Failed to parse social links:', error);
        }
    }
    
    // Add post count if available
    const postCount = authorBio.dataset.postCount;
    if (postCount) {
        addPostCountToBio(authorBio, postCount);
    }
}

/**
 * Add social links to author bio
 */
function addSocialLinksToBio(authorBio, socialData) {
    const socialContainer = document.createElement('div');
    socialContainer.className = 'author-social';
    
    Object.entries(socialData).forEach(([platform, url]) => {
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.className = `social-link social-${platform}`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.innerHTML = getSocialIcon(platform);
            link.setAttribute('aria-label', `${platform} profile`);
            
            socialContainer.appendChild(link);
        }
    });
    
    authorBio.appendChild(socialContainer);
}

/**
 * Get social media icon
 */
function getSocialIcon(platform) {
    const icons = {
        twitter: '🐦',
        facebook: '📘',
        linkedin: '💼',
        github: '🐙',
        instagram: '📸',
        youtube: '📺',
        website: '🌐'
    };
    
    return icons[platform] || '🔗';
}

/**
 * Add post count to author bio
 */
function addPostCountToBio(authorBio, postCount) {
    const countElement = document.createElement('div');
    countElement.className = 'author-post-count';
    countElement.textContent = `${postCount} post${postCount !== 1 ? 's' : ''} published`;
    
    authorBio.appendChild(countElement);
}

// ============================================
// RELATED POSTS
// ============================================

/**
 * Initialize related posts functionality
 */
function initRelatedPosts() {
    const relatedContainer = document.querySelector('.related-posts');
    if (!relatedContainer) return;
    
    // Load related posts if not already loaded
    if (relatedContainer.dataset.loaded !== 'true') {
        loadRelatedPosts();
    }
}

/**
 * Load related posts from API
 */
async function loadRelatedPosts() {
    const relatedContainer = document.querySelector('.related-posts');
    if (!relatedContainer) return;
    
    try {
        const postId = relatedContainer.dataset.postId;
        const response = await fetch(`/api/related-posts?post_id=${postId}`);
        
        if (response.ok) {
            const relatedPosts = await response.json();
            displayRelatedPosts(relatedPosts);
            relatedContainer.dataset.loaded = 'true';
        }
    } catch (error) {
        console.error('Failed to load related posts:', error);
        relatedContainer.style.display = 'none';
    }
}

/**
 * Display related posts
 */
function displayRelatedPosts(posts) {
    const relatedContainer = document.querySelector('.related-posts');
    if (!relatedContainer) return;
    
    if (posts.length === 0) {
        relatedContainer.style.display = 'none';
        return;
    }
    
    const postsGrid = document.createElement('div');
    postsGrid.className = 'posts-grid related-posts-grid';
    
    posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            ${post.image ? `
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                </div>
            ` : ''}
            
            <div class="post-content">
                <h3 class="post-title">
                    <a href="${post.url}">${post.title}</a>
                </h3>
                
                ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ''}
                
                <div class="post-meta">
                    ${post.date ? `<time datetime="${post.date}">${formatDate(post.date)}</time>` : ''}
                    ${post.readingTime ? `<span class="reading-time">${post.readingTime} min read</span>` : ''}
                </div>
            </div>
        `;
        
        postsGrid.appendChild(postElement);
    });
    
    relatedContainer.appendChild(postsGrid);
}

// ============================================
// NEWSLETTER SIGNUP
// ============================================

/**
 * Initialize newsletter signup form
 */
function initNewsletterSignup() {
    const newsletterForm = document.querySelector('.newsletter-signup form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(newsletterForm);
        const email = formData.get('email');
        
        if (!validateEmail(email)) {
            showNewsletterError('Please enter a valid email address');
            return;
        }
        
        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                showNewsletterSuccess();
                newsletterForm.reset();
            } else {
                showNewsletterError('Subscription failed. Please try again.');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            showNewsletterError('Network error. Please try again.');
        }
    });
}

/**
 * Validate email address
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show newsletter success message
 */
function showNewsletterSuccess() {
    const newsletterForm = document.querySelector('.newsletter-signup');
    if (!newsletterForm) return;
    
    const successDiv = document.createElement('div');
    successDiv.className = 'newsletter-success';
    successDiv.textContent = 'Successfully subscribed! Thank you.';
    successDiv.style.cssText = `
        background: #d4edda;
        color: #155724;
        padding: 10px;
        border-radius: 4px;
        margin-top: 10px;
    `;
    
    newsletterForm.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

/**
 * Show newsletter error message
 */
function showNewsletterError(message) {
    const newsletterForm = document.querySelector('.newsletter-signup');
    if (!newsletterForm) return;
    
    // Remove existing error
    newsletterForm.querySelector('.newsletter-error')?.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'newsletter-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 4px;
        margin-top: 10px;
    `;
    
    newsletterForm.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// ============================================
// SOCIAL LINKS
// ============================================

/**
 * Initialize social links
 */
function initSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-links a');
    
    socialLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        
        // Add analytics tracking
        link.addEventListener('click', () => {
            trackSocialClick(link.href);
        });
    });
}

/**
 * Track social link clicks
 */
function trackSocialClick(url) {
    console.log('Social link clicked:', url);
    // Implement analytics tracking here
    if (typeof gtag === 'function') {
        gtag('event', 'social_click', {
            social_url: url,
            post_id: window.postId,
            post_title: document.title
        });
    }
}

// ============================================
// STRUCTURED DATA
// ============================================

/**
 * Generate post-specific structured data
 */
function generatePostStructuredData() {
    const article = document.querySelector('article');
    if (!article) return;
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.querySelector('h1')?.textContent || document.title,
        "description": document.querySelector('meta[name="description"]')?.content || '',
        "image": article.querySelector('img')?.src || '',
        "datePublished": article.querySelector('time[datetime]')?.getAttribute('datetime') || '',
        "dateModified": article.querySelector('time[datetime]')?.getAttribute('datetime') || '',
        "author": {
            "@type": "Person",
            "name": document.querySelector('.author-name')?.textContent || ''
        },
        "publisher": {
            "@type": "Organization",
            "name": document.title.split(' - ')[0] || document.title,
            "logo": {
                "@type": "ImageObject",
                "url": `${window.location.origin}/logo.png`
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
        }
    };
    
    // Insert structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

/**
 * Setup post-specific event listeners
 */
function setupPostListeners() {
    // Listen for post content clicks (for footnotes, etc.)
    const postContent = document.querySelector('.post-content');
    if (postContent) {
        postContent.addEventListener('click', handleContentClicks);
    }
    
    // Listen for post visibility changes (for reading analytics)
    if (document.visibilityState) {
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Listen for post unload (for reading time tracking)
    window.addEventListener('beforeunload', trackReadingSession);
}

/**
 * Handle content clicks within post
 */
function handleContentClicks(e) {
    // Handle footnote clicks
    if (e.target.classList.contains('footnote')) {
        e.preventDefault();
        const footnoteId = e.target.getAttribute('href').substring(1);
        const footnote = document.getElementById(footnoteId);
        
        if (footnote) {
            footnote.scrollIntoView({ behavior: 'smooth' });
            footnote.classList.add('highlighted');
            setTimeout(() => {
                footnote.classList.remove('highlighted');
            }, 2000);
        }
    }
}

/**
 * Handle visibility changes for reading analytics
 */
function handleVisibilityChange() {
    if (document.hidden) {
        // Post is no longer visible
        window.postLastHidden = Date.now();
    } else if (window.postLastHidden) {
        // Post became visible again
        const hiddenDuration = Date.now() - window.postLastHidden;
        if (hiddenDuration > 300000) { // 5 minutes
            trackReadingResume();
        }
    }
}

/**
 * Track reading session before unload
 */
function trackReadingSession() {
    const scrollPercent = Math.round((window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    const readingTime = window.postReadingTime || 0;
    
    // Send final reading analytics
    if (typeof gtag === 'function') {
        gtag('event', 'reading_session_end', {
            post_id: window.postId,
            post_title: document.title,
            final_scroll_percent: scrollPercent,
            total_reading_time: readingTime
        });
    }
}

/**
 * Track reading resume after long pause
 */
function trackReadingResume() {
    if (typeof gtag === 'function') {
        gtag('event', 'reading_resume', {
            post_id: window.postId,
            post_title: document.title,
            pause_duration: Date.now() - window.postLastHidden
        });
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // Reuse from main.js if available
    if (typeof window.AppUtils?.showNotification === 'function') {
        window.AppUtils.showNotification(message, type);
        return;
    }
    
    // Fallback implementation
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Copy to clipboard helper
 */
async function copyToClipboard(text) {
    // Reuse from main.js if available
    if (typeof window.AppUtils?.copyToClipboard === 'function') {
        return window.AppUtils.copyToClipboard(text);
    }
    
    // Fallback implementation
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text:', err);
        return false;
    }
}

/**
 * Throttle function for performance
 */
function throttle(func, limit) {
    // Reuse from main.js if available
    if (typeof window.AppUtils?.throttle === 'function') {
        return window.AppUtils.throttle(func, limit);
    }
    
    // Fallback implementation
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
 * Format date for display
 */
function formatDate(dateString) {
    // Reuse from main.js if available
    if (typeof window.AppUtils?.formatDate === 'function') {
        return window.AppUtils.formatDate(dateString);
    }
    
    // Fallback implementation
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}