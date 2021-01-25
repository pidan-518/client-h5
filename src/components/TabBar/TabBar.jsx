import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './TabBar.less';

class TabBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      TabList: [
        {
          pagePath: '/pages/index/index',
          text: '首页',
          iconPath: require('../../static/tabbar/home.png'),
          selectedIconPath: require('../../static/tabbar/home-ac.png'),
        },
        {
          pagePath: '/pages/category/category',
          text: '分类',
          iconPath: require('../../static/tabbar/category.png'),
          selectedIconPath: require('../../static/tabbar/category-ac.png'),
        },
        {
          pagePath: '/pages/cart/cart',
          text: '购物车',
          iconPath: require('../../static/tabbar/cart.png'),
          selectedIconPath: require('../../static/tabbar/cart-ac.png'),
        },
        {
          pagePath: '/pages/person/person',
          text: '我的',
          iconPath: require('../../static/tabbar/person.png'),
          selectedIconPath: require('../../static/tabbar/person-ac.png'),
        },
      ],
    };
  }

  handleTabbarClick(item) {
    Taro.navigateTo({
      url: item.pagePath,
    });
  }

  getRequest() {
    var str = location.href;
    var num = str.indexOf('#');
    str = str.substr(num + 1);
    return str;
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  /* config = {
    navigationBarTitleText: '首页',
    usingComponents: {}
  } */

  render() {
    const { TabList } = this.state;
    // getRequest
    return (
      <View className="tab-bar">
        {TabList.map((item) => (
          <View
            className="tab-bar-item"
            onClick={this.handleTabbarClick.bind(this, item)}
          >
            <img
              src={
                item.pagePath === this.getRequest()
                  ? item.selectedIconPath
                  : item.iconPath
              }
            />
            <View
              className="tab-bar-text"
              style={{
                color: this.getRequest() === item.pagePath ? '#ff5d8c' : '',
              }}
            >
              {item.text}
            </View>
          </View>
        ))}

        {/* <View></View>
        <View></View>
        <View></View> */}
      </View>
    );
  }
}

export default TabBar;
