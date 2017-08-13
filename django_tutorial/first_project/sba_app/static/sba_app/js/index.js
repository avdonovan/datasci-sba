/* page setup */
var width = parseInt(d3.select('#map_container').style('width')),
    height = width,
    active = d3.select(null)

var svg = d3.select("#map_container").append("svg")
    .style('width', width + 'px')
    .style('height', height + 'px');
    // .on("click", stopped, true)

var projection = d3.geoMercator()
    .center([-122.433701, 37.767683])
    .scale(3 * width)
    .translate([width / 2, height / 2])

var path = d3.geoPath()
    .projection(projection)


var bins = rangeArray(9)
var colorScale = d3.scaleQuantize()
colorScale.range(bins)



d3.queue()
  .defer(d3.json,'/firstapp/api/v1/zips')
  .defer(d3.json, '/static/sba_app/tempdata/ca_zips.json')
  .await(drawMap);


function drawMap(error, data, map) {
  if (error) throw error;
  if(data.status !== 'success') {
    console.log('error: ' + data.status)
    return
  }

  data = data.data

  let exten = d3.extent(data, (d)=>{return d.sba_per_small_bus})
  colorScale.domain(exten)

  let dataMap = d3.nest()
      .key(d=>{return d.borr_zip})
      .rollup(v=>{return v[0].sba_per_small_bus})
      .object(data)

  svg.append('g')
      .selectAll('.zip')
        .data(topojson.feature(map, map.objects.ca_zips).features)
      .enter().append('path')
        .attr('d', path)
        .on('click', function(d){ return console.log(d.properties.GEOID10) })
        .attr('class', function(d){
          let val = dataMap[d.properties.GEOID10]
          return colorScale(val)
        })
}





function rangeArray (bins) {
  //TODO: i think there is a native d3 function that does this
  var result = [],
      max = bins - 1
  for (var i = 0; i <= max; i++) {
   result.push('q'+ i + '-' + bins);
  }
  return result
}