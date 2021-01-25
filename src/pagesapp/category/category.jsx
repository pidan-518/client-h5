import Taro, { Component } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import './category.less';
import '../../common/globalstyle.less';
import GoodsList from '../../components/GoodsList/GoodsList';
import servicePath from '../../common/util/api/apiUrl';
import { postRequest } from '../../common/util/request';
import TabBar from '../../components/TabBar/TabBar';
import utils from '../../common/util/utils';
import AgentShare from '../../components/AgentShare/AgentShare';

class CateGory extends Component {
  state = {
    bannerList: [], // 分类列表
    hotText: '', // 搜索框placeholder值
    hotArr: [], // 热搜词list
  };

  // 搜索框点击事件
  handleSearchInputClick = () => {
    Taro.navigateTo({
      url: `/pages/searchpage/searchpage?hotText=${encodeURI(
        this.state.hotText
      ) || ''}`,
    });
  };

  // banner点击事件
  handleBannerClick = (index, e) => {
    let bannerList = this.state.bannerList;
    bannerList.map((item, idx) => {
      if (idx === index) {
        if (item.isShow) {
          item.isShow = false;
        } else {
          item.isShow = true;
        }
      } else {
        item.isShow = false;
      }
      return item;
    });
    this.setState(
      {
        bannerList,
      },
      () => {
        Taro.pageScrollTo({
          scrollTop: e.currentTarget.offsetTop,
          duration: 200,
        });
      }
    );
  };

  // banner下的分类点击事件
  handleCategoryClick = (itemCate) => {
    if (itemCate.id && itemCate.namePath) {
      if (window.sessionStorage.getItem('system') === 'android') {
        click.toGoodsList(itemCate.id, itemCate.namePath);
      } else {
        const params = {
          id: itemCate.id,
          namePath: itemCate.namePath,
        };
        window.webkit.messageHandlers.toGoodsList.postMessage(params);
      }
    } else {
      Taro.showToast({
        title: '参数出现null',
        icon: 'none',
      });
    }
  };

  // 获取分类列表
  getListByTag() {
    postRequest(servicePath.getListByTag, {
      tag: 'category_search',
      source: 40,
    })
      .then((res) => {
        console.log('获取分类页列表成功', res.data);
        if (res.data.code === 0) {
          this.setState({
            bannerList: res.data.data.map((item) => {
              item.isShow = false;
              return item;
            }),
          });
        }
      })
      .catch((err) => {
        console.log('获取分类页列表失败', err);
      });
  }

  // 获取热搜词
  getHotSearchWord = () => {
    const postData = {
      len: 30,
      current: 1,
    };
    postRequest(servicePath.hotSearchWord, postData)
      .then((res) => {
        console.log('获取热搜词成功', res.data);
        if (res.statusCode === 200) {
          const hotArr = [];
          res.data.records.forEach((item) => {
            hotArr.push(item.title);
          });
          this.setState({
            hotArr,
            hotText: hotArr[Math.floor(Math.random() * hotArr.length)],
          });
        }
      })
      .catch((err) => {
        console.log('返回数据失败', err);
      });
  };

  // 上拉加载
  onReachBottom() {}

  componentWillMount() {}

  componentDidMount() {
    this.getListByTag();
    /* this.getHotSearchWord(); */
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    /* console.log("进入"); */
  }

  componentDidShow() {
    const hotArr = this.state.hotArr;
    this.setState({
      hotText: hotArr[Math.floor(Math.random() * hotArr.length)],
    });
    utils.updateRecommendCode(this.$router.params.shareRecommend); //绑定、存储代理码
  }

  componentDidHide() {}

  config = {
    onReachBottomDistance: 50,
    navigationBarTitleText: '分类',
    usingComponents: {},
  };

  render() {
    const { bannerList } = this.state;

    return (
      <View>
        <View id="banner-wrap">
          <View className="banner-list">
            {bannerList.map((item, index) => {
              let categoryList = item.categoryCommonList;
              return (
                <View className="banner-list-item-box" key={index}>
                  <View
                    className="banner-list-item"
                    style={{
                      backgroundImage: `url(${item.categoryComShow.image})`,
                    }}
                    onClick={this.handleBannerClick.bind(this, index)}
                    data-id={item.id}
                  ></View>
                  <View
                    className="level-category-list"
                    style={{ display: item.isShow ? 'block' : 'none' }}
                  >
                    {categoryList.map((itemCate) => (
                      <View
                        className="list-item"
                        onClick={this.handleCategoryClick.bind(this, itemCate)}
                        key={itemCate.id}
                      >
                        <Text className="item-label">{itemCate.name}</Text>
                        <img
                          className="item-icon"
                          src={require('../../static/category/right-icon.png')}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
}

export default CateGory;
