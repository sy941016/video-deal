import { http } from '@/util/http'
  
export const exportVideo = (params) => http.post('output', params ) // 导出视频

export const getDub = (params) => http.post('ai_text_to_audio', params ) // 导出视频