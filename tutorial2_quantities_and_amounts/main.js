/* horizantal graph */
//Load data
d3.csv("../data/US_Wealth_Inequality_2016.csv", d3.autoType).then(data => {
    console.log(data)

    // Constants in SVG Frame 
    const width = window.innerWidth * 0.9,
    height = window.innerHeight / 1.5,
    paddingInner = 0.2,
    margin = { top: 40, bottom: 40, left: 200, right:100 },
    wealth = 98;

    // Scales for visualization 
    const yScale = d3
        .scaleBand()
        .domain(data.map(d => d["Wealth Bracket"]))
        .range([margin.top, height - margin.bottom])
        .paddingInner(paddingInner);
    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(data, d => d.Percentage * wealth))
        .range([margin.left, width - margin.right]);
    const yAxis = d3.axisLeft(yScale).ticks(data.length);
    
    // Shape Drawing Code 
    // main svg square
    const svg = d3
        .select("#d3-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    //append rects
    const rect = svg
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("y", d => yScale(d["Wealth Bracket"]))
        .attr("x", d => xScale(Math.min(0,d.Percentage * wealth)))
        .attr("height", yScale.bandwidth())
        .attr("width", d => Math.abs(xScale(d.Percentage * wealth)-xScale(0)))
        .attr("fill", "grey")
    //append labels
    const text = svg
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("class", 
            d => {return "label"+ (d.Percentage < 0 ? " negative" : "")})
        .attr("y", d => yScale(d["Wealth Bracket"]) + (yScale.bandwidth() / 2))
        .attr("x", d => xScale(d.Percentage * wealth) + 60)       
        text.append("tspan") 
       .attr("x", d => xScale(d.Percentage * wealth) + 60)
       .text( d => "$ "+ d.Percentage * wealth )
       text.append("tspan")
       .attr("x", d => xScale(d.Percentage * wealth) + 60)
       .text("Billion")
       .attr("dy", "1.25em")
    // append Y axis
    svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${xScale(0)},0)`)
        .call(yAxis);
});

/* vertical graph */
/*
//Load data
d3.csv("../data/US_Wealth_Inequality_2016.csv", d3.autoType).then(data => {
    console.log(data)

    // Constants in SVG Frame 
    const width = window.innerWidth * 0.9,
    height = window.innerHeight / 1.5,
    paddingInner = 0.2,
    margin = { top: 40, bottom: 40, left: 40, right:40 },
    wealth = 98;

    // Scales for visualization 
    const xScale = d3
        .scaleBand()
        .domain(data.map(d => d["Wealth Bracket"]))
        .range([margin.left, width - margin.right])
        .paddingInner(paddingInner);
    const yScale = d3
        .scaleLinear()
        .domain(d3.extent(data, d => d.Percentage * wealth))
        .range([height - margin.bottom, margin.top]);
    const xAxis = d3.axisBottom(xScale).ticks(data.length);
    
    // Shape Drawing Code 
    // main svg square
    const svg = d3
        .select("#d3-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    //append rects
    const rect = svg
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", d => xScale(d["Wealth Bracket"]))
        .attr("y", d => yScale(Math.max(0,d.Percentage * wealth)))
        .attr("width", xScale.bandwidth())
        .attr("height", d => Math.abs(yScale(d.Percentage * wealth)-yScale(0)))
        .attr("fill", "grey")
    //append labels
    const text = svg
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("class", 
            d => { 
            if (d.Percentage < 0) {
                return "negative label"
            }
            return "label"
            })
        .attr("x", d => xScale(d["Wealth Bracket"]) + (xScale.bandwidth() / 2))
        .attr("y", d => yScale(d.Percentage * wealth) - 40)
        .text(d => "$"+ d.Percentage * wealth + " Billion")
        .attr("dy", "1.25em")
    // append X axis
    svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${yScale(0)})`)
        .call(xAxis);
});
*/