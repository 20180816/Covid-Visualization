import Index from '../../views'
import Statistics from '../../views/covid/Statistics'

export default {
  path: "/covid",
  meta: { title: "COVID" },
  component: Index,
  redirect:"/covid/statistics",
  children:[
    {
      path:"statistics",
      meta:{title:"Statistics"},
      component: Statistics,
    },
  
  ]
}
