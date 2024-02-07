import { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box } from '@mui/material';
import geoJson from '../assets/1twCounty2010.geo.json';
// import twTownJson from '../assets/twTown1982.geo.json';
// import twTownJson from '../assets/15twTown1982.geo.json';
import { geoCoordMap, nameTO, countyArr }  from '../assets/TWgeoCoordMap.js'
import 'echarts-gl';
import { useRequest } from 'ahooks';
import * as mapJson from '../assets/index.js';
import * as echarts from 'echarts/core';
import { cloneDeep, difference } from 'lodash-es'

let defaultBlue = '#3160B5';
let darkBlue = '#25ade6';

const data = [
  { name: '新竹市', project: '桃園市觀音區草漯第一、三、六整體開發單元市地重劃統包工程', place: '桃園市觀音區中山路二段' , type: '商業建築工程',aqi: 151, pm25: 123.2, pm10: 300, ppm: 0.096  }, 
  { name: '高雄市', project: '桃園市觀音區草漯第一、三、六整體開發單元市地重劃統包工程', place: '桃園市觀音區中山路二段' , type: '商業建築工程',aqi: 151, pm25: 123.2, pm10: 300, ppm: 0.096  }, 
]

const dataY = [
  { name: '彰化縣', project: '桃園市觀音區草漯第一、三、六整體開發單元市地重劃統包工程', place: '桃園市觀音區中山路二段' , type: '商業建築工程',aqi: 151, pm25: 123.2, pm10: 300, ppm: 0.096  }, 
  { name: '新北市', project: '桃園市觀音區草漯第一、三、六整體開發單元市地重劃統包工程', place: '桃園市觀音區中山路二段' , type: '商業建築工程',aqi: 151, pm25: 123.2, pm10: 300, ppm: 0.096  }, 
]

const dataG = [
  { name: '台東縣', project: '桃園市觀音區草漯第一、三、六整體開發單元市地重劃統包工程', place: '桃園市觀音區中山路二段' , type: '商業建築工程',aqi: 151, pm25: 123.2, pm10: 300, ppm: 0.096  }, 
  { name: '南投縣', project: '桃園市觀音區草漯第一、三、六整體開發單元市地重劃統包工程', place: '桃園市觀音區中山路二段' , type: '商業建築工程',aqi: 151, pm25: 123.2, pm10: 300, ppm: 0.096  }, 
]

const convertData = function (data) {
  let res = [];
  for (let i = 0; i < data.length; i++) {
    const geoCoord = geoCoordMap[data[i].name];
    if (geoCoord) {
      res.push({
        name: data[i].project,
        value: 
          geoCoord.concat(Object.entries(data[i]).map(([key, value]) => value)),
      });
    }
  }
  console.log("👷 ~ convertData ~ res:", res)
  return res;
};


