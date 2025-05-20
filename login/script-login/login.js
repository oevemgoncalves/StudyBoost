import { auth } from "../../firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";

// Configuração do toggle password (seu código existente)
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

  // Adicionando a autenticação
  const loginForm = document.getElementById("registerForm");
  const errorMessage = document.getElementById("error-message");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      // Tenta fazer login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Usuário logado:", user);

      // Redireciona para a dashboard
      window.location.href = "../../dashboard/index.html";

    } catch (error) {
      let errorMsg = "";

      switch (error.code) {
        case "auth/invalid-credential":
          errorMsg = "E-mail ou senha incorretos. Tente novamente.";
          break;
        case "auth/user-not-found":
          errorMsg = "E-mail não cadastrado.";
          break;
        case "auth/wrong-password":
          errorMsg = "Senha incorreta.";
          break;
        default:
          errorMsg = "Erro ao fazer login. Tente novamente.";
      }

      errorMessage.textContent = errorMsg;
      errorMessage.style.display = "block";
      console.error("Erro de login:", error);
    }
  });
});