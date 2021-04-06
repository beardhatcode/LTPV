/*
 * (C) Copyright 2013 - Thales SA (author: Simon DENEL - Thales Research & Technology)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 */
var colors = new Array();
var streams = new Array();
var min, max;
var tasks = new Array();
var wLeft;
var wRight;
var unit = "";
var nameStart = "";
var startedVal = 0;
var cursor = [NaN, NaN];
var colorAdvanced1 = {};
var colorAdvanced2 = {};
var advanced = 0;
var timelineWidth;
var timelineHeight;
//var ocl_queuedSubmit=[undefined, undefined];
var ocl_queuedSubmit = [undefined, undefined];
var $xml;


function initByFile(filePath){

  if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    die(
      "The File APIs are not fully supported by your browser. Fallback required."
    );
    return false;
  }

  const reader = new FileReader();
  let data = null;
  var output = ""; //placeholder for text output
  if (filePath.files && filePath.files[0]) {
    reader.onload = (res) => {
        init(res.target.result)
    };
    reader.readAsText(filePath.files[0]);
  } else {
    alert("Could not find or read file, try again");
    return false;
  }

}

function init(data) {
  $xml = $($.parseXML(data));

  // get unit
  unit = $xml.children("profiling").children("head").children("unit").text();
  if (unit == "") unit = "ns";

  // Min and max for tasks
  $xml.find("taskInstance").each(function () {
    x = $(this).find("ocl_queued").text();
    if (x != "") {
      x = parseFloat(x);
      if (x > max || max == undefined) max = x;
      if (x < min || min == undefined) min = x;
    }
    //console.log([min, max]);
    x = $(this).find("ocl_submit").text();
    if (x != "") {
      x = parseFloat(x);
      if (x > max || max == undefined) max = x;
      if (x < min || min == undefined) min = x;
    }
    //console.log([min, max]);
    x = $(this).find("start").text();
    if (x != "") {
      x = parseFloat(x);
      if (x > max || max == undefined) max = x;
      if (x < min || min == undefined) min = x;
    }
    //console.log([min, max]);
    x = $(this).find("end").text();
    if (x != "") {
      x = parseFloat(x);
      if (x > max || max == undefined) max = x;
      if (x < min || min == undefined) min = x;
    }
    //console.log([min, max]);
  });

  min = min - 0.02 * (max - min);
  max = max + 0.02 * (max - min);

  wLeft = min;
  wRight = max;

  const $tasks = $xml.find("task");
  createColors($tasks.length + 1);

  // Creating the tasks tab
  var i = 1;
  $tasks.each(function () {
    var id = $(this).find("id").text();
    var name = $(this).find("name").text();
    if (tasks[id] != undefined)
      die("There is more than one task with the id " + id + "");
    tasks[id] = [name, i];
    i += 1;
  });

  if (i > colors.length) die("More tasks than colors!");

  // Creating the device tab with streams
  var devices = new Array();
  var idDevice = 0;
  var idStreamG = 0;

  streams = new Array();

  $xml.find("device").each(function () {
    var datas = new Array();
    var i = 0;
    $(this)
      .children("details")
      .children("detail")
      .each(function () {
        datas[i] = new Array();
        datas[i++] = $(this).children("name").text();
        datas[i++] = $(this).children("value").text();
        datas[i++] = String($(this).children("help").text()).replace(
          /,/gi,
          "&virgule"
        );
      });

    var nameDevice = $(this).children("name").text();
    devices[idDevice] = new Array();
    devices[idDevice]["name"] = nameDevice;

    $("#timelineTitles").append(
      imgMinus(
        0,
        "Hide streams for device [" + idDevice + "]" + nameDevice,
        ".titleStream-" + idDevice
      ) +
        '<span class="nameDevice" title=\'Click to see the ' +
        nameDevice +
        " device properties' onclick='showInfos(\"" +
        nameDevice +
        '", "' +
        escape(datas) +
        "\")'>[" +
        idDevice +
        "] " +
        nameDevice +
        '</span><br /><div id="device-' +
        idDevice +
        '" class="device"></div>'
    );

    devices[idDevice]["stream"] = new Array();
    var idStream = 0;

    // Entering in streams
    $(this)
      .find("stream")
      .each(function () {
        var nameStream = $(this).children("name").text();
        devices[idDevice]["stream"]["name"] = nameStream;

        // Creating tasks
        streams[idStreamG] = new Array();
        var idTaskInstance = 0;
        $(this)
          .find("taskInstance")
          .each(function () {
            streams[idStreamG][idTaskInstance] = new Array();
            streams[idStreamG][idTaskInstance] = [
              $(this).find("idTask").text(),
              $(this).find("name").text(),
              $(this).find("start").text(),
              $(this).find("end").text(),
              $(this).find("ocl_global_work_size").text(),
              $(this).find("ocl_local_work_size").text(),
              $(this).find("ocl_bandwidth").text(),
              $(this).find("ocl_queued").text(),
              $(this).find("ocl_submit").text(),
              $(this).find("ocl_size").text(),
            ];
            idTaskInstance += 1;
          });

        $("#device-" + idDevice).append(
          '<div class="titleStream titleStream-' +
            idDevice +
            '" id="titleStream-' +
            idStreamG +
            '" style="display:block;height:30px;">&nbsp;&nbsp;&nbsp;&nbsp;' +
            nameStream +
            "</div>"
        );
        idStream += 1;
        idStreamG += 1;
      });
    idDevice += 1;
  });
  createScreen();
  createRAW();
  refreshScreen();
  shortcut.add("F1", function () {
    changeView(1);
  });
  shortcut.add("F2", function () {
    changeView(2);
  });
  shortcut.add("F3", function () {
    $("#details").html("Click on a task to display details");
    $("#console").html("");
    cursor[0] = NaN;
    changeView(0);
  });
  shortcut.add("F4", function () {
    refreshScreen();
  });
  shortcut.add("Left", function () {
    changeView(3);
  });
  shortcut.add("Right", function () {
    changeView(4);
  });

  var zoomDone = 1;
  $("#canvasBackground").mousedown(function (a) {
    a.preventDefault();
    if (a.which == 1) {
      zoomDone = 0;
      var offsets = document
        .getElementById("canvasBackground")
        .getBoundingClientRect();
      var top = offsets.top + window.pageYOffset;
      var left = a.pageX;
      $("#divZooming").css("left", "" + left + "px");
      $("#divZooming").css("top", "" + (top + 15) + "px");
      $("#divZooming").css("height", "" + (timelineHeight - 16) + "px");
      $("#divZooming").css("border", "1px black solid");
      $("#divZooming").css("display", "block");
      $("#divZooming").css("width", "0px");
      var minX = $("#timelineStreams").offset().left;
      var maxX = minX + $("#timelineStreams").outerWidth() - 1;
      var width;
      $(document).mousemove(function (e) {
        width = Math.min(Math.max(e.pageX, minX), maxX) - left;
        if (width > 0) {
          $("#divZooming").css("left", "" + left + "px");
          $("#divZooming").css("width", "" + width + "px");
        } else {
          $("#divZooming").css(
            "left",
            "" + Math.max(left + width, minX) + "px"
          );
          $("#divZooming").css("width", "" + -width + "px");
        }
        if (Math.abs(width) > 20) {
          $("#divZooming").css("background-color", "rgba(76, 64, 107, 0.7)");
          $("#divZooming").css(
            "background-image",
            "linear-gradient(to right, rgba(08, 0, 57, 0.4), rgba(76, 64, 107, 0.3))"
          );
        } else {
          $("#divZooming").css("background-color", "rgba(76, 64, 107, 0.2)");
          $("#divZooming").css(
            "background-image",
            "linear-gradient(to right, rgba(18, 0, 67, 0.2), rgba(76, 64, 107, 0.2))"
          );
        }
      });

      $(document).mouseup(function (e) {
        if (zoomDone == 0) {
          if (Math.abs(width) > 20) {
            zoomDone = 1;
            var X1 = document
              .getElementById("canvasBackground")
              .getBoundingClientRect();
            var X2 = document
              .getElementById("divZooming")
              .getBoundingClientRect();
            var a = (left - X1.left) / X1.width;
            var b = a + width / X1.width;
            if (a > b) {
              var c = a;
              a = b;
              b = c;
            }
            var wLeftN = wLeft + a * (wRight - wLeft);
            var wRightN = wLeft + b * (wRight - wLeft);

            wLeft = wLeftN;
            wRight = wRightN;
            refreshScreen();
          }
          $("#divZooming").css("display", "none");
          $(document).unbind("mousemove");
          $(document).unbind("mouseup");
        }
      });
    }
  });
  var date = "";
  var dateGenerated = $xml
    .children("profiling")
    .children("head")
    .children("date")
    .text();
  if (dateGenerated != "") {
    date += "XML generated: " + dateGenerated + "<br />";
  }
  date += "Last display refresh: " + getTime();
  $("#date").html(date);
  $("#tempBlock").html("");
}

$(function () {
  $("#tempBlock").append(`
        <div id="showInfos1" style="color:white; font-size:x-large; text-align:center;">
        <div style="position:relative;top:50%;">Give a profle file</div>
        <input type="file" onchange='initByFile(this)' />
        </div>`);
  document.body.scrollTop = document.documentElement.scrollTop = 0;
});
