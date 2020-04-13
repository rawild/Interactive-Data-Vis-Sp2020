/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.6,
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
  councilDistricts: null,
  hover: {
    District: null,
    "Current Councilmember": null,
    "Bernie Donors": null,
    "Term-limited in 2021": null
  }
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../data/CityCouncilDistricts.geojson"),
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
  //color scale
  colorScale = d3.scaleSequential(d3.extent(state.councilDistricts.map(d => d.Donors)), d3.interpolateYlGnBu).nice()
  // top layer map 
  // modified from Bostok's map here: https://observablehq.com/@d3/non-contiguous-cartogram?collection=@d3/d3-geo
  svg.append("g")
  .attr("stroke", "#000")
  .selectAll("path.donors")
  .data(state.geography.features.filter(d => state.councilDistricts[parseInt(d.properties.coun_dist) - 1]))
  .join(enter =>
      enter
      .append("path")
      .attr("class", "donors")
      .attr("d", path)
      .attr("fill", d => colorScale(state.councilDistricts[parseInt(d.properties.coun_dist) -1]['Donors']))
      .attr("transform", d => {
        const [x, y] = path.centroid(d);
        return `
          translate(${x},${y})
          scale(${.01})
          translate(${-x},${-y})
        `;
      })
      .on("mouseover", d =>{
        state.hover["District"] = "#" +d.properties.coun_dist
        state.hover["Bernie Donors"] = state.councilDistricts[parseInt(d.properties.coun_dist) -1]['Donors']
        state.hover[" Current Councilmember"] =state.councilDistricts[parseInt(d.properties.coun_dist) -1]['Council_Member']
        state.hover["Term-limited in 2021"]= state.councilDistricts[parseInt(d.properties.coun_dist) -1]['Term_Limited'] > 2021 ? "No" : "Yes"
        draw()
      })
      .call(enter =>
        enter
          .transition()
          .delay(d => state.councilDistricts[parseInt(d.properties.coun_dist) -1]['Donors'] )
          .attr("transform", 'scale(1)')
        )
    );
  // Initial hover:
  d3.select("#hover-content")
    .attr("style","border: solid 12px #98aee9;")
    .selectAll("div.row")
    .data([1])
    .join("div")
    .attr("class", "row")
    .html(d => `${"Hover over a district to get info."}`)
  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  // return an array of [key, value] pairs
  hoverData = Object.entries(state.hover);
  if (hoverData[0][1] != null){
    color = colorScale(state.hover['Bernie Donors'])
    d3.select("#hover-content")
      .attr("style","border: solid 12px "+ color +";")
      .selectAll("div.row")
      .data(hoverData)
      .join("div")
      .attr("class", "row")
      .html(
        d =>
          // each d is [key, value] pair
          d[1] // check if value exist
            ? `${d[0]}: ${d[1]}` // if they do, fill them in
            : null // otherwise, show nothing
      );
  }
};

