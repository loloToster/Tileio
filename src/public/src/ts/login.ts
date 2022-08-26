const login = document.querySelector(".login")!

const loginEmailInp = <HTMLInputElement>document.getElementById("login-email")!
const loginPasswordInp = <HTMLInputElement>document.getElementById("login-password")!

const toggleLoginPassword = login.querySelector<HTMLButtonElement>(".text-inp__toggle-password")!
toggleLoginPassword.addEventListener("click", () => {
    loginPasswordInp.type = loginPasswordInp.type == "text" ? "password" : "text"
})

const signUpBtn = document.getElementById("sign-up")
signUpBtn?.addEventListener("click", () => {
    login.classList.remove("active")
    register.classList.add("active")
})

const register = document.querySelector(".register")!

const registerUsernameInp = <HTMLInputElement>document.getElementById("register-username")
const registerUsernameValidation = <HTMLDivElement>document.getElementById("register-username-validation")
const registerEmailInp = <HTMLInputElement>document.getElementById("register-email")
const registerEmailValidation = <HTMLDivElement>document.getElementById("register-email-validation")
const registerPasswordInp = <HTMLInputElement>document.getElementById("register-password")
const registerPasswordValidation = <HTMLDivElement>document.getElementById("register-password-validation")
const createAccountBtn = <HTMLButtonElement>document.getElementById("create-account")

const toggleRegisterPassword = register.querySelector<HTMLButtonElement>(".text-inp__toggle-password")!
toggleRegisterPassword.addEventListener("click", () => {
    registerPasswordInp.type = registerPasswordInp.type == "text" ? "password" : "text"
})

createAccountBtn.addEventListener("click", async () => {
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

    const res = await fetch("/auth/create-account", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    })

    if (res.status != 200) {
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

        return
    }
})
