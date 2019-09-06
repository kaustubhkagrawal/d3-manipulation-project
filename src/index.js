const $ = require('jquery');

require('bootstrap');
require('../src/sass/index.scss');


const d3 = require('d3');
// const d3-array = require('d3-array');
$('.Options').hide();
let columns = [''];

let dbData, groupedData;
let tableData;
let page = 1, limit = 10;







let tabulate = (data) => {
  let table = d3.select('#resultsTable');
  table.select('tbody').html('');
  table.select('thead tr').html('');
  let $table = $('#resultsTable');
  $.each(data[0], (key, value) => {
    table.select('thead tr')
      .append('th')
      .attr('scope', 'col')
      .text(key.replace('_', ' '));
  })
  $.each(data, (index, item) => {
    let tr = table.select('tbody')
      .append('tr');
    $.each(item, (key, value) => {
      tr.append('td')
        .text(value);
    })
  });

  // table.select('tbody')
  //   .selectAll('tr')
  //   .data(data)
  //   .enter()
  //   .append('tr')
  //   .text((d,i) => {
  //     // console.log(`tbody tr:nth-child(${i})`);
  //     // return d;
  //     d3.select(`tbody tr:nth-child(${i})`)
  //   });

  // table.select('tbody tr')
  //   .selectAll('td')
  //   .data(d => d)
  //   .enter()
  //   .append('td')
  //   .text(d => d);
  // console.log(d3.select('table'));
}

let paginate = (data = tableData) => {
  let start = (page - 1) * limit;
  // console.log([start, start + limit]);
  d3.select('#limitSpan').text(limit);
  d3.select('#startSpan').text(start);
  d3.select('#endSpan').text(start + limit);
  return data.slice(start, start + limit);
}

let groupdata = () => {
  groupedData = d3.nest()
    .key(d => d.ministry)
    .entries(dbData);
}

let chart = (data = null) => {
  if(groupedData == null){groupdata();}
  if(!data) {
    data = groupedData;
  }
  d3.select('.chart').html('');
  // console.log(groupedData);

  // d3.select('.chart')
  // .selectAll("div")
  //   .data(data)
  // .enter().append("div")
  //   .style("width", function(d) { return d.values.length * 10 + "px"; })
  //   .text(function(d) { return d.key; });

  let width = '75%';
  let barHeight = 20;

  var x = d3.scaleLinear()
    .range([0, width]);

  x.domain([0, d3.max(data, function(d) { return d.values.length; })]);

  var chart = d3.select(".chart")
    .append('svg')
    .attr("width", width)
    .attr("height", barHeight * data.length);


  var bar = chart.selectAll("g")
      .data(data)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

  bar.append("rect")
      .attr("width", function(d) { return x(d.values.length); })
      .attr("height", barHeight - 1);

  bar.append("text")
      .attr('class', 'value')
      .attr("x", function(d) { return x(d.values.length); })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text(function(d) { return d.values.length; });


  // bar.append("text")
  //     .attr('class', 'label')
  //     .attr("x", function(d) { return x(d.values.length); })
  //     .attr("y", barHeight / 2)
  //     .attr("dy", ".35em")
  //     .text(function(d) { return d.key; });
}


fetch('http://localhost:3000/rajyasabha')
  .then(res => {
    res.json().then(data => {
      dbData = data;
      tableData = dbData;
      tabulate(paginate());
      // console.log(data.splice(3,10));
      $('.Options').show();

      $('#chartBtn').click();
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));


$('#searchBtn').click(() => {
  $('.tabulated').show();
  if(groupedData == null) {
      groupdata();
  }

  let $keyword = $('input[type=\'search\']').val();
  // console.log($keyword);
  $.each(groupedData, (index, item) => {
    if(item.key.toLowerCase() == $keyword.toLowerCase()) {
      tableData = item.values;
      tabulate(paginate());
      return false;
    }
  })

  // console.log(d3.group(paginate(dbData, 2), d => d.ministry));
});




$('#chartBtn').click(() => {
  $('.tabulated').hide();
  $('.chart').show();
  chart();
})
