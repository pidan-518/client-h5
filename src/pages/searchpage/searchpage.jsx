import Taro, { Component } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import GoodsList from '../../components/GoodsList/GoodsList';
import '../../common/globalstyle.less';
import './searchpage.less';
import { postRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import CommonEmpty from '../../components/CommonEmpty/CommonEmpty';
import Navigation from '../../components/Navigation/Navigation';
import { AtInput } from 'taro-ui';

// 搜索页面
class SearchPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchVal: '', // 搜索框值
      timer: null, // 防抖函数定时器
      TopHeight: 45, // 搜索列表对顶部的距离
      searchListHeight: '', // 搜索列表的高度
      searchList: [], // 搜索结果的list
      paddingTop: '',
      goodsList: [], // 商品列表
      isShow: true, // 显示搜索结果list的值
      goodsCurrent: 1, // 商品列表当前页
      goodsPages: '', // 商品列表总页数
      visible: false, // 显示搜索历史热搜词框
      searchHistory: [], // 搜索历史数据
      hotWords: [], // 热搜词
      riseIcon: require('../../static/category/filter-top.png'), // 销量正序图标
      dropIcon: require('../../static/category/filter-bottom.png'), // 销量倒序图标
      isSales: false, // 显示销量排序
      isPrice: false, // 显示价格排序
      isSalesDrop: false, // 销量降序
      isSalesRise: false, // 销量升序
      isPriceDrop: false, // 价格降序
      isPriceRise: false, // 价格升序
      isNewest: false, // 最近上新
      saleOrder: '', // 传给后台的销量排序值
      priceOrder: '', // 传给后台的价格排序值
      updateOrder: '', // 传给后台的最近上新排序值
    };
  }

  handleCloseMask = () => {
    if (this.state.isSales || this.state.isPrice) {
      this.setState({
        isSales: false,
        isPrice: false,
      });
    }
  };

  // 左上角返回按钮
  handleNavigateBack = () => {
    Taro.navigateBack({
      delta: 1,
    });
  };

  // 搜索框输入事件
  handleSearchInput = (e) => {
    clearTimeout(this.state.timer);
    this.setState({
      searchVal: e.detail.value,
      isShow: false,
    });
    if (e.detail.value === '') {
      this.setState({
        searchList: [],
        isShow: true,
        visible: false,
      });
      return;
    } else if (e.detail.value.match(/^\s*$/)) {
      return;
    }
    this.state.timer = setTimeout(() => {
      this.searchItems(e.detail.value, 1);
    }, 300);
  };

  // 搜索框点击完成按钮时触发事件
  handleSearchInputConfirm = (e) => {
    if (e.detail.value.match(/^\s*$/)) {
      return;
    }
    let searchHistory = this.state.searchHistory;
    searchHistory.unshift(this.state.searchVal);
    this.setState(
      {
        goodsList: [],
        isShow: true,
        visible: true,
        searchVal: e.detail.value,
        searchHistory: this.unique(searchHistory),
        saleOrder: '', // 传给后台的销量排序值
        priceOrder: '', // 传给后台的价格排序值
        updateOrder: '', // 传给后台的最近上新排序值
        isSalesDrop: false, // 销量降序
        isSalesRise: false, // 销量升序
        isPriceDrop: false, // 价格降序
        isPriceRise: false, // 价格升序
        isNewest: false, // 最近上新
      },
      () => {
        window.sessionStorage.setItem(
          'searchHistory',
          JSON.stringify(this.state.searchHistory)
        );
        this.getSearchGoods();
      }
    );
  };

  // 搜索框获取焦点事件
  handleSearchInputFocus = (e) => {
    if (e.detail.value === '') {
      this.setState({
        isShow: true,
        visible: false,
      });
      return;
    } else if (e.detail.value.match(/^\s*$/)) {
      return;
    } else {
      this.setState(
        {
          isShow: false,
        },
        () => {
          this.searchItems(this.state.searchVal, 1);
        }
      );
    }
  };

  // 搜索框失去焦点事件
  handleSearchInputBlur = (e) => {
    setTimeout(() => {
      this.setState({
        isShow: true,
      });
    }, 100);
  };

  // 搜索结果列表item的点击事件
  handleSearchItemClick = (itemName) => {
    let searchHistory = this.state.searchHistory;
    searchHistory.unshift(itemName);
    this.setState(
      {
        goodsList: [],
        isShow: true,
        visible: true,
        searchVal: itemName,
        searchHistory: this.unique(searchHistory),
        saleOrder: '', // 传给后台的销量排序值
        priceOrder: '', // 传给后台的价格排序值
        updateOrder: '', // 传给后台的最近上新排序值
        isSalesDrop: false, // 销量降序
        isSalesRise: false, // 销量升序
        isPriceDrop: false, // 价格降序
        isPriceRise: false, // 价格升序
        isNewest: false, // 最近上新
      },
      () => {
        window.sessionStorage.setItem(
          'searchHistory',
          JSON.stringify(this.state.searchHistory)
        );
        this.getSearchGoods();
      }
    );
  };

  // 删除搜索历史
  handleDeleteSearchHistory = () => {
    this.setState(
      {
        searchHistory: [],
      },
      () => {
        window.sessionStorage.removeItem('searchHistory');
      }
    );
  };

  // 搜索历史数据item点击事件
  handleSearchHistoryItem = (item) => {
    this.setState(
      {
        visible: true,
        goodsList: [],
        searchVal: item,
        saleOrder: '', // 传给后台的销量排序值
        priceOrder: '', // 传给后台的价格排序值
        updateOrder: '', // 传给后台的最近上新排序值
        isSalesDrop: false, // 销量降序
        isSalesRise: false, // 销量升序
        isPriceDrop: false, // 价格降序
        isPriceRise: false, // 价格升序
        isNewest: false, // 最近上新
      },
      () => {
        this.getSearchGoods();
      }
    );
  };

  // 热搜词item点击事件
  handleHotItemClick = (item) => {
    let searchHistory = this.state.searchHistory;
    searchHistory.unshift(item);
    this.setState(
      {
        visible: true,
        goodsList: [],
        searchVal: item,
        searchHistory: this.unique(searchHistory),
      },
      () => {
        window.sessionStorage.setItem(
          'searchHistory',
          JSON.stringify(this.state.searchHistory)
        );
        this.getSearchGoods();
      }
    );
  };

  /* ------------------------------销量排序-------------------------- */

  // 销量排序点击事件
  handleSalesSortClick = () => {
    if (this.state.isSales) {
      this.setState({
        isSales: false,
      });
    } else {
      this.setState({
        isSales: true,
        isPrice: false,
      });
    }
  };

  // 销量降序点击事件
  handleSalesDropClick = () => {
    this.setState(
      {
        isSalesDrop: true,
        isSalesRise: false,
        isPriceDrop: false,
        isPriceRise: false,
        saleOrder: 1,
        priceOrder: '',
        isNewest: false,
        updateOrder: '',
        goodsList: [],
      },
      () => {
        this.getSearchGoods();
      }
    );
  };

  // 销量升序点击事件
  handleSalesRiseClick = () => {
    this.setState(
      {
        isSalesDrop: false,
        isSalesRise: true,
        isPriceDrop: false,
        isPriceRise: false,
        saleOrder: 0,
        priceOrder: '',
        isNewest: false,
        updateOrder: '',
        goodsList: [],
      },
      () => {
        this.getSearchGoods();
      }
    );
  };

  /* ------------------------------价格排序-------------------------- */

  // 价格排序点击事件
  handlePriceSortClick = () => {
    if (this.state.isPrice) {
      this.setState({
        isPrice: false,
      });
    } else {
      this.setState({
        isPrice: true,
        isSales: false,
      });
    }
  };

  // 价格降序点击事件
  handlePriceDropClick = () => {
    this.setState(
      {
        isPriceDrop: true,
        isPriceRise: false,
        isSalesDrop: false,
        isSalesRise: false,
        saleOrder: '',
        priceOrder: 1,
        isNewest: false,
        updateOrder: '',
        goodsList: [],
      },
      () => {
        this.getSearchGoods();
      }
    );
  };

  // 价格升序点击事件
  handlePriceRiseClick = () => {
    this.setState(
      {
        isPriceDrop: false,
        isPriceRise: true,
        isSalesDrop: false,
        isSalesRise: false,
        saleOrder: '',
        priceOrder: 0,
        isNewest: false,
        updateOrder: '',
        goodsList: [],
      },
      () => {
        this.getSearchGoods();
      }
    );
  };

  /* ------------------------------最近上新-------------------------- */

  // 最近上新点击事件
  handleRecentlyAddedClick = () => {
    this.setState({
      isSalesDrop: false,
      isSalesRise: false,
      isPriceDrop: false,
      isPriceRise: false,
      isSales: false,
      isPrice: false,
      priceOrder: '',
      saleOrder: '',
      goodsList: [],
    });

    if (this.state.isNewest) {
      this.setState(
        {
          isNewest: false,
          updateOrder: '',
        },
        () => {
          this.getSearchGoods();
        }
      );
    } else {
      this.setState(
        {
          isNewest: true,
          updateOrder: 1,
        },
        () => {
          this.getSearchGoods();
        }
      );
    }
  };

  // 上拉事件
  onReachBottom() {
    if (this.state.goodsPages > this.state.goodsCurrent) {
      this.getSearchGoods(this.state.goodsCurrent + 1);
    }
  }

  onPageScroll(e) {
    this.setState({
      isSales: false,
      isPrice: false,
    });
  }

  // 搜索关键字
  searchItems(value, current) {
    postRequest(servicePath.searchItems, {
      current: current,
      len: 10,
      keyword: `${value}`,
      source: 40,
    })
      .then((res) => {
        console.log('搜索关键词返回数据成功', res.data);
        if (res.data.code === 0) {
          this.setState({
            /* isShow: false, */
            searchList: res.data.data.records,
          });
        }
      })
      .catch((err) => {
        console.log('搜索关键词返回数据失败', err);
      });
  }

  // 热搜词接口
  getHotSearchWord = () => {
    const postData = {
      len: 30,
      current: 1,
    };
    postRequest(servicePath.hotSearchWord, postData)
      .then((res) => {
        console.log('获取热搜词成功', res.data);
        if (res.statusCode === 200) {
          this.setState({
            hotWords: res.data.records,
          });
        }
      })
      .catch((err) => {
        console.log('返回数据失败', err);
      });
  };

  // 获取搜索的商品
  getSearchGoods(current = 1) {
    postRequest(servicePath.searchItems, {
      current: current,
      len: 10,
      source: 40,
      keyword: this.state.searchVal,
      sortPrice: this.state.priceOrder,
      sortSaleNum: this.state.saleOrder,
      sortTimer: this.state.updateOrder,
    })
      .then((res) => {
        console.log('搜索商品列表返回数据成功', res.data);
        if (res.data.code === 0) {
          this.setState({
            goodsList: [...this.state.goodsList, ...res.data.data.records],
            goodsCurrent: res.data.data.current + 1,
            goodsPages: res.data.data.pages,
          });
        }
      })
      .catch((err) => {
        console.log('搜索关键词返回数据失败', err);
      });
  }

  // 数组去重
  unique(arr) {
    return Array.from(new Set(arr));
  }

  componentWillMount() {
    this.getHotSearchWord();
    let searchHistory = window.sessionStorage.getItem('searchHistory') || '';
    if (searchHistory !== '') {
      this.setState({
        searchHistory: JSON.parse(searchHistory),
      });
    }
  }

  componentDidMount() {
    let navHeight = Taro.createSelectorQuery();
    let urlParam = this.$router.params.hotText || '';
    const searchBox = document.getElementById('search-page-head');
    navHeight
      .select('#search-page-head')
      .boundingClientRect((rect) => {
        console.log(rect);
        this.setState(
          {
            /* TopHeight: (rect.height / 3), */
          },
          () => {
            Taro.getSystemInfo({
              success: (res) => {
                this.setState({
                  searchListHeight: res.screenHeight,
                  searchVal: decodeURI(urlParam),
                });
              },
            });
          }
        );
      })
      .exec();
  }

  componentDidShow() {
    Taro.getSystemInfo({}).then((res) => {
      Taro.$navBarMarginTop = res.statusBarHeight || 0;
    });
  }

  config = {
    onReachBottomDistance: 50,
    navigationStyle: 'custom',
  };

  render() {
    const {
      TopHeight,
      searchListHeight,
      searchList,
      goodsList,
      isShow,
      searchVal,
      visible,
      searchHistory,
      hotWords,
      riseIcon,
      dropIcon,
      isSales,
      isPrice,
      isSalesDrop,
      isSalesRise,
      isPriceDrop,
      isPriceRise,
      isNewest,
    } = this.state;
    return (
      <View onClick={this.handleCloseMask}>
        <View id="search-page-head">
          <View className="search-page-head-nav">
            <img
              onClick={this.handleNavigateBack}
              className="left-icon"
              src={require('../../static/searchpage/left.png')}
            />
            <View className="search-input">
              <img src={require('../../static/home/search-icon.png')} />
              <Input
                type="text"
                id="searchInput"
                value={searchVal}
                onFocus={this.handleSearchInputFocus}
                onBlur={this.handleSearchInputBlur}
                placeholder="点击搜索您想要的商品"
                onConfirm={this.handleSearchInputConfirm}
                onInput={this.handleSearchInput}
              />
            </View>
          </View>
        </View>
        <View className="filter-row" /* style={{top:`${TopHeight}px`}} */>
          <View className="filter-item-box">
            <View className="filter-item" onClick={this.handleSalesSortClick}>
              <View>销量排序</View>
              <img src={isSales ? riseIcon : dropIcon} />
            </View>
            <View
              className="mask"
              style={{
                display: isSales ? 'block' : 'none',
                height: `${searchListHeight - TopHeight}px`,
              }}
            >
              <View className="item-select">
                <View
                  className="select-text"
                  onClick={this.handleSalesDropClick}
                >
                  <View style={{ color: isSalesDrop ? '#ff5d8c' : null }}>
                    销量降序
                  </View>
                  <img
                    className="select-icon"
                    src={
                      isSalesDrop
                        ? require('../../static/category/hook.png')
                        : null
                    }
                  />
                </View>
                <View
                  className="select-text"
                  onClick={this.handleSalesRiseClick}
                >
                  <View style={{ color: isSalesRise ? '#ff5d8c' : null }}>
                    销量升序
                  </View>
                  <img
                    className="select-icon"
                    src={
                      isSalesRise
                        ? require('../../static/category/hook.png')
                        : null
                    }
                  />
                </View>
              </View>
            </View>
          </View>
          <View className="filter-item-box">
            <View className="filter-item" onClick={this.handlePriceSortClick}>
              <View>价格排序</View>
              <img src={isPrice ? riseIcon : dropIcon} />
            </View>
            <View
              className="mask"
              style={{
                display: isPrice ? 'block' : 'none',
                height: `${searchListHeight - TopHeight}px`,
              }}
            >
              <View className="item-select">
                <View
                  className="select-text"
                  onClick={this.handlePriceDropClick}
                >
                  <View style={{ color: isPriceDrop ? '#ff5d8c' : null }}>
                    价格降序
                  </View>
                  <img
                    className="select-icon"
                    src={
                      isPriceDrop
                        ? require('../../static/category/hook.png')
                        : null
                    }
                  />
                </View>
                <View
                  className="select-text"
                  onClick={this.handlePriceRiseClick}
                >
                  <View style={{ color: isPriceRise ? '#ff5d8c' : null }}>
                    价格升序
                  </View>
                  <img
                    className="select-icon"
                    src={
                      isPriceRise
                        ? require('../../static/category/hook.png')
                        : null
                    }
                  />
                </View>
              </View>
            </View>
          </View>
          <View className="filter-item-box">
            <View
              className="filter-item"
              onClick={this.handleRecentlyAddedClick}
            >
              <View style={{ color: isNewest ? '#ff5d8c' : null }}>
                最近上新
              </View>
            </View>
          </View>
        </View>
        <View
          id="search-list"
          style={{
            top: `${TopHeight}px`,
            height: `${searchListHeight - TopHeight}px`,
            display: isShow ? 'none' : 'block',
          }}
        >
          {searchList.map((item) => (
            <View
              className="search-list-item"
              key={item.itemId}
              onClick={this.handleSearchItemClick.bind(this, item.itemName)}
              style={{
                display: '-webkit-box',
                '-webkit-box-orient': 'vertical',
                '-webkit-line-clamp': 1,
                overflow: 'hidden',
              }}
            >
              {item.itemName}
            </View>
          ))}
        </View>
        <View id="search-page" style={{ paddingTop: `${TopHeight}px` }}>
          <View className="search-goods">
            {goodsList.length === 0 ? (
              <CommonEmpty content="暂无商品" />
            ) : (
              <GoodsList goodsList={goodsList} hasTitle={true} />
            )}
          </View>
        </View>

        <View
          id="history-record-wrap"
          style={{
            top: `${TopHeight}px`,
            height: `${searchListHeight - TopHeight}px`,
            display: visible ? 'none' : 'block',
          }}
        >
          {/* 搜索历史框 */}
          {searchHistory.length === 0 ? null : (
            <View className="history-content">
              <View className="history-line">
                <Text>搜索历史</Text>
                <img
                  onClick={this.handleDeleteSearchHistory}
                  src={require('../../static/searchpage/delete.png')}
                />
              </View>
              <View className="history-list">
                {searchHistory.map((item, index) => (
                  <View
                    key={index + 1}
                    onClick={this.handleSearchHistoryItem.bind(this, item)}
                    className="history-list-item"
                    style={{ '-webkit-box-orient': 'vertical' }}
                  >
                    {item}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 热搜词 */}
          <View className="hot-search-words">
            <View className="hot-title">热搜词</View>
            <View className="hot-list">
              {hotWords.map((item) => (
                <View
                  className="hot-list-item"
                  key={item.id}
                  onClick={this.handleHotItemClick.bind(this, item.title)}
                >
                  {item.title}
                </View>
              ))}
            </View>
          </View>
          {/* 搜索店铺 */}
          <View className="search-shop">
            <Navigation url="/pages/searchshop/searchshop">
              <View className="search-shop-text">切换店铺搜索</View>
            </Navigation>
          </View>
        </View>
      </View>
    );
  }
}

export default SearchPage;
