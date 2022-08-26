const login = document.querySelector(".login")!

const errorBox = login.querySelector<HTMLDivElement>(".login__message-box--error")!
const infoBox = login.querySelector<HTMLDivElement>(".login__message-box--info")!

const loginForm = login.getElementsByTagName("form")[0]
const loginEmailInp = <HTMLInputElement>loginForm.elements.namedItem("email")
const loginEmailValidation = <HTMLDivElement>document.getElementById("login-email-validation")!
const loginPasswordInp = <HTMLInputElement>loginForm.elements.namedItem("password")
const loginPasswordValidation = <HTMLDivElement>document.getElementById("login-password-validation")!
const loginBtn = login.querySelector("button[type='submit']")!

const loginCreateAccountSection = login.querySelector<HTMLDivElement>(".login__no-account")!

const toggleLoginPassword = login.querySelector<HTMLButtonElement>(".text-inp__toggle-password")!
toggleLoginPassword.addEventListener("click", () => {
    loginPasswordInp.type = loginPasswordInp.type == "text" ? "password" : "text"
})

loginForm.addEventListener("submit", e => {
    loginEmailValidation.innerText = ""
    loginPasswordValidation.innerText = ""

    if (!loginEmailInp.value) {
        loginEmailValidation.innerText = "This field is required"
        e.preventDefault()
        return
    }

    if (!loginPasswordInp.value) {
        loginPasswordValidation.innerText = "This field is required"
        e.preventDefault()
        return
    }

    loginBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`
})

const signUpBtn = document.getElementById("sign-up")
signUpBtn?.addEventListener("click", () => {
    login.classList.remove("active")
    register.classList.add("active")
})

const register = document.querySelector(".register")!

const registerForm = register.getElementsByTagName("form")[0]
const registerUsernameInp = <HTMLInputElement>registerForm.elements.namedItem("username")
const registerUsernameValidation = <HTMLDivElement>document.getElementById("register-username-validation")
const registerEmailInp = <HTMLInputElement>registerForm.elements.namedItem("email")
const registerEmailValidation = <HTMLDivElement>document.getElementById("register-email-validation")
const registerPasswordInp = <HTMLInputElement>registerForm.elements.namedItem("password")
const registerPasswordValidation = <HTMLDivElement>document.getElementById("register-password-validation")
const createAccountBtn = registerForm.querySelector<HTMLButtonElement>("button[type='submit']")!

const toggleRegisterPassword = register.querySelector<HTMLButtonElement>(".text-inp__toggle-password")!
toggleRegisterPassword.addEventListener("click", () => {
    registerPasswordInp.type = registerPasswordInp.type == "text" ? "password" : "text"
})

registerForm.addEventListener("submit", async () => {
    registerUsernameValidation.innerText = ""
    registerEmailValidation.innerText = ""
    registerPasswordValidation.innerText = ""

    const body = {
        username: registerUsernameInp.value,
        email: registerEmailInp.value,
        password: registerPasswordInp.value
    }

    if (!body.email) {
        registerEmailValidation.innerText = "This field is required"
        return
    }

    if (!body.password) {
        registerPasswordValidation.innerText = "This field is required"
        return
    }

    createAccountBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`

    const res = await fetch("/auth/create-account", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    })

    switch (res.status) {
        case 200: {
            errorBox.innerText = ""
            infoBox.innerText = "Check your email, verify your account and login."
            login.classList.add("active")
            register.classList.remove("active")
            loginCreateAccountSection.remove()
            break
        }

        case 400: {
            const json = await res.json()
            switch (json.field) {
                case "username": {
                    registerUsernameValidation.innerText = json.msg
                    break
                }

                case "email": {
                    registerEmailValidation.innerText = json.msg
                    break
                }

                case "password": {
                    registerPasswordValidation.innerText = json.msg
                    break
                }

                default: {
                    break
                }
            }

            createAccountBtn.innerHTML = "Create account"
            break
        }

        default: {
            infoBox.innerText = ""
            errorBox.innerText = "Something went wrong. Please try again."
            login.classList.add("active")
            register.classList.remove("active")
            createAccountBtn.innerHTML = "Create account"
            break
        }
    }
})
