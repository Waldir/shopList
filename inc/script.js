/*! ShopList - v1.0.14 - 2019-03-19
* http://waldirb.com/sl/
* Simple shopping list with tags
* Licensed MIT */

(function main($) {
  'use strict';

  var version = '1.0.14';
  var v = '?v=' + version;
  var jsonId;
  var jsonUrl = 'https://api.myjson.com/bins/';
  var $theList1 = $('#checkedList');
  var $theList2 = $('#uncheckedList');
  var $theList3 = $('#tagsUList');
  var $theList4 = $('#tagsCList');
  var $contNewItem = $('#contNewItem');
  var $hideOnScroll = $('.hideOnScroll');
  var $tagCheckedHeader = $('#tagCheckedHeader');
  var $tagUncheckedHeader = $('#tagUncheckedHeader');
  var $uncheckedHeader = $('#uncheckedHeader');
  var $checkedHeader = $('#checkedHeader');
  var $inputNew = $('#newItem');
  var $inputShareId = $('#inputShareId');
  var jsonObj = {};
  var bodyEl = document.body;
  var tagCookie = null;
  var cache = {};

  /**
   * get the list id out of the url
   * @returns {string} or false
   */
  function getQueryStr() {
    var str = window.location.search;
    return str ? str.replace('?', '') : false;
  }

  /**
   * generate a random id
   * @returns
   */
  function randId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * turn a string to an array using a divider
   * @param {string} str
   * @param {string} div
   * @returns {array}
   */
  function strToArr(str, div) {
    var divider = div || ' ';
    return str ? str.split(divider) : [];
  }

  /**
   * determine if a tag exists within a tag string
   * @param {string} _tag
   * @param {string} _tagStr
   * @returns {boolean}
   */
  function hasATag(_tag, _tagStr) {
    var tag = _tag || '';
    var tagStr = _tagStr || '';
    return tag ? strToArr(tagStr.toLowerCase()).indexOf(tag.toLowerCase()) > -1 : false;
  }

  /**
   * attempt to remove emojis from a string
   * @param {string} str
   * @returns
   */
  function removeEmojis(str) {
    return str.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
  }
  /**
   * extend jquery to create new btn
   * @param {string} src
   * @param {string} classes
   */
  $.extend({
    createNewBtn: function createNewBtn(src, classes) {
      var $img = $('<img>', { src: 'images/' + src + '.svg' + v });
      return $('<div>', { class: 'btn d-inline-block p-2 ' + classes }).html($img);
    },
  });

  /**
   * creates an element on the list with all its icons
   * @param {boolean} checked
   * @param {string} id
   * @param {string} name
   * @returns {JQuery Object}
   */
  function createNewEl(checked, id, name) {
    var html      = [];
    var sortName  = removeEmojis(name).trim();
    var ck        = checked ? 'checked' : 'unchecked';
    var $title    = $('<span>', { id: 'itemName-' + id }).text(name);
    var $del      = $.createNewBtn('delete', 'deleteItem').attr({ 'data-index': id });
    var $tag      = $.createNewBtn('tag', 'tag').attr({ 'data-index': id });
    var $edit     = $.createNewBtn('pencil', 'editItem').attr({ 'data-index': id });
    var $arrow    = $.createNewBtn('angle', 'arrow').attr({ 'data-index': id });
    var $check    = $.createNewBtn(ck, 'checkItem').attr({ 'data-index': id, 'data-check': checked });
    var $col1     = $('<div>', { class: 'col-6 col-md-8 d-flex align-items-center' });
    var $col2     = $('<div>', { class: 'col-6 col-md-4 text-align-right right-menu' });
    html.push($col1.append($check));
    html.push($col1.append($title));
    html.push($col2.append($arrow));
    html.push($col2.append($tag));
    html.push($col2.append($edit));
    html.push($col2.append($del));
    return $('<div/>', { id: id, class: 'row row-bar position-relative m-1', 'data-sort': sortName }).html(html);
  }

  /**
   * loads the list from the remote aip
   * and appends it all into the DOM
   */
  function loadList() {
    $.get(jsonUrl + jsonId, function fn(data) {
      jsonObj = data;
      var unchecked = [];
      var checked = [];
      var tagUnchecked = [];
      var tagChecked = [];
      var tCCount = 0;
      var tUCount = 0;
      var uCount = 0;
      var cCount = 0;
      var tTotal = 0;
      var uTotal = 0;
      var msg;
      var html = [];
      $theList1.empty();
      $theList2.empty();
      $theList3.empty();
      $theList4.empty();
      $.each(data, function fn(k, v) {
        var div = createNewEl(v.checked, k, v.name);
        var hasTag = hasATag(tagCookie, v.tags);
        if (hasTag && v.checked) {
          tagChecked.push(div);
          tCCount += 1;
          tTotal += 1;
        } if (hasTag && !v.checked) {
          tagUnchecked.push(div);
          tUCount += 1;
          tTotal += 1;
        } if (!hasTag && v.checked) {
          checked.push(div);
          cCount += 1;
          uTotal += 1;
        } if (!hasTag && !v.checked) {
          unchecked.push(div);
          uCount += 1;
          uTotal += 1;
        }
      });

      if (unchecked.length > 0) {
        msg = 'Unchecked: ' + uCount + '/' + uTotal;
        $theList1.append(unchecked).sortDivs();
        $uncheckedHeader.slideDown('fast').html(msg);
      } else $uncheckedHeader.slideUp('fast');

      if (checked.length > 0) {
        msg = cCount === uTotal ? 'All done!' : 'Checked: ' + cCount + '/' + uTotal;
        $theList2.append(checked).sortDivs();
        $checkedHeader.slideDown('fast').html(msg);
      } else $checkedHeader.slideUp('fast');

      if (tagUnchecked.length > 0) {
        msg = tagCookie + ': ' + tUCount + '/' + tTotal;
        var $minusBtn1 = $.createNewBtn('minus', 'delTagCookie');
        html.push($('<div>', { class: 'col-6 d-flex align-items-center pl-3' }).html(msg));
        html.push($('<div>', { class: 'col-6 text-align-right' }).html($minusBtn1));
        $theList3.append(tagUnchecked).sortDivs();
        $tagUncheckedHeader.slideDown('fast').html(html);
      } else $tagUncheckedHeader.slideUp('fast');

      if (tagChecked.length > 0) {
        html = [];
        msg = tCCount === tTotal ? 'All done with ' + tagCookie : tagCookie + ': ' + tCCount + '/' + tTotal;
        var $minusBtn2 = $.createNewBtn('minus', 'delTagCookie');
        html.push($('<div>', { class: 'col-6 d-flex align-items-center pl-3' }).html(msg));
        html.push($('<div>', { class: 'col-6 text-align-right' }).html($minusBtn2));
        $theList4.append(tagChecked).sortDivs();
        $tagCheckedHeader.slideDown('fast').html(html);
      } else $tagCheckedHeader.slideUp('fast');
    });
  }

  /**
   * trigger a refresh on DOM
   * that will recall loadList()
   */
  function triggerRefresh() {
    $('#reloadBtn img').addClass('rotated');
    setTimeout(function x() {
      $('#reloadBtn img').removeClass('rotated');
    }, 600);
    loadList();
  }

  /**
   * send out newly generated data to the remote aip
   * in order to update it. Will trigger a refresh when done
   */
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

  /**
   * Will add a new item to the list and
   * it will update the json at the end
   * @returns false
   */
  function addItem() {
    var newItem = $inputNew.val();
    var id = randId();
    if (!newItem.trim()) return false;
    jsonObj[id] = { name: newItem, checked: false };
    var $el = createNewEl(false, id, newItem).css('display', 'none');
    $theList1.append($el).sortDivs();
    $el.slideToggle('fast').coin('coin', 'new item created');
    $inputNew.val('');
    $contNewItem.slideUp('fast');
    updateJson();
    return false;
  }

  /**
   * will animate and remove a tagCell
   * ignores param added to ignore the current cell
   * @param {string} ignore
   */
  function removeTagCell(ignore) {
    var not = ignore || '';
    $('.tagCell').children().hide('fast');
    $('.tagCell').slideToggle('slow', function x() {
      $(this).not(not).remove();
    });
  }

  /**
   * Hides each bottom menu on scroll if it is not focused
   */
  function hideBottomMenu() {
    window.onscroll = function hideAddNew() {
      $.each($hideOnScroll, function x(k, v) {
        if ($(v).is(':visible') && !$(v).children('input').is(':focus')) $(v).slideUp('fast');
      });
    };
  }

  /**
   * create a new list when no cookie is found or no id is selected
   */
  function createNewList() {
    var id = randId();
    jsonObj[id] = { name: 'Bananas 🍌', checked: false, tags: 'fruit costco' };
    $.ajax({
      url: 'https://api.myjson.com/bins',
      type: 'POST',
      data: JSON.stringify(jsonObj),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (data) {
        window.location.href = '?' + data.uri.match(/([^/]*)\/*$/)[1];
      },
    });
  }

  /**
   * initiate the list
   * @returns {boolean}
   */
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

  /**
   * force a refresh cache by changing all
   * img, link and script tags
   * !! Dev environment only
   * @param {boolean} bool
   * @returns {boolean}
   */
  function forceCache(bool) {
    if (!bool) return false;
    $('img, link, script').each(function x() {
      var src = $(this).attr('src');
      var href = $(this).attr('href');
      var tagName = $(this).prop('tagName');
      if (tagName === 'LINK') $(this).attr('href', href + v);
      if (tagName === 'IMG' || tagName === 'SCRIPT') $(this).attr('src', src + v);
    });
    return true;
  }

  // * ============================
  // * Clicks below
  // * ============================
  $inputNew.keypress(function fn(e) {
    if (e.which === 13) addItem();// enter pressed
  }).autocomplete({
    source: function source(request, response) {
      var term = request.term;
      if (term in cache) {
        response(cache[term]);
        return;
      }
      $.getJSON('inc/foods.json', request, function x(data) {
        var autoComplete = [];
        for (let i = 0; i < data.length; i++) {
          var name = data[i].name.toUpperCase();
          var thisTerm = term.toUpperCase();
          var match = name.match(thisTerm);
          if (match) autoComplete.push(data[i].emoji + ' ' + data[i].name);
        }
        cache[term] = autoComplete;
        response(autoComplete);
      });
    },
    minLength: 2,
    // select: addItem,
    position: { my: 'left bottom', at: 'left top', collision: 'flip' },
  });

  // reload btn
  $('#reloadBtn').on('click', triggerRefresh);
  // share list btn
  $('#shareList').on('click', function x() {
    $inputShareId.val('http://waldirb.com/sl/?' + jsonId);
    $inputShareId.copyToClip();
    $(this).coin('coin', 'Clipboard!');
  });

  // toggle on
  $('.toggleOn').on('click', function x() {
    var data = $(this).data('index');
    $(data).slideToggle('fast').add(data + ' input').focus();
  });

  // * ============================
  // * Delegated Clicks below
  // * ============================
  $(bodyEl)
  // inputTags
    .on('keypress', '#inputTags', function fn(e) {
      if (e.which === 13) {
        var tags = $('#inputTags').val();
        var id = $('#inputTagId').val();
        jsonObj[id] = { name: jsonObj[id].name, checked: jsonObj[id].checked, tags: tags };
        $(this).coin('coin', 'tag updated');
        updateJson();
      }
    })
  // delTagCookie
    .on('click', '.delTagCookie', function fn() {
      $.eraseCookie('tag');
      tagCookie = null;
      $(this).coin('coin', 'tag reset');
      triggerRefresh();
    })
  // inputEditName
    .on('keypress', '.inputEditName', function fn(e) {
      if (e.which === 13) {
        var val = $(this).val();
        var id = $(this).data('index');
        jsonObj[id] = { name: val, checked: jsonObj[id].checked, tags: jsonObj[id].tags };
        $(this).coin('coin', val + ' updated');
        updateJson();
      }
    })
  // editItem
    .on('click', '.editItem', function fn() {
      var id = $(this).data('index');
      var isOn = $(this).hasClass('on');
      var $itemEl = $('#itemName-' + id);
      var nameVal = $itemEl.text();
      var newInputId = 'editInput-' + id;
      var $newInput = $('<input>', {
        type: 'text',
        id: newInputId,
        class: 'inputEditName',
        'data-index': id,
      }).css('display', 'none').val(nameVal);
      $(this).toggleClass('on');
      if (isOn) {
        $itemEl.show();
        $('#' + newInputId).remove();
      } else {
        $itemEl.hide().after($newInput);
        $newInput.slideToggle('fast').focus();
      }
    })
  // arrow
    .on('click', '.arrow', function fn() {
      var $arrow = $(this);
      var $arrowParent = $(this).parent();
      $('.right-menu, .arrow').not($arrowParent).not($arrow).removeClass('on');
      $arrow.toggleClass('on').parent().toggleClass('on');
      $('.tag').removeClass('on');
      removeTagCell();
    })
  // deleteItem
    .on('click', '.deleteItem', function fn() {
      var id = $(this).attr('data-index');
      var $el = $('#' + id);
      delete jsonObj[id];
      $el.slideToggle('fast');
      updateJson();
      return false;
    })
  // checkItem
    .on('click', '.checkItem', function fn() {
      var $el  = $(this);
      var data = $el.data('check');
      var id   = $el.data('index');
      var $img = $el.children('img');
      var $id  = $('#' + id);
      var ckb  = data ? 'checked' : 'unchecked';
      var ckc  = data ? 'unchecked' : 'checked';
      var jData = !data;
      var hasTag = hasATag(tagCookie, jsonObj[id].tags);
      var $list;
      // if box is unchecked
      if (jData) $list = (tagCookie && hasTag) ? $theList4 : $theList2;
      else $list = (tagCookie && hasTag) ? $theList3 : $theList1;

      jsonObj[id] = { name: jsonObj[id].name, checked: jData, tags: jsonObj[id].tags };

      $id.slideToggle('fast', function hide() {
        $id.appendTo($list);
        $list.sortDivs();
        $el.data('check', ckc);
        $img.attr('src', $img.attr('src').replace(ckb, ckc));
        $id.slideToggle('fast', updateJson);
      });
      // updateJson();
      return false;
    })
  // tag
    .on('click', '.tag', function fn() {
      var $this = $(this);
      var isOn = $this.hasClass('on');
      $this.toggleClass('on');
      // if this is on already just kill it
      if (isOn) {
        removeTagCell();
        return false;
      }
      var id = $(this).parent().parent().attr('id');
      var $id = $('#' + id);
      var tagId = 'tag-' + id;
      var html = [];
      var tagsArr = strToArr(jsonObj[id].tags);
      removeTagCell('#' + tagId); // remove tag sells and ignore this one

      html.push($('<input/>', {
        type: 'text',
        id: 'inputTags',
        class: 'mb-3',
        placeholder: '+ Add Space Separated Tags',
        val: jsonObj[id].tags,
      }).css('width', '100%'));
      html.push($('<input/>', { type: 'hidden', id: 'inputTagId', val: id }));
      html.push($('<br>'));

      // get tags
      for (let i = 0; i < tagsArr.length; i++) {
        html.push($('<span/>', { class: 'mx-1 tagSelect' }).html(tagsArr[i]));
      }
      var $div = $('<div/>', { id: tagId, class: 'p-2 tagCell table' }).css('display', 'none').html(html);
      $id.after($div);
      $('#' + tagId).fadeIn('fast');
      return false;
    })
  // tagSelect
    .on('click', '.tagSelect', function fn() {
      var $this = $(this);
      var tag = $this.text();
      $.setCookie('tag', tag);
      tagCookie = tag;
      $(this).coin('coin', tag + ' selected');
      triggerRefresh();
    });

  // initiate script
  tagCookie = $.getCookie('tag');
  if (initList()) loadList();
  else createNewList();
  hideBottomMenu();
  forceCache(false);
}(jQuery));
