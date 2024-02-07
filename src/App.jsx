import { useEffect, useState, useRef } from 'react';
import { taoyuanDistricts, replacesArr, testData }  from './assets/TWgeoCoordMap.js'
import * as d3 from "d3";
import { useDispatch, useSelector } from 'react-redux';
import { toggleCarousel } from '@/redux/carouselSlice';
import './App.css'

import twCounty from './assets/twCounty.json';
import twTown from './assets/towntopo.json';


const mapRatio = 1.38
const margin = {
  top: 5,
  bottom: 5,
  left: 5,
  right: 5
}

let width = 660;
let height = window.innerHeight;
const areaColor = '#030d30c2';

// 調整顏色亮度
function lightenColor(hexColor, factor) {
  return '#' + [1, 2, 3]
      .map(channel => Math.min(parseInt(hexColor.slice(2 * (channel - 1) + 1, 2 * channel + 1), 16) + factor, 255))
      .map(val => val.toString(16).padStart(2, '0'))
      .join('');
}
// 鄉鎮地圖層
let townPaths = null;
let townLabels = null;
let svg = null;
let isCarouselOn = null; // 提高 redux值
let intervalId = null;
let currentIndex = 0;
let currentTown = ''
let previousTown = ''

const D3Map = () => {
  const dispatch = useDispatch();
  isCarouselOn = useSelector(state => state.carousel.isCarouselOn);
  intervalId = useRef(null);
    const renderMap = () => {
        width = parseInt(d3.select('.viz').style('width'))
        height = width * mapRatio
        console.log("👷 ~ renderMap ~ height:", height, 'width', width)
        
    let active = d3.select(null);

    width = width - margin.left - margin.right

    // geoAlbers
    // Creating projection, it's best to use 'geoAlbersUsa' projection
    // if you're rendering USA map and for other maps use 'geoMercator'.
    const projection = d3.geoMercator()
    .center([121.15, 23.65])
    .scale(13000) // 比例尺
    .translate([width / 2, height / 2]);
    
    // 根據上面建立的投影建立路徑產生器
    const pathGenerator = d3.geoPath()
      .projection(projection);
    
    svg = d3.select('.viz').append('svg')
      .attr("title", "Map")
      .attr('class', 'center-container')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
      .attr("style", "max-width: 100%; height: auto;")

    
    svg.append('rect')
      .attr('class', 'background center-container')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
    
    // 建立容器
    const g = svg.append("g")
      .attr('class', 'center-container center-items us-state')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

      // 訊息框
    d3.select('body')
      .append('div')
      .attr('id', 'tooltip')
      .attr('style', 'position: absolute; opacity: 0; z-index: 3');

    // 地圖漸層
    svg.append("defs").append("radialGradient")
      .attr("id", "gradient")
      .attr("spreadMethod", "repeat")
      .attr("r", "10%")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "transparent" },
        { offset: "60%", color: "rgba(0, 43, 91, 0.5)"},
        { offset: "100%", color: "rgba(0, 43, 91, 0.9)"},
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

      // 創建一個漸層
      svg.append("defs").append("linearGradient")
      .attr("id", "path-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#33599E" },
        { offset: "100%", color: "#01122B" },
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color)
      .attr("stdDeviation", 50);

    // 標記點漸層
    function createRadialGradient(svg, inpuColor) {
      // 在SVG中添加漸變
      const gradientId = "gradient" + Math.floor(Math.random() * 100000);
      svg.append("defs").append("radialGradient")
        .attr("id", gradientId)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "40%")
      //   .attr("fx", "50%")
      //   .attr("fy", "80%")
        .selectAll("stop")
        .data([
          { offset: "2%", color: lightenColor(inpuColor, 80) },
          { offset: "100%", color: inpuColor },
        ])
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
      return gradientId;
    }
    
    // 定義鄉鎮漸變色塊
    const townGradient = svg.append("defs")
    .append("radialGradient")
    .attr("id", "townGradient")
    .attr("cx", "50%")
    .attr("cy", "80%")
    .attr("r", "110%")
    .attr("fx", "80%")
    .attr("fy", "100%")
    .selectAll("stop")
    .data([
      { offset: "10%", color: "rgba(14, 253, 221, 0)" },
      { offset: "100%", color: "rgba(14, 253, 221, 0.7)" },
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

    // 縣市漸層背景
    g.append('g')
      .attr("id", "county-stroke")
      .selectAll('path')
      .data(twCounty.features)
      .enter().append('path')
      .attr("id", feature => {
        return feature.properties.COUNTYNAME
      })
      .attr("d", pathGenerator)
      .attr('stroke', '#33599E' )
      .attr('stroke-width', 5 )
      .style("filter", "url(#blur-filter)")
      // .attr('stroke', 'url(#path-gradient)' )

      // 創建高斯模糊濾鏡
      svg.append("defs")
      .append("filter")
      .attr("id", "blur-filter")
      .append("feGaussianBlur")
      .attr("in", "SourceGraphic") // 濾鏡應用在圖形上
      .attr("stdDeviation", 7); // 調整模糊度

    // Creating town layer 建立鄉鎮圖層
    townPaths = g.append("g")
      .attr("id", "town")
      .selectAll("path")
      .data(twTown.features) // countyData twTown
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("key", feature => {
        return feature.properties.TOWNNAME;
      })
      .attr("class", "town-boundary")
      // .attr("fill", "url(#gradient)")
      .attr("fill", "transparent")
      .on("click", townClick)
      .on("mouseover", pauseInterval)
      .on("mouseleave", startInterval);

    // 在每個區域群組中添加文字
    townLabels =  g.append("g")
      .attr("id", "town-labels")
      .selectAll("text")
      .data(twTown.features)
      .enter()
      .append("text")
      .attr("class", "town-label")
      .attr("fill", "#4D5560")
      .attr("font-size", 4)
      .attr("font-weight", "bold")
      .attr("transform", (d) => { return "translate(" + pathGenerator.centroid(d) + ")"; })
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("key", feature => {
        return feature.properties.TOWNNAME;
      })
      .text((d) => {
          return d.properties.TOWNNAME;
      })
      .style("display", 'none');
    
    // TW圖層
    const countyPaths = g.append("g")
      .attr("id", "counts")
      .selectAll("path")
      .data(twCounty.features)
      .enter()
      .append("path")
      .attr("key", feature => {
        return feature.properties.COUNTYNAME
      })
      .attr("d", pathGenerator)
      .attr("class", "county")
      .attr("fill", areaColor)
      .on("click", handleZoom)
      // .on("mouseover", pauseInterval)
      // .on("mouseout", startInterval);
    
    // 在每個區域群組中添加文字
    const countyLabels =  g.append("g")
      .attr("id", "county-labels")
      .selectAll("text")
      .data(twCounty.features)
      .enter()
      .append("text")
      .attr("class", "county-label")
      .attr("fill", "#4D5560")
      .attr("font-size", 12)
      .attr("transform", (d) => {
        return "translate(" + pathGenerator.centroid(d) + ")";
        })
      .attr("text-anchor", "middle")
      .text((d) => {
          return d.properties.COUNTYNAME;
      });

    // 依據replacesArr進行位置微調
    replacesArr.forEach((replace) => {
        const label = countyLabels.filter((d) => d.properties.COUNTYNAME === replace.title);
            label.attr(replace.set, replace.offset);
    });

      // 標記點
      g.selectAll("circle")
      .data(testData)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return projection([d.cx, d.cy])[0];
      })
      .attr("cy", function(d) {
        return projection([d.cx, d.cy])[1];
      })
      .attr("fill", (d) => {
        const gradientId = createRadialGradient(svg, d.color);
        return `url(#${gradientId})`
      })
      .attr("r", 2)
      .on("mouseover", function(event, d) {
        // 加入白色邊框
        d3.select(this)
        .attr("stroke", "white")
        .attr("stroke-width", 0.15)

        d3.select('#tooltip').style('opacity', 1).html(
          '<div class="custom_tooltip">' +
          `<div class="tooltip_title">${d.title}</div>` +
          '工程地點： ' + d.place +
          '<br>工程類型： ' + d.type +
          '<br>AQI： ' + d.AQI +
          '<br>PM2.5(μg/m3)： ' + d.PM25 +
          '<br>PM10(μg/m3) ： ' + d.PM10 +
          '<br>O3(ppm) ： ' + d.O3 +
          '<br>cx ： ' + d.cx +
          '<br>cy ： ' + d.cy +
          '</div>')

        d3.select('.custom_tooltip')  // 選擇 .custom_tooltip
          .style('background', `${d.color}`).style('opacity', 0.9)

        })
        .on("mousemove", function(event, d) {
            
        const tooltip = d3.select('.custom_tooltip');
        const tooltipWidth = parseInt(tooltip.style('width'));
        const tooltipHeight = parseInt(tooltip.style('height'));

        let leftPosition = event.pageX + 10;
        let topPosition = event.pageY + 10;

        // 檢查邊界
        leftPosition =
            (leftPosition + tooltipWidth > window.innerWidth) 
                ? (event.pageX - tooltipWidth - 10) : leftPosition;
        topPosition =
            (topPosition + tooltipHeight > window.innerHeight)
                ? (event.pageY - tooltipHeight - 10) : topPosition;
        leftPosition = (leftPosition < 0) ? (event.pageX + 10) : leftPosition;
        topPosition = (topPosition < 0) ? (event.pageY + 10) : topPosition;

        d3.select('#tooltip')
        .style('left', `${leftPosition}px`)
        .style('top', `${topPosition}px`)
      })
      .on("mouseout", function(d) {
        d3.select(this).attr("stroke", null); // 移除邊框
        d3.select('#tooltip').style('opacity', 0)
      })
    
    // * 創建一個模糊效果的filter
    function blurFilterMethod(svg, scale) {
      const filterId = "blurFilter";
      let blurRatio = scale > 9 ? 0.2 : 0.4
      // 檢查是否已存在相同 ID 的濾鏡
      if (svg) {
        const existingFilter = svg.select(`#${filterId}`);
        if (!existingFilter.empty()) {
          // 如果存在，更新現有濾鏡的 stdDeviation
          existingFilter.select("feGaussianBlur")
            .attr("stdDeviation", blurRatio);
          // 返回現有的濾鏡ID
          return `url(#${filterId})`;
        }
        // 如果不存在，創建新的濾鏡
        svg.append("defs")
          .append("filter")
          .attr("id", filterId)
          .append("feGaussianBlur")
          .attr("stdDeviation", blurRatio);
        // 返回新建的濾鏡ID
      }
      return `url(#${filterId})`;
    }
    
    let selectedCounty = null; // 目前在縣市

    function handleZoom(event, d) {
      event.stopPropagation();
    //   console.log("👷 ~ handleZoom ~ stateFeature:", event, d)
      selectedCounty = d.properties.name;
      // 取消之前選中的縣市的 stroke
      if (active.node() !== null) {
        active.classed("active", false)
          .attr("stroke", null)
          .attr("stroke-width", null)
          .style("filter", null);
      }
      let bounds = pathGenerator.bounds(d);
      // console.log("👷 ~ zoomIn ~ bounds0:", bounds0)
      // Zoom In calculations
      let dx = bounds[1][0] - bounds[0][0];
      let dy = bounds[1][1] - bounds[0][1];
      let x = (bounds[0][0] + bounds[1][0]) / 2;
      let y = (bounds[0][1] + bounds[1][1]) / 2;
      
      let scale = .7 / Math.max(dx / width, dy / height);
      const blurFilter = blurFilterMethod(svg, scale); // 傳入拉近比例
    
      //   .raise(); // 將選中的縣市移到最上層
      active.classed("active", false);
      active = d3.select(this)
        .classed("active", true)     
        .attr("stroke", '#8ED5FF')
        .attr("stroke-width",scale > 10 ? 0.3 : 0.5)
        .style("filter", blurFilter)
        .raise(); // 將選中的縣市移到最上層
      
      // 隱藏其他縣市邊框
      d3.selectAll('#county-stroke path')
        .style('display', feature =>
          feature.properties.COUNTYNAME === d.properties.COUNTYNAME ? 'block' : 'none');

      // 隱藏其他區塊的鄉鎮
      d3.selectAll(".town-boundary")
        .attr("stroke-width", 1)
        .style("display", function(feature) {
          const displayValue = feature.properties.COUNTYNAME === d.properties.COUNTYNAME ? "block" : "none";
          return displayValue;
        });
      zoomIn(d, {scale, x, y})
    }

    function zoomIn(d, { scale, x, y }) {
      let translate = [width / 2 - scale * x, height / 2 - scale * y];
      // console.log("👷 ~ zoomIn ~ scale:", scale, translate)
      g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform",
            `translate(${translate[0] + 5 * scale}, ${translate[1]})
            scale(${scale})`);

      // 依據縣市是否是目前縮小的縣市來判斷是否顯示
      countyLabels.transition()
        .duration(750)
        .style("font-size", 10 / scale * 1.8 + "px")
        .style("display", function(d) {
          return d.properties.name === selectedCounty ? "none" : "block";
        })
        
      // 依據鄉鎮是否是目前縮小的縣市來判斷是否顯示
      townLabels.transition()
      .duration(750)
      .style("font-size", 10 / scale * 1.2 + "px")
      .style("display", (d) => {
        return d.properties.COUNTYNAME === selectedCounty ? "block" : "none"
      })
    }

    function resetZoom() {
      // Remove the active class so that state color will be restored and conuties will be hidden again.
      // 取消之前選中的縣市的 stroke
      pauseInterval();
      console.log("👷 ~ 停止輪播", )

      active.classed("active", false)
        .attr("stroke", null)
        .attr("stroke-width", null)
        .style("filter", null);
      
      active = d3.select(null);
      selectedCounty = null;
      
      // 恢復全部縣市名稱
      countyLabels.transition()
      .duration(750)
      .style("font-size", "12px")
      .style("display", "block")
      .attr("transform", (d) => { return "translate(" + pathGenerator.centroid(d) + ")"; })
    
      // 鄉鎮名稱隱藏
      townLabels.transition()
      .duration(750)
      .style("display", "none")

      // Resetting the css using D3
      g.transition()
        .delay(100)
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    }
}

  // * 輪播功能
  function switchCounty() {   
    const mapContainer = d3.select('.viz').select('svg')
    // 移除上一個鄉鎮的 hover 效果
    resetTownPath()
    // 取得要切換的鄉鎮名稱
    currentIndex = (currentIndex + 1) % taoyuanDistricts.length;
    currentTown = taoyuanDistricts[currentIndex];
    // previousTown = currentTown
    const townContainer = mapContainer.select('#town')
    const cityKey = townContainer.select(`path[key=${currentTown}]`);
    // 做相應的操作，例如更新地圖、顯示資訊等
    // 直接呼叫 handleMouseOverTown 函式
    // handleMouseOverTown(cityKey.node(), d3.select(cityKey.node()).datum());
    handleMouseOverTown.call(cityKey.node(), cityKey.node().__data__);
  }

  // * 移除上一個鄉鎮的 hover 效果
  function resetTownPath(clickType = false) {
    // console.log("👷 ~ 移除上一個鄉鎮的 hover 效果 ~ previousTown:", previousTown, taoyuanDistricts[currentIndex], currentIndex)

    const mapContainer = d3.select('.viz').select('svg')
    // console.log("👷 ~ resetTownPath ~ currentIndex:", currentIndex)
    if (currentIndex >= 0) {
      previousTown = clickType ? previousTown : taoyuanDistricts[currentIndex];
      const previousTownPath = mapContainer.select(`#town path[key=${previousTown}]`);
      previousTownPath.dispatch('mouseout', handleMouseOutTown);
    }
  }
  function handleMouseOverTown() {
    // 調整路徑元素的樣式
    d3.select(this)
    .attr("fill", "transparent")
    .transition() // 啟用過渡效果
    .duration(700) // 持續時間
    // .style("fill", "url(#townGradient)")
    .style("fill", "rgba(14, 253, 221, 0.3)")
    .attr("stroke", "#59F8CB")
    .attr("transform", "translate(0.5, -1)")
      
    
    // 隱藏區域的文字元素
    const textElement = d3.select('.viz').select('svg')
      .select(`#town-labels`).select(`text[key=${currentTown}]`);
    // 添加淡出效果
    textElement.transition()
    .duration(600)
    .style("opacity", 0)
    .on("end", function() {
      // 隱藏文字元素
      d3.select(this).style("display", "none");
    });
  }
  function handleMouseOutTown() {
    d3.select(this)
      .transition() // 啟用過渡效果
      .duration(700) // 持續時間
      // .style("fill", "url(#gradient)")
      .style("fill", "transparent")
      .attr("stroke", "none")
      .attr("transform", "translate(0, 0)")

    // 顯示文字元素
    const textElement = d3.select('.viz').select('svg')
    .select(`#town-labels`).select(`text[key=${previousTown}`);
    // 添加淡出效果
    textElement.transition()
    .duration(200)
    .style("opacity", 1)
    .on("end", function() {
      // 隱藏文字元素
      d3.select(this).style("display", "block");
    });
  }

  function townClick(event, d) {
    // event.stopPropagation();
    console.log("111 townClick ~ d.properties.TOWNNAME :",d.properties.TOWNNAME,'previousTown',previousTown, d.properties.TOWNNAME === currentTown)
    if( d.properties.TOWNNAME === currentTown) return
    
    previousTown = currentTown
    resetTownPath(true)
    // 隱藏區域的文字元素
    d3.select('.viz').select('svg')
      .select(`#town-labels`).select(`text[key=${d.properties.TOWNNAME}]`)
      .style("opacity", 0)
      .on("end", function() {
        // 隱藏文字元素
        d3.select(this).style("display", "none");
      });
    
    d3.select(this)
    .style("fill", "rgba(14, 253, 221, 0.6)")
    // .style("fill", "url(#townGradient)")  // 使用漸變色塊
    .attr("stroke", "#59F8CB")
    .attr("transform", "translate(0.5, -1)")

    // dispatch(toggleCarousel(false)); // 修改redux狀態
    currentTown = d.properties.TOWNNAME;
    // console.log("👷 ~ townClick ~ d.properties.TOWNNAME:",  currentTown)
  }
  const isFirstRun = useRef(true);
  // const intervalId = useRef(null);

  // * 創建定時器
  function startInterval() {
    // console.log("👷 ~ startInterval ~ intervalId.current:",currentTown, intervalId.current)
    if(intervalId.current) return
    if (isCarouselOn) {
      intervalId.current = setInterval(switchCounty, 2000); // 每隔2秒切換一次
      // console.log("👷 ~ 222 startInterval ~ intervalId:", intervalId)
      console.log('定時器執行中...');
    }
  }
  // * 懸停時暫停定時器
  function pauseInterval() {
    // console.log("👷 ~ pauseInterval ~ intervalId:", intervalId.current)
    clearInterval(intervalId.current);
    if (intervalId.current) {
    // console.log("👷 ~ 清空 ~ intervalId:", intervalId.current)
      intervalId.current = null;
    }
    console.log('定時器已暫停');
  }

  // const [pageCarouselOn, setPageCarouselOn] = useState(true);
  useEffect(() => {
    if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
    }
      // console.log("👷 ~ useEffect ~ isCarouselOn:",isCarouselOn,)
    if (isCarouselOn) {
      console.log("👷 ~ 開 :" )
      townPaths.style("fill", "transparent")
        .attr("transform", "translate(0, 0)")
      
      townLabels.style("opacity", function(d) {
          // 只顯示桃園市的鄉鎮標籤，其他的隱藏
          return d.properties.COUNTYNAME === "桃園市" ? 1 : 0;
      })
      
      startInterval()
    } else {
      console.log("👷 ~ 關閉 :", intervalId.current)
      // resetZoom()
      pauseInterval()
    }
    console.log("👷 ~ useEffect ~ isCarouselOn:", isCarouselOn)
    // setPageCarouselOn(isCarouselOn)
  }, [isCarouselOn])


  useEffect(() => {
     // 清理已有地圖元素
    const vizContainer = d3.select('.viz');
    vizContainer.selectAll('*').remove();
    if (intervalId.current) pauseInterval()
    // 如果 viz 中不存在 SVG 元素，才添加
    if (vizContainer.select('svg').empty()) {
      // 渲染地圖
      console.log("👷 ~ useEffect ~ // 渲染地圖:")
      renderMap();
        // 縮放到桃園
      const mapContainer = d3.select('.viz').select('svg')
      const cityKey = mapContainer.select(`path[key=桃園市]`);
      cityKey.dispatch('click');
      startInterval()
      // dispatch(toggleCarousel(true)); // 修改redux狀態
    }
    return () => {
      pauseInterval
      svg = null;
    };
    // 返回清除函式以在組件卸載時執行
  }, []);


  return (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
      <div className="viz">
      </div>
    </div>
  )
}

export default D3Map;