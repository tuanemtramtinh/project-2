const socket = io();

const formChat = document.querySelector("[form-chat]");
if (formChat) {
  formChat.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = e.target.content.value;
    if (content) {
      const data = {
        content: content,
      };
      socket.emit("CLIENT_SEND_MESSAGE", data);

      formChat.content.value = "";
    }
  });
}

socket.on("SERVER_RETURN_MESSAGE", (data) => {
  console.log(data);
})