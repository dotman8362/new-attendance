document.querySelector('.sidebar-toggle').addEventListener('click', function () {
  try {
    document.querySelector('.sidebar').classList.toggle('expanded');
  } catch (error) {
    console.error('Error toggling sidebar:', error);
  }
});

document.querySelectorAll('.sidebar-nav a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    try {
      document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');

      const targetId = this.getAttribute('href').substring(1);
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(targetId).classList.add('active');

      // Close sidebar on small screens after clicking a link
      if (window.innerWidth <= 768) {
        document.querySelector('.sidebar').classList.remove('expanded');
      }

      loadSectionData(targetId);
    } catch (error) {
      console.error('Error handling navigation:', error);
    }
  });
});

// document.getElementById('logoutBtn').addEventListener('click', function() {
//   try {
//     fetch('/api/logout', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       }
//     })
//     .then(response => {
//       if (response.ok) {
//         alert('Logged out successfully!');
//         window.location.href = 'index.html';
//       } else {
//         throw new Error('Logout failed');
//       }
//     })
//     .catch(error => {
//       console.error('Logout error:', error);
//       alert('An error occurred during logout.');
//     });
//   } catch (error) {
//     console.error('Error in logout:', error);
//   }
// });
// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function () {
  try {
    document.getElementById('logoutModal').style.display = 'flex';
  } catch (error) {
    console.error('Error opening logout modal:', error);
  }
});
document.getElementById('cancelLogout').addEventListener('click', function () {
  try {
    document.getElementById('logoutModal').style.display = 'none';
  } catch (error) {
    console.error('Error closing logout modal:', error);
  }
});

document.querySelector('.modal-close').addEventListener('click', function () {
  try {
    document.getElementById('logoutModal').style.display = 'none';
  } catch (error) {
    console.error('Error closing logout modal:', error);
  }
});

