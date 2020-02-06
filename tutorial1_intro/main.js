"function to get class colors"

function getClassColor(x){
    var classColors = [ "white","lightestBlue","lightBlue","middleBlue","darkBlue","darkestBlue"]
    if (x < 0) {
        return classColors[0]
    }else if (x < 1){
        return classColors[1]
    }
    else if (x < 5) {
        return classColors[2]
    }else if (x < 10){
        return classColors[3]
    }else if (x < 20){
        return classColors[4]
    }else {
        return classColors[5]
    }
}
/* load csv */
d3.csv("../data/US_income_inequality.csv").then(data => {
    console.log("data", data);
    // going to make a table
    const table = d3.select("#d3-table");

    const thead = table.append("thead");
    /* Title header */
    thead 
        .append("tr")
        .append("th")
        .attr("colspan", data.columns.length)
        .text("Percent share of $98 Billion Personal Wealth in the US");
    /* Column headers */
    thead
        .append("tr")
        .selectAll("th")
        .data(data.columns)
        .join("th")
        .text(d => d);
    /* Table body */
    const rows = table
        .append("tbody")
        .selectAll("tr")
        .data(data)
        .join("tr"); 
     rows
        .selectAll("td")
        .data(d => Object.values(d))
        .join("td")
        .attr("class", (d,i) => {
            if (i > 6) { 
                return getClassColor(d) 
            }
        })
        .text(d => d);
})

d3.select("body")
    .append("div")
    .attr("class","source")
d3.select(".source")
    .append("a")
    .attr("href", "https://www.nber.org/papers/w24085.pdf")
    .text("Source: Household Wealth Trends in the United States 1962-2016: Has Middle Class Wealth Recovered?")