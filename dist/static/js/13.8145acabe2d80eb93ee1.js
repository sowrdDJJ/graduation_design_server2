webpackJsonp([13],{PGlT:function(e,t){},fWcp:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var s=i("Dd8w"),r=i.n(s),n=i("GQaK"),c=i("CRLr"),a=i("NYxO"),o=i("MqkC"),v={name:"OrderReceiv",data:function(){return{orderReceivList:[]}},methods:{getOrderReceiv:function(){var e=this;this.$store.dispatch("user/getUserOrderInfo",{url:"/getUserOrderColumn",params:{action:"Receiv"}}).then(function(t){e.orderReceivList=t})},detailsBtn:function(e){this.$router.push("/commodity/id="+e)},transtionOrderNavigation:function(e){o.a.setPayId(e),o.a.setAction("Receiv"),c.a.$emit("transtionOrderNavigation","OrderReceiv")}},computed:r()({pirceSum:function(){return function(e,t){return e*t}},orderReceivContentHeight:function(){return 4*this.orderReceivList.length}},Object(a.b)(["currUserData"])),mounted:function(){console.log(this.$route.params),this.getOrderReceiv(),this.scroll=new n.a(this.$refs.orderReceivShow,{mouseWheel:!0,click:!0,tap:!0})},activated:function(){this.getOrderReceiv()}},d={render:function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"ordeReceiv-box"},[i("div",{ref:"orderReceivShow",staticClass:"orderReceiv-show"},[i("div",{staticClass:"orderReceiv-content",style:{height:e.orderReceivContentHeight+"rem"}},e._l(e.orderReceivList,function(t){return i("div",{key:t.id,staticClass:"receivContent"},[i("div",{staticClass:"receivContent-img"},[i("img",{staticClass:"img",attrs:{src:t.imgUrl}})]),e._v(" "),i("div",{staticClass:"receivContent-title"},[i("span",{staticClass:"title"},[e._v(e._s(t.title))])]),e._v(" "),i("div",{staticClass:"receivContent-information"},[i("span",{staticClass:"price"},[e._v("价格：￥"+e._s(t.price))]),e._v(" "),i("span",{staticClass:"number"},[e._v("数量："+e._s(t.number))]),e._v(" "),i("span",{staticClass:"size"},[e._v("型号："+e._s(t.size))])]),e._v(" "),i("div",{staticClass:"sum-price"},[e._v("\n                合计："),i("span",{staticClass:"sum"},[e._v("￥"+e._s(e.pirceSum(t.price,t.number)))])]),e._v(" "),i("div",{staticClass:"receivContent-btns"},[i("ul",[i("router-link",{attrs:{to:"orderReceivInformation/ReceivId="+t.id}},[i("li",{staticClass:"btns details"},[e._v("查看物流")])]),e._v(" "),i("router-link",{attrs:{to:"/user/PasswordBtn"}},[i("li",{staticClass:"btns Receiv",on:{click:function(i){return e.transtionOrderNavigation(t.id)}}},[e._v("确认收货")])]),e._v(" "),i("li",{staticClass:"btns cancel"},[e._v("退货")])],1)])])}),0)]),e._v(" "),i("router-view")],1)},staticRenderFns:[]};var l=i("VU/8")(v,d,!1,function(e){i("PGlT")},"data-v-9d578f76",null);t.default=l.exports}});
//# sourceMappingURL=13.8145acabe2d80eb93ee1.js.map