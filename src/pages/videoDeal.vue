<style src="@/assets/css/videoDeal.scss" lang="scss"></style>
<template>
  <div ref="videoClip" @click="clickIndex=-1,nameShow=true" class="videoClip">
    <nav ref="nav">
      <el-menu
        default-active="1"
        class="el-menu-demo"
        mode="horizontal"
        background-color="#fff"
        text-color="#909399"
        active-text-color="#00DFB0"
      >
        <el-menu-item index="1" @click="tabId=0">
          <img src="@/assets/img/media.png" alt v-show="tabId!=0" />
          <img src="@/assets/img/media_click.png" alt v-show="tabId==0" />媒体
        </el-menu-item>
        <el-menu-item index="2">
          <el-upload
            :action="domain+'upload/'"
            accept="video/*, audio/*, .PDF, .docx, image/*"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            :on-progress="beforeAvatarUpload"
            :limit="1"
            :show-file-list="false"
            ref="upload"
          >
            <div @click="tabId = 2">
              <img src="@/assets/img/upload.png" alt v-show="tabId!=2" />
              <img src="@/assets/img/upload_click.png" alt v-show="tabId==2" />
              <button :style="{color:(tabId==2?'#F9B703':'rgb(144, 147, 153)')}">上传</button>
            </div>
          </el-upload>
        </el-menu-item>
        <el-menu-item index="3" @click="tabId=1">
          <img src="@/assets/img/sel.png" alt v-show="tabId!=1" />
          <img src="@/assets/img/sel_click.png" alt v-show="tabId==1" />字幕
        </el-menu-item>
        <el-menu-item index="4" @click="dub">
          <img src="@/assets/img/peiyin.png" alt v-show="tabId!=3" style="width:14px;height:20px;" />
          <img
            src="@/assets/img/peiyin_click.png"
            alt
            v-show="tabId==3"
            style="width:14px;height:20px;"
          />电脑配音
        </el-menu-item>
      </el-menu>
      <ul class="right">
        <li class="active" @click="generate">导出</li>
        <li v-show="load">
          <a :href="loadHref">下载</a>
        </li>
      </ul>
    </nav>
    <div class="video" ref="center">
      <div class="left" v-show="tabId===0||tabId===2||tabId===3">
        <el-menu
          default-active="1"
          class="el-menu-vertical-demo"
          background-color="#fff"
          text-color="#909399"
          active-text-color="#00DFB0"
        >
          <el-menu-item index="1">
            <span slot="title">我的素材</span>
          </el-menu-item>
        </el-menu>
        <div class="center" ref="material">
          <div class="title">
            <div>共{{material.length}}个素材</div>
          </div>
          <ul class="video-list">
            <!-- 素材拖拽div -->
            <!-- video及video的音频 -->
            <div ref="drag_v" class="drag_v">
              <div class="audio-background" ref="background" />
              <canvas ref="videoAduioCanvas" :width="dragWidth" :height="20" v-show="false" />
            </div>
            <!-- audio -->
            <canvas ref="drag_canvas" :width="dragWidth" :height="dragHeight" v-show="false"></canvas>
            <div ref="drag_background" class="drag_background" :style="dragAudioStyle" />
            <!-- 上传进度 -->
            <div class="click-box bg" v-show="isUpload">
              <div class="pro-box">
                <div class="title" ref="pro_title"></div>
                <el-progress :percentage="percent" color="rgba(249,183,3,1)" :show-text="false"></el-progress>
              </div>
            </div>
            <!-- 右键 -->
            <vue-context-menu
              class="right-menu"
              :target="materialTarget"
              :show="materialMenuVisible"
              @update:show="(show) => materialMenuVisible = show"
            >
              <a href="javascript:" @click.stop="rename">重命名</a>
              <a href="javascript:" @click.stop="delItem(clickIndex)">删除</a>
            </vue-context-menu>
            <template v-for="(item,index) in material">
              <li
                class="click-box"
                @mousedown="dragData(item,index)"
                :key="'vc'+index"
                v-if="item.type==='v'"
                @click.right="rightClick(index)"
              >
                <div class="qie" @click.stop="videoPlay(index)" @mousedown.stop>切割</div>
                <img
                  :src="[domain+item.thumb]"
                  alt
                  draggable="false"
                  @mousedown="(e)=>{ e.preventDefault()}"
                />
                <div class="name">{{item.name}}</div>
                <div class="renameFile" v-show="clickIndex==index&&!nameShow">
                  <input type="text" v-model="item.name" @click.stop @mousedown.stop />
                </div>
              </li>
              <li
                class="click-box bg"
                @mousedown="dragData(item,index)"
                :key="'ac'+index"
                v-if="item.type==='a'"
                @click.right="rightClick(index)"
              >
                <div class="qie" @click="audioPlay(index)" @mousedown.stop>预览</div>
                <div class="name">{{item.name}}</div>
                <div class="renameFile" v-show="clickIndex==index&&!nameShow">
                  <input type="text" v-model="item.name" @click.stop @mousedown.stop />
                </div>
              </li>
              <li
                class="click-box bg"
                @mousedown="dragData(item,index)"
                v-if="item.type==='i'"
                :key="'ic'+index"
                @click.right="rightClick(index)"
              >
                <div class="qie" @click="imgPlay(index)" @mousedown.stop>预览</div>
                <img
                  :src="[domain+item.image]"
                  alt
                  draggable="false"
                  @mousedown="(e)=>{ e.preventDefault()}"
                />
                <div class="name">{{item.name}}</div>
                <div class="renameFile" v-show="clickIndex==index&&!nameShow">
                  <input type="text" v-model="item.name" @click.stop @mousedown.stop />
                </div>
              </li>
            </template>
          </ul>
        </div>
      </div>
      <div class="left" v-show="tabId===1">
        <el-menu
          default-active="1"
          class="el-menu-vertical-demo"
          background-color="#fff"
          text-color="#909399"
          active-text-color="#00DFB0"
        >
          <el-menu-item index="1">
            <span slot="title">默认</span>
          </el-menu-item>
        </el-menu>
        <div class="center">
          <ul class="video-list word-list">
            <li class="click-box big" @click="textPlay(0)">
              <div class="bottom">应用样式</div>
              <div class="qie-word" :style="{display:(fontSizeIndex==0?'block':'none')}">
                <i class="el-icon-check"></i>
              </div>
            </li>
            <li class="click-box small" @click="textPlay(1)">
              <div class="bottom">应用样式</div>
              <div class="qie-word" :style="{display:(fontSizeIndex==1?'block':'none')}">
                <i class="el-icon-check"></i>
              </div>
            </li>
            <li class="click-box large" @click="textPlay(2)">
              <div class="bottom">应用样式</div>
              <div class="qie-word" :style="{display:(fontSizeIndex==2?'block':'none')}">
                <i class="el-icon-check"></i>
              </div>
            </li>
            <li class="click-box tm" @click="textPlay(3)">
              <div class="bottom">应用样式</div>
              <div class="qie-word" :style="{display:(fontSizeIndex==3?'block':'none')}">
                <i class="el-icon-check"></i>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!--播放窗口-->
      <div class="right">
        <div class="canvas">
          <canvas ref="canvas"></canvas>
          <div class="subtitles" ref="subtitles">{{subtitles}}</div>
        </div>
        <div class="controls">
          <img src="@/assets/img/000.jpg" alt style="display: none" id="black_img" />
          <img src="@/assets/img/play.png" alt @click="canvasPlay" v-if="playShow" />
          <img src="@/assets/img/pause.png" alt @click="pause" v-if="!playShow" />
          <p>{{canvasTime | timeFormat}}&nbsp;&nbsp;/&nbsp;&nbsp;{{this.etime | timeFormat}}</p>
        </div>
      </div>
      <div class="copy-editor" v-if="word">
        <div class="left">
          <el-tabs type="border-card">
            <el-tab-pane label="内容">
              <el-radio v-model="radio" label="1">手动输入</el-radio>
              <el-radio v-model="radio" label="2">语音转字幕</el-radio>
              <el-button round @click="addText">+ 加一行</el-button>
              <div class="con" v-show="radio==1">
                <template v-for="textArr in textData">
                  <div class="text-row" v-for="(item,index) in textArr" :key="index">
                    <div class="time" @click="textTo(item,index)">
                      <span>{{item.s_ruler | timeFormat}}</span>&nbsp;~&nbsp;
                      <span>{{item.e_ruler | timeFormat}}</span>
                    </div>
                    <div class="text">
                      <el-input placeholder v-model="item.subtitles"></el-input>
                    </div>
                  </div>
                </template>
              </div>
              <div class="con" v-show="radio==2">
                <img src="@/assets/img/1.png" alt class="title-img" />
                <el-button round id="make">开始制作</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="样式">
              <div class="aligin">
                底部间距
                <div class="block">
                  <el-slider v-model="padding" @change="paddingZoom"></el-slider>
                </div>
              </div>
              <div class="aligin">
                对齐方式
                <img src="@/assets/img/left.png" class="aligin-item" @click="aligin(0)" alt />
                <img
                  src="@/assets/img/center.png"
                  class="aligin-item isActive"
                  @click="aligin(1)"
                  alt
                />
                <img src="@/assets/img/right.png" class="aligin-item" @click="aligin(2)" alt />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="right" @click="word=false">
          <i class="el-icon-caret-right"></i>
          收起
        </div>
      </div>
    </div>
    <!-- 前进后退 -->
    <div class="action" ref="action">
      <a @click="scissor">
        <img src="@/assets/img/scissor.png" alt class="scissor" />
      </a>
      <a @click="clickDel">
        <img src="@/assets/img/dell.png" alt v-show="!delButton" />
        <img src="@/assets/img/delClick.png" alt v-show="delButton" class="del" />
      </a>
      <a @click="retreat">
        <img src="@/assets/img/back.png" v-show="!backButton" alt />
        <img src="@/assets/img/back_click.png" v-show="backButton" alt />
      </a>
      <a @click="forward">
        <img src="@/assets/img/go.png" v-show="!goButton" alt />
        <img src="@/assets/img/go_click.png" v-show="goButton" alt />
      </a>
    </div>
    <div class="footer" ref="footer">
      <!--轨道title-->
      <ul class="left" ref="footerLeft">
        <li></li>
        <li v-for="(item,index) in videoData" :key="'v'+index">
          <img id="v_img" src="@/assets/img/video.png" alt />
          <img id="xl" src="@/assets/img/xiala.png" @click="sboxShow(index,'v')" alt />
          <ul class="selected" ref="video">
            <li @click="addTrack(index,'v')">
              <img src="@/assets/img/add.png" alt />添加媒体轨
            </li>
            <li @click="delTrack(index,'v')">
              <img src="@/assets/img/del.png" alt />删除媒体轨
            </li>
          </ul>
        </li>
        <li v-for="(item,index) in audioData" :key="'a'+index" class="audioHeight">
          <img id="a_img" src="@/assets/img/audio.png" alt />
          <img id="xl" src="@/assets/img/xiala.png" @click="sboxShow(index,'a')" alt />
          <ul class="selected" ref="audio">
            <li @click="addTrack(index,'a')">
              <img src="@/assets/img/add.png" alt />添加音频轨
            </li>
            <li @click="delTrack(index,'a')">
              <img src="@/assets/img/del.png" alt />删除音频轨
            </li>
          </ul>
        </li>
        <li v-for="(item,index) in textData" :key="'t'+index" class="audioHeight">
          <img id="t_img" src="@/assets/img/zimu.png" alt />
        </li>
      </ul>
      <div class="right" ref="right">
        <div class="right-box" ref="rightBox">
          <!-- 右键 -->
          <vue-context-menu
            class="right-menu"
            :target="rightTarget"
            :show="rightMenuVisible"
            @update:show="(show) => rightMenuVisible = show"
          >
            <a href="javascript:" @click="clickDel">删除</a>
            <a
              href="javascript:"
              @click="cutPiece"
              :style="{cursor:(pieceObj==undefined?'not-allowed':'pointer')}"
            >
              剪切
              <span>ctrl + x</span>
            </a>
            <a
              href="javascript:"
              @click="copyPiece"
              :style="{cursor:(pieceObj==undefined?'not-allowed':'pointer')}"
            >
              复制
              <span>ctrl + c</span>
            </a>
            <a
              href="javascript:"
              @click="pastePiece"
              :style="{cursor:(copyPieceObj==undefined?'not-allowed':'pointer')}"
            >
              粘贴
              <span>ctrl + v</span>
            </a>
            <a
              href="javascript:"
              @click="clickParted"
              :style="{cursor:(pieceObj==undefined?'not-allowed':'pointer')}"
            >音频分离</a>
          </vue-context-menu>
          <!--pointer-->
          <div class="pointer pointer-b" ref="pointB" @mousedown="movePointerB"></div>
          <!--标尺-->
          <div id="li">
            <ul class="times" id="b-times">
              <li v-for="count in rulerCopies" :key="count"></li>
            </ul>
            <div class="ruler" @click="clickPointer" ref="ruler">
              <div class="scale" v-for="count in rulerCopies" :key="count">
                <div class="ruler-child">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
              </div>
            </div>
          </div>
          <!--video轨道-->
          <VideoTrack
            v-for="(item,index) in videoData"
            :key="'video'+index"
            :videoArr="item"
            :unit="unit"
            :trackIndex="index"
            @click.right.native="getTrackIndex(index)"
            @click.native="getTrackIndex(index)"
            tabindex="0"
            @clip="piecesMax"
            @pieceMes="piece"
            @overlap="pieceOverlap"
            @copy="fastCopuPiece"
            @cut="fastCutPiece"
            @keyup.ctrl.86.native="pastePiece"
            @record="record"
            @del="pieceDel"
            @mousedown.native="dragPiece"
          ></VideoTrack>
          <!-- 
          clip -- 求最大段piece
          pieceMes -- 获取轨道信息
          overlap -- 处理重叠
          copy -- 复制piece
          cut -- 剪切piece
          keyup.ctrl.86.native -- ctrl + c 粘贴piece
          record -- 记录操作
          del -- 删除piece
          mousedown.native -- peiece 轨道间拖动
          -->
          <!--audio轨道-->
          <AudioTrack
            v-for="(item,index) in audioData"
            :key="'audio'+index"
            :audioArr="item"
            :unit="unit"
            :trackIndex="index"
            @click.right.native="getTrackIndex(index)"
            @click.native="getTrackIndex(index)"
            tabindex="0"
            @clip="piecesMax"
            @pieceMes="piece"
            @overlap="pieceOverlap"
            @copy="fastCopuPiece"
            @cut="fastCutPiece"
            @keyup.ctrl.86.native="pastePiece"
            @record="record"
            @del="pieceDel"
            @mousedown.native="dragPiece"
          ></AudioTrack>
          <!-- 字幕轨道 -->
          <TextTrack
            v-for="(item,index) in textData"
            :key="'text'+index"
            :textArr="item"
            :unit="unit"
            :trackIndex="index"
            @click.right.native="getTrackIndex(index)"
            @click.native="getTrackIndex(index)"
            tabindex="0"
            @clip="piecesMax"
            @pieceMes="piece"
            @overlap="pieceOverlap"
            @copy="fastCopuPiece"
            @cut="fastCutPiece"
            @keyup.ctrl.86.native="pastePiece"
            @record="record"
            @del="pieceDel"
          ></TextTrack>
        </div>
      </div>
    </div>
    <div class="zoom" ref="zoom">
      <div class="scroll" ref="scroll">
        <div class="scroll-thumb" @mousedown="moveScroll" ref="scrollThumb"></div>
      </div>
      <i class="el-icon-remove" @click="minus"></i>
      <div class="block">
        <el-slider v-model="value" @change="zoom"></el-slider>
      </div>
      <i class="el-icon-circle-plus" @click="add"></i>
    </div>
    <template v-for="(item,index) in material">
      <!--video编辑-->
      <el-dialog
        :visible="preIndex=='vp'+index"
        :key="'vp'+index"
        title="预览剪辑"
        center
        @close="preIndex=-1"
        custom-class="modalBox"
      >
        <div class="video-preview">
          <div class="video-box" :id="'vb'+index">
            <video :id="'video'+index" class="video-js">
              <source :src="item.url?[domain+item.url]:''" type="video/mp4" />
            </video>
            <div class="controls">
              <img src="@/assets/img/play.png" alt @click="play" v-if="playShow" />
              <img src="@/assets/img/pause.png" alt @click="pause" v-if="!playShow" />
              <p>{{currentTime | timeFormat}}&nbsp;&nbsp;/&nbsp;&nbsp;{{videoTime | timeFormat}}</p>
              <img src="@/assets/img/before.png" alt @click="starTime(index)" class="arrow before" />
              <img src="@/assets/img/after.png" alt @click="endTime(index)" class="arrow" />
            </div>
            <div class="ruler-box">
              <ul class="times" :id="'time'+index">
                <li>00:00:00</li>
              </ul>
              <div class="pointer" ref="pointer"></div>
              <div id="pointer-segment" ref="segment"></div>
              <div class="ruler-container">
                <div class="ruler-frag"></div>
                <div class="ruler-frag"></div>
                <div class="ruler-frag"></div>
                <div class="ruler-frag"></div>
                <div class="ruler-frag"></div>
                <div class="ruler-frag"></div>
              </div>
            </div>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancel(index)">取 消</el-button>
          <el-button type="primary" @click="confirm(index)">确 定</el-button>
        </span>
      </el-dialog>
      <!--audio编辑-->
      <el-dialog :visible="preIndex=='ap'+index" :key="'ap'+index" @close="preIndex=-1">
        <div class="audio-preview">
          <audio controls>
            <source :src="[domain+item.url]" type="audio/ogg" />
          </audio>
        </div>
      </el-dialog>
      <!--img编辑-->
      <el-dialog :visible="preIndex=='ip'+index" :key="'ip'+index" @close="preIndex=-1">
        <div class="audio-preview img-preview">
          <img :src="[domain+item.image]" alt />
        </div>
      </el-dialog>
    </template>
    <!-- 配音弹框 -->
    <el-dialog :visible.sync="dubVisible">
      <div class="dub">
        <div class="dubing-title">
          <span>电脑配音</span>
          仅支持中文的识别，暂不支持其他语种的配音
        </div>
        <div class="dubing-body">
          <ul class="col-left">
            <li class="dubing-item" @click="dubClick(0)" :class="{dubActive:dubIndex==0}">
              <img src="@/assets/img/2.png" alt />
              <div class="col-name">
                <span class="name">蓝蓝</span>
                <img
                  src="@/assets/img/source.gif"
                  alt
                  class="icon-sound"
                  :style="{display:(dubIndex==0?'block':'none')}"
                />
              </div>
              <i class="el-icon-check" :style="{display:(dubIndex==0?'block':'none')}"></i>
            </li>
            <li class="dubing-item" @click="dubClick(1)" :class="{dubActive:dubIndex==1}">
              <img src="@/assets/img/3.png" alt />
              <div class="col-name">
                <span class="name">大鑫</span>
                <img
                  src="@/assets/img/source.gif"
                  alt
                  class="icon-sound"
                  :style="{display:(dubIndex==1?'block':'none')}"
                />
              </div>
              <i class="el-icon-check" :style="{display:(dubIndex==1?'block':'none')}"></i>
            </li>
            <li class="dubing-item" @click="dubClick(3)" :class="{dubActive:dubIndex==3}">
              <img src="@/assets/img/4.png" alt />
              <div class="col-name">
                <span class="name">凯哥</span>
                <img
                  src="@/assets/img/source.gif"
                  alt
                  class="icon-sound"
                  :style="{display:(dubIndex==3?'block':'none')}"
                />
              </div>
              <i class="el-icon-check" :style="{display:(dubIndex==3?'block':'none')}"></i>
            </li>
            <li class="dubing-item" @click="dubClick(4)" :class="{dubActive:dubIndex==4}">
              <img src="@/assets/img/5.png" alt />
              <div class="col-name">
                <span class="name">夕颜</span>
                <img
                  src="@/assets/img/source.gif"
                  alt
                  class="icon-sound"
                  :style="{display:(dubIndex==4?'block':'none')}"
                />
              </div>
              <i class="el-icon-check" :style="{display:(dubIndex==4?'block':'none')}"></i>
            </li>
          </ul>
          <div class="col-right">
            <el-input type="textarea" placeholder="请输入您的配音" resize="none" v-model="dubCon"></el-input>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dubVisible = false">取 消</el-button>
        <el-button type="primary" @click="dubConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- audio 播放源 -->
    <audio id="audio" v-show="false" />
    <!-- video 播放源 -->
    <video id="video" v-show="false" />
    <!-- img 播放源 -->
    <img id="img" alt v-show="false" />
  </div>