document.getElementById('logoutModal').addEventListener('click', function (event) {
  try {
    if (event.target === this) {
      this.style.display = 'none';
    }
  } catch (error) {
    console.error('Error closing logout modal on overlay click:', error);
  }
});
// message displayer function
function showMessage(message, type) {
  try {
    let messageElement = document.getElementById(`${type}Message`);

    // Create message element if it doesn't exist
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = `${type}Message`;
      messageElement.className = type === 'error' ? 'message-error' : 'message-success';
      document.body.appendChild(messageElement);
    }

    // Set message content and display
    messageElement.textContent = message;
    messageElement.style.display = 'block';

    // Auto-hide after 3 seconds
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
  } catch (error) {
    console.error('Error displaying message:', error);
  }
}
document.getElementById('confirmLogout').addEventListener('click', async function () {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      showMessage('Logged out successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000); // Delaying redirect for message visibility
    } else {
      throw new Error('Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
    showMessage('An error occurred during logout.', 'error');
  } finally {
    document.getElementById('logoutModal').style.display = 'none';
  }
});

function loadSectionData(sectionId) {
  try {
    switch (sectionId) {
      case 'attendance':
        fetchAttendance();
        break;
      case 'profile':
        fetchProfile();
        break;
      case 'mark-attendance':
        fetchMarkAttendance();
        break;
    }
  } catch (error) {
    console.error('Error loading section data:', error);
  }
}

function fetchAttendance() {
  const tableBody = document.getElementById('attendanceTableBody');
  tableBody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

  const mockAttendance = [
    { date: '2025-08-28', time: '09:00 AM', status: 'Present' },
    { date: '2025-08-27', time: '08:45 AM', status: 'Absent' }
  ];

  setTimeout(() => {
    tableBody.innerHTML = '';
    mockAttendance.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.date}</td>
        <td>${record.time}</td>
        <td><span class="status ${record.status.toLowerCase()}">${record.status}</span></td>
      `;
      tableBody.appendChild(row);
    });
  }, 500);

  // Real API call example:
  // fetch('/api/user/attendance')
  //   .then(response => response.json())
  //   .then(records => {
  //     tableBody.innerHTML = '';
  //     records.forEach(record => { /* Append rows */ });
  //   })
  //   .catch(error => {
  //     console.error('Error fetching attendance:', error);
  //     tableBody.innerHTML = '<tr><td colspan="3">Error loading attendance</td></tr>';
  //   });
}

function fetchProfile() {
  const mockProfile = {
    fullname: 'John Doe',
    email: 'john@example.com',
    studentId: 'LSEI2025/1234'
  };

  document.getElementById('userName').textContent = mockProfile.fullname || 'User';
  document.getElementById('fullname').value = mockProfile.fullname || '';
  document.getElementById('email').value = mockProfile.email || '';
  document.getElementById('studentId').value = mockProfile.studentId || '';

  // Real API call example:
  // fetch('/api/user/profile')
  //   .then(response => response.json())
  //   .then(data => {
  //     document.getElementById('userName').textContent = data.fullname || 'User';
  //     document.getElementById('fullname').value = data.fullname || '';
  //     document.getElementById('email').value = data.email || '';
  //     document.getElementById('studentId').value = data.studentId || '';
  //   })
  //   .catch(error => {
  //     console.error('Error fetching profile:', error);
  //     document.getElementById('userName').textContent = 'Error';
  //   });
}

function fetchMarkAttendance() {
  const attendanceMessage = document.getElementById('attendanceMessage');
  attendanceMessage.textContent = '';
  document.getElementById('attendanceStatus').value = '';
  document.getElementById('attendanceStatus').classList.remove('is-valid', 'is-invalid');
  document.getElementById('attendanceStatus').nextElementSibling.textContent = '';
}

document.getElementById('profileForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  try {
    let isValid = true;

    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const studentId = document.getElementById('studentId');

    document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
    document.querySelectorAll('input').forEach(input => {
      input.classList.remove('is-valid', 'is-invalid');
    });

    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const studentIdRegex = /^LSEI2025\/[0-9]{4}$/;

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

    if (!studentId.value.trim() || !studentIdRegex.test(studentId.value.trim())) {
      studentId.nextElementSibling.textContent = 'Please enter a valid Student ID (e.g., LSEI2025/1234)';
      studentId.classList.add('is-invalid');
      isValid = false;
    } else {
      studentId.classList.add('is-valid');
    }

    if (isValid) {
      console.log('Profile update successful:', {
        fullname: fullname.value,
        email: email.value,
        studentId: studentId.value
      });

      const data = {
        fullname: fullname.value,
        email: email.value,
        studentId: studentId.value
      };
      //   waiting for backend logic
      try {
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Profile update failed.');
        }

        const result = await response.json();
        console.log('Success:', result);
        alert('Profile updated successfully!');
        document.getElementById('userName').textContent = data.fullname;
      } catch (error) {
        console.error('Error:', error.message);
        alert('An error occurred during profile update.');
      }
    }
  } catch (error) {
    console.error('Error during form validation:', error);
    alert('An unexpected error occurred. Please try again.');
  }
});

document.querySelectorAll('#profileForm input').forEach(input => {
  input.addEventListener('input', function () {
    try {
      const errorElement = this.nextElementSibling;
      errorElement.textContent = '';
      this.classList.remove('is-valid', 'is-invalid');

      const nameRegex = /^[A-Za-z\s]{2,50}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const studentIdRegex = /^LSEI2025\/[0-9]{4}$/;

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
      }
    } catch (error) {
      console.error('Error in real-time validation:', error);
    }
  });
});

document.getElementById('markAttendanceForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  try {
    let isValid = true;
    const attendanceStatus = document.getElementById('attendanceStatus');
    const attendanceMessage = document.getElementById('attendanceMessage');

    attendanceStatus.classList.remove('is-valid', 'is-invalid');
    attendanceStatus.nextElementSibling.textContent = '';
    attendanceMessage.textContent = '';

    if (!attendanceStatus.value) {
      attendanceStatus.nextElementSibling.textContent = 'Please select an attendance status';
      attendanceStatus.classList.add('is-invalid');
      isValid = false;
    } else {
      attendanceStatus.classList.add('is-valid');
    }

    if (isValid) {
      const data = {
        status: attendanceStatus.value,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      try {
        const response = await fetch('/api/user/mark-attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Attendance marking failed.');
        }

        const result = await response.json();
        console.log('Success:', result);
        attendanceMessage.textContent = `Attendance marked as ${data.status} on ${data.date} at ${data.time}`;
        attendanceStatus.value = ''; // Reset form
        attendanceStatus.classList.remove('is-valid');
      } catch (error) {
        console.error('Error:', error.message);
        attendanceMessage.textContent = 'An error occurred while marking attendance.';
        attendanceMessage.style.color = '#dc3545';
      }
    }
  } catch (error) {
    console.error('Error during attendance form submission:', error);
    document.getElementById('attendanceMessage').textContent = 'An unexpected error occurred. Please try again.';
    document.getElementById('attendanceMessage').style.color = '#dc3545';
  }
});

document.getElementById('attendanceStatus').addEventListener('change', function () {
  try {
    const errorElement = this.nextElementSibling;
    errorElement.textContent = '';
    this.classList.remove('is-valid', 'is-invalid');

    if (!this.value) {
      this.classList.add('is-invalid');
      errorElement.textContent = 'Please select an attendance status';
    } else {
      this.classList.add('is-valid');
    }
  } catch (error) {
    console.error('Error in real-time validation:', error);
  }
});

// Initial load
loadSectionData('attendance');