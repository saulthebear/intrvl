// On each change of current password input, copy the value into the delete form
// Enables verifying password on delete, without needing duplicate current
// password inputs

const currentPasswordInput = document.querySelector("#current-password-input")
const duplicatePasswordInput = document.querySelector("#copy-current-password")

currentPasswordInput.addEventListener("change", () => {
  duplicatePasswordInput.value = currentPasswordInput.value
})
