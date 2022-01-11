$(function () {
    $("#select2").select2({
        width: "50%",
        placeholder: "#,@検索",
        background: "blue",
    });
});
$(function () {
    $(".js-modal-open").on("click", function () {
        $(".js-modal").fadeIn();
        return false;
    });
    $(".js-modal-close").on("click", function () {
        $(".js-modal").fadeOut();
        return false;
    });
});

function addDMroom() {
    //【DM】受信者と送信者にのみDMボタンが追加される
    let receiver = document.getElementById("DMtext");
    let inputValue = receiver.value;
    socket.emit("DM", inputValue, name); //送信者と受信者
    $("#Channel").append(`<option>#${inputValue}</option>`);
    receiver.value = "";
}



const socket = io();

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const toUser = document.querySelector("#input");
const typingAlert = document.querySelector(".typing_alert");

let channelBtn = document.getElementsByClassName('channel_list')[0];

let name1 = "";
let userarray = [];
let room_name = "general";
const hash = location.hash;
name1 = hash.substr(9);
let music = new Audio("./sound.mp3");

if (!(hash == '#approval' + name1) && name1 === '') {

    alert('ログインをやり直してください')
    location.replace(location.protocol + "//" + location.host + '/login');
}
$("#User").append($("<option>").html("@" + name1));

let onlineUsers = [];

console.log(location.protocol + "//" + location.host + " @sample ");


form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit("chat message", input.value);
        input.value = "";
    }
});


socket.on("connect", () => {
    socket.emit("setUserName", name1);

});

socket.on("show_online", (users) => {
    const onlineMembers = document.querySelector(".online_user");
    onlineMembers.innerHTML = "";
    onlineUsers = [];
    for (const id in users) {
        onlineMembers.innerHTML += `<li>👤${users[id]}</li>`;
        onlineUsers.push(users[id]);
    }
});

//アップロードを許可する拡張子
//jpg jpeg png gif をimgタグで表示するため拡張子判定を行う
var allow_exts = new Array('jpg', 'jpeg', 'png', 'gif');

//アップロード予定のファイル名の拡張子が許可されているか確認する関数
function checkImgExt(fileName) {
    //比較のため小文字にする
    var ext = getExt(fileName).toLowerCase();
    //許可する拡張子の一覧(allow_exts)から対象の拡張子があるか確認する
    if (allow_exts.indexOf(ext) === -1) return false;
    return true;
}

//ファイル名を渡して拡張子を返す
function getExt(fileName) {
    var pos = fileName.lastIndexOf('.');
    if (pos === -1) return '';
    return fileName.slice(pos + 1);
}

function sendImage(event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = (event) => {
        socket.emit("image", event.target.result);
    };

    reader.readAsDataURL(file);
}

