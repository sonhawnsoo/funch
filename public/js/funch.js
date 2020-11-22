var firebaseConfig = {
  apiKey: "AIzaSyCIQik_XND6yKjek4vgqnS-czh_QTvX1Tg",
  authDomain: "maple-e738b.firebaseapp.com",
  databaseURL: "https://maple-e738b.firebaseio.com",
  projectId: "maple-e738b",
  storageBucket: "maple-e738b.appspot.com",
  messagingSenderId: "738227753710",
  appId: "1:738227753710:web:40f6c74317d376d23319ff"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
// Get a reference to the database service
var database = firebase.database();
// Get element from the DOM
const currentPunchElement = document.getElementById('currentPunch');
const leftElem = document.getElementById('left');
const rightElem = document.getElementById('right');
const strongElem = document.getElementById('strong');
const verystrongElem = document.getElementById('verystrong');
const normalstrongElem = document.getElementById('normalstrong');
const goodElem = document.getElementById('good');
const leftcountElem = document.getElementById('leftcount');
const rightcountElem = document.getElementById('rightcount');
const countAmountElem = document.getElementById('countAmount');

const finalCountElem = document.getElementById('finalCount');
const finalPointElem = document.getElementById('finalPoint');

const inputChallengerElem = document.getElementById('inputChallenger');
inputChallengerElem.style.display = "none";

// // 폼 초기화
// try{
//     const inputChallengerElem = document.getElementById('inputChallenger');
//     inputChallengerElem.style.display = "none";
// }
// catch(err){
//     console.log("inputChallengerElem 초기화 Skip");
// }


// 1분 동안의 펀치 기록
const punchHistory = [];

// 기준 시간 설정
const sdt = new Date();
const sdtTstamp = sdt.getTime();
const tdt = new Date(sdtTstamp + (60 * 1000));
const tdtTstamp = tdt.getTime();

// 펀치 DB 위치 설정 
const currentPunchRef = database.ref('funch/record');

// DB 초기화 funch/sy 전체삭제
currentPunchRef.remove().then(() => {
    console.log('펀치 기록 초기화');
}).catch((error) => {
    console.log("Remove failed ", error.message);
})

// 펀치 데이터가 추가될 때
currentPunchRef.orderByChild("createTime").on("child_added", function (snapshot) {
    console.log(snapshot.val().side + '펀치 강도' + snapshot.val().strong);

    // 기록데이터 추가
    punchHistory.push(snapshot.val());

    var side = snapshot.val().side;
    var strong = snapshot.val().strong;
    expStatus(side, strong);
    checkPunchHistory();
})

function expStatus(side, strong) {
    if (side === "left") {
        console.log('entered in left');
        leftElem.style.display = 'block';
        rightElem.style.display = 'none';
    } else if (side === "right") {
        console.log('entered in right');
        leftElem.style.display = 'none';
        rightElem.style.display = 'block';
    } else {
        console.log('entered in nothing');
        leftElem.style.display = 'none';
        rightElem.style.display = 'none';
    }

    if (strong > 1000) {
        strongElem.innerHTML = "Very Strong"
        verystrongElem.style.background = "crimson";
        normalstrongElem.style.background = "orange";
        goodElem.style.background = "yellow";
    } else if (strong > 900) {
        strongElem.innerHTML = "Strong"
        verystrongElem.style.background = "white";
        normalstrongElem.style.background = "orange";
        goodElem.style.background = "yellow";

    } else if (strong > 800) {
        strongElem.innerHTML = "Good"
        verystrongElem.style.background = "white";
        normalstrongElem.style.background = "white";
        goodElem.style.background = "yellow";

    } else {
        strongElem.innerHTML = "Weak";
        verystrongElem.style.background = "white";
        normalstrongElem.style.background = "white";
        goodElem.style.background = "white";
    }
}

function clearScreen() {
    leftElem.style.display = 'none';
    rightElem.style.display = 'none';
}

function countdown() {
    console.log('entered in countdown func');
    // var timerInstance = new easytimer.Timer();
    // weight 가져오기

    var urlParams = new URLSearchParams(window.location.search)
    var weight= parseInt(urlParams.get('weight'));
    console.log('몸무게 ', weight);
    if(weight ===0 || weight===null){
        weight = 60;
    }

    var timer = new easytimer.Timer();
    timer.start({ countdown: true, startValues: { seconds: 60 } });

    const countdownElem = document.getElementById('countdown');
    const calorieElem = document.getElementById('calorie');
    countdownElem.innerHTML = timer.getTimeValues().toString(['minutes', 'seconds']);
    timer.addEventListener('secondTenthsUpdated', function (e) {
        countdownElem.innerHTML = timer.getTimeValues().toString(['minutes', 'seconds']);

   
        // 1초 단위로 칼로리 계산하기
        var calorieSec = 60-parseInt(timer.getTimeValues().seconds);
        console.log(calorieSec);
        var currentCalorie = 7*(6.5*weight*calorieSec)*5/60000;
        calorieElem.innerHTML = currentCalorie.toFixed(2) +" kcal Burning" 

    });
    timer.addEventListener('targetAchieved', function (e) {
        // 1분 카운트다운 종료 후 벨소리 출력 및 입력폼 활성화
        countdownElem.innerHTML = 'Finish!!';

        // 최종점수 보여주기
        finalCountElem.innerHTML = $("#countAmount").text();
        finalPointElem.innerHTML = getFinalPoint();

        var sound = new Howl({
            src: ['sound/bell.mp3']
        });
        sound.play();
        inputChallengerElem.style.display = "block";
    });
}

function checkPunchHistory() {
    var sound = new Howl({
        src: ['sound/punch.mp3']
    });
    sound.play();

    const leftcount = [];
    const rightcount = [];
    const finalCount=0;
    const finalPoint=0;
    punchHistory.forEach(
        function (punch) {
            if (punch.createdTime >= sdtTstamp && punch.createdTime <= tdtTstamp) {
                if (punch.side === "left") {
                    leftcount.push(punch);
                } else {
                    rightcount.push(punch);
                }
                leftcountElem.innerHTML = leftcount.length;
                rightcountElem.innerHTML = rightcount.length;
                countAmountElem.innerHTML = leftcount.length + rightcount.length;
            }
        }
    )
}

function getFinalPoint(){
    
    var res = 0;

    punchHistory.forEach(
        function (punch) {
            if (punch.createdTime >= sdtTstamp && punch.createdTime <= tdtTstamp)
            {
                res+=punch.strong;
            }
        });

        return res;
}

function save(){

    var nickname = document.getElementById("nickname").value;
    // var phone = document.getElementById("phone").value;
    var phone = "010";
    
    var finalCount = $("#finalCount").text();
    var finalPoint = $("#finalPoint").text();

    if(nickname === "" || phone===""){
        alert('닉네임 또는 폰번호를 입력해주세요.');
    }else{
        // DB에 기록 저장 후 랭킹 화면으로 이동
        // 랭킹 DB 위치 설정 
        const rankingRef = database.ref('funch/rank');
        rankingRef.push(
            {
                nickname:nickname,
                phone:phone,
                finalCount:finalCount,
                finalPoint:finalPoint,
                createdTime:new Date()
            }
        );
        location.href = "rank.html";            
    }
}

function rankOnLoad() {

    // 랭킹 DB 위치 설정 
    const RankRef = database.ref('funch/rank');

    // 랭킹 데이터
    const rankSource=[];

    const rankElem = document.getElementById("rank");

    // 기록불러오기
    RankRef.orderByChild("finalCount").on("value", function (snapshot) {
        snapshot.forEach(function(record){
            rankSource.push(record.val());
            console.log(record.val());
        })

        rankSource.sort(function(a, b){
            return b.finalCount-a.finalCount;
        });

        rankSource.forEach(function(rec, index){
            var msg = "<div><h1>"+(index+1)+ '. ' +  rec.nickname + ": 카운트 " + rec.finalCount + "번, 총점" + rec.finalPoint+"점<h1></div>";
            rankElem.innerHTML += msg;
        });    
    });
}

function startgame(){

    var weight = document.getElementById("weight").value;
    if(weight===""){
        weight = 0;
    }
    location.href = "game.html?weight="+weight;   

}