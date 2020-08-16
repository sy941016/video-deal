// data - 原始数组  obj - 添加的obj  return data
export const addPiece = function (data, obj) {
    let trackAdd = false;
    let track = null;
    let time = obj.e_time - obj.s_time
    for (let trackArr of data) {
        if (track) break
        if (trackArr.length == 0) {
            trackArr.push(obj);
            trackAdd = false;
            break;
        }

        for (let video of trackArr) {
            if (video.s_ruler < time) {
                trackAdd = true;
                break;
            } else if (!track) {
                track = trackArr;
            }
        }
    }

    if (trackAdd) {
        let track = [];
        track.push(obj);
        data.unshift(track);
    } else if (track) {
        track.unshift(obj);
    }
    return data
}