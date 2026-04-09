// js/newsletter.js - Newsletter subscription, management, and integration functionality

// ============================================
// NEWSLETTER MODULE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Newsletter module initialized');
    
    // Initialize all newsletter components
    initNewsletterForms();
    initNewsletterPreferences();
    initNewsletterModals();
    initNewsletterAnalytics();
    initNewsletterIntegrations();
    
    // Setup newsletter event listeners
    setupNewsletterListeners();
    
    // Check subscription status
    checkSubscriptionStatus();
    
    // Load newsletter content if needed
    if (document.querySelector('.newsletter-content')) {
        loadNewsletterContent();
    }
});

// ============================================
// NEWSLETTER FORMS
// ============================================

/**
 * Initialize newsletter subscription forms
 */
function initNewsletterForms() {
    const forms = document.querySelectorAll('.newsletter-signup form, [data-newsletter-form]');
    
    forms.forEach(form => {
        // Add enhanced form features
        enhanceNewsletterForm(form);
        
        // Setup form validation
        setupFormValidation(form);
        
        // Setup form submission
        form.addEventListener('submit', handleNewsletterSubmit);
        
        // Setup auto-save for form data
        setupFormAutoSave(form);
    });
    
    // Create floating newsletter signup if enabled
    if (shouldShowFloatingSignup()) {
        createFloatingSignup();
    }
}

/**
 * Enhance newsletter form with additional features
 */
function enhanceNewsletterForm(form) {
    // Add email validation feedback
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
        addEmailValidation(emailInput);
    }
    
    // Add name field if not present
    if (!form.querySelector('input[name="name"]') && form.dataset.collectName === 'true') {
        addNameField(form);
    }
    
    // Add honeypot field for spam protection
    addHoneypotField(form);
    
    // Add GDPR compliance checkbox if needed
    if (form.dataset.gdpr === 'true') {
        addGDPRCheckbox(form);
    }
    
    // Add interest categories if enabled
    if (form.dataset.categories === 'true') {
        addInterestCategories(form);
    }
    
    // Add success/error message containers
    addMessageContainers(form);
}

/**
 * Add email validation with real-time feedback
 */
function addEmailValidation(emailInput) {
    const validationContainer = document.createElement('div');
    validationContainer.className = 'email-validation';
    validationContainer.style.cssText = `
        font-size: 12px;
        margin-top: 5px;
        min-height: 20px;
    `;
    
    emailInput.parentNode.appendChild(validationContainer);
    
    emailInput.addEventListener('input', debounce(() => {
        const email = emailInput.value.trim();
        const isValid = validateEmail(email);
        
        if (email === '') {
            validationContainer.textContent = '';
            emailInput.classList.remove('valid', 'invalid');
        } else if (isValid) {
            validationContainer.textContent = '✓ Valid email';
            validationContainer.style.color = '#28a745';
            emailInput.classList.add('valid');
            emailInput.classList.remove('invalid');
        } else {
            validationContainer.textContent = 'Please enter a valid email address';
            validationContainer.style.color = '#dc3545';
            emailInput.classList.add('invalid');
            emailInput.classList.remove('valid');
        }
    }, 300));
}

/**
 * Add name field to form
 */
function addNameField(form) {
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    nameGroup.innerHTML = `
        <label for="newsletter-name">Name</label>
        <input type="text" id="newsletter-name" name="name" placeholder="Your name">
    `;
    
    const emailGroup = form.querySelector('.form-group');
    if (emailGroup) {
        emailGroup.parentNode.insertBefore(nameGroup, emailGroup);
    } else {
        form.insertBefore(nameGroup, form.querySelector('button[type="submit"]'));
    }
}

/**
 * Add honeypot field for spam protection
 */
function addHoneypotField(form) {
    const honeypot = document.createElement('div');
    honeypot.className = 'honeypot';
    honeypot.style.cssText = `
        position: absolute;
        left: -9999px;
        opacity: 0;
        height: 0;
        overflow: hidden;
    `;
    
    honeypot.innerHTML = `
        <label for="website">Website</label>
        <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
    `;
    
    form.appendChild(honeypot);
}

/**
 * Add GDPR compliance checkbox
 */
