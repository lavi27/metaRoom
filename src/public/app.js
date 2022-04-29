const socket = io();

let roomName;
let nickName;
let myDataChannel;

const searchInput = document.getElementsByClassName("searchInput")[0];
const headerBtnLogin = document.getElementsByClassName("headerBtnLogin")[0];
const loginUserName = headerBtnLogin.getElementsByClassName("loginUserName")[0];

searchInput.disabled = true;

headerBtnLogin.addEventListener('click', () => {
  nickName = prompt('닉네임', nickName);
  socket.emit("change_nickname", nickName);
  loginUserName.innerText = nickName;
  searchInput.disabled = false;
  searchInput.placeholder = "초대코드";
});

const search = document.getElementsByClassName("search")[0];
const searchIcon = search.getElementsByClassName("searchIcon")[0];
const searchLoading = search.getElementsByClassName("searchLoading")[0];

searchInput.value = "";

searchInput.addEventListener('input', async () => {
  if (searchInput.value != "") {
    searchLoading.style.display = "block";
    searchIcon.className = "searchIcon";
    searchIcon.style.display = "none";
    try {
      socket.emit("load_rooms", 1);
    } catch(error) {
      console.error(error);
    };
  } else {
    searchIcon.src = "/public/search.svg";
    searchResultList.innerText = "";
    searchResultList.style.display = "none";
  }
});

const roomList = document.getElementsByClassName("roomList")[0];
const searchResultList = document.getElementsByClassName("searchResultList")[0];

socket.on("load_rooms", (publicRooms, state) => {
  switch(state) {
    case 0:
      if (publicRooms.length !== 0) {
        publicRooms.forEach(({name, owner, userCount}) => {
          const li = document.createElement("li");
          li.className = "room";
          li.innerHTML = `
            <span>
              <h5 class="roomTitle">${name}</h5>
              <p class="roomOwner">${owner}</p>
            </span>
            <span>
              <img src="/public/user.svg">
              <p class="roomUsercount">${userCount}</p>
            </span>`;
          li.addEventListener('click', () => {
            if (nickName !== undefined) {
              socket.emit("join_room", name, () => {
                setRoom(1, name);
              });
            } else {
              alert("로그인해주세요")
            }
          });
          roomList.appendChild(li);
        });
      } else {
        roomList.innerText = "아무 방도 열려있지 않습니다.";
      }

      break;
    case 1:
      searchResultList.innerText = "";
      let searchResultValue = [];

      if (publicRooms.length !== 0) {
        for(let i=0; i<((publicRooms.length < 5) ? publicRooms.length : 5); i++) {
          if(publicRooms[i].name.includes(searchInput.value)) {
            let searchResult = document.createElement("div");
            searchResultValue.push(publicRooms[i].name);
            searchResult.innerHTML += publicRooms[i].name.replace(searchInput.value, `<strong>${searchInput.value}</strong>`);
            
            searchResult.addEventListener("click", () => {
              socket.emit("join_room", publicRooms[i].name, () => setRoom(1, publicRooms[i].name));
              addChat(`${nickName} 님 반가워요!`, '[sys]');
            });

            searchResultList.appendChild(searchResult);
          }
        }

        if (searchResultValue.length != 0) {
          searchIcon.src = "/public/play.svg";
        } else {
          let searchResult = document.createElement("div");
          searchIcon.src = "/public/x.svg";
          searchResult.innerText = "룸이 존재하지 않습니다.";
          searchResultList.appendChild(searchResult);
        }
      } else {
        let searchResult = document.createElement("div");
        searchIcon.src = "/public/x.svg";
        searchResult.innerText = "룸이 존재하지 않습니다.";
        searchResultList.appendChild(searchResult);
      }
      searchLoading.style.display = "none";
      searchIcon.style.display = "block";
      searchResultList.style.display = "flex";

      break;
  }
});

const cards = document.getElementsByClassName("cards")[0];
const chat = document.getElementsByClassName("chat")[0];
const chatWindow = document.getElementsByClassName("chatWindow")[0];
const chatInput = document.getElementsByClassName("chatInput")[0];
const roomNameH2 = document.getElementsByClassName("roomName")[0];

function setRoom(num, roomNameInner) {
  switch(num) {
    case 1:
      cards.style.display = "none";
      roomList.style.display = "none";
      chat.style.display = "block";
      searchResultList.style.display = "none";

      searchIcon.src = "/public/search.svg";
      roomList.innerHTML = "";
      searchResultList.innerText = "";
      searchInput.value = "";
      
      roomNameH2.innerText = roomNameInner;
      roomName = roomNameInner;

      break;
    case 2:
      cards.style.display = "flex";
      roomList.style.display = "block";
      chat.style.display = "none";

      chatWindow.innerHTML = "";
      roomNameH2.innerText = null;

      break;
  }
}

