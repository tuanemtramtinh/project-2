import * as Popper from "https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js";

const socket = io();

const formChat = document.querySelector("[form-chat]");
if (formChat) {
  const upload = new FileUploadWithPreview.FileUploadWithPreview(
    "upload-images",
    {
      multiple: true,
      maxFileCount: 6,
    }
  );

  formChat.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = e.target.content.value;

    const images = upload.cachedFileArray || [];

    if (content || images.length > 0) {
      const data = {
        content: content,
        images,
      };
      socket.emit("CLIENT_SEND_MESSAGE", data);

      formChat.content.value = "";

      upload.resetPreviewPanel();
    }
  });
}

const listTyping = document.querySelector(".inner-list-typing");
const chat = document.querySelector(".chat");
const body = document.querySelector(".chat .inner-body");
const currentUserId = chat.getAttribute("user-id");
let timeOutTyping;

socket.on("SERVER_RETURN_MESSAGE", (data) => {
  const div = document.createElement("div");

  let userFullName = ``;

  if (currentUserId === data.userId) {
    div.classList.add("inner-outgoing");
  } else {
    div.classList.add("inner-incoming");
    userFullName = `<div class="inner-name">${data.fullName}</div>`;
  }

  div.innerHTML = `${userFullName} <div class="inner-content">${data.content}</div>`;

  body.insertBefore(div, listTyping);

  socket.emit("CLIENT_SEND_TYPING", false);

  body.scrollTop = body.scrollHeight;
});

const emojiPicker = document.querySelector("emoji-picker");

if (emojiPicker) {
  const buttonIcon = document.querySelector(".button-icon");
  const tooltip = document.querySelector(".tooltip");

  Popper.createPopper(buttonIcon, tooltip);

  buttonIcon.addEventListener("click", () => {
    tooltip.classList.toggle("shown");
  });

  emojiPicker.addEventListener("emoji-click", (e) => {
    const emoji = e.detail.unicode;

    let inputChat = formChat.content.value;
    inputChat += emoji;
    formChat.content.value = inputChat;
  });
}

const inputChat = formChat.content;

if (inputChat) {
  console.log(inputChat);
  inputChat.addEventListener("keyup", (e) => {
    if (e.key !== "Enter" && e.keyCode !== 13) {
      // console.log(e.target.value);

      socket.emit("CLIENT_SEND_TYPING", true);

      clearTimeout(timeOutTyping);

      timeOutTyping = setTimeout(() => {
        socket.emit("CLIENT_SEND_TYPING", false);
      }, 3000);
    }
  });
}

socket.on("SERVER_RETURN_TYPING", (data) => {
  if (data.type) {
    const existBoxTyping = listTyping.querySelector(
      `.box-typing[user-id="${data.userId}"]`
    );

    if (!existBoxTyping) {
      const boxTyping = document.createElement("div");
      boxTyping.classList.add("box-typing");
      boxTyping.setAttribute("user-id", data.userId);

      boxTyping.innerHTML = `
      <div class="inner-name">${data.fullName}</div>
      <div class="inner-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      `;

      listTyping.appendChild(boxTyping);
    }

    body.scrollTop = body.scrollHeight;
  } else {
    const existBoxTyping = listTyping.querySelectorAll(
      `.box-typing[user-id="${data.userId}"]`
    );

    if (existBoxTyping.length > 0) {
      for (const box of existBoxTyping) {
        listTyping.removeChild(box);
      }
    }
  }
});