function addGDPRCheckbox(form) {
    const gdprGroup = document.createElement('div');
    gdprGroup.className = 'form-group gdpr-consent';
    gdprGroup.innerHTML = `
        <div class="checkbox-group">
            <input type="checkbox" id="gdpr-consent" name="gdpr_consent" required>
            <label for="gdpr-consent">
                I agree to receive newsletter emails. I understand I can unsubscribe at any time.
            </label>
        </div>
    `;
    
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        form.insertBefore(gdprGroup, submitButton);
    } else {
        form.appendChild(gdprGroup);
    }
}

/**
 * Add interest categories selection
 */
function addInterestCategories(form) {
    const categories = ['Technology', 'Design', 'Business', 'Marketing', 'Development'];
    
    const categoriesGroup = document.createElement('div');
    categoriesGroup.className = 'form-group interest-categories';
    categoriesGroup.innerHTML = `
        <label>Interests (optional)</label>
        <div class="categories-list">
            ${categories.map(category => `
                <label class="category-checkbox">
                    <input type="checkbox" name="interests[]" value="${category.toLowerCase()}">
                    <span>${category}</span>
                </label>
            `).join('')}
        </div>
    `;
    
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        form.insertBefore(categoriesGroup, submitButton);
    } else {
        form.appendChild(categoriesGroup);
    }
    
    // Style categories
    const style = document.createElement('style');
    style.textContent = `
        .categories-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }
        .category-checkbox {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 5px 10px;
            background: #f8f9fa;
            border-radius: 20px;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        .category-checkbox:hover {
            background: #e9ecef;
        }
        .category-checkbox input:checked + span {
            font-weight: bold;
            color: #007bff;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Add message containers for form feedback
 */
function addMessageContainers(form) {
    const successMessage = document.createElement('div');
    successMessage.className = 'newsletter-success';
    successMessage.style.cssText = `
        display: none;
        padding: 15px;
        background: #d4edda;
        color: #155724;
        border-radius: 5px;
        margin-top: 15px;
    `;
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'newsletter-error';
    errorMessage.style.cssText = `
        display: none;
        padding: 15px;
        background: #f8d7da;
        color: #721c24;
        border-radius: 5px;
        margin-top: 15px;
    `;
    
    form.appendChild(successMessage);
    form.appendChild(errorMessage);
}

/**
 * Setup form validation
 */
function setupFormValidation(form) {
    const emailInput = form.querySelector('input[type="email"]');
    const gdprCheckbox = form.querySelector('input[name="gdpr_consent"]');
    
    form.addEventListener('submit', (e) => {
        let isValid = true;
        
        // Validate email
        if (emailInput && !validateEmail(emailInput.value.trim())) {
            showFormError(form, 'Please enter a valid email address');
            emailInput.focus();
            isValid = false;
        }
        
        // Validate GDPR if required
        if (gdprCheckbox && !gdprCheckbox.checked) {
            showFormError(form, 'Please agree to receive newsletter emails');
            gdprCheckbox.focus();
            isValid = false;
        }
        
        // Check honeypot
        const honeypot = form.querySelector('input[name="website"]');
        if (honeypot && honeypot.value.trim() !== '') {
            console.log('Spam detected via honeypot');
            isValid = false;
        }
        
        if (!isValid) {
            e.preventDefault();
        }
    });
}

/**
 * Handle newsletter form submission
 */
async function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submissionData = {
        email: formData.get('email'),
        name: formData.get('name') || '',
        interests: formData.getAll('interests[]'),
        source: form.dataset.source || window.location.pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        timestamp: Date.now()
    };
    
    // Validate submission
    if (!validateNewsletterSubmission(submissionData)) {
        showFormError(form, 'Please check your information and try again');
        return;
    }
    
    // Show loading state
    showFormLoading(form, true);
    
    try {
        // Submit to API
        const response = await submitNewsletterSubscription(submissionData);
        
        if (response.success) {
            // Show success message
            showFormSuccess(form, response.message || 'Successfully subscribed!');
            
            // Reset form
            form.reset();
            
            // Track successful subscription
            trackNewsletterEvent('subscription_success', {
                email: submissionData.email,
                source: submissionData.source
            });
            
            // Store subscription in local storage
            storeSubscription(submissionData.email);
            
            // Show welcome modal if first subscription
            if (!hasSubscribedBefore(submissionData.email)) {
                setTimeout(() => showWelcomeModal(submissionData.email), 1000);
            }
            
        } else {
            throw new Error(response.message || 'Subscription failed');
        }
        
    } catch (error) {
        console.error('Newsletter submission error:', error);
        showFormError(form, error.message || 'Failed to subscribe. Please try again.');
        
        // Track failed subscription
        trackNewsletterEvent('subscription_failed', {
            email: submissionData.email,
            error: error.message,
            source: submissionData.source
        });
        
    } finally {
        // Hide loading state
        showFormLoading(form, false);
    }
}

/**
 * Validate newsletter submission data
 */
function validateNewsletterSubmission(data) {
    if (!data.email || !validateEmail(data.email)) {
        return false;
    }
    
    // Check if email is from disposable domain
    if (isDisposableEmail(data.email)) {
        return false;
    }
    
    return true;
}

/**
 * Submit newsletter subscription to API
 */
async function submitNewsletterSubscription(data) {
    // Determine which service to use
    const service = document.querySelector('[data-newsletter-service]')?.dataset.newsletterService || 'mailchimp';
    
    let endpoint, body;
    
    switch (service.toLowerCase()) {
        case 'mailchimp':
            endpoint = '/api/newsletter/mailchimp/subscribe';
            body = prepareMailchimpData(data);
            break;
            
        case 'convertkit':
            endpoint = '/api/newsletter/convertkit/subscribe';
            body = prepareConvertKitData(data);
            break;
            
        default:
            endpoint = '/api/newsletter/subscribe';
            body = data;
    }
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCSRFToken()
        },
        body: JSON.stringify(body)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Prepare data for Mailchimp API
 */
function prepareMailchimpData(data) {
    return {
        email_address: data.email,
        status: 'subscribed',
        merge_fields: {
            FNAME: data.name.split(' ')[0] || '',
            LNAME: data.name.split(' ').slice(1).join(' ') || ''
        },
        tags: data.interests || [],
        ip_signup: await getClientIP()
    };
}

/**
 * Prepare data for ConvertKit API
 */
function prepareConvertKitData(data) {
    return {
        email: data.email,
        first_name: data.name.split(' ')[0] || '',
        fields: {
            last_name: data.name.split(' ').slice(1).join(' ') || '',
            source: data.source
        },
        tags: data.interests || []
    };
}

// ============================================
// NEWSLETTER PREFERENCES
// ============================================

/**
 * Initialize newsletter preferences management
 */
function initNewsletterPreferences() {
    // Create preferences modal if needed
    if (document.querySelector('[data-newsletter-preferences]')) {
        createPreferencesModal();
    }
    
    // Load user preferences if logged in
    if (isUserLoggedIn()) {
        loadUserPreferences();
    }
}

/**
 * Create newsletter preferences modal
 */
function createPreferencesModal() {
    const modal = document.createElement('div');
    modal.className = 'newsletter-preferences-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="preferences-content" style="
            background: white;
            border-radius: 10px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            transform: translateY(-20px);
            transition: transform 0.3s ease;
        ">
            <div class="preferences-header" style="margin-bottom: 20px;">
                <h3 style="margin: 0;">Newsletter Preferences</h3>
                <button class="close-preferences" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    position: absolute;
                    top: 15px;
                    right: 15px;
                ">&times;</button>
            </div>
            
            <div class="preferences-body">
                <div class="preference-section">
                    <h4>Email Frequency</h4>
                    <div class="frequency-options">
                        <label class="frequency-option">
                            <input type="radio" name="frequency" value="weekly" checked>
                            <span>Weekly Digest</span>
                        </label>
                        <label class="frequency-option">
                            <input type="radio" name="frequency" value="biweekly">
                            <span>Bi-weekly</span>
                        </label>
                        <label class="frequency-option">
                            <input type="radio" name="frequency" value="monthly">
                            <span>Monthly</span>
                        </label>
                    </div>
                </div>
                
                <div class="preference-section">
                    <h4>Content Categories</h4>
                    <div class="category-options">
                        <label class="category-option">
                            <input type="checkbox" name="categories[]" value="technology" checked>
                            <span>Technology</span>
                        </label>
                        <label class="category-option">
                            <input type="checkbox" name="categories[]" value="design" checked>
                            <span>Design</span>
                        </label>
                        <label class="category-option">
                            <input type="checkbox" name="categories[]" value="business" checked>
                            <span>Business</span>
                        </label>
                        <label class="category-option">
                            <input type="checkbox" name="categories[]" value="marketing">
                            <span>Marketing</span>
                        </label>
                        <label class="category-option">
                            <input type="checkbox" name="categories[]" value="development" checked>
                            <span>Development</span>
                        </label>
                    </div>
                </div>
                
                <div class="preference-section">
                    <h4>Notification Types</h4>
                    <div class="notification-options">
                        <label class="notification-option">
                            <input type="checkbox" name="notifications[]" value="new_posts" checked>
                            <span>New Blog Posts</span>
                        </label>
                        <label class="notification-option">
                            <input type="checkbox" name="notifications[]" value="product_updates">
                            <span>Product Updates</span>
                        </label>
                        <label class="notification-option">
                            <input type="checkbox" name="notifications[]" value="special_offers">
                            <span>Special Offers</span>
                        </label>
                        <label class="notification-option">
                            <input type="checkbox" name="notifications[]" value="event_invites">
                            <span>Event Invitations</span>
                        </label>
                    </div>
                </div>
                
                <div class="preference-section">
                    <h4>Email Format</h4>
                    <div class="format-options">
                        <label class="format-option">
                            <input type="radio" name="format" value="html" checked>
                            <span>HTML (with images)</span>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="format" value="text">
                            <span>Text Only</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="preferences-footer" style="margin-top: 30px; text-align: right;">
                <button class="save-preferences" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Save Preferences</button>
                <button class="unsubscribe-all" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-left: 10px;
                ">Unsubscribe All</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-preferences').addEventListener('click', () => {
        closePreferencesModal(modal);
    });
    
    modal.querySelector('.save-preferences').addEventListener('click', async () => {
        await savePreferences(modal);
    });
    
    modal.querySelector('.unsubscribe-all').addEventListener('click', () => {
        showUnsubscribeConfirmation(modal);
    });
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePreferencesModal(modal);
        }
    });
}

/**
 * Open preferences modal
 */
function openPreferencesModal() {
    const modal = document.querySelector('.newsletter-preferences-modal');
    if (!modal) return;
    
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.querySelector('.preferences-content').style.transform = 'translateY(0)';
    
    // Load current preferences
    loadCurrentPreferences(modal);
    
    // Track modal open
    trackNewsletterEvent('preferences_modal_opened');
}

/**
 * Close preferences modal
 */
function closePreferencesModal(modal) {
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modal.querySelector('.preferences-content').style.transform = 'translateY(-20px)';
}

/**
 * Load current preferences into modal
 */
function loadCurrentPreferences(modal) {
    const storedPreferences = localStorage.getItem('newsletter_preferences');
    
    if (storedPreferences) {
        try {
            const preferences = JSON.parse(storedPreferences);
            
            // Set frequency
            const frequencyInput = modal.querySelector(`input[name="frequency"][value="${preferences.frequency}"]`);
            if (frequencyInput) frequencyInput.checked = true;
            
            // Set categories
            modal.querySelectorAll('input[name="categories[]"]').forEach(input => {
                input.checked = preferences.categories?.includes(input.value) || false;
            });
            
            // Set notifications
            modal.querySelectorAll('input[name="notifications[]"]').forEach(input => {
                input.checked = preferences.notifications?.includes(input.value) || false;
            });
            
            // Set format
            const formatInput = modal.querySelector(`input[name="format"][value="${preferences.format}"]`);
            if (formatInput) formatInput.checked = true;
            
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
    }
}

/**
 * Save newsletter preferences
 */
async function savePreferences(modal) {
    const preferences = {
        frequency: modal.querySelector('input[name="frequency"]:checked')?.value || 'weekly',
        categories: Array.from(modal.querySelectorAll('input[name="categories[]"]:checked')).map(cb => cb.value),
        notifications: Array.from(modal.querySelectorAll('input[name="notifications[]"]:checked')).map(cb => cb.value),
        format: modal.querySelector('input[name="format"]:checked')?.value || 'html',
        updated_at: Date.now()
    };
    
    // Save to localStorage
    localStorage.setItem('newsletter_preferences', JSON.stringify(preferences));
    
    // Save to server if user is logged in
    if (isUserLoggedIn()) {
        try {
            await fetch('/api/newsletter/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(preferences)
            });
        } catch (error) {
            console.error('Failed to save preferences to server:', error);
        }
    }
    
    // Show success message
    showNotification('Preferences saved successfully!', 'success');
    
    // Close modal
    closePreferencesModal(modal);
    
    // Track preferences update
    trackNewsletterEvent('preferences_updated', preferences);
}

// ============================================
// NEWSLETTER MODALS AND POPUPS
// ============================================

/**
 * Initialize newsletter modals and popups
 */
function initNewsletterModals() {
    // Create exit intent popup
    setupExitIntentPopup();
    
    // Create scroll-triggered popup
    setupScrollPopup();
    
    // Create time-delayed popup
    setupTimedPopup();
}

/**
 * Setup exit intent popup
 */
function setupExitIntentPopup() {
    if (hasSubscribedRecently() || localStorage.getItem('exit_intent_shown')) {
        return;
    }
    
    let mouseY = 0;
    
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 10 && !localStorage.getItem('exit_intent_shown')) {
            showExitIntentPopup();
            localStorage.setItem('exit_intent_shown', 'true');
        }
    });
    
    // Also track mouse movement to top
    document.addEventListener('mousemove', (e) => {
        mouseY = e.clientY;
    });
}

/**
 * Show exit intent popup
 */
function showExitIntentPopup() {
    const popup = createNewsletterPopup('exit-intent');
    document.body.appendChild(popup);
    
    // Track popup display
    trackNewsletterEvent('exit_intent_popup_shown');
}

/**
 * Setup scroll-triggered popup
 */
function setupScrollPopup() {
    if (hasSubscribedRecently() || localStorage.getItem('scroll_popup_shown')) {
        return;
    }
    
    window.addEventListener('scroll', throttle(() => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        if (scrollPercent > 50 && !localStorage.getItem('scroll_popup_shown')) {
            showScrollPopup();
            localStorage.setItem('scroll_popup_shown', 'true');
        }
    }, 100));
}

/**
 * Show scroll-triggered popup
 */
function showScrollPopup() {
    const popup = createNewsletterPopup('scroll-triggered');
    document.body.appendChild(popup);
    
    // Track popup display
    trackNewsletterEvent('scroll_popup_shown');
}

/**
 * Setup time-delayed popup
 */
function setupTimedPopup() {
    if (hasSubscribedRecently() || localStorage.getItem('timed_popup_shown')) {
        return;
    }
    
    setTimeout(() => {
        if (!localStorage.getItem('timed_popup_shown')) {
            showTimedPopup();
            localStorage.setItem('timed_popup_shown', 'true');
        }
    }, 30000); // Show after 30 seconds
}

/**
 * Show time-delayed popup
 */
function showTimedPopup() {
    const popup = createNewsletterPopup('timed');
    document.body.appendChild(popup);
    
    // Track popup display
    trackNewsletterEvent('timed_popup_shown');
}

/**
 * Create newsletter popup
 */
function createNewsletterPopup(type) {
    const popup = document.createElement('div');
    popup.className = `newsletter-popup newsletter-popup-${type}`;
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 10px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        z-index: 10000;
        opacity: 0;
        animation: popupFadeIn 0.3s ease forwards;
    `;
    
    const messages = {
        'exit-intent': 'Wait! Don\'t miss out on our latest updates.',
        'scroll-triggered': 'Enjoying this content? Get more delivered to your inbox.',
        'timed': 'Stay updated with our best content.'
    };
    
    popup.innerHTML = `
        <button class="close-popup" style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
        ">&times;</button>
        
        <div class="popup-content">
            <h3 style="margin-top: 0;">Join Our Newsletter</h3>
            <p>${messages[type] || 'Subscribe to get our latest content by email.'}</p>
            
            <form class="popup-newsletter-form">
                <div class="form-group">
                    <input type="email" placeholder="Your email address" required style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        margin-bottom: 10px;
                    ">
                </div>
                <button type="submit" style="
                    width: 100%;
                    padding: 10px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Subscribe</button>
            </form>
            
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
                We respect your privacy. Unsubscribe at any time.
            </p>
        </div>
    `;
    
    // Add CSS animation
    if (!document.querySelector('#popup-animations')) {
        const style = document.createElement('style');
        style.id = 'popup-animations';
        style.textContent = `
            @keyframes popupFadeIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes popupFadeOut {
                from { opacity: 1; transform: translate(-50%, -50%); }
                to { opacity: 0; transform: translate(-50%, -60%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    
    // Add event listeners
    popup.querySelector('.close-popup').addEventListener('click', () => {
        closePopup(popup, overlay);
    });
    
    popup.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = popup.querySelector('input[type="email"]').value;
        
        if (validateEmail(email)) {
            await handlePopupSubscription(email, type, popup, overlay);
        }
    });
    
    // Close when clicking overlay
    overlay.addEventListener('click', () => {
        closePopup(popup, overlay);
    });
    
    return popup;
}

/**
 * Handle popup subscription
 */
async function handlePopupSubscription(email, popupType, popup, overlay) {
    try {
        const response = await submitNewsletterSubscription({
            email: email,
            source: `popup_${popupType}`,
            timestamp: Date.now()
        });
        
        if (response.success) {
            showNotification('Subscribed successfully!', 'success');
            storeSubscription(email);
            closePopup(popup, overlay);
            
            trackNewsletterEvent('popup_subscription_success', {
                email: email,
                popup_type: popupType
            });
        }
    } catch (error) {
        showNotification('Subscription failed. Please try again.', 'error');
    }
}

/**
 * Close popup
 */
function closePopup(popup, overlay) {
    popup.style.animation = 'popupFadeOut 0.3s ease forwards';
    overlay.style.opacity = '0';
    
    setTimeout(() => {
        popup.remove();
        overlay.remove();
    }, 300);
}

/**
 * Create floating newsletter signup
 */
function createFloatingSignup() {
    if (hasSubscribedRecently() || localStorage.getItem('floating_signup_closed')) {
        return;
    }
    
    const floatingSignup = document.createElement('div');
    floatingSignup.className = 'floating-newsletter-signup';
    floatingSignup.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 300px;
        animation: slideInUp 0.3s ease;
    `;
    
    floatingSignup.innerHTML = `
        <button class="close-floating" style="
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
        ">&times;</button>
        
        <h4 style="margin-top: 0; margin-bottom: 10px;">Stay Updated</h4>
        <p style="margin-bottom: 15px; font-size: 14px;">Get the latest posts delivered to your inbox.</p>
        
        <form class="floating-newsletter-form">
            <input type="email" placeholder="Email address" required style="
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin-bottom: 10px;
                font-size: 14px;
            ">
            <button type="submit" style="
                width: 100%;
                padding: 8px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">Subscribe</button>
        </form>
    `;
    
    document.body.appendChild(floatingSignup);
    
    // Add event listeners
    floatingSignup.querySelector('.close-floating').addEventListener('click', () => {
        localStorage.setItem('floating_signup_closed', 'true');
        floatingSignup.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => floatingSignup.remove(), 300);
    });
    
    floatingSignup.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = floatingSignup.querySelector('input[type="email"]').value;
        
        if (validateEmail(email)) {
            try {
                await submitNewsletterSubscription({
                    email: email,
                    source: 'floating_signup',
                    timestamp: Date.now()
                });
                
                showNotification('Subscribed successfully!', 'success');
                storeSubscription(email);
                floatingSignup.remove();
                
                trackNewsletterEvent('floating_signup_subscription', { email: email });
            } catch (error) {
                showNotification('Subscription failed', 'error');
            }
        }
    });
}