searchInput.addEventListener('keydown', async (event) => {
  if (event.keyCode == 13) {
    // await initCall();
    const roomNameInner = searchInput.value;
    socket.emit("join_room", roomNameInner, () => {setRoom(1, roomNameInner)});
    addChat(`${nickName} 님 반가워요!`, '[sys]');
  }
});

chatInput.addEventListener('keydown', async (event) => {
  if (event.keyCode == 13) {
    // console.log(myDataChannel)
    // if (myDataChannel != undefined) {
    //   myDataChannel.send(chatInput.value);
    // } else {
    //   console.log("이게 왜 undefined누;;")
    // }
    await socket.emit("chat", chatInput.value, roomName, nickName);
    addChat(chatInput.value, `${nickName}(나)`);
  }
});

const exitBtn = document.getElementsByClassName("exitBtn")[0];

exitBtn.addEventListener("click", () => {
  socket.emit("leave_room", roomName);
  setRoom(2);
  socket.emit("load_rooms", 0);
});

function addChat(chat, nickName) {
  console.log(chat)
  const li = document.createElement("li");
  li.innerText = `${nickName} : ${chat}`;
  chatWindow.appendChild(li);
}

socket.on("chat", (msg, nickName) => {
  addChat(msg, nickName);
})

const userCount = document.getElementsByClassName("userCount")[0];

socket.on("join", (nickName, count) => {
  userCount.innerText = `현재 ${count}명`;
  addChat(`${nickName} 님 반가워요!`, '[sys]');
})

socket.on("leave_user", (nickName, count) => {
  userCount.innerText = `현재 ${count}명`;
  addChat(`${nickName} 님 안녕히 가세요!`, '[sys]');
})














async function initCall() {
  // await getMedia();
  makeConnection();
}

async function getMedia(deviceId) {
  const initialConstrains = {
      audio: true,
      video: { facingMode: "user" },
  };
  const cameraConstraints = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
  };
  try {
      myStream = await navigator.mediaDevices.getUserMedia(
          deviceId ? cameraConstraints : initialConstrains
      );
      // myFace.srcObject = myStream;

      if(!deviceId) {
          // await getCameras();
      }
  } catch(e) {
      console.log(e);
  }
}

// function makeConnection() {
//   myPeerConnection = new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: [
//             "stun:stun.l.google.com:19302",
//             "stun:stun1.l.google.com:19302",
            // "stun:stun2.l.google.com:19302",
            // "stun:stun3.l.google.com:19302",
            // "stun:stun4.l.google.com:19302",
      //     ]
      //   }
      // ]
  // });
  // myPeerConnection.addEventListener("icecandidate", handleIce);
  // myPeerConnection.addEventListener("addstream", handleAddstream);
  // myStream
      // .getTracks()
      // .forEach((track) => myPeerConnection.addTrack(track, myStream));
// }

function handleIce(data) {
  console.log("sent candidate")
  socket.emit("ice", data.candidate, roomName);
}

socket.on("ice", (ice) => {
  console.log("received candidate")
  myPeerConnection.addIceCandidate(ice);
});

function handleAddstream(data) {
  // const peerFace = document.getElementById("peerFace");
  // console.log("peer's Stream", data.stream);
  // peerFace.srcObject = data.stream;
}

// socket.on("welcome", async () => {
//   myDataChannel = myPeerConnection.createDataChannel("chat");
//   console.log("-----")
//   console.log(myDataChannel)
//   myDataChannel.addEventListener("message", (event)=>{
//     onMessage(event);
//   });
//   console.log("make data channel")
//   const offer = await myPeerConnection.createOffer();
//   myPeerConnection.setLocalDescription(offer);
//   console.log("sent the offer");
//   socket.emit("offer", offer, roomName);
// })

// socket.on("offer", async (offer)=>{
//   myPeerConnection.addEventListener("datachannel", (data)=>{
//       myDataChannel = data.channel;
//       console.log("-----")
//       console.log(myDataChannel)
//       myDataChannel.addEventListener("message", (event)=>{
//         onMessage(event);
//       });
//   });
//   console.log("received the offer");
//   myPeerConnection.setRemoteDescription(offer);
//   const answer = await myPeerConnection.createAnswer();
//   myPeerConnection.setLocalDescription(answer);
//   socket.emit("answer", answer, roomName);
//   console.log("sent the answer");
// });

// socket.on("answer", (answer) => {
//   console.log("received the answer");
//   myPeerConnection.setRemoteDescription(answer);
// });