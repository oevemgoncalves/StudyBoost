// cadastro.js
import { auth } from "../../firebase-config.js"; // Agora o auth existe!
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js"; // Atualize para v11.8.0
import { updateProfile } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

//autenticação de usuário
document.getElementById("registerForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Previne envio automático

  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword");
  let confirmContainer = confirmPassword.parentElement;
  let errorMessage = document.getElementById("error-message");
  const displayName = document.getElementById("username").value.trim();

  if (password !== confirmPassword.value) {
    errorMessage.textContent = "As senhas não coincidem!";
    errorMessage.style.display = "block";
    confirmContainer.classList.add("input-error");
    return;
  } else {
    errorMessage.style.display = "none";
    confirmContainer.classList.remove("input-error");
  }

  const email = document.getElementById("email").value;
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Validação do e-mail
    if (!email || !email.includes("@") || !email.includes(".")) {
      errorMessage.textContent = "E-mail inválido! Use o formato: usuario@exemplo.com";
      errorMessage.style.display = "block";
      return;
    }

    // Prossegue se o e-mail for válido
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Atualiza o nome do usuário
    await updateProfile(auth.currentUser, {
      displayName: displayName || email.split('@')[0]
    });

    console.log("Usuário criado:", userCredential.user);
    alert("Cadastro realizado com sucesso!");
    window.location.href = "../../login/login.html"; // Redireciona para a página de login após o cadastro
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    errorMessage.textContent = "Erro: " + error.message;
    errorMessage.style.display = "block";
  }

  console.log("Formulário enviado!");
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

