import Taro from '@tarojs/taro';

// 携带token的请求
export function CarryTokenRequest(url, parmas) {
  return new Promise((resolve, rejece) => {
    Taro.request({
      url: url,
      method: "POST",
      data: JSON.stringify(parmas),
      credentials: "include",
      header: {
        'Content-Type': 'application/json',
        'JWT-Token': window.sessionStorage.getItem("JWT-Token")
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else {
          rejece(res);
        }
      },
      fail: (err) => {
        rejece(err);
        if (err.status === 403) {
          let index = window.location.hash.indexOf('?');
          const paths = ["", "#/pages/index/index"];
          if (paths.includes(window.location.hash) ||  window.location.hash.slice(0, index) === '#/pages/goodsdetails/goodsdetails') {
            console.log("进入");
          } else {
            Taro.showToast({
              title: '暂未登录',
              icon: 'none',
              duration: 1000,
              success: () => {
                window.sessionStorage.removeItem('JWT-Token');
                window.sessionStorage.removeItem('userinfo');
                setTimeout(() => {
                  Taro.navigateTo({
                    url: '/pages/login/login'
                  });
                }, 1000);
              }
            });
          }
        } else {
          Taro.showToast({
            title: '网络连接失败',
            icon: 'none',
            duration: 1000,
            success: () => {
            }
          })
        }
      }
    })
  })
};

// post请求
export function postRequest(url, parmas) {
  return new Promise((resolve, rejece) => {
    Taro.request({
      url: url,
      method: "POST",
      data: JSON.stringify(parmas),
      header: {
        'Content-Type': 'application/json; charset=utf-8',
        'JWT-Token': Taro.getStorageSync("JWT-Token")
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else {
          rejece(res);
        }
      }
    })
  })
}