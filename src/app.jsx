import Taro, { Component } from '@tarojs/taro';
import Index from './pages/index';
/* import VConsole from 'vconsole'; */
import './app.less';

/* let vConsole = new VConsole(); */

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

class App extends Component {
  componentDidMount() {
    /* Taro.navigateTo({
      url: '/pages/landingpage/landingpage'
    }) */
  }

  componentDidShow() {
    Taro.getSystemInfo({}).then((res) => {
      Taro.$navBarMarginTop = res.statusBarHeight || 0;
    });
    // PC端重定向
    let isAndroid = /android/gi.test(navigator.appVersion);
    let isIDevice = /iphone/gi.test(navigator.appVersion);
    let isWindowsPhone = /windows phone/gi.test(navigator.appVersion);
    let isHasLinux = /linux/gi.test(navigator.appVersion);
    let isGecko = /gecko/gi.test(navigator.appVersion);
    if (
      !(isAndroid || isIDevice || isWindowsPhone || (isHasLinux && isGecko))
    ) {
      window.location.href = 'https://' + document.domain;
    } else {
      let urlSource = this.GetQueryString('source');
      if (!sessionStorage.getItem('source')) {
        sessionStorage.setItem('source', urlSource);
      }
      let source = sessionStorage.getItem('source');
      let url = location.href;
      let isLandingpage = url.indexOf('landingpage') !== -1;
      let isDrp = url.indexOf('drp') !== -1;
      // 非内嵌页跳转落地页
      if (source !== 'app' && urlSource !== 'app' && !isLandingpage && !isDrp) {
        switch (envConstants) {
          case 'pro':
            window.location.href =
              'https://' +
              window.location.hostname +
              '/h5/v100/#/pages/landingpage/landingpage';
            // window.location.href = 'https://' + window.location.hostname + '/h5/#/pages/landingpage/landingpage' // --no v100
            break;
          case 'pre':
          case 'dev':
            window.location.href =
              'http://' +
              window.location.hostname +
              '/h5/#/pages/landingpage/landingpage';
            break;
          default:
            break;
        }
      }
    }
    // 安卓/ios区分
    let system = isAndroid ? 'android' : 'ios';
    window.sessionStorage.setItem('system', system);
  }

  GetQueryString(paras) {
    var url = window.location.href;
    var paraString = url.substring(url.indexOf('?') + 1, url.length).split('&');
    var paraObj = {};
    let j = '';
    for (let i = 0; (j = paraString[i]); i++) {
      paraObj[j.substring(0, j.indexOf('=')).toLowerCase()] = j.substring(
        j.indexOf('=') + 1,
        j.length
      );
    }
    var returnValue = paraObj[paras.toLowerCase()];
    if (typeof returnValue == 'undefined') {
      return '';
    } else {
      return returnValue;
    }
  }

  componentDidHide() {}

  componentDidCatchError() {}