// ============================================
// NEWSLETTER ANALYTICS
// ============================================

/**
 * Initialize newsletter analytics
 */
function initNewsletterAnalytics() {
    // Track newsletter interactions
    setupNewsletterTracking();
    
    // Track subscription sources
    trackSubscriptionSources();
    
    // Track email performance
    setupEmailPerformanceTracking();
}

/**
 * Setup newsletter tracking
 */
function setupNewsletterTracking() {
    // Track form impressions
    document.querySelectorAll('.newsletter-signup').forEach(form => {
        trackNewsletterEvent('form_impression', {
            form_id: form.id || 'unknown',
            location: getElementLocation(form)
        });
    });
    
    // Track form interactions
    document.querySelectorAll('.newsletter-signup input, .newsletter-signup button').forEach(element => {
        element.addEventListener('focus', () => {
            trackNewsletterEvent('form_interaction', {
                element_type: element.type,
                form_id: element.closest('form')?.id || 'unknown'
            });
        });
    });
}

// ============================================
// NEWSLETTER INTEGRATIONS
// ============================================

/**
 * Initialize newsletter service integrations
 */
function initNewsletterIntegrations() {
    // Check for Mailchimp integration
    if (document.querySelector('[data-mailchimp-integration]')) {
        setupMailchimpIntegration();
    }
    
    // Check for ConvertKit integration
    if (document.querySelector('[data-convertkit-integration]')) {
        setupConvertKitIntegration();
    }
    
    // Check for custom API integration
    if (document.querySelector('[data-custom-newsletter-api]')) {
        setupCustomIntegration();
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate email address
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check if email is from disposable domain
 */
function isDisposableEmail(email) {
    const disposableDomains = [
        'tempmail.com', '10minutemail.com', 'guerrillamail.com',
        'mailinator.com', 'yopmail.com', 'throwawaymail.com'
    ];
    
    const domain = email.split('@')[1];
    return disposableDomains.some(d => domain.includes(d));
}

/**
 * Show form loading state
 */
function showFormLoading(form, isLoading) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;
    
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading-spinner"></span> Subscribing...';
    } else {
        submitButton.disabled = false;
        submitButton.textContent = 'Subscribe';
    }
}

