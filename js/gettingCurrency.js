/**
 * Created by Dasha on 25.11.2017.
 */

$(function () {
  const CURRENCY_ID_USD = 145;
  const CURRENCY_ID_RUR = 141;
  const CURRENCY_ID_EUR = 19;

    function timeConverter(dateAgo){
        let dateCur = new Date();
        if (dateAgo != 0){
          dateCur.setDate(dateCur.getDate() - dateAgo);
          dateCur.setDate(dateCur.getDate());
        }
        let year = dateCur.getFullYear();
        let month = dateCur.getMonth()+1;
        let date = dateCur.getDate();
        let time = year + '-' +month + '-' + date;
        return time;
    }

    let currentDate = timeConverter(0);
    let dateWeekAgo = timeConverter(7);
    $('#startDate').val(dateWeekAgo);
    $('#endDate').val(currentDate);


  let uri = 'http://www.nbrb.by/API/';
  let selectCurrency= CURRENCY_ID_USD;


  function diagram(courseOfcurrency,timeInterval) {
      let chart = c3.generate({
          bindto: '#diagram',
          padding: {
              right: 60,
              left: 60,
            },
          data: {
              x: 'date',
                columns: [
                    timeInterval,
                    courseOfcurrency
                ]
            },
          grid: {
              x: {
                    show: true
                },
              y: {
                    show: true
                }
            },
          zoom: {
                enabled: true
            },
          axis: {
              x: {
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d'
                    },
                    label: {
                        text: 'Дата',
                        position: 'outer-center'
                    }
                },
              y: {
                    label: {
                        text: 'Курс валют',
                        position: 'outer-middle'

                    },
                    tick: {
                        format: d3.format(".5s")
                    },
                }
            }
        });
    };


   function creatediagram(uri,selectCurrency, beginCalendarDate,endCalendarDate) {
            let courseOfcurrency=[];
            let timeInterval =[];
            let dataNow= $.getJSON(uri + 'ExRates/Rates/Dynamics/' + parseInt(selectCurrency),
                { 'startDate': beginCalendarDate  , 'endDate': endCalendarDate })
        .done(function (data) {
                $.each(data, function (key, item) {
                    courseOfcurrency.push(item.Cur_OfficialRate);
                    timeInterval.push(item.Date.slice(0, 10));
                });
                $('#btn').removeAttr("disabled");
                courseOfcurrency.unshift('График изменения курса валюты');
                timeInterval.unshift('date');
                diagram(courseOfcurrency, timeInterval);
            }).error(function (err) {
                $('#btn').removeAttr("disabled");
                alert('Error');
            });
        }


    function receiveScheduleOfCurrency(uri) {
        let beginCalendarDate = $('#startDate').val();
        let endCalendarDate = $('#endDate').val();
        let selectCurrency = $('#typeOfCurrency option:selected').val();
        creatediagram(uri,selectCurrency, beginCalendarDate,endCalendarDate);
    }

    function gettingDates(){

        let beginCalendarDate = $('#startDate').val();
        let endCalendarDate = $('#endDate').val();
        let selectCurrency = $('#typeOfCurrency option:selected').val();
        let dataNow= $.getJSON(uri + 'ExRates/Rates/Dynamics/' + parseInt(selectCurrency),
            { 'startDate': beginCalendarDate  , 'endDate': endCalendarDate });
        return dataNow;

    }

    function createTableofCurrencies() {
        let data = gettingDates();
        let tableString = "<table id='tableData' >";

        data.done(function (data) {
            let currentCurrency = $('#typeOfCurrency option:selected').text();
            tableString += "<tr><td>" + "Date" + "</td><td>" + currentCurrency + "</td></tr>";
            $.each(data, function (key, item) {
                tableString += "<tr><td>" + item.Date.slice(0, 10) + "</td><td>" + item.Cur_OfficialRate + "</td></tr>";
            });
            tableString += "</table>";
            $('#resultsOfTable').prepend(tableString);
        });
    }


    function addDataTable() {
        let data = gettingDates();
        let currentCurrency = $('#typeOfCurrency option:selected').text();
        let table = document.getElementById('tableData');
        let trArr = table.getElementsByTagName('tr');
        let i = 0;
        data.done(function (data) {
            $.each(data, function (key, item) {
                if (i === 0){
                    trArr[i].insertCell(-1).innerHTML = currentCurrency;

                    i++;}
                trArr[i].insertCell(-1).innerHTML = item.Cur_OfficialRate;
                i++;
            })
            });
    }


    function deleteTableTD() {
        let rows = document.getElementById('tableData').getElementsByTagName('tr');
        let rowsLen = rows.length;
        for (let i = 0; i < rowsLen; i++) {
            let row = rows[i];
            row.deleteCell(-1);
        }
    }


    function downloadCSV(csv, filename) {
        let csvFile;
        let downloadLink;

        csvFile = new Blob([csv], {type: "text/csv"});
        downloadLink = document.createElement("a");
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }


    function exportTableToCSV() {
        let csv = [];
        let table= document.getElementById('tableData');
       // let rows = $("table tr");
         let rows = table.querySelectorAll("tr");
        for (let i = 0; i < rows.length; i++) {
            let row = [], cols = rows[i].querySelectorAll("td, th");

            for (let j = 0; j < cols.length; j++)
                row.push(cols[j].innerText);

            csv.push(row.join(","));
        }
        downloadCSV(csv.join("\n"), 'TableOfCurrencies.csv');
    }


    function exportFromDiagram( ){
        let csv = [];
        let data = gettingDates();
        let currentCurrency = $('#typeOfCurrency option:selected').text();
        csv.push('date' + ',' + currentCurrency);
        data.done(function (data) {
            $.each(data, function (key, item) {
                csv.push(item.Date.slice(0, 10) + ',' + item.Cur_OfficialRate);
            });
            downloadCSV(csv.join("\n"), 'TableOfCurrencies.csv');
        }
        )}


    creatediagram(uri,selectCurrency ,dateWeekAgo,currentDate);

    $('#startDate').click(function(){
        receiveScheduleOfCurrency(uri);
    });


    $('#endDate').click(function(){
        receiveScheduleOfCurrency(uri);
    });


    $('#typeOfCurrency').click(function(){
        receiveScheduleOfCurrency(uri);
    });


    $("#createCurrenciesTable").hide();


    $('#createTableOfCurrencies').click(function(){
        $("#createDiagram").hide();
        createTableofCurrencies();
        $("#createCurrenciesTable").show();
    });


    $('#exportDiagramValues').click(function(){
        exportFromDiagram();
    });


    $('#backToDiagram').click(function(){
        $("#createCurrenciesTable").hide();
        $("#createDiagram").show();
        $("#tableData").remove();
    });


    $('#insertTable').click(function () {
        addDataTable();
    });


    $('#deleteTd').click(function () {
        deleteTableTD();
    });


    $('#exportTableToCSV').click(function(){
        exportTableToCSV();
    });


});

