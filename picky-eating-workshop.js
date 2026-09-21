const dialog = document.querySelector("[data-registration-dialog]");
const formStep = document.querySelector("[data-form-step]");
const successStep = document.querySelector("[data-success-step]");
const workshopForm = document.querySelector("[data-workshop-form]");
const statusMessage = document.querySelector("[data-form-status]");
const openButtons = document.querySelectorAll("[data-open-registration]");
const closeButton = document.querySelector("[data-close-registration]");

const googleFormEndpoint =
  "https://docs.google.com/forms/d/e/1FAIpQLScMTIaGdFLkMtEFyMuFFxxAndT_in5oEXfdBZDXON1Ef0tCPQ/formResponse";

const googleFormFields = {
  name: "entry.1924862638",
  phone: "entry.1884616902",
  email: "entry.1253942186",
  childAge: "entry.512733351",
};

const openRegistration = () => {
  if (!dialog?.open) {
    dialog?.showModal();
  }
};

const closeRegistration = () => {
  dialog?.close();
};

openButtons.forEach((button) => button.addEventListener("click", openRegistration));
closeButton?.addEventListener("click", closeRegistration);

dialog?.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  const isBackdropClick =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (isBackdropClick) {
    closeRegistration();
  }
});

window.setTimeout(() => {
  if (!sessionStorage.getItem("nutriwhizzWorkshopPromptSeen")) {
    openRegistration();
    sessionStorage.setItem("nutriwhizzWorkshopPromptSeen", "true");
  }
}, 900);

workshopForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!workshopForm.reportValidity()) {
    return;
  }

  const submitButton = workshopForm.querySelector("button[type='submit']");
  const submitLabel = submitButton.querySelector("span");
  const data = Object.fromEntries(new FormData(workshopForm).entries());
  const originalLabel = submitLabel.textContent;

  submitButton.disabled = true;
  submitLabel.textContent = "Saving your spot…";
  statusMessage.textContent = "";

  const responseData = new URLSearchParams({
    [googleFormFields.name]: data.name.trim(),
    [googleFormFields.phone]: data.phone.trim(),
    [googleFormFields.email]: data.email.trim().toLowerCase(),
    [googleFormFields.childAge]: data.child_age.trim(),
  });

  try {
    await fetch(googleFormEndpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: responseData,
    });
  } catch (error) {
    console.error("Workshop registration error", error);
    statusMessage.textContent = "We couldn’t save your details. Please try again in a moment.";
    submitButton.disabled = false;
    submitLabel.textContent = originalLabel;
    return;
  }

  workshopForm.reset();
  formStep.hidden = true;
  successStep.hidden = false;
  dialog.scrollTop = 0;
});