// 地圖配置
let options = {
  // geo3D: {
  //   map: 'tw',
  //   show: true,
  //   boxDepth: 80,
  //   itemStyle: {
  //     borderColor: '#3160B5',
  //     areaColor: 'rgba(1, 18, 43, 0.8)',
  //     shadowColor: 'rgba(0, 0, 0, 1)', // 阴影颜色
  //     borderWidth: 2,
  //   },
  //   // 選中狀態
  //   emphasis: {
  //     label: {
  //       show: true,
  //       color: '#fff'
  //     },
  //     itemStyle: {
  //       focus: 'self',
  //       areaColor: '#ffffff',
  //       shadowColor: 'rgba(0, 0, 0, 0.5)',
  //       shadowBlur: 0,
  //       shadowOffsetX: 0,
  //       shadowOffsetY: 2
  //     }
  //   }
  // },
  tooltip: {
    trigger: 'item',
    borderWidth: 1,
  },
  geo: {
    tooltip: {
      show: true
    },
    map: 'tw',
    // boxDepth: 350,
    // silent: false, // 不會回應和觸發滑鼠事件
    roam: true, // 放大地圖
    zoom: 1.2, // 放大倍數
    selectedMode: 'multiple',
    // layoutCenter: ['50%', '53%'],
    // layoutSize: '60%',
    // 未選中狀態
    label: {
      show: true,
      color: '#bbb',
      fontFamily: '微軟雅黑',
    },
    itemStyle: {
      areaColor: 'rgba(1, 18, 43, 0.8)',
      borderColor: '#9499a1',
      borderWidth: 1,
    },
    
    // hover 狀態
    emphasis: {
      label: {
        show: true,
        color: '#bbb',
      },
      itemStyle: {
        // focus: 'self',
        borderColor: '#25ade6',
        borderWidth: 2,
        color: undefined,
        // areaColor: 'rgba(49, 96, 181, 0.9)',
        // shadowColor: 'rgba(49, 50, 181, 0.9)',
        // shadowBlur: 10,
        // shadowOffsetX: -3,
        // shadowOffsetY: -5,
      },
    },
    // 選中狀態
    select: {
      label: {
        show: true,
        color: "#bbb"
      },
      itemStyle: {
        color: undefined,
        shadowColor: '#1e3c70',
        shadowBlur: 40,
        borderColor: '#8c9df2',
        borderWidth: 1,
        // shadowOffsetX: 0,
        // shadowOffsetY: 0,
      }
    }
  },
  // dataset: {
  //   // source: convertData(data)
  //   source: data
  // },
  series: [
    {
      // name: 'red',
      type: 'scatter',
      coordinateSystem: 'geo',
      geoIndex: 0,
      // 標示點大小
      // symbolSize: function (params) {
      //   return (params[2] / 100) * 15 + 5;
      // },
      // hoverAnimation: true,
      // 點旁邊資訊
      label: {
        formatter: '{b}',
        position: 'right',
        show: false
      },
      // emphasis: {
      //   label: {
      //     show: true
      //   }
      // },
      itemStyle: {
        color: '#b02a02',
        shadowBlur: 10,
        shadowColor: '#333'
      },
      encode: {
        tooltip: [4, 5, 6, 7, 8, 9]
      },
      dimensions: [
        null,
        null,
        null,
        null,
        '工程地點',
        '工程類型',
        'AQI',
        'PM2.5(μg/m3)',
        'PM10(μg/m3)',
        'O3(ppm)',
      ],
      // data: data,
      data: convertData(data)
    },
    {
      // name: 'yellow',
      type: 'scatter',
      coordinateSystem: 'geo',
      geoIndex: 0,
      itemStyle: {
        color: '#F9CE16',
        shadowBlur: 10,
        shadowColor: '#333'
      },
      encode: {
        tooltip: [4, 5, 6, 7, 8, 9]
      },
      dimensions: [
        null,
        null,
        null,
        null,
        '工程地點',
        '工程類型',
        'AQI',
        'PM2.5(μg/m3)',
        'PM10(μg/m3)',
        'O3(ppm)',
      ],
      data: convertData(dataY)
    },
    {
      // name: 'green',
      type: 'scatter',
      coordinateSystem: 'geo',
      geoIndex: 0,
      itemStyle: {
        color: '#00BE78',
        shadowBlur: 10,
        shadowColor: '#333'
      },
      encode: {
        tooltip: [4, 5, 6, 7, 8, 9]
      },
      dimensions: [
        null,
        null,
        null,
        null,
        '工程地點',
        '工程類型',
        'AQI',
        'PM2.5(μg/m3)',
        'PM10(μg/m3)',
        'O3(ppm)',
      ],
      data: convertData(dataG)
    },
    // {
    //       name: 'tw',
    //       type: 'map3D',
    //       map: 'tw',  //必須和上面註冊的地圖名稱一致，詳細可以看ECharts的GL設定說明
    //       boxDepth: 170, //地圖傾斜度
    //       regionHeight: 1, //地圖厚度
    //       light: {
    //         main: {
    //           intensity: 1.5
    //         }
    //       },
    //       label: {
    //         show: true, //是否顯示城市< a i=5> textStyle: {
    //         color: "#333333", //文字顏色
    //         fontSize: 16, //文字大小
    //         fontFamily: '微軟雅黑',
    //         backgroundColor: "rgba(0,0,0,0)", //透明度0清空文字背景
    //       },
    //       itemStyle: {
    //         borderColor: '#3160B5',
    //         areaColor: 'rgba(1, 18, 43, 0.8)',
    //         shadowColor: 'rgba(0, 0, 0, 1)', // 阴影颜色
    //         borderWidth: 2,
    //       },
    //       emphasis: {
    //         label: {
    //           show: true,
    //           color: '#4D5560',
    //           fontFamily: '微軟雅黑',
    //         },
    //         itemStyle: {
    //           // focus: 'self',
    //           areaColor: 'rgba(49, 96, 181, 0.9)',
    //           shadowColor: 'rgba(0, 0, 0, 0.5)',
    //           shadowBlur: 0,
    //           shadowOffsetX: 0,
    //           shadowOffsetY: -5
    //         }
    //       },
    //       groundplane: {
    //         show: false,
    //       },
    //       viewControl: {
    //         distance: 30, // 地圖視角 控制初始大小
    //         rotateSensitivity: 1, // 旋轉
    //         zoomSensitivity: 1, // 縮放
    //       },
    // }
  ],
};
echarts.registerMap('tw', geoJson, {});

 //详细地图，线条颜色暗一些

