import "./styles/style.scss";

const form = document.querySelector<HTMLFormElement>(".register__form")!;
const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(".form__input");
const registerBtn = document.querySelector<HTMLButtonElement>(".form__button")!;
registerBtn.disabled = true;

function showError(input: HTMLInputElement | HTMLSelectElement, message: string){
    const group = input.closest(".form__group")!;
  const errorEl = group.querySelector<HTMLElement>(".error")!;
  input.classList.add("invalid");
  errorEl.textContent = message;

};

function clearError(input: HTMLElement | HTMLSelectElement){
     const group = input.closest(".form__group")!;
  const errorEl = group.querySelector<HTMLElement>(".error")!;
  input.classList.remove("invalid");
  errorEl.textContent = "";

};

const validateLogin = (value: string) => /^[A-Za-z][A-Za-z]{2,}$/.test(value);
const validatePassword = (value: string) =>
  /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{6,}$/.test(value);
const validateConfirmPassword = (pw: string, confirm: string) => pw === confirm;
const validateCity = (value: string) => value.trim() !== "";
const validateStreet = (value: string) => value.trim() !== "";
const validateHouse = (value: string) => Number(value) > 1;
const validatePayment = () =>
  !!form.querySelector<HTMLInputElement>('input[name="payment"]:checked');

const citySelect = document.querySelector<HTMLSelectElement>("#city")!;
const streetSelect = document.querySelector<HTMLSelectElement>("#street")!;

const cityToStreets: Record<string, string[]> = {
  newyork: ["5th Ave", "Broadway", "Wall Street"],
  london: ["Oxford St", "Baker St", "Regent St"],
  toronto: ["Queen St", "King St", "Bloor St"],
};

citySelect.addEventListener("change", () => {
  streetSelect.innerHTML = `<option value="">Select street</option>`;
  const streets = cityToStreets[citySelect.value] || [];
  streets.forEach(street => {
    const opt = document.createElement("option");
    opt.value = street;
    opt.textContent = street;
    streetSelect.append(opt);
  });
});

inputs.forEach(input => {
    input.addEventListener("blur", () => {
        const value = input.value.trim();
        switch (input.id) {
             case "login":
        if (!validateLogin(input.value)) showError(input, "Login must be at least 3 letters and start with a letter");
        break;
         case "password":
        if (!validatePassword(value)) showError(input, "Password must be ≥ 6 chars and contain a special character");
        break;

      case "confirm-password":
        const password = (document.querySelector<HTMLInputElement>("#password")!).value;
        if (!validateConfirmPassword(password, value)) showError(input, "Passwords do not match");
        break;

      case "city":
        if (!validateCity(value)) showError(input, "Select a city");
        break;

      case "street":
        if (!validateStreet(value)) showError(input, "Select a street");
        break;

      case "house":
        if (!validateHouse(value)) showError(input, "House number must be greater than 1");
        break;
        }
         toggleButtonState();
    });
    input.addEventListener("focus", () => clearError(input));
});

document.querySelectorAll<HTMLInputElement>('input[name="payment"]').forEach(radio => {
  radio.addEventListener("change", () => {
    const group = radio.closest(".form__group")!;
    const errorEl = group.querySelector<HTMLElement>(".error")!;
    errorEl.textContent = "";
    toggleButtonState();
  });
});

function toggleButtonState() {
  const allValid =
    validateLogin((document.querySelector<HTMLInputElement>("#login")!).value) &&
    validatePassword((document.querySelector<HTMLInputElement>("#password")!).value) &&
    validateConfirmPassword(
      (document.querySelector<HTMLInputElement>("#password")!).value,
      (document.querySelector<HTMLInputElement>("#confirm-password")!).value
    ) &&
    validateCity(citySelect.value) &&
    validateStreet(streetSelect.value) &&
    validateHouse((document.querySelector<HTMLInputElement>("#house")!).value) &&
    validatePayment();

  registerBtn.disabled = !allValid;
}

