import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import twCounty from "./assets/twCounty.json";
// import twCounty from "./assets/twCountygg.json";
import './red.css';

function App() {
  // const [twCounty, setGeojson] = useState(twCounty);

  const width = 800; // 你的地圖寬度
  const height = 600; // 你的地圖高度

  const projection = d3.geoMercator()
    .center([121, 24])
    .scale(5000) // 比例尺
    .translate([width / 2, height / 2.5]);
    
  const pathGenerator = d3.geoPath().projection(projection);

  const svg = useRef();
  const landColor = "#09A573";

useEffect(() => {
    d3.select(svg.current).selectAll(".county")
      .data(twCounty.features)
      .join("path")
      .attr("class", "county")
      .attr("d", pathGenerator)
      .attr("stroke", landColor)
      .attr("stroke-width", 1)
      .attr("fill", "#ccc")
      .on("mouseover", (event, d) => {
        // 在這裡可以處理滑鼠懸停事件
        console.log("Mouseover", d);
      })
}, [twCounty]);

  return (
    <svg ref={svg} width="800" height="600">
    </svg>
  );
}

export default App;
