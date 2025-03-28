document.getElementById("registerForm").addEventListener("submit", function(event) {
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword");
    let confirmContainer = confirmPassword.parentElement; // Pega a div .input-container
    let errorMessage = document.getElementById("error-message");

    if (password !== confirmPassword.value) {
        errorMessage.textContent = "As senhas não coincidem!";
        errorMessage.style.display = "block";
        confirmContainer.classList.add("input-error"); // Deixa a borda vermelha na div
        event.preventDefault(); // Impede o envio do formulário
    } else {
        errorMessage.style.display = "none";
        confirmContainer.classList.remove("input-error"); // Remove o erro ao corrigir
    }
});
