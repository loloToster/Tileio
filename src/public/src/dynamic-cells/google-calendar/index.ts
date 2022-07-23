const editIcal = document.querySelector<HTMLButtonElement>(".header__btn--edit-ical")!
const editIcalModal = document.querySelector<HTMLDivElement>(".input-modal")!

editIcal.addEventListener("click", () => {
    console.log("click")
    editIcalModal.classList.add("active")
})

editIcalModal.addEventListener("click", e => {
    if (e.target == editIcalModal)
        editIcalModal.classList.remove("active")
})