//appendMessage拡張版
//引数のデータタイプに応じた表示に切り替えてappendする
const appendContent = (sender_name, text, dataType, fileUrl, timestamp, log) => {
    var time = timestamp.slice(5, -3);
    let n = 0;
    const item = document.createElement("li");
    const subText = document.createElement("div");
    item.className = "msglist";
    item.id = log.uniqueKey;

    item.dataset.sendername = sender_name;
    item.dataset.text = text;
    item.dataset.datatype = dataType;
    item.dataset.fileurl = fileUrl;
    item.dataset.timestamp = timestamp;
    item.dataset.filename = log.fileName;

    console.log(fileUrl, log.fileName);



    switch (dataType) {
        case 'msg': //itemにmsg格納
            item.textContent = text + "【@" + sender_name + "】" + time;

            // console.log('msg');
            break;

        case 'img': //imgタグをつくって画像表示
            const imageData = document.createElement("img");
            imageData.classList.add('appendImg')
            imageData.src = fileUrl;
            // imageData.width=300;
            item.appendChild(imageData);
            // console.log('img');
            break;

        case 'link':
            const link = document.createElement('a');

            link.textContent = text;
            link.href = text;
            link.className = "links";
            console.log(text)
            link.target = "_blank";
            subText.textContent = "【@" + sender_name + "】" + time;
            item.appendChild(link);
            item.appendChild(subText);
            console.log('link');
            break;


        case 'other': //aタグでファイルリンク表示
            const urlLink = document.createElement("a");
            // const subText= document.createElement("div");

            urlLink.textContent = text;
            urlLink.href = fileUrl;
            urlLink.download = "";
            urlLink.target = "_blank";
            urlLink.className = "links";
            subText.textContent = "【@" + sender_name + "】" + time;
            item.appendChild(urlLink);
            item.appendChild(subText);
            // console.log('other');
            break;
    }

    for (let index = 0; index < 4; index++) {
        let stampBtn = document.createElement("button");
        stampBtn.className = "stampBtn";

        switch (index) {
            case 0:
                stampBtn.innerHTML = "👍";
                break;
            case 1:
                stampBtn.innerHTML = "👎";
                break;
            case 2:
                stampBtn.innerHTML = "💓";
                break;
            case 3:
                stampBtn.innerHTML = "🌟";
                break;
        }
        stampBtn.dataset.stampnumber = "stamp0" + (index + 1);


        item.appendChild(stampBtn);

    }


    //.stampや.stamp.stamp01等のプロパティが実装されていないデータもあるため、TypeErrorが発生しているが、全データのデータ構造を最新にすれば治る
    //-------ここからーーーーーーーーーーー
    console.log(log);
    console.log(log.stamp);
    console.log(log.stamp.stamp01);

    item.dataset.stamp01 = log.stamp.stamp01;
    item.dataset.stamp02 = log.stamp.stamp02;
    item.dataset.stamp03 = log.stamp.stamp03;
    item.dataset.stamp04 = log.stamp.stamp04;

    let stampElement = document.createElement('div');
    stampElement.id = 'stampLog' + log.uniqueKey;
    appendStamp(stampElement, item);//スタンプログ追加

    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    music.play();
}



//チャンネルリストのボタン追加
const appendChList = (name) => {

    const chBtn = document.createElement("button");
    const brTag = document.createElement("br");
    chBtn.textContent = "# " + name;
    chBtn.setAttribute('onclick', "moveToRoom('" + name + "')");
    chBtn.id = name;
    channelBtn.appendChild(chBtn);
    channelBtn.appendChild(brTag);

};

const updateContent = (log) => {

    console.log(log.uniqueKey);
    let updateTarget = document.getElementById(log.uniqueKey);
    console.log(log.stamp.stamp01, log.stamp.stamp02, log.stamp.stamp03, log.stamp.stamp04, '：：updateContentのdataset');
    console.log(log.stamp.stamp01, '：：updateContentのdataset1');
    console.log(log.stamp.stamp02, '：：updateContentのdataset2');
    updateTarget.dataset.stamp01 = log.stamp.stamp01;
    updateTarget.dataset.stamp02 = log.stamp.stamp02;
    updateTarget.dataset.stamp03 = log.stamp.stamp03;
    updateTarget.dataset.stamp04 = log.stamp.stamp04;

    //タグ作ってスタンプのせる

    let stampElement = document.getElementById('stampLog' + log.uniqueKey);
    appendStamp(stampElement, updateTarget);


}

const appendStamp = (appendElement, updateTarget) => {// スタンプログ追加 スタンプログを格納する要素とその親要素を受け取る
    appendElement.innerHTML = '';

    let stamps = [updateTarget.dataset.stamp01, updateTarget.dataset.stamp02, updateTarget.dataset.stamp03, updateTarget.dataset.stamp04];
    let stampIcons = ['👍', '👎', '💓', '🌟'];

    console.log(stamps);

    for (let i = 0; i < stamps.length; i++) {
        if (stamps[i] != 0) {
            console.log('ifOK');
            appendElement.innerHTML += `${stampIcons[i]}${stamps[i]} `;

        }

    }

    console.log(appendElement);
    updateTarget.appendChild(appendElement);

}



function moveToRoom(roomname) {
    //部屋移動
    room_name = roomname;
    x = 2000;
    //room_name_set(roomname);
    $("#center > h3").text("#" + roomname);
    $("li").remove(); //白紙に戻す
    socket.emit("setRoomName", roomname, name);
}



const file = document.getElementById("file");


//textareaコピーボタン
function cp() {
    let txt = document.getElementById("copy");
    txt.select();
    document.execCommand("Copy");
}