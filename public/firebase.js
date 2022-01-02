// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getStorage, uploadBytes, ref as sRef, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-storage.js';
import {
    getDatabase,
    ref,
    push,
    set,
    onChildAdded,
    remove,
    onChildRemoved,
    onChildChanged,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";
// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyBZxjwX0yd15FkvGzoVZlXgRdIQaJgH7j4",
    authDomain: "sky-way-d053d.firebaseapp.com",
    databaseURL: "https://sky-way-d053d-default-rtdb.firebaseio.com",
    projectId: "sky-way-d053d",
    storageBucket: "sky-way-d053d.appspot.com",
    messagingSenderId: "256426296650",
    appId: "1:256426296650:web:66eacc287adffb69496db3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app); //RealtimeDBに接続
chListLoad();
contentAdd('general', 0); //初期設定 generalに入室

//お試し



// Initialize firebase

let killNumber = 0;
// input要素
const fileInput = document.getElementById('file');
//チャンネル追加フォームのボタン
const addRoombutton = document.getElementById("addRoombutton");
//チャンネルリスト重複防止用のset
let chSet = new Set(["general", "random"]);
//firebaseデータ登録


function dataSendToDB(txt, type, fName, url) {
    let now = new Date();
    const newPostRef = push(ref(db, 'chat/' + room_name)); //ユニークKEYを生成
    let msg = {
        uname: name,
        text: txt,
        channel: room_name,
        dataType: type,
        fileName: fName,
        fileUrl: url,
        uniqueKey: newPostRef.key, //ユニークキー
        timestamp: now.toLocaleString(), //現在時刻をタイムスタンプの値に設定
        stamp: {
            stamp01: '0',
            stamp02: '0',
            stamp03: '0',
            stamp04: '0'
        }
    };

    console.log(newPostRef.key);
    set(newPostRef, msg); //"chat"にユニークKEYをつけてオブジェクトデータを登録
}

//メッセージ送信時発火
$("#send").on("click", function () {
    let inputVal = $("#input").val();
    console.log(inputVal.slice(0, 4) + 'slice')
    if (inputVal.slice(0, 4) == 'http') { //リンクを検出
        dataSendToDB(inputVal, 'link', '0', '0');
    } else {
        dataSendToDB(inputVal, 'msg', '0', '0');
    }
});


//ファイルのやりとり
//------------ファイル選択＆storageへアップロード------------------

//以下を行う
//1.ファイルをstorageへ送信
//2.storageに保存されたファイルのurlを取得
//3.取得したurlをRealtimeDatabaseに記録

const handleFileSelect = async () => {
    const files = fileInput.files;
    for (let i = 0; i < files.length; i++) {

        let file = files[i];
        let fileName = files[i].name;
        const storage = getStorage();
        const imageRef = sRef(storage, fileName);

        //1.ファイルをstorageへ送信
        await uploadBytes(imageRef, file).then((snapshot) => {
            console.log('Uploaded a blob or file!');
        });
        //2.storageに保存されたファイルのurlを取得
        let fileUrl = await fileUrlDownloader(fileName); //アップロード完了後にUrlを取りにいく

        //3.取得したurlをRealtimeDatabaseに記録
        if (checkImgExt(fileName)) {
            dataSendToDB(fileName, 'img', fileName, fileUrl);
        } else {
            dataSendToDB(fileName, 'other', fileName, fileUrl);
        };


    }

}
// ファイル選択時にhandleFileSelectを発火
fileInput.addEventListener('change', handleFileSelect);


//fileNameと同じ名前のファイルのリンクをfirebase storageから取得＋リンクをセットするメソッドを呼び出し
//getDownloadURLの呼び出し＋Urlを返す
const fileUrlDownloader = async (fileName) => {
    // console.log(fileName);
    const storage = getStorage();
    let getUrl; //戻り値格納用変数

    await getDownloadURL(sRef(storage, fileName)) //処理に時間がかかるのでawaitが必要
        .then((url) => {
            // `url` is the download URL for 'images/stars.jpg'

            // This can be downloaded directly:
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = (event) => {
                const blob = xhr.response;
            };
            xhr.open('GET', url);
            xhr.send();
            getUrl = url;

        })
        .catch((error) => {
            // Handle any errors
        });
    return getUrl;
}

//----------------------------------------------------------


//メッセージを表示させる
function contentAdd(channel, myNumber) {
    const dbRef = ref(db, 'chat/' + channel);

    onChildAdded(dbRef, function (data) {
        //music.play(); メッセージ受け取った時サウンド(チャンネル移動の時も音が鳴ってしまった)
        let log = data.val();
        if (killNumber == myNumber) { //最新のonChildAddedか照合
            appendContent(log.uname, log.text, log.dataType, log.fileUrl, log.timestamp, log); //チャット欄へデータの追加

        } else {
            return;
        }
    })

    onChildChanged(ref(db, 'chat/' + channel), (data) => {
        let log = data.val();

        if (killNumber == myNumber) { //最新のonChildAddedか照合
            console.log(log.uname, log.text, log.dataType, log.fileUrl, log.timestamp, log);
            updateContent(log);

        } else {
            return;
        }

    });


}


channelBtn.addEventListener('click', changeRoom); //部屋移動発火

function changeRoom(e) { //部屋移動
    console.log('roomChange');
    killNumber++;
    console.log(killNumber + ":killNumber");
    console.log(e.target.id);
    contentAdd(e.target.id, killNumber);
}

//チャンネル移動用のボタンのリストを作成
function chListLoad() {
    const chListRef = ref(db, 'channelList');

    onChildAdded(chListRef, function (data) {
        let list = data.val();

        console.log(list.channelName);
        chSet.add(list.channelName);
        appendChList(list.channelName);

    })
}

//チャンネル追加フォームのイベントリスナー
addRoombutton.addEventListener('click', channelAdd);



//チャンネル追加フォームの値をデータベースへ送信
function channelAdd() {

    //【公開チャンネル】全ユーザーに部屋ボタンが追加される
    let textbox = document.getElementById("roomtext");
    let inputValue = textbox.value;
    textbox.value = "";
    console.log(inputValue);

    //チャンネル名の重複防止
    if (!chSet.has(inputValue)) {
        chSet.add(inputValue);
        let addCh = {
            channelName: inputValue
        }

        const channelListRef = push(ref(db, 'channelList')); //ユニークKEYを生成
        set(channelListRef, addCh); //"channelList"にユニークKEYをつけてオブジェクトデータを登録
    } else {
        appendContent("error message", "そのルームは既に存在します", "msg", "null", "null", "null", "null"); //チャット欄へデータの追加
    }

}

document.addEventListener("click", function (event) {
    if (event.target.classList.contains("stampBtn")) {

        console.log(event.target.parentNode);

        console.log('ok');
        // console.log($(this).data('stampnumber'));
        // console.log($(this).parent().attr('id'));

        let stampNumber = event.target.dataset.stampnumber;
        let parent = event.target.parentNode;
        let uniqueID = parent.id;

        let stamp01Tmp = parent.dataset.stamp01;
        let stamp02Tmp = parent.dataset.stamp02;
        let stamp03Tmp = parent.dataset.stamp03;
        let stamp04Tmp = parent.dataset.stamp04;
        console.log(stamp01Tmp, stamp02Tmp, stamp03Tmp, stamp04Tmp, '：：要素を拾った時のdataset');


        switch (stampNumber) {
            case "stamp01":
                console.log("stamp01 switch");
                stamp01Tmp++;
                console.log(stamp01Tmp);
                break;

            case "stamp02":
                console.log("stamp02 switch");
                stamp02Tmp++;
                console.log(stamp02Tmp);
                break;

            case "stamp03":
                console.log("stamp03 switch");
                stamp03Tmp++;
                console.log(stamp03Tmp);
                break;

            case "stamp04":
                console.log("stamp04 switch");
                stamp04Tmp++;
                console.log(stamp04Tmp);
                break;

            default:
                console.log("stamp EventLisner default");
                break;
        }
        // console.log(parent.data('filename') + '::nullcheck filename');
        // console.log(parent.data('fileurl') + '::nullcheck fileurl');

        let now = new Date();
        let msg = {
            uname: parent.dataset.sendername,
            text: parent.dataset.text,
            channel: room_name,
            dataType: parent.dataset.datatype,
            fileName: parent.dataset.filename,
            fileUrl: parent.dataset.fileurl,
            uniqueKey: uniqueID, //ユニークキー
            timestamp: now.toLocaleString(),
            stamp: {
                stamp01: stamp01Tmp,
                stamp02: stamp02Tmp,
                stamp03: stamp03Tmp,
                stamp04: stamp04Tmp
            }
        };

        console.log(msg);

        const PostRef = ref(db, 'chat/' + room_name + '/' + uniqueID);
        set(PostRef, msg); //"chat"にユニークKEYをつけてオブジェクトデータを登録

    }
}, false);







function stampEvent(e) {
    console.log('ok');
    console.log(e.data('stampnumber'));
    console.log(e.parent().attr('id'));

    let stampNumber = e.data('stampnumber');
    let parent = e.parent();
    let uniqueID = parent.attr('id');

    let stamp01Tmp = parent.data('stamp01');
    let stamp02Tmp = parent.data('stamp02');
    let stamp03Tmp = parent.data('stamp03');
    let stamp04Tmp = parent.data('stamp04');
    console.log(stamp01Tmp, stamp02Tmp, stamp03Tmp, stamp04Tmp, '：：要素を拾った時のdataset');


    switch (stampNumber) {
        case "stamp01":
            console.log("stamp01 switch");
            stamp01Tmp++;
            console.log(stamp01Tmp);
            break;

        case "stamp02":
            console.log("stamp02 switch");
            stamp02Tmp++;
            console.log(stamp02Tmp);
            break;

        case "stamp03":
            console.log("stamp03 switch");
            stamp03Tmp++;
            console.log(stamp03Tmp);
            break;

        case "stamp04":
            console.log("stamp04 switch");
            stamp04Tmp++;
            console.log(stamp04Tmp);
            break;

        default:
            console.log("stamp EventLisner default");
            break;
    }
    console.log(parent.data('filename') + '::nullcheck filename');
    console.log(parent.data('fileurl') + '::nullcheck fileurl');

    let now = new Date();
    let msg = {
        uname: parent.data('sendername'),
        text: parent.data('text'),
        channel: room_name,
        dataType: parent.data('datatype'),
        fileName: parent.data('filename'),
        fileUrl: parent.data('fileurl'),
        uniqueKey: uniqueID, //ユニークキー
        timestamp: now.toLocaleString(),
        stamp: {
            stamp01: stamp01Tmp,
            stamp02: stamp02Tmp,
            stamp03: stamp03Tmp,
            stamp04: stamp04Tmp
        }
    };

    console.log(msg);

    const PostRef = ref(db, 'chat/' + room_name + '/' + uniqueID);
    set(PostRef, msg); //"chat"にユニークKEYをつけてオブジェクトデータを登録


}





// let testbtn = document.getElementById('testbtn');
// testbtn.addEventListener('click', tester);

// function tester() {
//     let now = new Date();
//     let msg = {
//         uname: 'update004',
//         text: 'update',
//         channel: room_name,
//         dataType: 'msg',
//         fileName: 'update',
//         fileUrl: 'update',
//         timestamp: now.toLocaleString(), //現在時刻をタイムスタンプの値に設定
//         stamp: {
//             stamp01: '1',
//             stamp02: '10',
//             stamp03: '2',
//             stamp04: '3'
//         }
//     };

//     const PostRef = ref(db, 'chat/general/-MpjNUtJs0YXzkDL4L3j');
//     set(PostRef, msg); //"chat"にユニークKEYをつけてオブジェクトデータを登録
//     console.log('update?');
// }



//ファイル送受信のプロセス
//---------------------
//1.ファイルをstorageへ送信
//2.storageに保存されたファイルのurlを取得
//3.取得したurlをRealtimeDatabaseに記録
//4.RDが各ユーザーに追加されたデータを送る  （onChildAdded）
//5.送信されたデータをメッセージ・画像・ファイルに応じた方法で表示 (appendMessage等)


//onChildAdded と チャンネル移動 について
//----------------------------------
//起動時に ①既存データを取得 ②データ更新されるたびに新データを取得し処理を行う
//①を利用してデータを取り込むことで部屋移動の際のデータ表示を行いたい
//しかし、部屋移動毎に②の部分が残り待機してしまう
//結果、複数回部屋移動を行なったのち新しく投稿を行うと、待機していた移動回数分のonChildAddedがその数だけappendContentを行い、投稿がダブる
//
//解決策として、
//静的な変数killNumberを用意する。
//killNumberの値は部屋移動毎に ＋１ される
//onChildAddedCollerが呼び出される際、killNumberを渡し、これをmyNumberとして保持させる
//appendContentが行われる際、myNumberとkillNumberの照合を行い、結果がfalseの場合appendContentは行わないようにする
//（最新のkillNumberを保持していないonChildAddedは処理を持たない状態になる）


//チャンネルリストの作成・更新
//---------------------
// window読み込み時にonChildAddedで'channelList'を参照
// 取得したデータをボタンにしてチャンネルリストに追加
// チャンネル追加フォームに入力された値を'channelList'に送信
// onChildAddedがリストの変更を検知し自動で更新
// 重複したチャンネル名が存在しないようにチャンネル追加の前にsetで検証