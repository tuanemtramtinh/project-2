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
// if (chat) {
//   const currentUserId = chat.getAttribute("user-id");
// }
let timeOutTyping;

if (body) {
  body.scrollTop = body.scrollHeight;

  new Viewer(body);
}

socket.on("SERVER_RETURN_MESSAGE", (data) => {
  const div = document.createElement("div");

  console.log(data);

  let userFullName = ``;
  let userImage = ``;
  let userContent = ``;

  if (chat) {
    var currentUserId = chat.getAttribute("user-id");
  }

  if (currentUserId === data.userId) {
    div.classList.add("inner-outgoing");
  } else {
    div.classList.add("inner-incoming");
    userFullName = `<div class="inner-name">${data.fullName}</div>`;
  }

  if (data.content) {
    userContent = `<div class="inner-content">${data.content}</div>`;
  }

  if (data.images.length > 0) {
    userImage = `<div class="inner-images">`;

    for (const image of data.images) {
      userImage += `<img src="${image}"/>`;
    }

    userImage += `</div>`;
  }

  div.innerHTML = `${userFullName} ${userContent} ${userImage}`;

  body.insertBefore(div, listTyping);

  new Viewer(div);

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

if (formChat) {
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

const listBtnAddFriend = document.querySelectorAll("[btn-add-friend]");
if (listBtnAddFriend.length > 0) {
  listBtnAddFriend.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const userIdB = btn.getAttribute("btn-add-friend");

      btn.closest(".box-user").classList.add("add");

      socket.emit("CLIENT_ADD_FRIEND", userIdB);
    });
  });
}

const listBtnCancelFriend = document.querySelectorAll("[btn-cancel-friend]");
if (listBtnCancelFriend.length > 0) {
  listBtnCancelFriend.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const userIdB = btn.getAttribute("btn-cancel-friend");

      btn.closest(".box-user").classList.remove("add");

      socket.emit("CLIENT_CANCEL_FRIEND", userIdB);
    });
  });
}

const listBtnRefuseFriend = document.querySelectorAll("[btn-refuse-friend]");
if (listBtnRefuseFriend.length > 0) {
  listBtnRefuseFriend.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const userIdB = btn.getAttribute("btn-refuse-friend");

      btn.closest(".box-user").classList.add("refuse");

      socket.emit("CLIENT_REFUSE_FRIEND", userIdB);
    });
  });
}

const listBtnAcceptFriend = document.querySelectorAll("[btn-accept-friend]");
if (listBtnAcceptFriend.length > 0) {
  listBtnAcceptFriend.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const userIdB = btn.getAttribute("btn-accept-friend");

      btn.closest(".box-user").classList.add("accepted");

      socket.emit("CLIENT_ACCEPT_FRIEND", userIdB);
    });
  });
}

// SERVER_RETURN_LENGTH_ACCEPT_FRIENDS

socket.on("SERVER_RETURN_LENGTH_ACCEPT_FRIENDS", (data) => {
  const badgeUserAccept = document.querySelector(
    `[badge-user-accept="${data.userIdB}"]`
  );

  if (badgeUserAccept) {
    badgeUserAccept.innerHTML = data.length;
  }
});

// SERVER_RETURN_INFO_ACCEPT_FRIENDS
socket.on("SERVER_RETURN_INFO_ACCEPT_FRIENDS", (data) => {
  const listAcceptFriends = document.querySelector(
    `[list-accept-friends="${data.userIdB}"]`
  );

  if (listAcceptFriends) {
    const newUser = document.createElement("div");

    newUser.classList.add("col-6");
    newUser.setAttribute("user-id", data.userIdA);
    newUser.innerHTML = `
    <div class="box-user">
      <div class="inner-avatar">
        <img src="https://robohash.org/hicveldicta.png" alt="${data.fullNameA}" />
      </div>
      <div class="inner-info">
        <div class="inner-name">${data.fullNameA}</div>
        <div class="inner-buttons">
          <button 
            class="btn btn-sm btn-primary mr-1"
            btn-accept-friend="${data.userIdA}"
          >
            Chấp nhận
          </button>
          <button
            class="btn btn-sm btn-secondary mr-1"
            btn-refuse-friend="${data.userIdA}"
          >
            Xóa
          </button>
          <button 
            class="btn btn-sm btn-secondary mr-1" 
            btn-deleted-friend="" 
            disabled=""
          >
            Đã xóa
          </button>
          <button 
            class="btn btn-sm btn-primary mr-1" 
            btn-accepted-friend="" 
            disabled=""
          >
            Đã chấp nhận
          </button>
        </div>
      </div>
    </div>
    `;

    listAcceptFriends.appendChild(newUser);

    const btnRefuseFriend = newUser.querySelector("[btn-refuse-friend]");
    if (btnRefuseFriend) {
      btnRefuseFriend.addEventListener("click", (e) => {
        const userIdB = btnRefuseFriend.getAttribute("btn-refuse-friend");

        btnRefuseFriend.closest(".box-user").classList.add("refuse");

        socket.emit("CLIENT_REFUSE_FRIEND", userIdB);
      });
    }

    const btnAcceptFriend = newUser.querySelector("[btn-accept-friend]");
    if (btnAcceptFriend) {
      btnAcceptFriend.addEventListener("click", (e) => {
        const userIdB = btnAcceptFriend.getAttribute("btn-accept-friend");

        btnAcceptFriend.closest(".box-user").classList.add("accepted");

        socket.emit("CLIENT_ACCEPT_FRIEND", userIdB);
      });
    }
  }

  const listNotFriends = document.querySelector(
    `[list-not-friends="${data.userIdB}"]`
  );

  if (listNotFriends) {
    const userA = listNotFriends.querySelector(`[user-id="${data.userIdA}"]`);
    if (userA) {
      listNotFriends.removeChild(userA);
    }
  }
});

//SERVER_RETURN_INFO_CANCEL_FRIENDS
socket.on("SERVER_RETURN_INFO_CANCEL_FRIENDS", (data) => {
  const listAcceptFriends = document.querySelector(
    `[list-accept-friends="${data.userIdB}"]`
  );
  if (listAcceptFriends) {
    const userA = listAcceptFriends.querySelector(
      `[user-id="${data.userIdA}"]`
    );
    if (userA) {
      listAcceptFriends.removeChild(userA);
    }
  }
});

//SERVER_RETURN_STATUS_ONLINE_USER
socket.on("SERVER_RETURN_STATUS_ONLINE_USER", (data) => {
  const listFriend = document.querySelector("[list-friend]");
  if (listFriend) {
    const user = listFriend.querySelector(`[user-id="${data.userId}"]`);

    if (user) {
      const status = user.querySelector("[status]");
      status.setAttribute("status", data.statusOnline);
    }
  }
});
