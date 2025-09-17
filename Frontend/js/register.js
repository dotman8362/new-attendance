document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    let isValid = true;

    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    // const publicIP = await fetch('https://api.ipify.org?format=json').then(res => res.json());
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
    document.querySelectorAll('input').forEach(input => input.classList.remove('is-valid', 'is-invalid'));

    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!fullname.value.trim() || !nameRegex.test(fullname.value.trim())) {
        fullname.nextElementSibling.textContent = 'Please enter a valid name (2-50 characters, letters only)';
        fullname.classList.add('is-invalid');
        isValid = false;
    } else {
        fullname.classList.add('is-valid');
    }

    if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        email.nextElementSibling.textContent = 'Please enter a valid email address';
        email.classList.add('is-invalid');
        isValid = false;
    } else {
        email.classList.add('is-valid');
    }

    
    if (!password.value || !passwordRegex.test(password.value)) {
        password.nextElementSibling.textContent = 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character';
        password.classList.add('is-invalid');
        isValid = false;
    } else {
        password.classList.add('is-valid');
    }

    if (!confirmPassword.value || confirmPassword.value !== password.value) {
        confirmPassword.nextElementSibling.textContent = 'Passwords do not match';
        confirmPassword.classList.add('is-invalid');
        isValid = false;
    } else {
        confirmPassword.classList.add('is-valid');
    }

   if (isValid) {
    const data = {
        fullname: fullname.value,
        email: email.value,
        password: password.value,
        // ipAddress: publicIP.ip
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Registration failed.');
        }

        // Show SweetAlert success message
        Swal.fire({
            icon: 'success',
            title: 'Registration Successful!',
            text: 'Redirecting you to your dashboard...',
            showConfirmButton: false,
            timer: 2000
        });

        // Store token if backend returns one
        if (result.token) {
            localStorage.setItem('authToken', result.token);
             localStorage.setItem('studentId', result.studentId);     // 👈 save student ID
             localStorage.setItem('studentName', result.studentName); // 👈 save student name
        }

        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = '/dashboard.html'; // change to your actual dashboard page
        }, 2000);

        // Reset form
        this.reset();
        document.querySelectorAll('input').forEach(input => input.classList.remove('is-valid'));

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: error.message || 'Something went wrong. Please try again.',
            confirmButtonColor: '#d33'
        });
    }
}
});

// Real-time validation for better user experience
const inputs = document.querySelectorAll('input');

inputs.forEach(input => {
    input.addEventListener('input', function () {
        try {
            const errorElement = this.nextElementSibling;
            errorElement.textContent = '';
            this.classList.remove('is-valid', 'is-invalid');

            // Real-time validation patterns
            const nameRegex = /^[A-Za-z\s]{2,50}$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const studentIdRegex = /^LSEI2025\/[0-9]{4}$/;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            switch (this.id) {
                case 'fullname':
                    if (this.value.trim() && !nameRegex.test(this.value.trim())) {
                        this.classList.add('is-invalid');
                        errorElement.textContent = 'Please enter a valid name (2-50 characters, letters only)';
                    } else if (this.value.trim()) {
                        this.classList.add('is-valid');
                    }
                    break;
                case 'email':
                    if (this.value.trim() && !emailRegex.test(this.value.trim())) {
                        this.classList.add('is-invalid');
                        errorElement.textContent = 'Please enter a valid email address';
                    } else if (this.value.trim()) {
                        this.classList.add('is-valid');
                    }
                    break;
                case 'studentId':
                    if (this.value.trim() && !studentIdRegex.test(this.value.trim())) {
                        this.classList.add('is-invalid');
                        errorElement.textContent = 'Please enter a valid Student ID (e.g., LSEI2025/1234)';
                    } else if (this.value.trim()) {
                        this.classList.add('is-valid');
                    }
                    break;
                case 'password':
                    if (this.value && !passwordRegex.test(this.value)) {
                        this.classList.add('is-invalid');
                        // use to retify the password-goggle-icon
                        document.getElementById('passwordToggle').style.top = "38%"
                        errorElement.textContent = 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character';
                    } else if (this.value) {
                        // use to retify the password-goggle-icon
                        document.getElementById('passwordToggle').style.top = "50%"
                        this.classList.add('is-valid');
                    } else {
                        // use to retify the password-goggle-icon
                        document.getElementById('passwordToggle').style.top = "50%"
                    }
                    break;
                case 'confirmPassword':
                    if (this.value && this.value !== document.getElementById('password').value) {
                        this.classList.add('is-invalid');
                        errorElement.textContent = 'Passwords do not match';
                    } else if (this.value && document.getElementById('password').value) {
                        this.classList.add('is-valid');
                    }
                    break;
            }
        } catch (error) {
            console.error('Error in real-time validation:', error);
        }
    });
});

// Password visibility toggle
document.getElementById('passwordToggle').addEventListener('click', function () {
    try {
        const passwordInput = document.getElementById('password');
        const icon = this;

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    } catch (error) {
        console.error('Error in password visibility toggle:', error);
    }
});