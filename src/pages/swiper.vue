<template>
  <div class="swiper">
    <swiper ref="mySwiper" :options="swiperOption">
      <swiper-slide class="swiper-list" v-for="(slide,index) in slides" :key="index">
        <img ref="swiperImg" class="swiperImg" :src="slide.icon" />
      </swiper-slide>
      <div class="swiper-pagination" slot="pagination"></div>
    </swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import "swiper/swiper-bundle.css";

export default {
  data() {
    return {
      // 滑动模块
      slides: [
        {
          icon: "http://placehold.it/300x649?text=1",
        },
        {
          icon: "http://placehold.it/300x649?text=2",
        },
        {
          icon: "http://placehold.it/300x649?text=3",
        },
        {
          icon: "http://placehold.it/300x649?text=4",
        },
        {
          icon: "http://placehold.it/300x649?text=5",
        },
      ],
      // 默认转动角度
      transAngle: 6,
      // swiper的配置项
      swiperOption: {
        loop: false,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        slidesPerView: 1,
        autoplay: false,
        spaceBetween: 20,
        watchSlidesProgress: true,
        on: {
          progress: (swiper, progress) => {
            this.handleProgressChange(progress);
          },
        },
      },
    };
  },
  components: {
    Swiper,
    SwiperSlide,
  },
  mounted() {
    this.handleProgressChange(0);
  },
  computed: {
    // progress的间隔
    progressInterval() {
      return 1 / (this.slides.length - 1);
    },
  },
  methods: {
    handleProgressChange(progress) {
      let listInstances = this.$refs.swiperImg;
      let _this = this;
      listInstances.forEach((instance, index) => {
        (function t(ins, i) {
          // 对于每一个slide的偏转度
          let deflection = progress - index * _this.progressInterval;
          // 小于0表示向右偏转
          if (deflection < 0) {
            // 计算出偏转的真实角度
            let angle =
              (Math.abs(deflection) / _this.progressInterval) *
              _this.transAngle;
            instance.style.transform = "rotateZ(" + angle + "deg)";
          } else {
            // 计算出偏转的真实角度
            let angle =
              (deflection / _this.progressInterval) * _this.transAngle;
            instance.style.transform = "rotateZ(-" + angle + "deg)";
          }
        })(instance, index);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.swiper {
  width: 220px;
  height: 390px;
  margin: auto;
  overflow: hidden;
  padding: 0 50px;
  box-sizing: border-box;

  .swiper-list {
    .swiperImg {
      width: 100%;
      height: 100%;
      transform-origin: 50% 100%;
      box-shadow: 0px 0px 50px 0px rgba(0, 0, 0, 0.36);
      border-radius: 24px;
      border: 4px solid rgba(255, 255, 255, 0.44);
    }
  }
}

.swiper-container {
  overflow: visible;
}

.swiper-pagination {
  width: 100%;
  height: 50px;
  border: 1px solid red;
}
</style>
