//转化s为00:00:00:00    时 分 秒 毫秒
function Seconds(time) {
    time = Number(time).toFixed(2) * 1000
    let _h = 1000 * 60 * 60;
    let _m = 1000 * 60;
    let _s = 1000;
    let h = format(time / _h);
    let m = format((time % _h) / _m);
    let s = format((time % _m) / _s);
    let ms = time % _s;
    if (ms <= 100) { ms = '01' } else { ms = Math.floor(ms / 10) }
    return h + ':' + m + ':' + s + ':' + ms;
}

function format(time) {
    time = parseInt(time);
    return time >= 10 ? time : '0' + time;
}

//填充标尺刻度时间
function time(time, x) {
    let item = '';
    for (let i = 0; i < x; i++) {
        item += "<li>" + Seconds(time / x * i) + "</li>"
    }
    return item
}

//dom-offset
function move(name, offset) {
    name.style.left = offset + 'px';
}

//获取浏览器滚动条宽度
function getScrollbarWidth() {
    var odiv = document.createElement('div'),//创建一个div
        styles = {
            width: '100px',
            height: '100px',
            overflowY: 'scroll'//让他有滚动条
        }, i, scrollbarWidth;
    for (i in styles) odiv.style[i] = styles[i];
    document.body.appendChild(odiv);//把div添加到body中
    scrollbarWidth = odiv.offsetWidth - odiv.clientWidth;//相减
    odiv.remove();//移除创建的div
    return scrollbarWidth;//返回滚动条宽度
}

//video帧图片填充函数
function drawVideoBackground(drawObj) {
    let images = [],
        positions = [],
        url = "url(" + drawObj.imgUrl + ")";

    let totalWidth = (drawObj.width / (drawObj.e_time - drawObj.s_time)) * drawObj.time;
    let realImgNumF = totalWidth / drawObj.frameImageWidth;
    let realImgNum = Math.ceil(realImgNumF);

    let startPos = (-drawObj.width / (drawObj.e_time - drawObj.s_time)) * drawObj.s_time; //开始图片的positionX

    let repeat = 0; //每次插入数
    let compensateTotal = 0;
    let compensate = 0; //补偿间隔
    let compensateStep = 0; //补偿间隔,skip时记录原始值
    let compensateCounter = 0;
    let skip = 0;

    if (realImgNum >= drawObj.totalImgNum) {
        repeat = Math.floor(realImgNum / drawObj.totalImgNum);
        compensateTotal = realImgNum % drawObj.totalImgNum;
        compensate =
            compensateTotal > 0 ? Math.floor(drawObj.totalImgNum / compensateTotal) : 0;
    } else {
        compensateTotal = drawObj.totalImgNum % realImgNum;
        compensate =
            compensateTotal > 0 ? Math.floor(drawObj.totalImgNum / compensateTotal) : 0;
        compensateStep = compensate;
        skip = Math.max(Math.floor(drawObj.totalImgNum / realImgNum - 1), 0);
    }

    for (let i = 0; i < drawObj.totalImgNum; i++) {
        //原始宽度增加，插入图片
        if (realImgNum >= drawObj.totalImgNum) {
            for (let j = 0; j < repeat; j++) {
                images.push(url);
                positions.push(startPos + "px " + -drawObj.frameImageHeight * i + "px");
                startPos += drawObj.frameImageWidth;
            }
            if (
                compensate > 0 &&
                (i + 1) % compensate == 0 &&
                compensateCounter < compensateTotal
            ) {
                images.push(url);
                positions.push(startPos + "px " + -drawObj.frameImageHeight * i + "px");
                startPos += drawObj.frameImageWidth;
                ++compensateCounter;
            }
        } else {
            if (
                i + 1 <= compensate &&
                i + 1 + skip >= compensate &&
                compensateCounter < compensateTotal
            ) {
                i += skip + 1;
                compensate += compensateStep;
                ++compensateCounter;
            } else {
                i += skip;
            }

            if (i >= drawObj.totalImgNum) {
                i = drawObj.totalImgNum - 1;
            }

            //原始宽度减少，隔断显示
            images.push(url);
            positions.push(startPos + "px " + -drawObj.frameImageHeight * i + "px");
            startPos += drawObj.frameImageWidth;
        }
    }
    return [images, positions];
}

