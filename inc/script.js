'use strict';

var jsonId;
var jsonUrl = 'https://api.myjson.com/bins/';
var $theList = $('#checkedList');
var $theList2 = $('#unchekedList');
var $theList3 = $('#tagsList');
var $tagHeader = $('#tagHeader');
var $unchekedHeader = $('#unchekedHeader');
var $checkedHeader = $('#checkedHeader');
var $inputNew = $('#newItem');
var $inputShareId = $('#inputShareId');
var jsonObj = {};
var bodyEl = document.body;
var availableTags = [
  'Bananas 🍌',
  'Bread 🍞',
  'Grapes 🍇',
  'Melon 🍈',
  'Watermelon 🍉',
  'Tangerine 🍊',
  'Tangerine 🍊',
  'Lemons 🍋',
  'Pineapple 🍍',
  'Mango',
  'Red Apple 🍎',
  'Green Apple 🍏',
  'Pear 🍐',
  'Peach 🍑',
  'Cherries 🍒',
  'Strawberry 🍓',
  'Kiwi Fruit 🥝',
  'Tomato 🍅',
  'Coconut 🥥',
  'Avocado 🥑',
  'Eggplant 🍆',
  'Potato 🥔',
  'Carrot 🥕',
  'Corn 🌽',
];

function getQueryStr() {
  var str = window.location.search;
  return str ? str.replace('?', '') : false;
}

function addLog(strName, objValue, error) {
  var newStrName = error ? '*** ERROR *** ' + strName : ' ' + strName;
  if (objValue) console.log(new Date().toLocaleTimeString() + newStrName, objValue);
  else console.log(new Date().toLocaleTimeString() + newStrName);
}

function randId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function strToArr(str, div) {
  var divider = div || ' ';
  return str ? str.split(divider) : [];
}

function createNewEl(checked, id, name) {
  var html = [];
  var ck = checked ? 'checked' : 'unchecked';
  var $div1 = $('<div/>', { class: 'table-cell' });
  var $div2 = $('<div/>', { class: 'table-cell text-align-right' });
  var $chkItem = $('<span/>', { class: 'checkItem mr-1 ' + ck, 'data-index': id });
  var title = ' ' + name + ' ';
  var tag = $('<img/>', { src: 'images/tag.svg', 'data-index': id, class: 'tag btn mr-2' });
  var $dlt = $('<img/>', { src: 'images/delete.svg', 'data-index': id, class: 'deleteItem btn' });
  html.push($div1.append($chkItem));
  html.push($div1.append(title));
  html.push($div2.append(tag));
  html.push($div2.append($dlt));
  return $('<div/>', { id: id, class: 'p-3 table', 'data-sort': name[0] }).html(html);
}

function loadList() {
  $.get(jsonUrl + jsonId, function fn(data) {
    jsonObj = data;
    var cookie = $.getCookie('tag');
    var appendUncheked = [];
    var appendChecked = [];
    var appendTags = [];
    var tCount = 0;
    var uCount = 0;
    var cCound = 0;
    $theList.html('');
    $theList2.html('');
    $theList3.html('');
    $.each(data, function fn(k, v) {
      var div = createNewEl(v.checked, k, v.name);
      var hasTag = cookie ? strToArr(v.tags).indexOf(cookie) > -1 : false;
      if (v.checked) {
        appendChecked.push(div);
        cCound += 1;
      } else if (hasTag) {
        appendTags.push(div);
        tCount += 1;
      } else {
        appendUncheked.push(div);
        uCount += 1;
      }
    });
    if (appendUncheked.length > 0) {
      $theList.append(appendUncheked).sortDivs();
      $unchekedHeader.slideDown('fast').html('Uncheked: ' + cCound);
    } else {
      $unchekedHeader.slideUp('fast');
    }
    if (appendChecked.length > 0) {
      $theList2.append(appendChecked).sortDivs();
      $checkedHeader.slideDown('fast').html('Cheked: ' + uCount);
    } else {
      $checkedHeader.slideUp('fast');
    }
    if (appendTags.length > 0) {
      $theList3.append(appendTags).sortDivs();
      $tagHeader.slideDown('fast').html(cookie + ': ' +  tCount);
    } else {
      $tagHeader.slideUp('fast');
    }
  });
}

function triggerRefresh() {
  $('#reloadBtn').toggleClass('rotated');
  setTimeout(loadList, 600);
}

function updateJson() {
  $.ajax({
    url: jsonUrl + jsonId,
    type: 'PUT',
    data: JSON.stringify(jsonObj),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    success: triggerRefresh,
  });
}