/**
 * Show form success message
 */
function showFormSuccess(form, message) {
    const successElement = form.querySelector('.newsletter-success');
    const errorElement = form.querySelector('.newsletter-error');
    
    if (errorElement) errorElement.style.display = 'none';
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
    }
}

/**
 * Show form error message
 */
function showFormError(form, message) {
    const successElement = form.querySelector('.newsletter-success');
    const errorElement = form.querySelector('.newsletter-error');
    
    if (successElement) successElement.style.display = 'none';
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Store subscription in local storage
 */
function storeSubscription(email) {
    const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
    
    if (!subscriptions.includes(email)) {
        subscriptions.push({
            email: email,
            subscribed_at: Date.now(),
            source: window.location.pathname
        });
        
        localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
    }
    
    // Also store last subscription time
    localStorage.setItem('last_subscription', Date.now());
}

/**
 * Check if user has subscribed recently
 */
function hasSubscribedRecently() {
    const lastSubscription = localStorage.getItem('last_subscription');
    if (!lastSubscription) return false;
    
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return parseInt(lastSubscription) > oneWeekAgo;
}

/**
 * Check if user has subscribed before
 */
function hasSubscribedBefore(email) {
    const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
    return subscriptions.some(sub => sub.email === email);
}

/**
 * Check subscription status
 */
function checkSubscriptionStatus() {
    // Check if user is already subscribed
    const email = getStoredEmail();
    if (email && hasSubscribedBefore(email)) {
        updateUIForSubscribedUser(email);
    }
}

/**
 * Get stored email from cookies or localStorage
 */
function getStoredEmail() {
    // Check cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});
    
    if (cookies.user_email) return cookies.user_email;
    
    // Check localStorage
    const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
    if (subscriptions.length > 0) {
        return subscriptions[subscriptions.length - 1].email;
    }
    
    return null;
}

/**
 * Update UI for subscribed user
 */
function updateUIForSubscribedUser(email) {
    // Update forms to show "already subscribed" message
    document.querySelectorAll('.newsletter-signup').forEach(form => {
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput) {
            emailInput.value = email;
            emailInput.disabled = true;
            emailInput.style.opacity = '0.7';
        }
        
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Already Subscribed';
            submitButton.disabled = true;
            submitButton.style.opacity = '0.7';
        }
    });
    
    // Show management options
    showManagementOptions(email);
}

