
const loginLoader = document.getElementById("loginLoader");
const registerLoader = document.getElementById("registerLoader");
const resetLoader = document.getElementById("resetLoader");

const form = document.getElementById('registerForm');

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById('userName').value.trim();
  const email = document.getElementById('email1').value.trim();
  const password = document.getElementById('password1').value.trim();
  const confirmPassword = document.getElementById('password2').value.trim();

  //  Validation
  if (!name || !email || !password || !confirmPassword) {
    Swal.fire({ icon: "error", text: "All fields are required" });
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    Swal.fire({ icon: "error", title: "Invalid email", text: "Please enter a valid email" });
    return;
  }

  if (password.length < 6) {
    Swal.fire({ icon: "error", title: "Weak password", text: "Password must be at least 6 characters" });
    return;
  }
  if(password !== confirmPassword){
    Swal.fire({
      icon: "error",
      title: "Password Mismatch",
      text: "Confirm password should be same as password",
      timer: 3000
    });
    return;
  }
  
   registerLoader.classList.remove("d-none");
  
  const url = "https://testapi-touo.onrender.com/api/auth/register";

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.message || JSON.stringify(data));
     

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "✅ User registered successfully"
      });
       registerLoader.classList.add("d-none");

      form.reset();

      
      const signupModalEl = document.getElementById("modal1");
      const signupModal = bootstrap.Modal.getInstance(signupModalEl) || new bootstrap.Modal(signupModalEl);
      signupModal.hide();

     
      const loginModalEl = document.getElementById("modal");
      const loginModal = new bootstrap.Modal(loginModalEl);
      loginModal.show();
    })
    .catch(err => {
      console.error("Registration error:", err);
      Swal.fire({ icon: "error", title: "Oops!", text: err.message });
      registerLoader.classList.add("d-none");
    });
});




// ============= Login Handling =========


const loginForm = document.getElementById("loginform");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("loginemail").value.trim();
  const password = document.getElementById("loginpassword").value.trim();

  // Validation
  if (!email || !password) {
    Swal.fire({ icon: "error", text: "Both fields are required" });
    return;
  }
 loginLoader.classList.remove("d-none");
  
  fetch("https://testapi-touo.onrender.com/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.message || JSON.stringify(data));
       
   
localStorage.setItem("authToken", data.token);
localStorage.setItem("loggedInUser", JSON.stringify(data.user));


      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Redirecting...",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
         loginLoader.classList.add("d-none");
        window.location.href = "/pages/dashboard.html";
      });
    })
    .catch(err => {
      Swal.fire({ icon: "error", title: "Login Failed", text: err.message });
       loginLoader.classList.add("d-none");
    });
});

const token = localStorage.getItem("authToken");

if (token) {
  fetch("https://testapi-touo.onrender.com/api/auth/profile", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      console.log("User Profile:", data);
     
      document.getElementById("welcomeUser").textContent = `Welcome, ${data.name}!`;

      // Pre-fill profile update form
      document.getElementById("profileName").value = data.name;
      document.getElementById("profileEmail").value = data.email;
      document.getElementById("profileDepartment").value = data.department;
    })
    .catch(err => console.error("Error fetching profile:", err));
};


// ========== Forgot Password =========
const resetForm = document.getElementById("resetForm");

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPassword = document.getElementById("resetPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword1").value.trim();
  const resetEmail = document.getElementById("resetEmail").value.trim();

  //  Password validation
  if (newPassword.length < 6) {
    Swal.fire({
      icon: "error",
      title: "Weak Password",
      text: "Password must be at least 6 characters.",
      timer: 3000
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Password Mismatch",
      text: "New password and confirm password do not match.",
      timer: 3000
    });
    return;
  }

  try {
    //   reset password
    const response = await fetch("https://testapi-touo.onrender.com/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: resetEmail,
        password: newPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: data.message || "Something went wrong. Try again.",
        timer: 3000
      });
      return;
    }

    //  Success
    Swal.fire({
      icon: "success",
      title: "Password Updated",
      text: "Your password has been updated successfully! Please log in again.",
      timer: 2500
    }).then(() => {
      // Switch modals after success
      const resetModal = bootstrap.Modal.getInstance(document.getElementById("modal3"));
      resetModal.hide();
      const loginModal = new bootstrap.Modal(document.getElementById("modal1"));
      loginModal.show();
    });

    resetForm.reset();

  } catch (error) {
    console.error("Reset Password Error:", error);
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: "Unable to connect to server. Try again later.",
      timer: 3000
    });
  }
});





  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterEmail = document.getElementById("newsletterEmail");

  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = newsletterEmail.value.trim();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        timer: 2500
      });
      return;
    }

    
    Swal.fire({
      icon: "success",
      title: "Subscribed!",
      text: "You've successfully subscribed to our newsletter 🎉",
      timer: 3000
    });

    newsletterForm.reset();
  });


