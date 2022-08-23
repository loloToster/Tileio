const emailInp = <HTMLInputElement>document.getElementById("email")!
const passwordInp = <HTMLInputElement>document.getElementById("password")!

const togglePassword = <HTMLButtonElement>document.getElementById("toggle-password")!
togglePassword.addEventListener("click", () => {
    passwordInp.type = passwordInp.type == "text" ? "password" : "text"
})
