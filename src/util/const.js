// data - 原始数组  obj - 添加的obj  return data
export const addPiece=function(data,obj){
    for(let array of data){
        if(array.length == 0){
            array.push(obj)
            break
        }
        for(let item of array){
            if(item.s_ruler<obj.time){
                data.push([obj])
                break;
            }else{
                array.push(obj)
            }
        }
    }    
    return data
}