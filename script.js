// script.js

// Countdown Timer
const countdownDate = new Date("2026-12-31T23:59:59").getTime();

const countdownFunction = setInterval(() => {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    if (distance < 0) {
        clearInterval(countdownFunction);
        document.getElementById("countdown").innerHTML = "EXPIRED";
    }
}, 1000);

// Form Validation and Handling
const form = document.getElementById("rsvpForm");
form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const messageBox = document.getElementById("messageBox");
    messageBox.innerHTML = "";
    
    if (!name || !email) {
        messageBox.innerHTML = "Please fill out all fields!";
        messageBox.style.color = "red";
        return;
    }

    // Simulate form submission success
    messageBox.innerHTML = "RSVP submitted successfully!";
    messageBox.style.color = "green";
    form.reset();
});
