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
  d3.select('#countSpan').text(data.length);
  return data.slice(start, start + limit);
}

let groupdata = () => {
  groupedData = d3.nest()
    .key(d => d.ministry)
    .entries(dbData);


  // d3.select('#searchbar')
  //   .selectAll('option')
  //   .data(groupedData)
  //   .append('option')
  //   .attr('value', d => d.key)
  //   .text(d => d.key);


  // $.each(groupedData, (index, item) => {
  //   d3.select('#searchbar')
  //     .append('option')
  //     .attr('value', item.key.toLowerCase())
  //     .text(item.key);
}

let searchFn = (flag = true) => {
  $('.tabulated').show();
  if(groupedData == null) {
      groupdata();
  }

  let $keyword = $('input[type=\'search\']').val();
  let regex = new RegExp($keyword, 'gi');
  // console.log($keyword);
  $.each(groupedData, (index, item) => {

    isSame = (flag)?regex.exec(item.key):item.key.toLowerCase() == $keyword.toLowerCase();
    if(isSame) {
      tableData = item.values;
      tabulate(paginate());
      return false;
    }
  })

  // console.log(d3.group(paginate(dbData, 2), d => d.ministry));
};

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

  let width = '100%';
  let barHeight = 20;

  var x = d3.scaleLinear()
    .range([0, width]);

  x.domain([0, d3.max(data, function(d) { return d.values.length; })]);

  var chart = d3.select(".chart")
    .append('svg')
    .attr("width", width)
    .attr("height", barHeight * data.length);

  var svgWidth = 720,
      svgHeight = data.length * barHeight,
      barPadding = 5;


  chart.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr("width", function(d) {
          return d.values.length;
      })
      .attr('x', function(d) {
          return svgWidth - d.values.length;
      })
      .attr('height', barHeight - barPadding)
      .attr('transform', function(d, i) {
          var translate = [svgWidth, barHeight * (i + 1)];
          return 'translate(' + translate + ')' + 'rotate(180)';
      });

  chart.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .text(function(d) {
          return d.key + '(' + d.values.length + ') ';
      })
      .attr("x", function(d, i) {
          return d.values.length + 30;
      })
      .attr('y', function(d, i) {
          return barHeight * (i + 1);
      });
}


fetch('http://localhost:3000/rajyasabha')
  .then(res => {
    res.json().then(data => {
      dbData = data;
      tableData = dbData;
      tabulate(paginate());
      // console.log(data.splice(3,10));
      $('.Options').show();
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));


$('#searchBtn').click(searchFn);


$('#chartBtn').click(() => {
  $('.tabulated').hide();
  $('.chart').show();
  chart();
})
