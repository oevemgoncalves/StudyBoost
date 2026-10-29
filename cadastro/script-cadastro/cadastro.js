// cadastro.js
import { auth } from "../../firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

// Autenticação de usuário
document.getElementById("registerForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Previne envio automático

  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword");
  const confirmContainer = confirmPassword.parentElement;
  const errorMessage = document.getElementById("error-message");
  const displayName = document.getElementById("username").value.trim();
  const registerBtn = document.getElementById("registerBtn");

  if (password !== confirmPassword.value) {
    errorMessage.textContent = "As senhas não coincidem!";
    errorMessage.style.display = "block";
    confirmContainer.classList.add("input-error");
    return;
  } else {
    errorMessage.style.display = "none";
    confirmContainer.classList.remove("input-error");
  }

  if (password.length < 6) {
    errorMessage.textContent = "A senha deve ter pelo menos 6 caracteres.";
    errorMessage.style.display = "block";
    return;
  }

  const email = document.getElementById("email").value.trim();

  // Validação do e-mail
  if (!email || !email.includes("@") || !email.includes(".")) {
    errorMessage.textContent = "E-mail inválido! Use o formato: usuario@exemplo.com";
    errorMessage.style.display = "block";
    return;
  }

  if (registerBtn) {
    registerBtn.disabled = true;
    registerBtn.textContent = "Cadastrando...";
  }

  try {
    // Prossegue se o e-mail for válido
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Atualiza o nome do usuário
    await updateProfile(auth.currentUser, {
      displayName: displayName || email.split('@')[0]
    });

    console.log("Usuário criado:", userCredential.user);
    alert("Cadastro realizado com sucesso!");
    window.location.href = "../login/login.html"; // Redireciona para a página de login após o cadastro
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    let errorMsg = "Erro ao realizar cadastro. Tente novamente.";
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMsg = "Este e-mail já está em uso.";
        break;
      case "auth/invalid-email":
        errorMsg = "Formato de e-mail inválido.";
        break;
      case "auth/weak-password":
        errorMsg = "A senha é muito fraca (mínimo de 6 caracteres).";
        break;
    }
    errorMessage.textContent = errorMsg;
    errorMessage.style.display = "block";
  } finally {
    if (registerBtn) {
      registerBtn.disabled = false;
      registerBtn.textContent = "Cadastrar";
    }
  }
});

// Função para alternar a visibilidade da senha
document.addEventListener("DOMContentLoaded", function () {
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const inputId = button.getAttribute("data-target");
      const input = document.getElementById(inputId);
      const icon = button.querySelector("i");

      if (input) {
        if (input.type === "password") {
          input.type = "text";
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        } else {
          input.type = "password";
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      }
    });
  });
});
