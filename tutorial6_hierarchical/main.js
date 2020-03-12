/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;

/**
 * APPLICATION STATE
 * */
let state = {
  root: null,
};

/**
 * LOAD DATA
 * */
d3.csv("../data/senate_25_contributions_Jan_2020.csv", d3.autotype).then(data => {
  state.data = data;
  console.log(data)
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  const container = d3.select("#d3-container").style("position", "relative");

  tooltip = container
    .append("div")
    .attr("width", 100)
    .attr("height", 100)
    .style("position", "absolute")
    .style("background-color", "white");

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const uniqueCandidates = [...new Set(state.data.map(d => d.Candidate))];
  const colorScale = d3
    .scaleOrdinal()
    .domain(uniqueCandidates)
    .range(d3.schemeCategory10);

  const rolledUp = d3.rollups(
    state.data,
    v => ({ total: d3.sum(v, d => d['AMOUNT_70']), donors: v }), // reduce function,
    d => d.Candidate,
    d => d.E_YEAR,
    d => d.NAME
  );

  console.log("rolledUp", rolledUp);

  // groups the data by genre, type and rating
  // make hierarchy
  const root = d3
    .hierarchy([null, rolledUp], ([key, values]) => values) // children accessor, tell it to grab the second element
    .sum(([key, values]) => values.total) // sets the 'value' of each level
    .sort((a, b) => b.value - a.value);

  // make treemap layout generator
  const tree = d3
    .treemap()
    .size([width, height])
    .padding(1)
    .round(true);

  // call our generator on our root hierarchy node
  tree(root); // creates our coordinates and dimensions based on the heirarchy and tiling algorithm

  console.log(root);

  // create g for each leaf
  const leaf = svg
    .selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  leaf
    .append("rect")
    .attr("fill-opacity", 0.6)
    .attr("fill", d => colorScale(d.data[1].donors[0].Candidate)) // take the genre from the first one in the group
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .on("mouseover", d => {
      console.log("d", d);
      state.hover = {
        translate: [
          // center tooltip in rect
          d.x0 + (d.x1 - d.x0) / 2,
          d.y0 + (d.y1 - d.y0) / 2,
        ],
        name: d
          .ancestors()
          .reverse()
          .map(d => d.data[0])
          .join("/"),
        value: d.value,
      };
      draw();
    });

  draw(); // calls the draw function
}
/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  if (state.hover) {
    tooltip
      .html(
        `
        <div>Name: ${state.hover.name}</div>
        <div>Value: ${state.hover.value}</div>
      `
      )
      .transition()
      .duration(500)
      .style(
        "transform",
        `translate(${state.hover.translate[0]}px,${state.hover.translate[1]}px)`
      );
  }
}
