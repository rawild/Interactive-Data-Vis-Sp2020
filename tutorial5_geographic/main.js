/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.8,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

/** these variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.*/
let svg;
let colorScale;
let path;
/**
 * APPLICATION STATE
 * */
let state = {
  geography: null,
  councilDistricts: null
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../data/City Council Districts.geojson"),
  d3.csv("../data/Council_Member_Donors.csv", d3.autoType),
]).then(([geojson, otherData]) => {
  state.geography = geojson
  state.councilDistricts = otherData
  console.log("state: ", state);
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  //projection + resultant path
  const projection = d3.geoAlbersUsa().fitSize([width,height], state.geography);
  path = d3.geoPath().projection(projection);

  // basemap
  svg
    .selectAll(".district")
    .data(state.geography.features)
    .join("path")
    .attr("d", path)
    .attr("class", "district")
    .attr("fill", "none")
    /*.on("mouseover", d =>{

    })*/
 
  // + ADD EVENT LISTENERS (if you want)
  colorScale = d3.scaleSequential(d3.extent(state.councilDistricts.map(d => d.Donors)), d3.interpolateBlues).nice()
  console.log('colorScale: '+ colorScale)
  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
// modified from Bostok's map here: https://observablehq.com/@d3/non-contiguous-cartogram?collection=@d3/d3-geo
svg.append("g")
  .attr("stroke", "#000")
  .selectAll("path.donors")
  .data(state.geography.features.filter(d => state.councilDistricts[parseInt(d.properties.coun_dist) - 1]))
  .join(enter =>
      enter
      .append("path")
      //.attr("vector-effect", "non-scaling-stroke")
      .attr("class", "donors")
      .attr("d", path)
      .attr("fill", d => {
        console.log(d)    
        return colorScale(state.councilDistricts[parseInt(d.properties.coun_dist) -1]['Donors'])
      })
      .attr("transform", d => {
        const [x, y] = path.centroid(d);
        return `
          translate(${x},${y})
          scale(${.1})
          translate(${-x},${-y})
        `;
      })
      .call(enter =>
        enter
          .transition()
          .delay(d => 2 * state.councilDistricts[parseInt(d.properties.coun_dist) -1]['Donors'] )
          .attr("transform", 'scale(1)')
        )
    );

}
