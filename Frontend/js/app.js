// // app.js

// // Utility function for validation
// function validateInput(input, regex) {
//   if (regex.test(input.value.trim())) {
//     input.classList.add("is-valid");
//     input.classList.remove("is-invalid");
//     return true;
//   } else {
//     input.classList.add("is-invalid");
//     input.classList.remove("is-valid");
//     return false;
//   }
// }

// // API Request helper
// async function apiRequest(url, method = "GET", data = null) {
//   try {
//     const options = {
//       method,
//       headers: { "Content-Type": "application/json" },
//     };

//     if (data) {
//       options.body = JSON.stringify(data);
//     }

//     const response = await fetch(url, options);
//     if (!response.ok) {
//       throw new Error(`Error: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("API Request Failed:", error);
//     throw error;
//   }
// }

// // Handle Login Form
// const loginForm = document.getElementById("loginForm");
// if (loginForm) {
//   loginForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const email = document.getElementById("email");
//     const password = document.getElementById("password");

//     const validEmail = validateInput(email, /^[^ ]+@[^ ]+\.[a-z]{2,3}$/);
//     const validPassword = validateInput(password, /^.{6,}$/);

//     if (validEmail && validPassword) {
//       try {
//         const data = await apiRequest("http://localhost:5000/api/auth/login", "POST", {
//           email: email.value,
//           password: password.value,
//         });

//         alert("Login successful!");
//         console.log("Response:", data);
//         window.location.href = "dashboard.html";
//       } catch (err) {
//         alert("Login failed. Please check your credentials.");
//       }
//     } else {
//       alert("Invalid login details.");
//     }
//   });
// }

// // Handle Registration Form
// const registerForm = document.getElementById("registerForm");
// if (registerForm) {
//   registerForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const name = document.getElementById("name");
//     const email = document.getElementById("email");
//     const password = document.getElementById("password");

//     const validName = validateInput(name, /^[a-zA-Z ]{3,}$/);
//     const validEmail = validateInput(email, /^[^ ]+@[^ ]+\.[a-z]{2,3}$/);
//     const validPassword = validateInput(password, /^.{6,}$/);

//     if (validName && validEmail && validPassword) {
//       try {
//         const data = await apiRequest("/auth/register", "POST", {
//           name: name.value,
//           email: email.value,
//           password: password.value,
//         });

//         alert("Registration successful!");
//         console.log("Response:", data);
//         window.location.href = "index.html";
//       } catch (err) {
//         alert("Registration failed. Please try again.");
//       }
//     } else {
//       alert("Please check your details.");
//     }
//   });
// }


const studentName = sessionStorage.getItem("fullname");
const studentId = localStorage.getItem("studentId");

if (studentName && studentId) {
    document.getElementById("userName").textContent = `${studentName} (${studentId})`;
}