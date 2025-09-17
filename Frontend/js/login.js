document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    try {
        let isValid = true;

        // Get form elements
        const studentId = document.getElementById('studentID');
        const password = document.getElementById('password');

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });

        // Regex patterns
     const studentIDRegex = /^LSEI\/\d{4}\/SIWES\/\d{3}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        // Validate Student ID
        if (!studentId.value.trim() || !studentIDRegex.test(studentId.value.trim())) {
            studentId.nextElementSibling.textContent = 'Please enter a valid Student ID (e.g., LSEI/SIWES/2025/01)';
            studentId.classList.add('is-invalid');
            isValid = false;
        } else {
            studentId.classList.add('is-valid');
        }

        // Validate Password
        if (!password.value || !passwordRegex.test(password.value)) {
            password.nextElementSibling.textContent = 'Password must include uppercase, lowercase, number, and special character';
            password.classList.add('is-invalid');
            isValid = false;
        } else {
            password.classList.add('is-valid');
        }

        if (!isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fix the errors in the form before submitting.'
            });
            return;
        }

        // Backend request with SweetAlert loading
        try {
            Swal.fire({
                title: 'Logging in...',
                text: 'Please wait while we authenticate your credentials.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const data = {
                studentId: studentId.value.trim(),
                password: password.value.trim()
            };

            const response = await fetch('/api/auth/login', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            Swal.close(); // Close loading state

            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: result.msg || "Invalid Student ID or Password."
                });
                return;
            }

            // Success
           Swal.fire({
    icon: 'success',
    title: 'Login Successful',
    text: 'Welcome back!',
    timer: 2000,
    showConfirmButton: false
}).then(() => {
    // Redirect to dashboard after SweetAlert closes
    window.location.href = "/dashboard.html";  // Change this path to your actual dashboard route
    sessionStorage.setItem('studentId', result.studentId);
     localStorage.setItem("token", result.token);  // ✅ store JWT
    sessionStorage.setItem('fullname', result.name);

});

this.reset();
document.querySelectorAll('input').forEach(input => input.classList.remove('is-valid'));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: 'An unexpected error occurred. Please try again.'
            });
            console.error('Submission error:', error);
        }

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Unexpected Error',
            text: 'Something went wrong. Please try again.'
        });
        console.error('Validation error:', error);
    }
});


// Real-time validation for better user experience
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('input', function() {
        try {
            const errorElement = this.nextElementSibling;
            errorElement.textContent = '';
            this.classList.remove('is-valid', 'is-invalid');

            // Real-time validation patterns
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            switch(this.id) {
                case 'email':
                    if (this.value.trim() && !emailRegex.test(this.value.trim())) {
                        this.classList.add('is-invalid');
                        errorElement.textContent = 'Please enter a valid email address';
                    } else if (this.value.trim()) {
                        this.classList.add('is-valid');
                    }
                    break;
                case 'password':
                    if (this.value && !passwordRegex.test(this.value)) {
                        this.classList.add('is-invalid');
                        errorElement.textContent = 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character';
                    } else if (this.value) {
                        this.classList.add('is-valid');
                    }
                    break;
            }
        } catch (error) {
            console.error('Error in real-time validation:', error);
        }
    });
});