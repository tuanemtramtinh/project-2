//Tính năng thông báo
const alertMessage = document.querySelector("[alert-message]");
if (alertMessage) {
  setTimeout(() => {
    alertMessage.style.display = "none";
  }, 3000);
}