</template>

<script>
import { cloneDeep } from "lodash";
import { exportVideo, getDub } from "@/service";
import vueCommon from "@/util/method";
import { addPiece } from "@/util";
//视频组件
import Video from "video.js";
import "video.js/dist/video-js.css";
//右键
import { component as VueContextMenu } from "@xunlei/vue-context-menu";

//轨道组件
import VideoTrack from "@/components/video/videoTrack.vue";
import AudioTrack from "@/components/audio/audioTrack.vue";
import TextTrack from "@/components/text/textTrack.vue";

const videoMoveWidth = 853; //小标尺总偏移量
const frameImageWidth = 164; //帧图片宽度
const frameImageHeight = 74; //帧图片高度
const pointerInitLeft = -6; //pointer初始偏移量
const totalPointerTime = 300; //标尺总时长300s
const text_time = 20; //字幕piece-time
const img_time = 3; //图片时间

export default {
  components: {
    VueContextMenu,
    VideoTrack,
    AudioTrack,
    TextTrack,
  },
  name: "videoDeal",
  data() {
    return {
      tabId: 0,
      preIndex: -1, //弹窗显示
      zero: true, //轨道是否为null,true - null
      delButton: false, //删除图标样式显示
      backButton: false, //后退前进button显示
      goButton: false, //前进button显示
      loadShow: false, //上传弹窗显示
      isUpload: false, //上传进度条显示
      //配音选框显示
      dubVisible: false,
      dubShow: false,
      dubCon: "",
      dubIndex: 0,
      percent: 0, //上传进度
      load: false, //下载显示
      loadHref: "", //下载地址
      playShow: true, //播放按钮显示
      videoTime: 0, //视频总时长
      currentTime: 0, //视频当前时长
      canvasTime: 0, //canvas当前播放时长
      etime: 0,
      rulerWidth: 100, //ruler初始宽度100%
      rulerCopies: 25, //标尺份数
      value: 30, //缩放初始值
      //组件传值
      frameImageWidth: frameImageWidth,
      frameImageHeight: frameImageHeight,
      //素材数据
      material: [
        {
          type: "v",
          time: 28,
          url: require("@/assets/video/1.mp4"),
          thumbnail: require("@/assets/img/suolue.png"),
          imagesNum: 28,
          is_audio: 1,
          thumb: require("@/assets/img/1.jpg"),
          vcodec: "",
          acodec: "",
        },
        {
          type: "a",
          url: require("@/assets/video/2.mp3"),
          time: 8,
        },
      ],
      //音频数据
      dragWidth: this.dragWidth,
      dragHeight: this.dragHeight,
      dragAudioStyle: {},
      //字幕数据
      word: false,
      radio: "1",
      subtitles: "",
      padding: 0,
      fontSizeIndex: 3,
      aliginIndex: 1,
      margin_bottom: 0,
      //视频填充数据
      videoData: [[]],
      //音频填充数据
      audioData: [[]],
      //文字填充数据
      textData: [[]],
      unit: this.unit,
      rightDis: 0, //底部滚动条滚动距离
      //接口域名
      // domain: process.env.VUE_APP_URL,
      domain: "",
      //重命名
      clickIndex: -1,
      nameShow: true,
      materialMenuVisible: false,
      materialTarget: "",
      rightMenuVisible: false,
      rightTarget: "",
      //即将处理的piece信息
      pieceObj: this.pieceObj,
      copyPieceObj: this.copyPieceObj,
      //记录状态信息
      recordData: [
        {
          videoData: [[]],
          audioData: [[]],
          textData: [[]],
        },
      ],
      step: 0,
    };
  },
  created: function () {},
  mounted: function () {
    //右键菜单源
    this.materialTarget = this.$refs.material;
    this.rightTarget = this.$refs.rightBox;

    //big-ruler刻度
    let bTimes = document.getElementById("b-times");
    bTimes.innerHTML = vueCommon.time(totalPointerTime, this.rulerCopies);

    //zoom  1 = 10%
    this.rulerWidth = this.rulerWidth + this.value * 10;
    this.$refs.rightBox.style.width = this.rulerWidth + "%";
    this.rightBoxWidth = this.$refs.rightBox.clientWidth; //rulerBox
    this.scrollWidth = this.$refs.scroll.clientWidth; //scrollBox
    this.unit =
      (this.$refs.right.clientWidth * this.rulerWidth * 0.01) /
      totalPointerTime;

    //底部滚动条宽度
    let scrollUnit = (this.unit / this.rightBoxWidth) * this.scrollWidth;
    this.$refs.scrollThumb.style.width =
      scrollUnit * totalPointerTime * (100 - this.value + 1) * 0.01 + "px";

    //track - height
    this.videoTrackHeight = document.getElementsByClassName(
      "video-track"
    )[0].clientHeight;
    this.audioTrackHeight = document.getElementsByClassName(
      "audio-track"
    )[0].clientHeight;

    // dom - height
    const navHeight = this.$refs.nav.clientHeight; //nav
    const centerHeight = this.$refs.center.clientHeight; //center
    const actionHeight = this.$refs.action.clientHeight + 10; //action + margin
    const rulerHeight = this.$refs.ruler.clientHeight; //ruler
    const fLeftWdith = this.$refs.footerLeft.clientWidth; //footer-left

    //拖拽素材 drapTopDif  drapLeftDif
    this.drapTopDif = navHeight + centerHeight + actionHeight + rulerHeight;
    this.drapLeftDif = fLeftWdith;
  },
  methods: {
    // canvas绘制
    canvas(width, height, name) {
      this.$refs.canvas.getContext("2d").drawImage(name, 0, 0, width, height);
    },
    //piece轨道间的拖动
    dragPiece(e) {
      if (!this.pieceObj) return;
      let scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      let scrollLeft =
        document.documentElement.scrollLeft || document.body.scrollLeft;
      //轨道box滚动距离
      let righTranslate = this.$refs.rightBox.style.transform;
      let bottomScrollTop = this.$refs.footer.scrollTop;
      let bottomScrollLeft = 0;
      if (righTranslate) {
        bottomScrollLeft = Number(righTranslate.replace(/[^0-9]/gi, ""));
      }
      let initTop = scrollTop + e.clientY - this.drapTopDif + bottomScrollTop; //初始实际拖动Y
      let initTrackIndex; //初始轨道下标
      let videoTrackSum = this.videoData.length * this.videoTrackHeight; //video轨道总高度
      if (this.pieceObj.type === ("v" || "i")) {
        initTrackIndex = Math.ceil(initTop / this.videoTrackHeight) - 1;
      } else if (this.pieceObj.type === "a") {
        initTrackIndex =
          Math.ceil((initTop - videoTrackSum) / this.audioTrackHeight) - 1;
      }
      //拖拽div宽度
      this.dragWidth = this.pieceObj.vdrWidth;
      //传入的draw函数的obj
      let drawObj;
      if (this.pieceObj.type === "v") {
        this.dragHeight = frameImageHeight;
        drawObj = {
          s_time: this.pieceObj.s_time,
          e_time: this.pieceObj.e_time,
          width: this.dragWidth,
          totalImgNum: this.pieceObj.imagesNum,
          imgUrl: this.pieceObj.thumbnail,
          time: this.pieceObj.time,
          frameImageWidth: frameImageWidth,
          frameImageHeight: frameImageHeight,
        };
        [
          this.backgroundImage,
          this.backgroundPosition,
        ] = vueCommon.drawVideoBackground(drawObj);
        //video的音频
        let bufferLen = 44100 * this.pieceObj.time;
        drawObj = {
          bufferLen: bufferLen,
          url: this.pieceObj.acodec,
          time: this.pieceObj.time,
          s_time: 0,
          unit: this.unit,
          width: this.dragWidth,
          height: 20,
          canvas: this.$refs.videoAduioCanvas,
          background: this.$refs.background,
        };
        vueCommon.getAudioDataAndDrawBackground(drawObj);
      } else if (this.pieceObj.type === "a") {
        this.dragHeight = 30;
        let bufferLen = 44100 * this.pieceObj.time;
        drawObj = {
          bufferLen: bufferLen,
          url: this.pieceObj.url,
          time: this.pieceObj.time,
          s_time: 0,
          unit: this.unit,
          width: this.dragWidth,
          height: this.dragHeight,
          canvas: this.$refs.drag_canvas,
          background: this.$refs.drag_background,
        };
        vueCommon.getAudioDataAndDrawBackground(drawObj);
      } else if (this.pieceObj.type === "i") {
        this.dragHeight = frameImageHeight;
        drawObj = {
          width: this.dragWidth,
          url: this.pieceObj.url,
          frameImageWidth: frameImageWidth,
        };
        [
          this.backgroundImage,
          this.backgroundPosition,
        ] = vueCommon.drawImgBackground(drawObj);
      }
      //鼠标点击piece的长度
      let mousePieceDis =
        scrollTop +
        e.clientX -
        this.drapLeftDif +
        Math.abs(bottomScrollLeft) -
        this.pieceObj.left;
      window.onmousemove = (e) => {
        //鼠标位置
        this.dragTop = scrollTop + e.clientY;
        this.dragLeft = scrollLeft + e.clientX - mousePieceDis;
        let trackIndex; //结束轨道下标
        let dragDisX =
          scrollLeft +
          e.clientX -
          this.drapLeftDif +
          Math.abs(bottomScrollLeft) -
          this.pieceObj.left -
          mousePieceDis; //实际拖动距离X
        let dragDisY = this.dragTop - this.drapTopDif + bottomScrollTop; //实际拖动距离Y
        if (this.pieceObj.type === ("v" || "i")) {
          trackIndex = Math.ceil(dragDisY / this.videoTrackHeight) - 1;
        } else if (this.pieceObj.type === "a") {
          trackIndex =
            Math.ceil((dragDisY - videoTrackSum) / this.audioTrackHeight) - 1;
        }
        //初始与当前轨道下标不相等且鼠标点击piece的位置>=0执行操作
        if (initTrackIndex != trackIndex && mousePieceDis >= 0) {
          this.pieceDel(this.pieceObj);
          if (this.pieceObj.type === ("v" || "i")) {
            this.$refs.drag_v.style.cssText =
              "display:block;top:" +
              this.dragTop +
              "px;left:" +
              this.dragLeft +
              "px;width:" +
              this.dragWidth +
              "px;height:" +
              this.dragHeight +
              "px;background-image:" +
              this.backgroundImage +
              ";background-position:" +
              this.backgroundPosition;
          } else if (this.pieceObj.type === "a") {
            this.dragAudioStyle = {
              display: "block",
              width: this.dragWidth + "px",
              height: this.dragHeight + "px",
              top: this.dragTop + "px",
              left: this.dragLeft + "px",
            };
          }
        }
        window.onmouseup = () => {
          //初始轨道下标不相等且有充足轨道才能进行轨道间的拖拽
          let newPieceAdded = false;
          if (
            initTrackIndex != trackIndex &&
            trackIndex >= 0 &&
            mousePieceDis >= 0
          ) {
            if (this.pieceObj.type === ("v" || "i")) {
              if (trackIndex < this.videoData.length) {
                this.pieceObj.left = this.pieceObj.left + dragDisX;
                this.pieceObj.s_ruler =
                  this.pieceObj.s_ruler + dragDisX / this.unit;
                this.videoData[trackIndex].push(this.pieceObj);
                newPieceAdded = true;
              } else {
                this.videoData[initTrackIndex].push(this.pieceObj);
              }
            } else if (this.pieceObj.type === "a") {
              if (trackIndex < this.audioData.length) {
                this.pieceObj.left = this.pieceObj.left + dragDisX;
                this.pieceObj.s_ruler =
                  this.pieceObj.s_ruler + dragDisX / this.unit;
                this.audioData[trackIndex].push(this.pieceObj);
                newPieceAdded = true;
              } else {
                this.audioData[initTrackIndex].push(this.pieceObj);
              }
            }
          } else if (
            //当前轨道下标<0  || 已经脱出piece且当前轨道与初始轨道下标相等
            trackIndex < 0 ||
            ((this.$refs.drag_v.style.cssText != "" ||
              Object.keys(this.dragAudioStyle).length > 0) &&
              initTrackIndex == trackIndex)
          ) {
            if (this.pieceObj.type === ("v" || "i")) {
              this.videoData[initTrackIndex].push(this.pieceObj);
            } else if (this.pieceObj.type === "a") {
              this.audioData[initTrackIndex].push(this.pieceObj);
            }
          }
          //记录操作
          if (newPieceAdded) {
            this.pieceOverlap(this.pieceObj, trackIndex);
            this.record();
          }
          //鼠标抬起清空样式
          this.$refs.drag_v.style.cssText = "";
          this.dragAudioStyle = {};
          trackIndex = null;
          initTrackIndex = null;
          window.onmousemove = null;
        };
      };
    },
    //素材拖拽至媒体轨道
    dragData(obj) {
      const {
        time,
        thumbnail,
        type,
        url,
        imagesNum,
        is_audio,
        vcodec,
        acodec,
      } = obj;
      //footer内部滚动距离
      let rightDom = this.$refs.rightBox.style.transform;
      let bottomScrollTop = this.$refs.footer.scrollTop;
      let bottomScrollLeft;
      if (rightDom == "") {
        bottomScrollLeft = 0;
      } else {
        bottomScrollLeft = Number(
          rightDom.match(/\(([^)]*)\)/)[1].split("p")[0]
        );
      }
      //形参:时长，帧图片，标识，下标，素材，帧图片张数,视频是否有声音
      //滚动条位移
      let scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      let scrollLeft =
        document.documentElement.scrollLeft || document.body.scrollLeft;
      //拖拽div宽度
      this.dragWidth = this.unit * time;
      //传入的draw函数的obj
      let drawObj;
      if (type == "v") {
        this.dragHeight = frameImageHeight;
        drawObj = {
          s_time: 0,
          e_time: time,
          width: this.dragWidth,
          totalImgNum: imagesNum,
          imgUrl: this.domain + thumbnail,
          time: time,
          frameImageWidth: frameImageWidth,
          frameImageHeight: frameImageHeight,
        };
        [
          this.backgroundImage,
          this.backgroundPosition,
        ] = vueCommon.drawVideoBackground(drawObj);
        //video的音频
        let bufferLen = 44100 * time;
        drawObj = {
          bufferLen: bufferLen,
          url: this.domain + acodec,
          time: time,
          s_time: 0,
          unit: this.unit,
          width: this.dragWidth,
          height: 20,
          canvas: this.$refs.videoAduioCanvas,
          background: this.$refs.background,
        };
        vueCommon.getAudioDataAndDrawBackground(drawObj);
      } else if (type == "a") {
        this.dragHeight = 30;
        let bufferLen = 44100 * time;
        drawObj = {
          bufferLen: bufferLen,
          url: this.domain + url,
          time: time,
          s_time: 0,
          unit: this.unit,
          width: this.dragWidth,
          height: this.dragHeight,
          canvas: this.$refs.drag_canvas,
          background: this.$refs.drag_background,
        };
        vueCommon.getAudioDataAndDrawBackground(drawObj);
      } else if (type == "i") {
        this.dragHeight = frameImageHeight;
        drawObj = {
          width: this.dragWidth,
          imgUrl: this.domain + url,
          frameImageWidth: frameImageWidth,
        };
        [
          this.backgroundImage,
          this.backgroundPosition,
        ] = vueCommon.drawImgBackground(drawObj);
      }
      window.onmousemove = (e) => {
        //鼠标位置
        this.dragTop = scrollTop + e.clientY;
        this.dragLeft = scrollLeft + e.clientX;
        if (type == "v" || type == "i") {
          this.$refs.drag_v.style.cssText =
            "display:block;top:" +
            this.dragTop +
            "px;left:" +
            this.dragLeft +
            "px;width:" +
            this.dragWidth +
            "px;height:" +
            this.dragHeight +
            "px;background-image:" +
            this.backgroundImage +
            ";background-position:" +
            this.backgroundPosition;
        } else if (type == "a") {
          this.dragAudioStyle = {
            display: "block",
            width: this.dragWidth + "px",
            height: this.dragHeight + "px",
            top: this.dragTop + "px",
            left: this.dragLeft + "px",
          };
        }
        window.onmouseup = () => {
          let dragDisY = this.dragTop - this.drapTopDif + bottomScrollTop; //实际拖动距离Y
          let dragDisX =
            this.dragLeft - this.drapLeftDif + Math.abs(bottomScrollLeft); //实际拖动距离x
          let trackIndex; //轨道下标
          let newPieceAdded = false;
          let item;
          if (type === "v") {
            item = {
              thumbnail: this.domain + thumbnail,
              url: this.domain + url,
              vcodec: this.domain + vcodec,
              acodec: this.domain + acodec,
              frameImageWidth: frameImageWidth,
              frameImageHeight: frameImageHeight,
              imagesNum: imagesNum,
              time: Number(time),
              s_time: 0,
              e_time: Number(time),
              s_ruler: dragDisX / this.unit,
              e_ruler: Number(time) + dragDisX / this.unit,
              is_audio: is_audio,
              backgroundImage: [],
              backgroundPosition: [],
              vdrWidth: 10,
              selected: true,
              type: type,
            };
            trackIndex = Math.ceil(dragDisY / this.videoTrackHeight) - 1; //轨道下标
            if (
              dragDisY / this.videoTrackHeight > 0 &&
              dragDisX >= 0 &&
              trackIndex < this.videoData.length
            ) {
              this.videoData[trackIndex].push(item);
              newPieceAdded = true;
            }
            this.$refs.drag_v.style.cssText = "";
          } else if (type === "a") {
            item = {
              url: this.domain + url,
              vdrWidth: 10,
              time: Number(time),
              s_time: 0,
              e_time: Number(time),
              s_ruler: dragDisX / this.unit,
              e_ruler: Number(time) + dragDisX / this.unit,
              selected: true,
              type: type,
            };
            let audioDragDis =
              dragDisY - this.videoData.length * this.videoTrackHeight; //audio实际拖动距离
            trackIndex = Math.ceil(audioDragDis / this.audioTrackHeight) - 1; //轨道下标
            if (
              audioDragDis / this.audioTrackHeight > 0 &&
              dragDisX >= 0 &&
              trackIndex < this.audioData.length
            ) {
              this.audioData[trackIndex].push(item);
              newPieceAdded = true;
            }
            this.dragAudioStyle = {};
          } else if (type == "i") {
            item = {
              s_ruler: dragDisX / this.unit,
              e_ruler: img_time + dragDisX / this.unit,
              url: this.domain + url,
              vdrWidth: 10,
              frameImageHeight: frameImageHeight,
              frameImageWidth: frameImageWidth,
              backgroundImage: [],
              backgroundPosition: [],
              is_audio: 0,
              selected: true,
              type: type,
            };
            trackIndex = Math.ceil(dragDisY / this.videoTrackHeight) - 1; //轨道下标
            if (
              dragDisY / this.videoTrackHeight > 0 &&
              dragDisX >= 0 &&
              trackIndex < this.videoData.length
            ) {
              this.videoData[trackIndex].push(item);
              newPieceAdded = true;
            }
            this.$refs.drag_v.style.cssText = "";
          }

          //记录操作
          if (newPieceAdded) {
            this.pieceOverlap(item, trackIndex);
            this.record();
          }

          this.dragLeft = null;
          this.dragTop = null;
          window.onmousemove = null;
        };
      };
    },
    //切割
    scissor() {
      let time = (this.left + Math.abs(pointerInitLeft)) / this.unit;
      let scItemBefore = {};
      let scItemAfter = {};
      this.isSelected = false;
      //判断是否piece
      this.videoData.forEach((track) => {
        track.forEach((item) => {
          if (item.selected) {
            this.isSelected = true;
          }
        });
      });
      this.audioData.forEach((track) => {
        track.forEach((item) => {
          if (item.selected) {
            this.isSelected = true;
          }
        });
      });
      //video
      this.videoData.forEach((track) => {
        track.forEach((item, index, arr) => {
          if (time > item.s_ruler && time < item.e_ruler) {
            if (item.type === "v") {
              scItemBefore = {
                type: item.type,
                frameImageWidth: item.frameImageWidth,
                frameImageHeight: item.frameImageHeight,
                thumbnail: item.thumbnail,
                imagesNum: item.imagesNum,
                time: item.time,
                s_time: item.s_time,
                e_time: item.e_time - (item.e_ruler - time),
                s_ruler: item.s_ruler,
                e_ruler: time,
                url: item.url,
                vcodec: item.vcodec,
                acodec: item.acodec,
                is_audio: item.is_audio,
                backgroundImage: [],
                backgroundPosition: [],
                vdrWidth: 10,
                selected: false,
              };
              scItemAfter = {
                type: item.type,
                frameImageWidth: item.frameImageWidth,
                frameImageHeight: item.frameImageHeight,
                thumbnail: item.thumbnail,
                imagesNum: item.imagesNum,
                time: item.time,
                s_time: item.s_time + time - item.s_ruler,
                e_time: item.e_time,
                s_ruler: time,
                e_ruler: item.e_ruler,
                url: item.url,
                vcodec: item.vcodec,
                acodec: item.acodec,
                is_audio: item.is_audio,
                backgroundImage: [],
                backgroundPosition: [],
                vdrWidth: 10,
                selected: false,
              };
            } else if (item.type === "a") {
              scItemBefore = {
                type: item.type,
                s_ruler: item.s_ruler,
                e_ruler: time,
                url: item.url,
                vdrWidth: 10,
                frameImageHeight: item.frameImageHeight,
                frameImageWidth: item.frameImageWidth,
                backgroundImage: [],
                backgroundPosition: [],
                selected: false,
              };
              scItemAfter = {
                type: item.type,
                s_ruler: time,
                e_ruler: item.e_ruler,
                url: item.url,
                vdrWidth: 10,
                frameImageHeight: item.frameImageHeight,
                frameImageWidth: item.frameImageWidth,
                backgroundImage: [],
                backgroundPosition: [],
                selected: false,
              };
            }
            if (item.selected || !this.isSelected) {
              arr.splice(index, 1, scItemBefore, scItemAfter);
              this.record();
            }
          }
        });
      });
      //audio
      this.audioData.forEach((track) => {
        track.forEach((item, index, arr) => {
          if (time > item.s_ruler && time < item.e_ruler) {
            scItemBefore = {
              url: item.url,
              time: item.time,
              s_time: item.s_time,
              e_time: item.e_time - (item.e_ruler - time),
              s_ruler: item.s_ruler,
              e_ruler: time,
              vdrWidth: 10,
              left: item.left,
              selected: false,
            };
            scItemAfter = {
              url: item.url,
              time: item.time,
              s_time: item.s_time + time - item.s_ruler,
              e_time: item.e_time,
              s_ruler: time,
              e_ruler: item.e_ruler,
              vdrWidth: 10,
              selected: false,
            };
            if (item.selected || !this.isSelected) {
              arr.splice(index, 1, scItemBefore, scItemAfter);
              this.record();
            }
          }
        });
      });
      //是否可切割
      if (!scItemBefore.e_time) {
        this.$message({ message: "无法切割", type: "warning" });
      }
    },
    //轨道下标
    getTrackIndex(index) {
      window.onmousemove = null;
      this.trackIndex = index;
    },
    //子组件传来的piece信息
    piece(obj) {
      this.pieceObj = obj;
    },
    //删除对应截取视频
    pieceDel(piece) {
      this.videoData.forEach((videoPieces) => {
        videoPieces.forEach((item, index, arr) => {
          if (item == piece) {
            arr.splice(index, 1);
          }
        });
      });
      this.audioData.forEach((audioPieces) => {
        audioPieces.forEach((item, index, arr) => {
          if (item == piece) {
            arr.splice(index, 1);
          }
        });
      });
      this.textData.forEach((textPieces) => {
        textPieces.forEach((item, index, arr) => {
          if (item == piece) {
            arr.splice(index, 1);
          }
        });
      });
      this.piecesMax();
    },
    //点击按钮||右键 - 删除
    clickDel() {
      if (this.zero) return;
      this.videoData.forEach((videoPieces, index, arr) => {
        let newArr = [];
        videoPieces.forEach((item) => {
          if (!item.selected) {
            newArr.push(item);
          }
        });
        arr.splice(index, 1, newArr);
      });
      this.audioData.forEach((audioPieces, index, arr) => {
        let newArr = [];
        audioPieces.forEach((item) => {
          if (!item.selected) {
            newArr.push(item);
          }
        });
        arr.splice(index, 1, newArr);
      });
      this.textData.forEach((textPieces, index, arr) => {
        let newArr = [];
        textPieces.forEach((item) => {
          if (!item.selected) {
            newArr.push(item);
          }
        });
        arr.splice(index, 1, newArr);
      });
      this.record();
      this.piecesMax();
      this.rightMenuVisible = false;
    },
    //视频预览截取
    videoPlay(index) {
      const videoId = "video" + index; //对应的videoId
      let screenX, left;
      this.preIndex = "vp" + index;
      //播放触发
      this.$nextTick(() => {
        let times = document.getElementById("time" + index);
        let modalBox = document.getElementsByClassName("modalBox")[0];
        let videoBox = document.getElementById("vb" + index);
        this.video = Video(videoId, { controls: false }); // 初始化videoJS组件
        this.videoTime = this.material[index].time; //视频总时长
        this.speed = videoMoveWidth / this.videoTime; //每s移动的距离
        times.innerHTML = vueCommon.time(this.videoTime, 6); //刻度填充时间

        //video加载完成触发
        this.video.on("loadedmetadata", function () {});
        this.video.on("timeupdate", () => {
          this.currentTime = this.video.currentTime(); //当前播放时间
          if (this.currentTime <= this.videoTime) {
            left = this.speed * this.currentTime;
            vueCommon.move(this.$refs.pointer[index], left);
          } else {
            return;
          }
        });
        //拖拽
        this.$refs.pointer[index].onmousedown = (e) => {
          screenX = e.offsetX;
          window.onmousemove = (e) => {
            left =
              e.clientX - screenX - videoBox.offsetLeft - modalBox.offsetLeft;
            left = left > pointerInitLeft ? left : pointerInitLeft;
            left =
              left > videoBox.clientWidth + pointerInitLeft
                ? videoBox.clientWidth + pointerInitLeft
                : left;
            this.video.currentTime(left / this.speed);
            vueCommon.move(this.$refs.pointer[index], left);
          };
        };
        window.onmouseup = function () {
          window.onmousemove = null;
        };
      });
    },
    //音频预览
    audioPlay(index) {
      this.preIndex = "ap" + index;
    },
    //图片预览
    imgPlay(index) {
      this.preIndex = "ip" + index;
    },
    //字幕编辑
    textPlay(index) {
      this.word = true;
      this.fontSizeIndex = index;
      if (index == 0) {
        this.$refs.subtitles.style.fontSize = "24px";
        this.$refs.subtitles.style.backgroundColor = "";
      } else if (index == 1) {
        this.$refs.subtitles.style.fontSize = "16px";
        this.$refs.subtitles.style.backgroundColor = "";
      } else if (index == 2) {
        this.$refs.subtitles.style.fontSize = "32px";
        this.$refs.subtitles.style.backgroundColor = "";
      } else if (index == 3) {
        this.$refs.subtitles.style.fontSize = "24px";
        this.$refs.subtitles.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      }
      if (this.textData[0].length >= 1) return;
      let textObj = {
        s_time: 0,
        e_time: text_time,
        vdrWidth: 10,
        s_ruler: 0,
        e_ruler: text_time,
        subtitles: "",
        selected: true,
      };
      this.textData[0].push(textObj);
      this.record();
    },
    aligin(index) {
      //对齐方式
      this.aliginIndex = index;
      let aliginItem = document.getElementsByClassName("aligin-item");
      for (let i = 0; i < aliginItem.length; i++) {
        aliginItem[i].classList.remove("isActive");
        aliginItem[index].classList.add("isActive");
      }
      if (index == 0) {
        this.$refs.subtitles.style.justifyContent = "flex-start";
      } else if (index == 1) {
        this.$refs.subtitles.style.justifyContent = "center";
      } else if (index == 2) {
        this.$refs.subtitles.style.justifyContent = "flex-end";
      }
    },
    paddingZoom(value) {
      //间距
      this.paddingBottom = value * 10 + "px";
      this.margin_bottom = value * 10;
      this.$refs.subtitles.style.paddingBottom = this.paddingBottom;
    },
    addText() {
      //加一行
      let time = this.textData[0][this.textData[0].length - 1].e_ruler;
      let obj = {
        s_time: 0,
        e_time: text_time,
        vdrWidth: 10,
        s_ruler: time,
        e_ruler: time + text_time,
        subtitles: "",
        selected: true,
      };
      this.textData[0].push(obj);
      this.record();
    },
    //播放
    play() {
      if (this.video) this.video.play();
      this.playShow = false;
    },
    //暂停
    pause() {
      this.playShow = true;
      if (this.video) this.video.pause();
      if (this.currentVideo) this.currentVideo.pause();
      if (this.currentAudio) this.currentAudio.pause();
      if (this.timer) clearInterval(this.timer); //canvas
      if (this.pointerTimer) clearInterval(this.pointerTimer); //pointer
    },
    //获取截取时间
    starTime(index) {
      this.s_time = this.video.currentTime();
      window.console.log("截取开始时间", this.s_time);
      //截取段样式
      this.$refs.segment[index].style.cssText =
        "left:" + this.s_time * this.speed + "px;border-left:1px solid #000";
    },
    endTime(index) {
      this.e_time = this.video.currentTime();
      window.console.log("截取结束时间", this.e_time);
      //预览截取区域样式
      this.$refs.segment[index].style.cssText =
        "width:" +
        (this.e_time - this.s_time) * this.speed +
        "px;border-right:1px solid #000;left:" +
        this.s_time * this.speed +
        "px;";
    },
    //轨道添加 删除
    sboxShow(index, logo) {
      if (logo == "v") {
        this.$refs.video[index].style.display == "block"
          ? (this.$refs.video[index].style.display = "none")
          : (this.$refs.video[index].style.display = "block");
      } else if (logo == "a") {
        this.$refs.audio[index].style.display == "block"
          ? (this.$refs.audio[index].style.display = "none")
          : (this.$refs.audio[index].style.display = "block");
      }
    },
    addTrack(index, logo) {
      if (logo == "v") {
        this.videoData.unshift([]);
        this.$refs.video[index].style.display = "none";
      } else if (logo == "a") {
        this.audioData.unshift([]);
        this.$refs.audio[index].style.display = "none";
      }
      this.record();
    },
    delTrack(index, logo) {
      if (logo == "v") {
        this.$refs.video[index].style.display = "none";
        if (this.videoData.length <= 1) return;
        this.videoData.splice(index, 1);
      } else if (logo == "a") {
        this.$refs.audio[index].style.display = "none";
        if (this.audioData.length <= 1) return;
        this.audioData.splice(index, 1);
      }
      this.record();
    },
    // video弹框确认
    confirm(index) {
      if (this.$refs.segment[index].style.width == 0) {
        this.$message({
          message: "请选择截取时间",
          type: "warning",
        });
        return;
      }
      this.preIndex = -1;
      //获取对应的帧图片，张数，video地址
      const {
        url,
        thumbnail,
        imagesNum,
        is_audio,
        time,
        vcodec,
        acodec,
        type,
      } = this.material[index];
      let videoObj = {
        type: type,
        frameImageWidth: this.frameImageWidth,
        frameImageHeight: this.frameImageHeight,
        thumbnail: this.domain + thumbnail,
        imagesNum: imagesNum,
        time: time,
        s_time: this.s_time,
        e_time: this.e_time,
        s_ruler: 0,
        e_ruler: this.e_time - this.s_time,
        url: this.domain + url,
        vcodec: this.domain + vcodec,
        acodec: this.domain + acodec,
        is_audio: is_audio,
        //保存帧图片信息,截取宽度,位移
        backgroundImage: [],
        backgroundPosition: [],
        vdrWidth: 10,
        selected: true,
      };

      // 添加piece
      this.videoData = addPiece(this.videoData, videoObj);
      this.record();
      if (this.video) this.video.pause();
    },
    // video弹框取消
    cancel(index) {
      this.preIndex = -1;
      this.$refs.segment[index].removeAttribute("style"); //清空segment
    },
    //pointer-video
    pointerVideo(time) {
      this.pause();
      const canvasW = this.$refs.canvas.width;
      const canvasH = this.$refs.canvas.height;
      //视频段
      let videoArr = [];
      for (let item of this.videoPlayList) {
        if (!item.black) {
          videoArr.push(item);
        }
      }

      let drawBlack = true; // draw 黑图
      for (let video of videoArr) {
        if (time > video.s_ruler && time < video.e_ruler) {
          drawBlack = false;
          if (video.type === "v") {
            this.currentVideo = video.video;
            let videoCurrent = time - video.s_ruler + video.s_time;
            if (video.url != this.currentVideo.src) {
              this.currentVideo.src = video.url; //src
            }
            this.currentVideo.currentTime = videoCurrent; //时间
            //判断当前网络状态，1为正常
            if (this.currentVideo.networkState != 1) {
              const loading = this.$loading({
                lock: true,
                text: "正在加载中...",
                background: "rgba(0, 0, 0, 0)",
                target: ".canvas",
                body: true,
              });
              setTimeout(() => {
                this.canvas(canvasW, canvasH, this.currentVideo);
                loading.close();
              }, 700);
            } else {
              this.canvas(canvasW, canvasH, this.currentVideo);
            }
          } else if (video.type === "i") {
            this.currentImg = video.img;
            if (video.url != this.currentImg.src) {
              this.currentImg.src = video.url; //src
            }
            this.canvas(canvasW, canvasH, this.currentImg);
          }
          break;
        }
      }
      if (drawBlack) {
        const black_img = document.getElementById("black_img");
        this.canvas(canvasW, canvasH, black_img);
      }
    },
    //pointer-音频播放
    pointerAudio(time) {
      this.pause();
      for (let audio of this.audioPlayList) {
        this.currentAudio = audio.audio;
        if (time >= audio.s_ruler && time < audio.e_ruler) {
          let audioCurrent = time - audio.s_ruler + audio.s_time;
          if (audio.url != this.currentAudio.src) {
            this.currentAudio.src = audio.url; //src
          }
          this.currentAudio.currentTime = audioCurrent; //时间
          break;
        }
      }
    },
    //pointer-字幕
    pointerText(time) {
      this.subtitles = "";
      for (let textArr of this.textData) {
        for (let text of textArr) {
          if (time >= text.s_ruler && time < text.e_ruler) {
            this.subtitles = text.subtitles;
            break;
          }
        }
      }
    },
    //text-pointer
    textTo(item, index) {
      vueCommon.move(this.$refs.pointB, item.widthSum + pointerInitLeft);
      this.canvasTime = item.e_ruler;
      let textRow = document.getElementsByClassName("text-row");
      for (let i = 0; i < textRow.length; i++) {
        textRow[i].style.backgroundColor = "";
        textRow[index].style.backgroundColor = "#ebebeb";
      }
    },
    //移动pointerB
    movePointerB(e) {
      if (this.vdrWidth == undefined) return;
      let right = this.$refs.right;
      let screenX = e.offsetX;
      this.playOrder();
      window.onmousemove = (e) => {
        this.left = e.clientX - screenX - right.offsetLeft + this.rightDis;
        this.left = this.left > pointerInitLeft ? this.left : pointerInitLeft;
        this.left =
          this.left > this.$refs.rightBox.clientWidth + pointerInitLeft
            ? this.$refs.rightBox.clientWidth + pointerInitLeft
            : this.left;
        vueCommon.move(this.$refs.pointB, this.left);
        this.canvasTime =
          ((this.left - pointerInitLeft) / this.vdrWidth) * this.etime; //canvas当前播放时间
      };
      window.onmouseup = () => {
        this.pointerVideo(this.canvasTime);
        this.pointerAudio(this.canvasTime);
        this.pointerText(this.canvasTime);
        window.onmousemove = null;
      };
    },
    //移动scroll-thumb
    moveScroll(e) {
      let right = this.$refs.right;
      let scrollDis =
        this.$refs.scroll.clientWidth - this.$refs.scrollThumb.clientWidth;
      let screenX = e.offsetX;
      window.onmousemove = (e) => {
        let left;
        left = e.clientX - screenX - right.offsetLeft;
        left = left > 0 ? left : 0;
        left = left > scrollDis ? scrollDis : left;
        vueCommon.move(this.$refs.scrollThumb, left);
        this.rightDis =
          (left / scrollDis) *
          (this.$refs.rightBox.clientWidth - right.clientWidth);
        this.$refs.rightBox.style.transform =
          "translateX(" + -this.rightDis + "px)";
      };
      window.onmouseup = () => {
        window.onmousemove = null;
      };
    },
    //点击标尺移动pointerB
    clickPointer(e) {
      if (this.vdrWidth == undefined) return;
      this.playOrder();
      let right = this.$refs.right;
      this.left = e.clientX - right.offsetLeft + this.rightDis;
      vueCommon.move(this.$refs.pointB, this.left);
      this.canvasTime =
        ((this.left - pointerInitLeft) / this.vdrWidth) * this.etime; //canvas当前播放时间
      this.pointerVideo(this.canvasTime);
      this.pointerAudio(this.canvasTime);
      this.pointerText(this.canvasTime);
    },
    //筛选最大的素材块
    piecesMax() {
      this.zero = true; //轨道是否为null,true - null
      this.videoWidth = 0;
      this.audioWidth = 0;
      this.textWidth = 0;
      //video最大width
      this.videoData.forEach((videoPieces) => {
        if (videoPieces.length != 0) {
          this.zero = false;
        }
        videoPieces.forEach((item) => {
          if (item.widthSum > this.videoWidth) {
            this.videoWidth = item.widthSum;
            this.videoEtime = item.eTime;
          }
        });
      });
      //audio最大width
      this.audioData.forEach((audioPieces) => {
        if (audioPieces.length != 0) {
          this.zero = false;
        }
        audioPieces.forEach((item) => {
          if (item.widthSum > this.audioWidth) {
            this.audioWidth = item.widthSum;
            this.audioEtime = item.eTime;
          }
        });
      });
      //text最大width
      this.textData.forEach((textPieces) => {
        if (textPieces.length != 0) {
          this.zero = false;
          this.subtitles = textPieces[0].subtitles; //更新字幕
        }
        textPieces.forEach((item) => {
          //字幕时间
          item.sTimeFor = vueCommon.Seconds(item.s_ruler);
          item.eTimeFor = vueCommon.Seconds(item.e_ruler);
          this.$set(item); //触发视图层更新
          if (item.widthSum > this.textWidth) {
            this.textWidth = item.widthSum;
            this.textEtime = item.eTime;
          }
        });
      });
      //取最大width
      this.vdrWidth = [this.videoWidth, this.audioWidth, this.textWidth].sort(
        function (a, b) {
          return b - a;
        }
      )[0];
      if (this.vdrWidth == this.audioWidth) {
        this.etime = this.audioEtime;
      } else if (this.vdrWidth == this.videoWidth) {
        this.etime = this.videoEtime;
      } else if (this.vdrWidth == this.textWidth) {
        this.etime = this.textEtime;
      }
      this.pause(); //暂停播放
    },
    //播放计划
    playOrder() {
      let videoBlack = []; //video可用时间数组
      this.videoPlayList = []; //video播放时间数组
      this.audioPlayList = []; //audio播放时间数组
      let videoTemp = []; //video中间容器
      let audioTemp = []; //audio中间容器
      let audioAllTime = []; //audio可用时间数组
      videoBlack[0] = { s_ruler: 0, e_ruler: this.etime };
      audioAllTime[0] = { s_ruler: 0, e_ruler: this.etime };
      for (let videoArr of this.videoData) {
        for (let videoPiece of videoArr) {
          for (let videoItem of videoBlack) {
            if (videoPiece.s_ruler >= videoItem.e_ruler) {
              videoTemp.push(videoItem);
              continue;
            } else if (videoPiece.e_ruler <= videoItem.s_ruler) {
              videoTemp.push(videoItem);
              continue;
            } else {
              let play_item = {};
              let temp = {};

              play_item.type = "video";
              temp.type = "video";
              //time处理
              if (videoPiece.s_ruler >= videoItem.s_ruler) {
                play_item.s_ruler = videoPiece.s_ruler;
                play_item.s_time = videoPiece.s_time;
              } else {
                play_item.s_ruler = videoItem.s_ruler;
                play_item.s_time =
                  videoPiece.s_time + (videoItem.s_ruler - videoPiece.s_ruler);
              }

              if (videoPiece.e_ruler >= videoItem.e_ruler) {
                play_item.e_ruler = videoItem.e_ruler;
                play_item.e_time =
                  videoPiece.e_time - (videoPiece.e_ruler - videoItem.e_ruler);
              } else {
                play_item.e_ruler = videoPiece.e_ruler;
                play_item.e_time = videoPiece.e_time;
              }
              //video
              if (videoPiece.type === "v") {
                play_item.video = document.getElementById("video"); //视频源组件
                play_item.url = videoPiece.url; //视频源url
                play_item.is_audio = videoPiece.is_audio; //是否有声音
              }
              //img
              if (videoPiece.type === "i") {
                play_item.img = document.getElementById("img");
                play_item.url = videoPiece.url;
                play_item.s_time = play_item.s_ruler;
                play_item.e_time = play_item.e_ruler;
              }
              this.videoPlayList.push(play_item);

              //videoTemp
              if (videoPiece.s_ruler > videoItem.s_ruler) {
                temp = {
                  s_ruler: videoItem.s_ruler,
                  e_ruler: videoPiece.s_ruler,
                };
                videoTemp.push(temp);
              }
              if (videoPiece.e_ruler < videoItem.e_ruler) {
                temp = {
                  s_ruler: videoPiece.e_ruler,
                  e_ruler: videoItem.e_ruler,
                };
                videoTemp.push(temp);
              }
            }
          }
          //去除有声音的视频段
          if (videoPiece.is_audio == 1) {
            for (let audio of audioAllTime) {
              if (videoPiece.s_ruler >= audio.e_ruler) {
                audioTemp.push(audio);
                continue;
              } else if (videoPiece.e_ruler <= audio.s_ruler) {
                audioTemp.push(audio);
                break;
              } else {
                let _temp = {};
                //videoTemp
                if (videoPiece.s_ruler > audio.s_ruler) {
                  _temp = {
                    s_ruler: audio.s_ruler,
                    e_ruler: videoPiece.s_ruler,
                  };
                  audioTemp.push(_temp);
                }
                if (videoPiece.e_ruler < audio.e_ruler) {
                  _temp = {
                    s_ruler: videoPiece.e_ruler,
                    e_ruler: audio.e_ruler,
                  };
                  audioTemp.push(_temp);
                }
              }
            }
            audioAllTime = audioTemp;
            audioTemp = [];
          }

          videoBlack = videoTemp;
          videoTemp = [];
        }
      }
      for (let temp of videoBlack) {
        temp.black = "black";
      }
      this.videoPlayList.push(...videoBlack); //合并正常视频和black段
      this.videoPlayList = this.videoPlayList.sort(function (a, b) {
        return a.s_ruler - b.s_ruler;
      });
      window.console.log("video播放计划列表", this.videoPlayList);
      // audio播放计划
      for (let audioArr of this.audioData) {
        for (let audioPiece of audioArr) {
          for (let audioItem of audioAllTime) {
            if (audioPiece.s_ruler >= audioItem.e_ruler) {
              audioTemp.push(audioItem);
              continue;
            } else if (audioPiece.e_ruler <= audioItem.s_ruler) {
              audioTemp.push(audioItem);
              continue;
            } else {
              let a_play_item = {};
              let a_temp = {};

              a_play_item.type = "audio";
              a_temp.type = "audio";
              //audio处理
              if (audioPiece.s_ruler >= audioItem.s_ruler) {
                a_play_item.s_ruler = audioPiece.s_ruler;
                a_play_item.s_time = audioPiece.s_time;
              } else {
                a_play_item.s_ruler = audioItem.s_ruler;
                a_play_item.s_time =
                  audioPiece.s_time + (audioItem.s_ruler - audioPiece.s_ruler);
              }

              if (audioPiece.e_ruler >= audioItem.e_ruler) {
                a_play_item.e_ruler = audioItem.e_ruler;
                a_play_item.e_time =
                  audioPiece.e_time - (audioPiece.e_ruler - audioItem.e_ruler);
              } else {
                a_play_item.e_ruler = audioPiece.e_ruler;
                a_play_item.e_time = audioPiece.e_time;
              }

              a_play_item.url = audioPiece.url; //url
              a_play_item.audio = document.getElementById("audio"); //音频源
              this.audioPlayList.push(a_play_item);

              //audioTemp
              if (audioPiece.s_ruler > audioItem.s_ruler) {
                a_temp = {
                  s_ruler: audioItem.s_ruler,
                  e_ruler: audioPiece.s_ruler,
                };
                audioTemp.push(a_temp);
              }
              if (audioPiece.e_ruler < audioItem.e_ruler) {
                a_temp = {
                  s_ruler: audioPiece.e_ruler,
                  e_ruler: audioItem.e_ruler,
                };
                audioTemp.push(a_temp);
              }
            }
          }
          audioAllTime = audioTemp;
          audioTemp = [];
        }
      }
      this.audioPlayList = this.audioPlayList.sort(function (a, b) {
        return a.s_ruler - b.s_ruler;
      });
      window.console.log("audio播放计划列表", this.audioPlayList);
    },
    //字幕组装信息
    textPost() {
      this.textItem = {};
      let textObj = {};
      textObj.type = "subtitles";
      textObj.alignment = 1;
      //字体大小
      if (this.fontSizeIndex == 0) {
        textObj.font_size = 24;
        textObj.background = 0;
      } else if (this.fontSizeIndex == 1) {
        textObj.font_size = 16;
      } else if (this.fontSizeIndex == 2) {
        textObj.font_size = 32;
      } else if (this.fontSizeIndex == 3) {
        textObj.font_size = 24;
        textObj.background = 1;
      }
      //居中方式
      if (this.aliginIndex == 0) {
        textObj.alignment = 1;
      } else if (this.aliginIndex == 1) {
        textObj.alignment = 2;
      } else if (this.aliginIndex == 2) {
        textObj.alignment = 3;
      }
      //margin_bottom
      textObj.margin_bottom = this.margin_bottom;
      textObj.margin_top = 0;
      textObj.margin_left = 0;
      textObj.margin_right = 0;
      textObj.text = [];
      for (let t of this.textData[0]) {
        let subtitleObj = {};
        //00:00:00:00 ==> 00:00:00,00
        t.sTimeFor = t.sTimeFor.replace(/(.*):/, "$1,");
        t.eTimeFor = t.eTimeFor.replace(/(.*):/, "$1,");
        subtitleObj["" + t.sTimeFor + " --> " + t.eTimeFor] = t.subtitles;
        textObj.text.push(subtitleObj);
      }
      this.textItem.video = textObj;
    },
    //视频音频组装信息
    assets() {
      this.playOrder();
      this.assembly = [];
      let videoPlayList = [...this.videoPlayList];
      let audioPlayList = [...this.audioPlayList];
      for (let videoPlay of videoPlayList) {
        let ass_obj = {};
        ass_obj.video = {};
        if (videoPlay.black) {
          ass_obj.video.time = parseInt(videoPlay.e_ruler - videoPlay.s_ruler);
          ass_obj.video.start_time = parseInt(videoPlay.s_ruler);
          ass_obj.video.type = videoPlay.black;
          ass_obj.video.url = "";
        } else {
          if (videoPlay.type === "v") {
            ass_obj.video.time = parseInt(videoPlay.e_time - videoPlay.s_time);
            ass_obj.video.start_time = parseInt(videoPlay.s_time);
            ass_obj.video.url = "static" + videoPlay.url.split("static")[1];
            ass_obj.video.type = "video";
          } else if (videoPlay.type === "i") {
            ass_obj.video.time = parseInt(
              videoPlay.e_ruler - videoPlay.s_ruler
            );
            ass_obj.video.start_time = parseInt(videoPlay.s_ruler);
            ass_obj.video.url = "static" + videoPlay.url.split("static")[1];
            ass_obj.video.type = "img";
          }
        }
        ass_obj.audio = [];
        for (let audioPlay of audioPlayList) {
          if (audioPlay.s_ruler >= videoPlay.e_ruler) {
            continue;
          } else if (audioPlay.e_ruler <= videoPlay.s_ruler) {
            continue;
          } else {
            let ass_item = {};
            if (audioPlay.s_ruler >= videoPlay.s_ruler) {
              ass_item.position = parseInt(
                audioPlay.s_ruler - videoPlay.s_ruler
              );
              ass_item.start_time = parseInt(audioPlay.s_time);
            } else {
              ass_item.position = 0;
              ass_item.start_time = parseInt(
                audioPlay.s_time + (videoPlay.s_ruler - audioPlay.s_ruler)
              );
            }

            if (audioPlay.e_ruler >= videoPlay.e_ruler) {
              ass_item.e_time = parseInt(
                audioPlay.e_time - (audioPlay.e_ruler - videoPlay.e_ruler)
              );
            } else {
              ass_item.e_time = parseInt(audioPlay.e_time);
            }
            ass_item.time = parseInt(ass_item.e_time - ass_item.start_time);
            ass_item.url = "static" + audioPlay.url.split("static")[1];
            ass_obj.audio.push(ass_item);
          }
        }
        this.assembly.push(ass_obj);
      }
      this.textPost();
      this.assembly.push(this.textItem);
      window.console.log("组装播放", this.assembly);
    },
    //截取video,audio播放及字幕播放
    canvasPlay() {
      if (this.zero) return; //轨道为null时，禁止播放
      //获取 playList
      this.playOrder();
      this.playShow = false; //播放按钮切换
      const canvasW = this.$refs.canvas.width;
      const canvasH = this.$refs.canvas.height;
      const black_img = document.getElementById("black_img"); //黑图片
      let isPlay = "stop";
      let isPlay_a = "stop";
      let isPlay_t = "stop";
      let setInterTime = 40;
      let moveOffset = this.unit / (1000 / setInterTime);
      //video记录值
      let oldVideoIndex;
      //audio记录值
      let oldAudioIndex;
      //字幕记录值
      let textPlayList = this.textData[0];
      let oldTextIndex;
      this.pointerTimer = setInterval(() => {
        if (
          this.vdrWidth + pointerInitLeft - this.$refs.pointB.offsetLeft <=
          moveOffset
        ) {
          this.playShow = true;
          //处理位移边界问题
          this.$refs.pointB.style.left = pointerInitLeft + "px"; //point位移归0
          //处理时间边界问题
          this.canvasTime = 0; //canvas当前播放时间归0
          //清空canvas
          this.$refs.canvas
            .getContext("2d")
            .clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
          //重置字幕
          if (this.textData[0].length > 0) {
            this.subtitles = this.textData[0][0].subtitles;
          }
          clearInterval(this.pointerTimer);
          clearInterval(this.timer);
          if (this.currentVideo) this.currentVideo.pause();
          if (this.currentAudio) this.currentAudio.pause();
          return;
        }
        let orignOffset = Number(
          this.$refs.pointB.style.left.replace("px", "")
        );
        if (orignOffset < 0) orignOffset = 0;
        this.$refs.pointB.style.left = orignOffset + moveOffset + "px";
        this.canvasTime =
          this.$refs.pointB.offsetLeft / (moveOffset * (1000 / setInterTime)); //canvas当前播放时间
        let playVideoItem; //视频段
        let playVideoItemIndex; //视频段下标
        for (let i = 0; i < this.videoPlayList.length; i++) {
          let s_ruler = this.videoPlayList[i].s_ruler; //标尺开始时间
          let e_ruler = this.videoPlayList[i].e_ruler; //标尺结束时间
          if (this.canvasTime >= s_ruler && this.canvasTime < e_ruler) {
            playVideoItem = this.videoPlayList[i];
            playVideoItemIndex = i;
            break;
          }
        }
        //若播放的为视频段
        if (playVideoItem.s_time != undefined) {
          if (playVideoItem.type === "v") {
            this.currentVideo = playVideoItem.video;
          } else if (playVideoItem.type === "i") {
            this.currentImg = playVideoItem.img;
          } //video or img
          if (isPlay == "stop") {
            isPlay = "playing";
            oldVideoIndex = playVideoItemIndex;
            if (playVideoItem.type === "v") {
              let videoCurrent =
                this.canvasTime - playVideoItem.s_ruler + playVideoItem.s_time;
              if (playVideoItem.url != this.currentVideo.src) {
                this.currentVideo.src = playVideoItem.url; //src
              }
              this.currentVideo.currentTime = videoCurrent; //时间
              this.currentVideo.play();
              this.timer = setInterval(() => {
                this.canvas(canvasW, canvasH, this.currentVideo);
              }, 40);
            } else if (playVideoItem.type == "i") {
              if (playVideoItem.url != this.currentImg.src) {
                this.currentImg.src = playVideoItem.url; //src
              }
              this.canvas(canvasW, canvasH, this.currentImg);
            }
          } else if (
            isPlay == "playing" &&
            oldVideoIndex != playVideoItemIndex
          ) {
            //如果当前播放的视频不是需要播放的视频片段
            oldVideoIndex = playVideoItemIndex;
            if (playVideoItem.type === "v") {
              let videoCurrent =
                this.canvasTime - playVideoItem.s_ruler + playVideoItem.s_time;
              this.currentVideo.src = playVideoItem.url; //src
              this.currentVideo.currentTime = videoCurrent; //时间
              this.currentVideo.play();
              this.timer = setInterval(() => {
                this.canvas(canvasW, canvasH, this.currentVideo);
              }, 40);
            } else if (playVideoItem.type === "i") {
              if (this.timer) clearInterval(this.timer);
              if (this.currentVideo) this.currentVideo.pause();
              this.currentImg.src = playVideoItem.url; //src
              this.canvas(canvasW, canvasH, this.currentImg);
            }
          }
        } else {
          //若播放的是非video或非img段 暂停并清空timer
          if (this.timer) clearInterval(this.timer);
          if (this.currentVideo) this.currentVideo.pause();
          isPlay = "stop";
          this.canvas(canvasW, canvasH, black_img);
        }
        //audio播放
        if (this.audioPlayList.length > 0) {
          let playAudioItem;
          let playAudioItemIndex;
          for (let j = 0; j < this.audioPlayList.length; j++) {
            let a_start = this.audioPlayList[j].s_ruler;
            let a_end = this.audioPlayList[j].e_ruler;
            if (this.canvasTime >= a_start && this.canvasTime < a_end) {
              playAudioItem = this.audioPlayList[j];
              playAudioItemIndex = j;
              break;
            }
          }
          if (playAudioItem != undefined) {
            this.currentAudio = playAudioItem.audio;
            if (isPlay_a == "stop") {
              isPlay_a = "playing";
              oldAudioIndex = playAudioItemIndex;
              let audioCurrent =
                this.canvasTime - playAudioItem.s_ruler + playAudioItem.s_time;
              if (playAudioItem.url != this.currentAudio.src) {
                this.currentAudio.src = playAudioItem.url; //src
              }
              this.currentAudio.currentTime = audioCurrent; //时间
              this.currentAudio.play();
            } else if (
              isPlay_a == "playing" &&
              oldAudioIndex != playAudioItemIndex
            ) {
              //如果当前播放的音频不是需要播放的音频片段
              let audioCurrent =
                this.canvasTime - playAudioItem.s_ruler + playAudioItem.s_time;
              oldAudioIndex = playAudioItemIndex;
              this.currentAudio.src = playAudioItem.url; //src
              this.currentAudio.currentTime = audioCurrent; //时间
              this.currentAudio.play();
            }
          } else {
            //不是音频段，暂停
            isPlay_a = "stop";
            if (this.currentAudio) this.currentAudio.pause();
          }
        }
        //字幕播放
        let playTextItem;
        let playTextItemIndex;
        for (let k = 0; k < textPlayList.length; k++) {
          let t_start = textPlayList[k].s_ruler;
          let t_end = textPlayList[k].e_ruler;
          if (this.canvasTime >= t_start && this.canvasTime < t_end) {
            playTextItem = textPlayList[k];
            playTextItemIndex = k;
            break;
          }
        }
        if (playTextItem != undefined) {
          if (isPlay_t == "stop") {
            isPlay_t = "playing";
            oldTextIndex = playTextItem;
            this.subtitles = playTextItem.subtitles;
          } else if (
            isPlay_t == "playing" &&
            oldTextIndex != playTextItemIndex
          ) {
            oldTextIndex = playTextItemIndex;
            this.subtitles = playTextItem.subtitles;
          }
        } else {
          //字幕置空
          isPlay_t = "stop";
          this.subtitles = "";
        }
      }, 40);
    },
    //标尺缩放
    zoomCommon() {
      this.$refs.rightBox.style.width = this.rulerWidth + "%"; //标尺的总宽度
      this.rightBoxWidth = this.$refs.rightBox.clientWidth;
      this.unit = this.rightBoxWidth / totalPointerTime; //标尺每s的px
      //底部滚动条
      let scrollUnit = (this.unit / this.rightBoxWidth) * this.scrollWidth;
      this.$refs.scrollThumb.style.width =
        scrollUnit * totalPointerTime * (100 - this.value + 1) * 0.01 + "px";
    },
    minus() {
      if (this.value <= 0) return;
      this.value -= 1;
      this.rulerWidth -= 10;
      this.zoomCommon();
    },
    add() {
      if (this.value >= 100) return;
      this.value += 1;
      this.rulerWidth += 10;
      this.zoomCommon();
    },
    zoom(value) {
      this.rulerWidth = 100 + value * 10;
      this.zoomCommon();
    },
    //上传前
    beforeUpload() {
      this.isUpload = true;
    },
    //上传进度
    beforeAvatarUpload(event) {
      this.percent = Math.floor(event.percent);
      this.$refs.pro_title.innerHTML = "上传中..." + this.percent + "%";
    },
    //上传成功
    handleSuccess(response, file) {
      // 后台根据上传文件的格式可以区分是视频/音频/图片 对应 type 'v'/'a'/'i'
      response.data.name = file.name;
      this.material.unshift(response.data);
      this.isUpload = false;
      this.percent = 0;
      this.$refs.upload.clearFiles(); //清空上传列表
    },
    //导出视频，下载视频
    generate() {
      const loading = this.$loading({
        lock: true, // 是否锁屏
        text: "正在导出中...", // 加载动画的文字
        body: true,
      });
      this.assets();
      exportVideo(this.assembly).then((response) => {
        this.load = true;
        loading.close();
        this.loadHref = this.domain + "video_download/" + response.data.data; //视频下载地址
      });
    },
    //配音选择
    dub() {
      this.dubVisible = true;
      this.tabId = 3;
    },
    dubConfirm() {
      const loading = this.$loading({
        lock: true, // 是否锁屏
        text: "正在处理中...", // 加载动画的文字
        background: "rgba(0, 0, 0, 0)", // 背景颜色
        target: ".dub", // 需要遮罩的区域
        body: true,
      });
      let dubObj = {
        text: this.dubCon,
        type: this.dubIndex,
      };
      getDub(dubObj).then((response) => {
        let data = response.data.data;
        //配音文字处理
        let textObj;
        let time = 0; //time-每段字幕的时长
        for (let item of data.mix_mp3) {
          textObj = {
            s_time: 0,
            e_time: Number(item.time),
            s_ruler: time,
            e_ruler: Number(item.time) + time,
            vdrWidth: 10,
            subtitles: item.text,
            selected: false,
          };
          this.textData[0].push(textObj);
          time += Number(item.time);
        }
        //音频素材填充
        this.material.push({
          url: data.total_mp3,
          time: Number(data.total_time),
          name: data.total_mp3.split("/").pop(),
        });
        //音频轨道填充
        let audioObj = {
          s_time: 0,
          e_time: Number(data.total_time),
          s_ruler: 0,
          e_ruler: Number(data.total_time),
          url: this.domain + data.total_mp3,
          vdrWidth: 10,
          time: data.total_time,
          selected: false,
        };
        // 添加piece
        this.audioData = addPiece(this.audioData, audioObj);
        loading.close();
        this.dubCon = "";
        this.dubShow = false; //字幕选框消失
        this.record();
      });
    },
    dubClick(index) {
      this.dubIndex = index;
    },
    //复制piece
    copyPiece() {
      this.rightMenuVisible = false;
      this.copyPieceObj = { ...this.pieceObj };
    },
    //ctrl+c piece
    fastCopuPiece(piece) {
      window.console.log("已复制");
      this.copyPieceObj = { ...piece };
    },
    //ctrl+x piece
    fastCutPiece(piece) {
      window.console.log("已剪切");
      this.copyPieceObj = { ...piece };
      this.record();
      this.pieceDel(piece);
    },
    //剪切piece
    cutPiece() {
      this.pieceDel(this.pieceObj);
      this.copyPieceObj = { ...this.pieceObj };
      this.record();
      this.rightMenuVisible = false;
    },
    //粘贴
    pastePiece() {
      if (this.copyPieceObj == undefined) return;
      window.console.log("已粘贴");
      let copyPieceObj = { ...this.copyPieceObj }; //防止连续复制产生的bug
      if (copyPieceObj.type === "i") {
        copyPieceObj.e_ruler = copyPieceObj.e_ruler - copyPieceObj.s_ruler;
        copyPieceObj.s_ruler = 0;
      } else {
        copyPieceObj.s_ruler = 0;
        copyPieceObj.e_ruler = copyPieceObj.e_time - copyPieceObj.s_time;
      }
      let e_ruler = copyPieceObj.e_ruler;
      let addVideoTrack = false;
      let addAudioTrack = false;
      if (copyPieceObj.type === ("v" || "i")) {
        for (let i = this.trackIndex; i >= 0; i--) {
          if (
            this.videoData[i].length == 0 ||
            e_ruler <= this.videoData[i][0].s_ruler
          ) {
            this.videoData[i].unshift(copyPieceObj);
            addVideoTrack = true;
            break;
          }
        }
        if (!addVideoTrack) {
          this.videoData.unshift([]);
          this.videoData[0].push(copyPieceObj);
        }
      } else if (this.copyPieceObj.type === "a") {
        for (let i = this.trackIndex; i >= 0; i--) {
          if (
            this.audioData[i].length == 0 ||
            e_ruler <= this.audioData[i][0].s_ruler
          ) {
            this.audioData[i].unshift(copyPieceObj);
            addAudioTrack = true;
            break;
          }
        }
        if (!addAudioTrack) {
          this.audioData.unshift([]);
          this.audioData[0].push(copyPieceObj);
        }
      } else if (this.copyPieceObj.eTimeFor) {
        if (e_ruler <= this.textData[0][0].s_ruler) {
          this.audioData[this.trackIndex].unshift(copyPieceObj);
        } else {
          this.$message({
            message: "字幕位置不足，无法添加",
            type: "error",
          });
        }
      }
      this.record();
      this.rightMenuVisible = false;
    },
    //右击音频分离
    clickParted() {
      this.videoParted(this.pieceObj);
    },
    //音频分离
    videoParted(piece) {
      if (piece.is_audio == 0 || !piece.is_audio) {
        this.rightMenuVisible = false;
        this.$message({
          message: "无法分离",
          type: "warning",
        });
        return;
      }
      //分离的音频
      let audioObj = {
        s_time: piece.s_time,
        e_time: piece.e_time,
        url: piece.acodec,
        vdrWidth: 10,
        time: piece.time,
        left: piece.left,
        selected: false,
      };
      //分离的视频
      this.videoData.forEach((videoPieces) => {
        videoPieces.forEach((item) => {
          if (item == piece) {
            item.is_audio = 0;
            item.url = piece.vcodec;
            item.vcodec = "";
            item.acodec = "";
            item.selected = false;
            this.$set(item); //触发视图层更新
          }
        });
      });
      // 添加piece
      this.audioData = addPiece(this.audioData, audioObj);
      this.record();
      this.rightMenuVisible = false;
    },
    //处理piece重合
    pieceOverlap(item, trackIndex) {
      let afterPiece, beforePiece;
      this.pieceArr = [];
      if (item.url === ("v" || "i")) {
        this.videoData.forEach((track, index) => {
          if (index == trackIndex) {
            track.forEach((piece) => {
              if (item == piece) {
                this.pieceArr.push(item);
              } else {
                if (
                  item.s_ruler >= piece.e_ruler ||
                  item.e_ruler <= piece.s_ruler
                ) {
                  this.pieceArr.push(piece);
                } else {
                  if (piece.type === "v") {
                    beforePiece = {
                      frameImageWidth: piece.frameImageWidth,
                      frameImageHeight: piece.frameImageHeight,
                      thumbnail: piece.thumbnail,
                      imagesNum: piece.imagesNum,
                      time: piece.time,
                      s_time: piece.s_time,
                      e_time: piece.e_time - (piece.e_ruler - item.s_ruler),
                      s_ruler: piece.s_ruler,
                      e_ruler: item.s_ruler,
                      url: piece.url,
                      vcodec: piece.vcodec,
                      acodec: piece.acodec,
                      is_audio: piece.is_audio,
                      backgroundImage: [],
                      backgroundPosition: [],
                      vdrWidth: 10,
                      selected: false,
                    };
                    afterPiece = {
                      frameImageWidth: piece.frameImageWidth,
                      frameImageHeight: piece.frameImageHeight,
                      thumbnail: piece.thumbnail,
                      imagesNum: piece.imagesNum,
                      time: piece.time,
                      s_time: piece.s_time + item.e_ruler - piece.s_ruler,
                      e_time: piece.e_time,
                      s_ruler: item.e_ruler,
                      e_ruler: piece.e_ruler,
                      url: piece.url,
                      vcodec: piece.vcodec,
                      acodec: piece.acodec,
                      is_audio: piece.is_audio,
                      backgroundImage: [],
                      backgroundPosition: [],
                      vdrWidth: 10,
                      selected: false,
                    };
                  } else if (piece.type === "i") {
                    beforePiece = {
                      s_ruler: piece.s_ruler,
                      e_ruler: item.s_ruler,
                      url: piece.url,
                      vdrWidth: 10,
                      frameImageHeight: piece.frameImageHeight,
                      frameImageWidth: piece.frameImageWidth,
                      backgroundImage: [],
                      backgroundPosition: [],
                      selected: false,
                    };
                    afterPiece = {
                      s_ruler: item.e_ruler,
                      e_ruler: piece.e_ruler,
                      url: piece.url,
                      vdrWidth: 10,
                      frameImageHeight: piece.frameImageHeight,
                      frameImageWidth: piece.frameImageWidth,
                      backgroundImage: [],
                      backgroundPosition: [],
                      selected: false,
                    };
                  }
                  if (
                    item.s_ruler < piece.s_ruler &&
                    item.e_ruler > piece.s_ruler &&
                    item.e_ruler < piece.e_ruler
                  ) {
                    this.pieceArr.push(afterPiece);
                  } else if (
                    item.s_ruler > piece.s_ruler &&
                    item.e_ruler < piece.e_ruler
                  ) {
                    this.pieceArr.push(afterPiece, beforePiece);
                  } else if (
                    item.e_ruler > piece.e_ruler &&
                    item.s_ruler < piece.e_ruler &&
                    item.s_ruler > piece.s_ruler
                  ) {
                    this.pieceArr.push(beforePiece);
                  }
                }
              }
            });
          }
        });
        this.videoData.splice(trackIndex, 1, this.pieceArr);
      } else if (item.type === "a") {
        this.audioData.forEach((track, index) => {
          if (index == trackIndex) {
            track.forEach((piece) => {
              if (item == piece) {
                this.pieceArr.push(item);
              } else {
                if (
                  item.s_ruler >= piece.e_ruler ||
                  item.e_ruler <= piece.s_ruler
                ) {
                  this.pieceArr.push(piece);
                } else {
                  beforePiece = {
                    url: piece.url,
                    vdrWidth: 10,
                    time: piece.time,
                    s_time: piece.s_time,
                    e_time: piece.e_time - (piece.e_ruler - item.s_ruler),
                    s_ruler: piece.s_ruler,
                    e_ruler: item.s_ruler,
                    selected: false,
                  };
                  afterPiece = {
                    url: piece.url,
                    vdrWidth: 10,
                    time: piece.time,
                    s_time: piece.s_time + item.e_ruler - piece.s_ruler,
                    e_time: piece.e_time,
                    s_ruler: item.e_ruler,
                    e_ruler: piece.e_ruler,
                    selected: false,
                  };
                  if (
                    item.s_ruler < piece.s_ruler &&
                    item.e_ruler > piece.s_ruler &&
                    item.e_ruler < piece.e_ruler
                  ) {
                    this.pieceArr.push(afterPiece);
                  } else if (
                    item.s_ruler > piece.s_ruler &&
                    item.e_ruler < piece.e_ruler
                  ) {
                    this.pieceArr.push(afterPiece, beforePiece);
                  } else if (
                    item.e_ruler > piece.e_ruler &&
                    item.s_ruler < piece.e_ruler &&
                    item.s_ruler > piece.s_ruler
                  ) {
                    this.pieceArr.push(beforePiece);
                  }
                }
              }
            });
          }
        });
        this.audioData.splice(trackIndex, 1, this.pieceArr);
      } else if (item.eTimeFor) {
        this.textData.forEach((track, index) => {
          if (index == trackIndex) {
            track.forEach((piece) => {
              if (item == piece) {
                this.pieceArr.push(item);
              } else {
                if (
                  item.s_ruler >= piece.e_ruler ||
                  item.e_ruler <= piece.s_ruler
                ) {
                  this.pieceArr.push(piece);
                } else {
                  beforePiece = {
                    s_time: piece.s_time,
                    e_time: piece.e_time - (piece.e_ruler - item.s_ruler),
                    s_ruler: piece.s_ruler,
                    e_ruler: item.s_ruler,
                    subtitles: piece.subtitles,
                    vdrWidth: 10,
                    selected: false,
                  };
                  afterPiece = {
                    s_time: piece.s_time + item.e_ruler - piece.s_ruler,
                    e_time: piece.e_time,
                    s_ruler: item.e_ruler,
                    e_ruler: piece.e_ruler,
                    subtitles: piece.subtitles,
                    vdrWidth: 10,
                    selected: false,
                  };
                  if (
                    item.s_ruler < piece.s_ruler &&
                    item.e_ruler > piece.s_ruler &&
                    item.e_ruler < piece.e_ruler
                  ) {
                    this.pieceArr.push(afterPiece);
                  } else if (
                    item.s_ruler > piece.s_ruler &&
                    item.e_ruler < piece.e_ruler
                  ) {
                    this.pieceArr.push(afterPiece, beforePiece);
                  } else if (
                    item.e_ruler > piece.e_ruler &&
                    item.s_ruler < piece.e_ruler &&
                    item.s_ruler > piece.s_ruler
                  ) {
                    this.pieceArr.push(beforePiece);
                  }
                }
              }
            });
          }
        });
        this.textData.splice(trackIndex, 1, this.pieceArr);
      }
    },
    //重命名素材
    rightClick(index) {
      window.onmousemove = null;
      this.clickIndex = index;
    },
    rename() {
      this.materialMenuVisible = false;
      this.nameShow = false;
    },
    //删除素材
    delItem(index) {
      this.materialMenuVisible = false;
      this.material.splice(index, 1);
    },
    //记录
    record() {
      let videoData = cloneDeep(this.videoData);
      let audioData = cloneDeep(this.audioData);
      let textData = cloneDeep(this.textData);
      let recordObj = {
        videoData: videoData,
        audioData: audioData,
        textData: textData,
      };
      let recordLen = this.recordData.length;
      let delInit = this.step + 1;
      let delRecordNum = recordLen - delInit;
      //若从操作开始进行下一步，需判断，删除后续步数
      if (delInit < this.recordData.length) {
        this.recordData.splice(delInit, delRecordNum, recordObj);
      } else {
        this.recordData.push(recordObj);
      }
      this.step++;
      this.backButton = true;
      this.goButton = false;
    },
    //操作回退
    retreat() {
      if (this.step < 1) {
        return;
      } else if (this.step == 1) {
        this.zero = true;
      }
      this.step--;
      this.goButton = true;
      this.videoData = cloneDeep(this.recordData[this.step].videoData);
      this.audioData = cloneDeep(this.recordData[this.step].audioData);
      this.textData = cloneDeep(this.recordData[this.step].textData);

      if (this.step < 1) {
        this.backButton = false;
      }
    },
    forward() {
      if (this.step >= this.recordData.length - 1) {
        return;
      }

      this.step++;
      this.backButton = true;
      this.videoData = cloneDeep(this.recordData[this.step].videoData);
      this.audioData = cloneDeep(this.recordData[this.step].audioData);
      this.textData = cloneDeep(this.recordData[this.step].textData);

      if (this.step >= this.recordData.length - 1) {
        this.goButton = false;
      }
    },
  },
  watch: {
    //轨道是否为null,true为null
    zero(val) {
      if (val) this.etime = 0;
      if (val) {
        this.delButton = false;
      } else {
        this.delButton = true;
      }
    },
    //当前步数
    step(val) {
      window.console.log("当前步数", val);
    },
  },
  computed: {},
  filters: {
    timeFormat(val) {
      return vueCommon.Seconds(val);
    },
  },
};
</script>