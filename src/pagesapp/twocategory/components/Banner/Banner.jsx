import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import Swiper from 'swiper';
import 'swiper/css/swiper.css';
import './Banner.less';
import '../../../../common/globalstyle.less';
import { postRequest } from '../../../../common/util/request';
import servicePath from '../../../../common/util/api/apiUrl';

// 品牌代购
class Banner extends Component {
  state = {
    rotationImg: [],
    status: '',
  };

  // banner点击事件
  handleBnnaerClick = () => {};

  // 分类点击事件
  handleCategoryClick = (item) => {
    Taro.navigateTo({
      url: `/pagesapp/threecategory/threecategory?source=app&title=${item.categoryName}&categoryId=${item.categoryId}`,
    });
  };

  fCheckUrl(str) {
    var oRegUrl = new RegExp();
    oRegUrl.compile('^[A-Za-z]+://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&?/.=]+$');
    if (!oRegUrl.test(str)) {
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    if (this.props.categoryId !== prevProps.categoryId) {
      this.swiper1.destroy(false);
      this.getSencondCategory();
    }
  }

  getSencondCategory() {
    postRequest(servicePath.getSencondCategory, {
      categoryId: this.props.categoryId,
      source: 40,
    })
      .then((res) => {
        console.log('获取轮播图数据成功', res.data);
        if (res.data.code === 0) {
          const { configImgVOList } = res.data.data;
          this.setState(
            {
              rotationImg: configImgVOList,
            },
            () => {
              this.initSwiper();
            }
          );
        }
      })
      .catch((err) => {
        console.log('获取轮播图数据异常', err);
      });
  }

  initSwiper() {
    this.swiper1 = new Swiper('.swiper-banner', {
      on: {
        click: (e) => {
          let query = e.target.getAttribute('data-jumpurl');
          let index = query.indexOf('=');
          if (!this.fCheckUrl(query)) {
            if (index !== -1) {
              if (window.sessionStorage.getItem('system') === 'android') {
                click.toAppPage(query);
              } else {
                window.webkit.messageHandlers.toAppPage.postMessage({
                  path: query,
                });
              }
            }
          } else {
            Taro.navigateTo({
              url: query,
            });
          }
        },
      },
      loop: true,
      preventLinksPropagation: false,
      autoplay: {
        disableOnInteraction: false,
      },
      observer: true, //修改swiper自己或子元素时，自动初始化swiper    重要
      observeParents: true, //修改swiper的父元素时，自动初始化swiper  重要
    });
    this.swiper1.init();
  }

  componentDidMount() {
    this.getSencondCategory();
  }

  componentWillUnmount() {}

  componentDidShow() {}

  render() {
    const { twoCategoryImage, bannerImg } = this.props;
    const { rotationImg } = this.state;
    return (
      <View className="banner">
        <View className="banner-box">
          <img className="banner-img" src={bannerImg} />
        </View>
        <View className="three-categroy-wrapp">
          <View className="three-categroy-list">
            {twoCategoryImage.map((item) => (
              <View
                className="category-item"
                key={item.categoryId}
                onClick={this.handleCategoryClick.bind(this, item)}
              >
                <img className="category-icon" src={item.icon} alt="" />
                <View className="category-name">{item.categoryName}</View>
              </View>
            ))}
          </View>
        </View>
        <View className="slogan">
          <img
            className="slogan-img"
            src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/banner-title.jpg"
            alt=""
          />
        </View>
        <View className="swiper-box">
          <View className="swiper-banner">
            <View className="swiper-wrapper">
              {rotationImg.map((item) => (
                <View className="swiper-slide" key={item.id}>
                  <img
                    className="swiper-item-img"
                    data-jumpUrl={item.jumpUrl}
                    src={item.imgUrl}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default Banner;