/**
 * Show newsletter management options
 */
function showManagementOptions(email) {
    const manageLink = document.createElement('a');
    manageLink.href = '#';
    manageLink.className = 'manage-subscription';
    manageLink.textContent = 'Manage subscription';
    manageLink.style.cssText = `
        display: block;
        margin-top: 10px;
        font-size: 14px;
        color: #007bff;
        text-decoration: none;
    `;
    
    manageLink.addEventListener('click', (e) => {
        e.preventDefault();
        openPreferencesModal();
    });
    
    document.querySelectorAll('.newsletter-signup').forEach(form => {
        if (!form.querySelector('.manage-subscription')) {
            form.appendChild(manageLink.cloneNode(true));
        }
    });
}

/**
 * Show unsubscribe confirmation
 */
function showUnsubscribeConfirmation(modal) {
    if (confirm('Are you sure you want to unsubscribe from all newsletters?')) {
        performUnsubscribe();
        closePreferencesModal(modal);
    }
}

/**
 * Perform unsubscribe action
 */
async function performUnsubscribe() {
    const email = getStoredEmail();
    
    if (!email) {
        showNotification('No subscription found to unsubscribe', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/newsletter/unsubscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        
        if (response.ok) {
            // Clear local storage
            localStorage.removeItem('newsletter_subscriptions');
            localStorage.removeItem('last_subscription');
            localStorage.removeItem('newsletter_preferences');
            
            // Update UI
            document.querySelectorAll('.newsletter-signup').forEach(form => {
                form.reset();
                const emailInput = form.querySelector('input[type="email"]');
                if (emailInput) {
                    emailInput.disabled = false;
                    emailInput.style.opacity = '1';
                }
                
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.textContent = 'Subscribe';
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                }
                
                // Remove manage subscription link
                form.querySelector('.manage-subscription')?.remove();
            });
            
            showNotification('Successfully unsubscribed', 'success');
            
            trackNewsletterEvent('unsubscribed', { email: email });
        }
    } catch (error) {
        console.error('Unsubscribe error:', error);
        showNotification('Failed to unsubscribe', 'error');
    }
}

