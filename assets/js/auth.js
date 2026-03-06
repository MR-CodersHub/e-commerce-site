document.addEventListener('DOMContentLoaded', () => {
    // Password visibility toggle logic
    const toggleIcons = document.querySelectorAll('.password-toggle-icon');

    toggleIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input');
            const iconItem = this.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                iconItem.classList.replace('ph-eye', 'ph-eye-slash');
            } else {
                input.type = 'password';
                iconItem.classList.replace('ph-eye-slash', 'ph-eye');
            }
        });
    });

    // Login Redirection Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // All logins redirect to user dashboard as requested; admin dashboard is accessed through dropdown
            window.location.href = 'user-dashboard.html';
        });
    }

    // Reset Password Validation
    const resetForm = document.getElementById('resetPasswordForm');
    if (resetForm) {
        resetForm.addEventListener('submit', function (e) {
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorMsg = document.getElementById('errorMsg');

            if (password.length < 8) {
                e.preventDefault();
                errorMsg.textContent = 'Password must be at least 8 characters long.';
                errorMsg.style.display = 'block';
                return;
            }

            if (password !== confirmPassword) {
                e.preventDefault();
                errorMsg.textContent = 'Passwords do not match.';
                errorMsg.style.display = 'block';
                return;
            }

            // If everything is fine, the form will submit (or you can simulate success)
            // For demo purposes, we can just show success and redirect
            /* e.preventDefault();
            alert('Password reset successful! Redirecting to login...');
            window.location.href = 'login.html'; */
        });
    }
});