// 获取音频时域数据，并绘制时域波形图
function getAudioDataAndDrawBackground(drawObj, afterDraw) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.OfflineAudioContext =
        window.OfflineAudioContext || window.webkitOfflineAudioContext;
    let request = new XMLHttpRequest();
    request.open("GET", drawObj.url, true); //允许异步
    request.responseType = "arraybuffer";
    request.onload = async () => {
        let context = new OfflineAudioContext(2, drawObj.bufferLen, 44100);
        let buffer = await context.decodeAudioData(request.response);
        let source = context.createBufferSource();
        let processor = context.createScriptProcessor(2048, 2, 1); //max-16384
        let analyser = context.createAnalyser();

        analyser.fftSize = 4096;
        analyser.smoothingTimeConstant = 0.6;
        source.buffer = buffer;

        source.connect(analyser);
        analyser.connect(processor);
        processor.connect(context.destination);

        let bufferLength = analyser.frequencyBinCount;
        let freqData = new Uint8Array(bufferLength);
        let audioArr = [];
        processor.onaudioprocess = () => {
            analyser.getByteTimeDomainData(freqData);
            audioArr.push(...freqData);
        };

        source.start(0);
        context.startRendering().then(() => {
            drawAudioBackground(audioArr, drawObj);
            if (afterDraw) {
                afterDraw(audioArr);
            }
        })
    };
    request.send();
}

// 根据绘制宽度重采样数据，然后绘制时域波形图
function drawAudioBackground(audioArr, drawObj) {
    //绘制音频波形
    const context = new OfflineAudioContext(2, drawObj.bufferLen, 44100);
    context.startRendering().then(function () {
        // 重采样
        let newAudioArr = [];
        const step = Math.max(
            Math.ceil(
                (audioArr.length / (drawObj.time * drawObj.unit)) >> 2
            ),
            1
        );
        for (let i = 0; i < audioArr.length; i += step) {
            newAudioArr.push(audioArr[i]);
        }

        drawAudioWave(newAudioArr, drawObj);

        const backgroundPos = -Math.floor(
            Math.max(drawObj.s_time, 0) * drawObj.unit
        );
        const imgDataURL = drawObj.canvas.toDataURL("image/jpg");
        const background = drawObj.background;
        background.style.backgroundImage = "url(" + imgDataURL + ")";
        background.style.backgroundPosition = backgroundPos + "px 0px";
    });
}

//绘制音频时域波形图
function drawAudioWave(audioArr, drawObj) {
    let canvasCtx = drawObj.canvas.getContext("2d");
    let fillWidth = drawObj.time * drawObj.unit;
    canvasCtx.fillStyle = "rgb(249,183,3,.2)"; //填充颜色
    canvasCtx.fillRect(0, 0, fillWidth, drawObj.height); //(x,y,width,height)
    canvasCtx.lineWidth = 2; //线宽
    canvasCtx.strokeStyle = "#fff"; //笔触颜色
    canvasCtx.beginPath();
    let sliceWidth = fillWidth / audioArr.length;
    let x = 0;
    for (let i = 0; i < audioArr.length; i++) {
        let v = audioArr[i] / 128.0;
        let y = (v * drawObj.height) / 2;
        if (i === 0) {
            canvasCtx.moveTo(x, y); //线起点
        } else {
            canvasCtx.lineTo(x, y); //线终点
        }
        x += sliceWidth;
    }
    canvasCtx.lineTo(drawObj.width, drawObj.height / 2);
    canvasCtx.stroke(); //实际绘出moveTo和lineTo定义的路径
}

//上传图片填充
function drawImgBackground(drawObj) {
    let imgNum = Math.ceil(drawObj.width / drawObj.frameImageWidth);
    let images = [],
        positions = [],
        url = "url(" + drawObj.imgUrl + ")";
    for (let i = 0; i < imgNum; i++) {
        images.push(url);
        positions.push("0px " + drawObj.frameImageWidth * i + "px");
    }
    return [images, positions]
}

export default {
    seletedZIndex: 999,
    unselectedZIndex: 998,
    Seconds: Seconds,
    time: time,
    move: move,
    getScrollbarWidth: getScrollbarWidth,
    drawVideoBackground: drawVideoBackground,
    getAudioDataAndDrawBackground: getAudioDataAndDrawBackground,
    drawAudioBackground: drawAudioBackground,
    drawImgBackground: drawImgBackground
}