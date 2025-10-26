import "./styles/style.scss";
import { AuthResponse } from "./types/auth.interface";

const signinBtn = document.querySelector<HTMLButtonElement>(".form__button")!;
const inputs = document.querySelectorAll<HTMLInputElement>(".form__input");
const form = document.querySelector<HTMLFormElement>(".signin__form")!;
const login = document.querySelector<HTMLInputElement>("#login")!;
const password = document.querySelector<HTMLInputElement>("#password")!;

const BASE_URL = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com";

signinBtn.disabled = true;

function showError(input: HTMLInputElement, message: string) {
  const group = input.closest(".form__group")!;
  const errorEl = group.querySelector<HTMLElement>(".error")!;
  errorEl.classList.add("invalid");
  errorEl.textContent = message;
}

function clearError(input: HTMLInputElement) {
  const group = input.closest(".form__group")!;
  const errorEl = group.querySelector<HTMLElement>(".error")!;
  errorEl.classList.remove("invalid");
  errorEl.textContent = "";
}

const validateLogin = (value: string) =>
  /^[A-Za-z][A-Za-z0-9]{2,}$/.test(value);
const validatePassword = (value: string) =>
  /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{6,}$/.test(
    value,
  );

inputs.forEach((input) => {
  input.addEventListener("blur", () => {
    const value = input.value.trim();
    switch (input.id) {
      case "login":
        if (value === "") showError(input, "Login must be entered");
        else if (!validateLogin(value))
          showError(
            input,
            "Login must be at least 3 letters and start with a letter",
          );
        break;
      case "password":
        if (value === "") showError(input, "Password must be entered");
        else if (!validatePassword(value))
          showError(
            input,
            "Password must be ≥ 6 chars and contain a special character",
          );
        break;
    }
    toggleButtonState();
  });
  input.addEventListener("focus", () => clearError(input));
});

function toggleButtonState() {
  const allValid =
    validateLogin(login.value) && validatePassword(password.value);
  if (allValid) {
    signinBtn?.classList.add("activate-button");
  }
  signinBtn!.disabled = !allValid;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (signinBtn.disabled) return;

  signinBtn.textContent = "Loading...";
  signinBtn.disabled = true;
  signinBtn.classList.add("loading");

  const userData = {
    login: login.value,
    password: password.value,
  };
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data: AuthResponse = await response.json();
    console.log(data);

    if (!response.ok) {
      showFormError("Incorrect login or password");
      resetButton();
      return;
    }

    localStorage.setItem("token", data.data.access_token);
    localStorage.setItem("user", JSON.stringify(data.data.user));

    signinBtn.textContent = "Success!";
    signinBtn.classList.remove("loading");
    login.value = "";
    password.value = "";
    setTimeout(() => {
      window.location.href = "./Menu/index.html";
    }, 2000);
  } catch (error) {
    showFormError("Network error. Please try again later.");
    resetButton();
  }
});

function resetButton() {
  signinBtn.textContent = "Sign In";
  signinBtn.disabled = false;
  signinBtn.classList.remove("loading");
}

function showFormError(message: string) {
  const formError = document.querySelector<HTMLElement>(".form__error-msg");
  if (formError) formError.textContent = message;
}
