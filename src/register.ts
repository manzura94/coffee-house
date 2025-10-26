import "./styles/style.scss";
import { AuthResponse } from "./types/auth.interface";

const form = document.querySelector<HTMLFormElement>(".register__form")!;
const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
  ".form__input",
);
const registerBtn = document.querySelector<HTMLButtonElement>(".form__button")!;
const login = document.querySelector<HTMLInputElement>("#login");
const password = document.querySelector<HTMLInputElement>("#password");
const confirmPassword =
  document.querySelector<HTMLInputElement>("#confirm-password");
const paymentMethod = form.querySelector<HTMLInputElement>(
  'input[name="payment"]',
);
const houseNumber = document.querySelector<HTMLInputElement>("#house");
const citySelect = document.querySelector<HTMLSelectElement>("#city")!;
const streetSelect = document.querySelector<HTMLSelectElement>("#street")!;

const BASE_URL = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com";

registerBtn.disabled = true;

function showError(
  input: HTMLInputElement | HTMLSelectElement,
  message: string,
) {
  const group = input.closest(".form__group")!;
  const errorEl = group.querySelector<HTMLElement>(".error")!;
  errorEl.classList.add("invalid");
  errorEl.textContent = message;
}

function clearError(input: HTMLElement | HTMLSelectElement) {
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
const validateConfirmPassword = (pw: string, confirm: string) => pw === confirm;
const validateCity = (value: string) => value.trim() !== "";
const validateStreet = (value: string) => value.trim() !== "";
const validateHouse = (value: string) => Number(value) > 1;
const validatePayment = () =>
  !!form.querySelector<HTMLInputElement>('input[name="payment"]:checked');

const cityToStreets: Record<string, string[]> = {
  newyork: ["5th Ave", "Broadway", "Wall Street"],
  london: ["Oxford St", "Baker St", "Regent St"],
  toronto: ["Queen St", "King St", "Bloor St"],
};

citySelect.addEventListener("change", () => {
  streetSelect.innerHTML = `<option value="">Select street</option>`;
  const streets = cityToStreets[citySelect.value] || [];
  streets.forEach((street) => {
    const opt = document.createElement("option");
    opt.value = street;
    opt.textContent = street;
    streetSelect.append(opt);
  });
});

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

      case "confirm-password":
        const password =
          document.querySelector<HTMLInputElement>("#password")!.value;
        if (value === "") showError(input, "Please confirm your password");
        else if (!validateConfirmPassword(password, value))
          showError(input, "Passwords do not match");
        break;

      case "city":
        if (!validateCity(value)) showError(input, "Select a city");
        break;

      case "street":
        if (!validateStreet(value)) showError(input, "Select a street");
        break;

      case "house":
        if (value === "") showError(input, "House number must be entered");
        else if (!validateHouse(value))
          showError(input, "House number must be greater than 1");
        break;
    }
    toggleButtonState();
  });
  input.addEventListener("focus", () => clearError(input));
});

document
  .querySelectorAll<HTMLInputElement>('input[name="payment"]')
  .forEach((radio) => {
    radio.addEventListener("change", () => {
      const group = radio.closest(".form__group")!;
      const errorEl = group.querySelector<HTMLElement>(".error")!;
      errorEl.textContent = "";
      toggleButtonState();
    });
  });

function toggleButtonState() {
  const allValid =
    validateLogin(document.querySelector<HTMLInputElement>("#login")!.value) &&
    validatePassword(
      document.querySelector<HTMLInputElement>("#password")!.value,
    ) &&
    validateConfirmPassword(
      document.querySelector<HTMLInputElement>("#password")!.value,
      document.querySelector<HTMLInputElement>("#confirm-password")!.value,
    ) &&
    validateCity(citySelect.value) &&
    validateStreet(streetSelect.value) &&
    validateHouse(document.querySelector<HTMLInputElement>("#house")!.value) &&
    validatePayment();

  if (allValid) {
    registerBtn.classList.add("activate-button");
  }

  registerBtn.disabled = !allValid;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (registerBtn.disabled) return;

  registerBtn.textContent = "Loading...";
  registerBtn.disabled = true;

  const userData = {
    login: login?.value,
    password: password?.value,
    confirmPassword: confirmPassword?.value,
    city: citySelect.value,
    street: streetSelect.value,
    houseNumber: Number(houseNumber?.value),
    paymentMethod: paymentMethod?.value,
  };

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      showFormError(data.error || "Registration failed. Try again.");

      resetButton();
      return;
    }

    localStorage.setItem("token", data.data.access_token);
    localStorage.setItem("user", JSON.stringify(data.data.user));

    registerBtn.textContent = "Success!";
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 3000);
  } catch (error) {
    showFormError("Network error. Please try again later.");
    resetButton();
  }
});

function resetButton() {
  registerBtn.textContent = "Registration";
  registerBtn.disabled = false;
  registerBtn.classList.remove("loading");
}

function showFormError(message: string) {
  const formError = document.querySelector<HTMLElement>(".form__error-msg");
  if (formError) formError.textContent = message;
}