const EchartMap = () => {
  const instance = useRef(null);
  const [mapData, setMapData] = useState({
    option: options,
    detail: false, // 是否使用详细地图
    curMap: geoJson,
  });

  const preventEventsHandler = (params) => {
    console.log("👷 ~ preventEventsHandler ~ params:", params)

    // const { option } = mapData;
    // const mapName = nameTO[params.name];
    // // const dataLen = option.series[0].data.length;
    // // console.log("👷 ~ onselect ~ dataLen:", dataLen)
    // if (params && params.name && mapName) {

    //   // option.geo.zoom = 4;
    //   option.geo.center = geoCoordMap[params.name];
    //   setMapData({
    //     detail: true,
    //     option,
    //     // curMap: twTownJson,
    //     curMap: mapJson[mapName],
    //     // Taitung
    //   });
    //   // 切换详细地图
    //   drawMap(mapJson[mapName]);

    //   setTimeout(() => {
        
    //     const echartInstance =  instance.current.getEchartsInstance()
    //     console.log("👷 ~ setTimeout ~ echartInstance:", echartInstance)

    //     echartInstance.dispatchAction({
    //       type: 'geounselected',
    //       seriesIndex: 0,
    //       dataIndex: 0
    //     });
    //   }, 500);
    // }
  };

  const drawMap = (json) => {
    const { option } = mapData;
    const echartInstance = instance.current.getEchartsInstance();
    // let option = echartInstance.getOption()

    echarts.registerMap('tw', json, {});
    echartInstance.setOption(option, true);
  };
  /*
    获取zoom和center
    zoom:地图缩放值，
    center:中心位置，地图拖动之后会改变
  */
  const getZoom = () => {
    if (instance) {
      const echartInstance = instance.current.getEchartsInstance();
      let { zoom, center } = echartInstance.getOption().geo[0]; //取得option
      return { zoom, center };
    }
    return;
  };

  /*
    保存缩放值和中心位置，
  */
  const saveZoom = () => {
    let { zoom, center } = getZoom();
    const { option } = mapData;
    option.geo.zoom = zoom;
    option.geo.center = center;
    setMapData({ ...mapData, option });
  };

  // 地圖縮放
  const onDatazoom = (params) => {
    const { detail, option } = mapData;
    const threshold = 2;
    const { zoom, center } = getZoom();
    // 平移
    if ([null, undefined].includes(params?.zoom)) {
      run();
    }
    if (detail && zoom < threshold) {
      console.log('👷 ~ onDatazoom ~ 切换默认地图:');
    // 切换默认地图
      option.geo.itemStyle.borderColor = '#9499a1';
      // option.geo.itemStyle.shadowColor = '#9499a1';
      option.geo.center = center;
      option.geo.zoom = zoom;
      // option.geo.label = {
      //   show: true,
      //   color: '#bbb',
      //   fontFamily: '微軟雅黑',
      // };
      setMapData({
        detail: false,
        option,
        curMap: geoJson,
      });
      drawMap(geoJson);
    }
  };

  const onselect = (params) => {
    console.log("👷 ~ onselect ~ params:", params)
    // const cpParams = cloneDeep(params)

    const { option } = mapData;

    const mapName = nameTO[params.name];
    console.log("👷 ~ onselect ~ mapName:", mapName)


    if (params && params.name && mapName) {
      option.geo.zoom = 3.5;
      // 增加地图傾斜角度
      // option.geo.boxDepth = 145;
      option.geo.center = geoCoordMap[params.name];
      setMapData({
        detail: true,
        option,
        curMap: mapJson[mapName],
      });
      // 切换详细地图
      drawMap(mapJson[mapName]);
      // 高亮当前图形
      setTimeout(() => {
        const echartInstance =  instance.current.getEchartsInstance()
        let option = echartInstance.getOption()
        // console.log("👷 ~ setTimeout ~ option:", option)
        const regions = option.geo[0].regions.map(i => i.name)
        const result = difference(regions, countyArr);
        // console.log("👷 ~ setTimeout ~ result:", result)

        result?.forEach(i => {
          echartInstance.dispatchAction({
            type: 'geoSelect', // geoSelect
            geoIndex: 0,
            name: i
          });
        })
      }, 100);
    }
  }

  const onEvents = {
    click: preventEventsHandler,
    geoselectchanged: onselect,
    georoam: onDatazoom,
    // "mouseover": mouseoverHandler,
  };

  // 節流
  const { run } = useRequest(saveZoom, {
    throttleWait: 800,
    throttleLeading: false,
    manual: true,
  });

  return (
    <Box component="main" sx={{ width: '100%', p: 3 }}>
      <ReactECharts
        ref={instance}
        option={options}
        style={{ width: '100vw', height: '100vh' }}
        onEvents={onEvents}
      />
    </Box>
  );
};

export default EchartMap;
