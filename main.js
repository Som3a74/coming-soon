import { CONFIG } from './config.js';

// DOM Elements
const elements = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
    form: document.getElementById("subscriptionForm"),
    email: document.getElementById("emailInput"),
    successMessage: document.querySelector(".success-message")
};

// EmailJS Initialization
emailjs.init(CONFIG.EMAILJS.USER_ID);

// Countdown Management
let countdownInterval;

function initializeCountdown() {
    const storedDate = getStoredLaunchDate();
    const validLaunchDate = validateLaunchDate(storedDate);

    countdownInterval = setInterval(
        () => updateCountdown(validLaunchDate),
        CONFIG.COUNTDOWN_REFRESH
    );
}

function getStoredLaunchDate() {
    const timestamp = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
    return timestamp ? new Date(parseInt(timestamp, 10)) : null;
}

function validateLaunchDate(storedDate) {
    const isValid = storedDate && storedDate.getTime() === CONFIG.LAUNCH_DATE.getTime();
    if (!isValid) {
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, CONFIG.LAUNCH_DATE.getTime());
        return CONFIG.LAUNCH_DATE;
    }
    return storedDate;
}

function updateCountdown(targetDate) {
    const now = Date.now();
    const timeRemaining = targetDate - now;

    if (timeRemaining <= 0) {
        clearInterval(countdownInterval);
        handleLaunch();
        return;
    }

    updateDisplay(calculateTimeUnits(timeRemaining));
}

function calculateTimeUnits(ms) {
    return {
        days: Math.floor(ms / 86400000),
        hours: Math.floor((ms % 86400000) / 3600000),
        minutes: Math.floor((ms % 3600000) / 60000),
        seconds: Math.floor((ms % 60000) / 1000)
    };
}

function updateDisplay(timeUnits) {
    Object.entries(timeUnits).forEach(([unit, value]) => {
        elements[unit].textContent = String(value).padStart(2, '0');
    });
}

// Email Handling
async function handleSubmit(e) {
    e.preventDefault();
    const email = elements.email.value.trim();

    if (!CONFIG.EMAIL_REGEX.test(email)) {
        showMessage('Please enter a valid email address.', false);
        return;
    }

    try {
        await sendWelcomeEmail(email);
        showMessage('Thank you for subscribing! Check your email for confirmation.', true);
        elements.email.value = '';
    } catch (error) {
        console.error('Email submission failed:', error);
        showMessage('Subscription failed. Please try again later.', false);
    }
}

async function sendWelcomeEmail(email) {
    return emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID,
        { email: email }
    );
}

// UI Helpers
function showMessage(text, isSuccess) {
    elements.successMessage.style.display = 'block';
    elements.successMessage.style.color = isSuccess ? '#28a745' : '#dc3545';
    elements.successMessage.textContent = text;
}

// Launch Handler
function handleLaunch() {
    document.title = "KimCam Academy - Now Live!";
    // Add additional launch actions here
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeCountdown);
elements.form.addEventListener('submit', handleSubmit);