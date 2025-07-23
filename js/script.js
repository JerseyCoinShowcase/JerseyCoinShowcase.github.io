document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('is-active'); // For animating the hamburger icon (optional CSS for this)
        });

        // Close mobile menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenu.classList.remove('is-active');
            });
        });
    }

    // Update current year in footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Inquiry Form Handling
    const inquiryForm = document.getElementById('inquiryForm');
    const formMessage = document.getElementById('formMessage');
    const fileInput = document.getElementById('images');
    const filePreview = document.getElementById('filePreview');

    if (inquiryForm) {
        // Image Preview Handler
        fileInput.addEventListener('change', (event) => {
            filePreview.innerHTML = ''; // Clear previous previews
            const files = event.target.files;

            // Simple client-side validation for number of files
            if (files.length > 3) {
                alert('You can upload a maximum of 3 images.');
                fileInput.value = ''; // Clear selected files
                filePreview.innerHTML = ''; // Clear any existing previews
                return;
            }

            Array.from(files).forEach(file => {
                // Client-side validation for file size and type
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    alert(`File "${file.name}" is too large (max 2MB).`);
                    fileInput.value = ''; // Clear selected files
                    filePreview.innerHTML = '';
                    return;
                }
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                    alert(`File "${file.name}" is not a JPG or PNG image.`);
                    fileInput.value = '';
                    filePreview.innerHTML = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    filePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });

        // Form Submission Handler
        inquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            const submitBtn = inquiryForm.querySelector('.submit-btn');
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            formMessage.style.display = 'none'; // Hide previous messages
            formMessage.className = 'form-message'; // Reset class

            const formData = new FormData(inquiryForm);

            // --- IMPORTANT for GitHub Pages ---
            // The `action` attribute in your HTML form needs to be set to a third-party
            // service's endpoint (like Formspree.io) for the form to actually send emails.
            // If you keep action="php/process_form.php", this fetch request will fail
            // on GitHub Pages because there's no PHP server to process it.

            try {
                // If using Formspree, the response might not be JSON, but a redirect or simple HTML
                // You might need to adjust this `fetch` and `result` parsing based on the service.
                // For Formspree, often just setting the 'action' in HTML is enough, and JS isn't strictly needed for sending.
                // However, this AJAX approach keeps the user on the page.

                const response = await fetch(inquiryForm.action, {
                    method: 'POST',
                    body: formData,
                    // If using Formspree, you might need to add:
                    // headers: { 'Accept': 'application/json' }
                });

                // Adjust based on the actual response from your form service
                // For a simple Formspree setup, a successful response might just be status 200 or 302
                if (response.ok) { // response.ok means status is 200-299
                    formMessage.textContent = 'Inquiry sent successfully! We will get back to you soon.';
                    formMessage.className = 'form-message success';
                    inquiryForm.reset(); // Clear the form
                    filePreview.innerHTML = ''; // Clear image previews
                } else {
                    // Try to parse JSON error if available
                    const errorData = await response.json().catch(() => null);
                    formMessage.textContent = errorData?.message || 'Failed to send inquiry. Please try again.';
                    formMessage.className = 'form-message error';
                    console.error('Form submission failed:', response.status, errorData);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                formMessage.textContent = 'An error occurred. Please try again later.';
                formMessage.className = 'form-message error';
            } finally {
                formMessage.style.display = 'block';
                submitBtn.textContent = 'Send Inquiry';
                submitBtn.disabled = false;
            }
        });
    }
});