  config = {
    pages: [
      'pages/landingpage/landingpage', // 落地页 --li
      'pagesapp/index/index', // app首页 --li
      'pages/index/index', // 首页 --li
      'pages/drpjoin/drpjoin',
      'pages/cart/cart',
      'pages/drpgoods/drpgoods',
      'pages/drpgoodsdetails/drpgoodsdetails',
      'pages/orderpaysuccess/orderpaysuccess',
      'pages/orderfinalpay/orderfinalpay',
      'pages/myorder/myorder',
      'pages/proreturn/proreturn',
      'pages/ordersubmit/ordersubmit',
      'pages/login/login', // 登录 --li
      'pageA/activity1/activity1', // 品牌代购  --li
      'pageA/activity2/activity2',
      'pageA/activity3/activity3',
      'pageA/activity4/activity4', // 限时限购 --li
      'pageA/activity5/activity5', // 开业庆典 --li
      'pageA/activity6/activity6', // 品质生活馆 --li
      'pages/returnapply/returnapply',
      'pages/proreturn/proreturn',
      'pages/evaldetails/evaldetails',
      'pages/logistics/logistics', // 物流信息 --li
      'pages/categoryGoods/categoryGoods', // 分类商品 --li
      'pages/ordersubmit/ordersubmit',
      'pages/bindwechat/bindwechat',
      'pages/goodsdetails/goodsdetails', // 商品详情 --li
      'pages/myinfo/myinfo',
      'pages/notice/notice',
      'pages/searchshop/searchshop', // 搜索店铺 --li
      'pages/searchpage/searchpage', // 搜索页 --li
      'pages/orderdetails/orderdetails',
      'pages/changeaddress/changeaddress',
      'pages/unbindwechat/unbindwechat',
      'pages/register/register', // 注册页 --li
      'pages/person/person', // 个人中心 --li
      'pages/searchgoods/searchgoods', // 开业庆典活动商品分类搜索页 --li
      'pages/usecertificate/usecertificate', // 使用优惠券 --li
      'pages/certificate/certificate', // 优惠券 --li
      'pages/mycertificate/mycertificate', // 我的卡券 --li
      'pages/historycertificate/historycertificate', // 历史卡券 --li
      'pages/resetpassword/resetpassword', // 修改密码 --li
      'pages/evaluate/evaluate', // 评论 --li
      'pages/shophome/shophome', // 店铺首页 --li
      'pages/realname/realname', // 实名认证 --li
      'pages/favorite/favorite', // 我的收藏 -li
      'pages/returnprocessing/returnprocessing',
      'pages/editaddress/editaddress', // 编辑地址 --li
      'pages/orderpay/orderpay',
      'pages/address/address', // 添加地址 --li
      'pages/returnresult/returnresult',
      'pages/category/category', // 分类页 --li
      'pages/hotpage/hotpage',
      'pages/shopqualifications/shopqualifications', // 店铺资质 --li
      'pages/messagecenter/messagecenter', // 消息中心 --li

      //app页面
      'pagesapp/index/index', // app首页 --li
      'pagesapp/category/category',
      'pagesapp/twocategory/twocategory',
      'pagesapp/threecategory/threecategory',
      'pagesapp/drpjoin/drpjoin',
      'pagesapp/drpgoods/drpgoods',
      'pagesapp/drpgoodsdetails/drpgoodsdetails',
      'pagesapp/findgoods/findgoods', // 发现好货 -- kzh
      'pagesapp/hotlist/hotlist', // 热销榜单 -- dzk
      'pagesapp/loveRobPurchase/loveRobPurchase', //爱抢购 -- cyl
      'pagesapp/brand/brand', // 品牌闪购 -- wq
      'pagesapp/brandlist/brandlist', // 品牌专场 -- wq
      'pageAapp/activity3/activity3',
      'pageAapp/activity4/activity4',
      'pageAapp/activity5/activity5',
      'pageAapp/activity6/activity6',
      'pageAapp/activity7/activity7', // 双十一活动页--dzk
      'pageAapp/activity7/activitylist/activitylist', // 双十一商品页--dzk
      'pageAapp/activity7/coupons/coupons', // 双十一领券页--dzk
      'pageAapp/doubletwelve/doubletwelve', // 双十二活动页--dzk
      'pageAapp/newyear/newyear', // 双旦活动页--dzk
      'pageAapp/newyear/activitylist/activitylist', // 双旦商品页--dzk
      'pageAapp/newshopping/newshopping', // 年货节活动页--dzk
      'pageAapp/newshopping/activitylist/activitylist', // 年货节商品页--dzk
      'pageAapp/spring/spring', // 春节活动页--dzk
      'pageAapp/spring/activitylist/activitylist', // 春节商品页--dzk
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      // navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
    },
    /* tabBar: {
      color: "#b5b5b5",
      selectedColor: "#ff5d8c",
      borderStyle: 'white',
      list: [
        {
          pagePath: 'pages/index/index',
          text: "首页",
          iconPath: "./static/tabbar/home.png",
          selectedIconPath: "./static/tabbar/home-ac.png",
        },
        {
          pagePath: 'pages/category/category',
          text: "分类",
          iconPath: "./static/tabbar/category.png",
          selectedIconPath: "./static/tabbar/category-ac.png",
        },
        {
          pagePath: 'pages/cart/cart',
          text: "购物车",
          iconPath: "./static/tabbar/cart.png",
          selectedIconPath: "./static/tabbar/cart-ac.png",
        },
        {
          pagePath: 'pages/person/person',
          text: "我的",
          iconPath: "./static/tabbar/person.png",
          selectedIconPath: "./static/tabbar/person-ac.png",
        },
      ]
    } */
  };

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return <Index />;
  }
}

Taro.render(<App />, document.getElementById('app'));
