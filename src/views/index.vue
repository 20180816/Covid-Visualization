<template>
  <div class="test">
    <head-menu></head-menu>
    <div class="content">
      <!-- <div class="menu" style="height: 100%;">
        <menu-list></menu-list>
      </div> -->
      <div class="menu-content">
        <!-- <keep-alive :max="1" :include="/-alive/"> -->
        <router-view></router-view>
        <!-- </keep-alive> -->
      </div>
    </div>

  </div>
</template>

<script>
import HeadMenu from "../components/headMenu"

export default {
  name: "test",
  data() {
    return {
      chartType: "3Dbar",
      rotate: true,
      data: [

      ],
    };
  },
  computed: {
    contentStyle() {
      let style = {};
      let height = (document.documentElement.clientHeight || document.body.clientHeight) - 50;
      style.height = height + "px";
      console.log("height", style)
      return style;
    }
  },
  mounted() {
    console.log('index mounted')
  },
  created() {
    console.log('index created')
    
  },
  components: {
    HeadMenu,
    //MenuList,
    //Choropleth,
    //barChart,
    //DbarChart,
    //lineChart,
  },
  methods: {
  },
};
</script>

<style scoped>
.content {
  display: flex;
}

.menu {
  width: 2px;
}

.menu-content {
  flex: 1;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 2px;
  min-height: 400px;
}
.title-content {
  float:left;
}
</style>