function addItem() {
  var newItem = $inputNew.val();
  var id = randId();
  if (!newItem.trim()) return false;
  jsonObj[id] = { name: newItem, checked: false };
  var $el = createNewEl(false, id, newItem).css('display', 'none');
  $theList.append($el).sortDivs();
  $el.slideToggle('fast');
  $inputNew.val('');
  updateJson();
  return false;
}

$inputNew.keypress(function fn(e) {
  // enter pressed
  if (e.which === 13) addItem();
}).autocomplete({ source: availableTags });

// add tags
$(bodyEl).on('keypress', '#inputTags', function fn(e) {
  if (e.which === 13) {
    var tags = $('#inputTags').val();
    var id = $('#inputTagId').val();
    jsonObj[id] = { name: jsonObj[id].name, checked: jsonObj[id].checked, tags: tags };
    updateJson();
  }
});

$('#reloadBtn').on('click', triggerRefresh);
$('#DelCookies').on('click', function x() {
  $.eraseCookie('tag');
  $.eraseCookie('listId');
  $(this).coin('coin', 'deleted');
});

$('#shareList').on('click', function x() {
  $inputShareId.copyToClip();
  $(this).coin('coin', 'Clipboard!');
});

$(bodyEl).on('click', '.deleteItem', function fn() {
  var id = $(this).attr('data-index');
  var $el = $('#' + id);
  delete jsonObj[id];
  $el.slideToggle('fast');
  updateJson();
  return false;
});

$(bodyEl).on('click', '.checkItem', function fn() {
  var $el = $(this);
  var id = $el.data('index');
  var $id = $('#' + id);
  var ckb = !$el.hasClass('checked');

  if (!ckb) {
    $id.appendTo('#checkedList');
    $el.removeClass('checked').addClass('unchecked');
    $theList.sortDivs();
  } else {
    $id.appendTo('#unchekedList');
    $el.removeClass('unchecked').addClass('checked');
    $theList2.sortDivs();
  }
  jsonObj[id] = { name: jsonObj[id].name, checked: ckb, tags: jsonObj[id].tags };
  updateJson();
  return false;
});

// Tag click
$(bodyEl).on('click', '.tag', function fn() {
  var $this = $(this);
  var id = $(this).parent().parent().attr('id');
  var $id = $('#' + id);
  var tagId = 'tag-' + id;
  var html = [];
  var tagsArr = strToArr(jsonObj[id].tags);
  var tags = [];
  $this.fadeOut('fast');
  $('.tagCell').children().hide('fast');
  $('.tagCell').slideToggle('slow', function fn() {
    $('.tagCell').not('#' + tagId).remove();
    $('.tag').not($this).show('fast');
  });
  // get tags
  for (let i = 0; i < tagsArr.length; i++) {
    tags.push($('<span/>', { class: 'mr-2 tagSelect' }).html(tagsArr[i]));
  }

  var $div1 = $('<div/>', { class: 'table-cell' });
  var $div2 = $('<div/>', { class: 'table-cell text-align-right' });
  var input1 = $('<input/>', { type: 'text', id: 'inputTags', placeholder: 'space separated tags', val: jsonObj[id].tags });
  var input2 = $('<input/>', { type: 'hidden', id: 'inputTagId', val: id });
  html.push($div1.append(input1));
  html.push($div1.append(input2));
  html.push($div2.append(tags));
  var $div = $('<div/>', { id: tagId, class: 'px-4 py-3 my-2 tagCell table' }).css('display', 'none').html(html);
  $id.after($div);
  $('#' + tagId).slideToggle('fast');
});

// click on tags
$(bodyEl).on('click', '.tagSelect', function fn() {
  var $this = $(this);
  var tag = $this.text();
  $.setCookie('tag', tag);
  triggerRefresh();
});

function initList() {
  var cookieJsonId = $.getCookie('listId');
  var getJsonId = getQueryStr();

  if (getJsonId) {
    jsonId = getJsonId;
    $.setCookie('listId', getJsonId);
    return true;
  }
  if (cookieJsonId) {
    jsonId = cookieJsonId;
    return true;
  }
  return false;
}

function createNewList() {
  $.ajax({
    url: 'https://api.myjson.com/bins',
    type: 'POST',
    data: '{}',
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    success: function (data) {
      window.location.href = '?' + data.uri.match(/([^/]*)\/*$/)[1];
    },
  });
}

function init() {
  if (initList()) loadList();
  else createNewList();
  $inputShareId.val(window.location.hostname + '/?' + jsonId);
}

$(document).ready(init);
