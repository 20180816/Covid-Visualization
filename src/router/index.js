import Vue from "vue";
import Router from "vue-router";
import Index from "@/views/index";
import Covid from "./modules/covid";
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "Index",
      component: Index,
      redirect:"/covid"
    },
    Covid,
  ]
});
