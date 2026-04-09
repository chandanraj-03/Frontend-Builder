// script.js: General Application Interactivity and Event Handling Module

// Import dependencies
import $ from 'jquery';
import 'bootstrap';

// Initialize page components
const dataTable = $('#response-data-table');
const downloadButton = $('#download-button');
const socialMediaButtons = $('#social-media-sharing-buttons');
const csvExportSettings = $('#csv-export-settings');
const navigationControls = $('#navigation-controls');
const barCharts = $('#bar-charts-questions');
const surveyLinkGenerator = $('#survey-link-generator');
const questionTypesSelector = $('#question-types-selector');
const pieCharts = $('#pie-charts-question-types');
const dragAndDropQuestionBuilderInterface = $('#drag-and-drop-question-builder-interface');
const surveyPreviewArea = $('#survey-preview-area');
const dataTablesForResponses = $('#data-tables-for-responses');
const linkCopyButton = $('#link-copy-button');
const requiredOptionalFieldToggle = $('#required-optional-field-toggle');
const builderInterfaceLink = $('#builder-interface-link');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Event listener for download button click
  downloadButton.on('click', () => {
    // Export responses to CSV format
    csvExportSettings.trigger('export-csv');
  });

  // Event listener for social media sharing buttons
  socialMediaButtons.on('click', 'button', (e) => {
    const socialMediaType = e.target.dataset.socialMediaType;
    shareSurveyLink(socialMediaType);
  });

  // Event listener for navigation controls
  navigationControls.on('click', '.nav-link', (e) => {
    const pageNumber = e.target.dataset.pageNumber;
    navigateToPage(pageNumber);
  });

  // Event listener for bar charts questions
  barCharts.on('click', '.bar-chart-question', () => {
    showQuestionDetails();
  });

  // Event listener for question types selector
  questionTypesSelector.on('change', (e) => {
    const selectedType = e.target.value;
    updateSurveyLink(selectedType);
  });

  // Event listener for drag-and-drop question builder interface
  dragAndDropQuestionBuilderInterface.on('drop', (e) => {
    handleDraggedQuestion(e.dataTransfer.getData('question'));
  });
});

// Smooth animations and transitions
document.addEventListener('DOMContentLoaded', () => {
  const animationDuration = 500;
  navigationControls.css('transition-duration', `${animationDuration}ms`);
  socialMediaButtons.css('transition-duration', `${animationDuration}ms`);
});

// Helper functions

function shareSurveyLink(socialMediaType) {
  // Generate and share survey link
  const url = `https://example.com/survey-link`;
  const html = `<a href="${url}" target="_blank">${socialMediaType}</a>`;
  socialMediaButtons.find(`.${socialMediaType}-button`).after(html);
}

function navigateToPage(pageNumber) {
  // Navigate to specified page number
  navigationControls.find('.active').removeClass('active');
  document.querySelector(`.page-${pageNumber}`).classList.add('active');
}

function showQuestionDetails() {
  // Show question details on click
  const selectedQuestion = barCharts.find('.selected-question');
  const questionId = selectedQuestion.attr('data-id');
  surveyPreviewArea.html(`<h2>Question ${questionId}</h2>`);
}

function updateSurveyLink(selectedType) {
  // Update survey link based on selected type
  const url = `https://example.com/survey-link?type=${selectedType}`;
  builderInterfaceLink.html(`<a href="${url}">${selectedType}</a>`);
}

function handleDraggedQuestion(questionData) {
  // Handle dragged question data
  dragAndDropQuestionBuilderInterface.append(questionData);
}