/**
 * Show welcome modal for new subscribers
 */
function showWelcomeModal(email) {
    const modal = document.createElement('div');
    modal.className = 'welcome-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 10px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        z-index: 10000;
        text-align: center;
    `;
    
    modal.innerHTML = `
        <h3 style="margin-top: 0;">Welcome! 🎉</h3>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>A confirmation email has been sent to <strong>${email}</strong>.</p>
        <p>Check your inbox for our welcome email.</p>
        <button class="close-welcome" style="
            margin-top: 20px;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Got it!</button>
    `;
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    
    modal.querySelector('.close-welcome').addEventListener('click', () => {
        modal.remove();
        overlay.remove();
    });
    
    overlay.addEventListener('click', () => {
        modal.remove();
        overlay.remove();
    });
}

/**
 * Track newsletter event
 */
function trackNewsletterEvent(eventName, eventData = {}) {
    console.log(`Newsletter Event: ${eventName}`, eventData);
    
    if (typeof gtag === 'function') {
        gtag('event', eventName, {
            ...eventData,
            page_title: document.title,
            page_url: window.location.href
        });
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
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
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Get CSRF token
 */
function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
}

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
    return document.cookie.includes('session=') || localStorage.getItem('auth_token');
}

/**
 * Debounce function
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
 * Throttle function
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
 * Should show floating signup
 */
function shouldShowFloatingSignup() {
    return !hasSubscribedRecently() && 
           !localStorage.getItem('floating_signup_closed') &&
           window.innerWidth > 768; // Only on desktop
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

/**
 * Setup newsletter event listeners
 */
function setupNewsletterListeners() {
    // Listen for newsletter-related custom events
    document.addEventListener('newsletter:subscribe', (e) => {
        if (e.detail && e.detail.email) {
            handleNewsletterSubmit(e.detail);
        }
    });
    
    // Listen for preference updates
    document.addEventListener('newsletter:updatePreferences', (e) => {
        if (e.detail) {
            savePreferences(e.detail);
        }
    });
}

// ============================================
// EXPORT FOR GLOBAL USAGE
// ============================================

// Make newsletter functions available globally
window.Newsletter = {
    subscribe: (email, name) => submitNewsletterSubscription({ email, name }),
    unsubscribe: performUnsubscribe,
    updatePreferences: savePreferences,
    showPreferences: openPreferencesModal,
    trackEvent: trackNewsletterEvent
};

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    initNewsletterForms();
    setupNewsletterListeners();
});