// ==UserScript==
// @name        Joyreactor advanced script
// @namespace   http://joyreactor.cc/tag/jras
// @description comment tree collapse, remove/hide posts/comments by username/tag, remove share buttons and more on http://joyreactor.cc/tag/jras
// @author      AntiUser
// @license     MIT
// @copyright   2016+, AntiUser (http://joyreactor.cc/user/AntiUser)
// @homepage    http://joyreactor.cc/tag/jras
// @homepageURL http://joyreactor.cc/tag/jras
// @supportURL  https://github.com/mrAntiUser/JRAS/issues
// @include     *reactor.cc*
// @include     *joyreactor.cc*
// @include     *jr-proxy.com*
// @connect     api.joyreactor.cc
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require     https://code.jquery.com/ui/1.11.4/jquery-ui.min.js
// @version     2.5.5
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.listValues
// @grant       GM.deleteValue
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// @run-at      document-end
// ==/UserScript==

const JRAS_CurrVersion = '2.5.5';

/* RELEASE NOTES
 2.5.5
   * баг с включением звука видео под катом
   * рефакторинг накопившихся изменений по работе с видео
 2.5.2
   + чутка поправил фон для заминусованных комментов
 2.5.1
   + Добавил фон для заминусованных комментов
 2.5.0
   + линки пользователей из профиля
     + Опция надо ли вообще [true]
     + Опция Пользовательские ссылки на посте [true]
     + Опция Пользовательские ссылки в комментариях [true]
     + Опция сколько показывать ссылок (0 - показывать всё) [0]
     + Опция Показывать прогрессбар ожидания загрузки пользовательских ссылок [true]
     + Опция Пытаться загрузить favicon.ico для неизвестных сайтов [true]

  see more on https://old.reactor.cc/tag/jras

 */

(function(win){
  'use strict';

  win.console.log(' ================ start JRAS');

  if (location.host == 'json.joyreactor.cc'){
    win.console.log(' ================ end JRAS - page is sexy runetki');
    return;
  }

  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  const gm3 = 'undefined' !== typeof GM_xmlhttpRequest;
  const GMgetValue        = (gm3) ? GM_getValue : GM.getValue;
  const GMsetValue        = (gm3) ? GM_setValue : GM.setValue;
  const GMlistValues      = (gm3) ? GM_listValues : GM.listValues;
  const GMdeleteValue     = (gm3) ? GM_deleteValue : GM.deleteValue;
  const GMxmlhttpRequest  = (gm3) ? GM_xmlhttpRequest : GM.xmlhttpRequest;

  const graphqlEndpoint = 'https://api.joyreactor.cc/graphql';

  const defUserName = 'Anonymous';
  const defLoadTooltipSize = 212;
  const defUserTooltipSize = 212;
  const defTagTooltipSize = 270;

  const lng = new LanguageData();
  const page = new PageData();
  const userUrlsByName = new Map();
  const socialMediaIco = new SocialMediaIcons();


  const quoteData = {
    $commentContainer: undefined,
    $popupQuote: undefined,
    quoteInsertData: undefined };

  const delay = {
    makeAllUsersCommentsLink: 150,
    showHiddenComments: 500
  }

  const userOptions = initOptions();
  userOptions.loadUserData(page.currentUser);
  const videoSoundController = new VideoSoundController({win: win, $: $, userOptions: userOptions, lng: lng});
  try{
    correctStyle();
    correctPostDate();
    addNewCSSClasses();
    themeDependentCSS();
    makePropElements();
    makeAllUserTooltip();
    makeAllUsersLink();
    makeAllTagTooltip();
    makePostControls();
    procTopbar();
    removeRedirectLink();
    removeShareButtons();
    correctOldReactorLink();
    previewReactorLink();
    makeExtendedGifLinks();
    videoSoundController.init();
    makeQuotes();
    makePopuperQuote();

    if (page.pageIs('post') || page.pageIs('discussion')){
      showHiddenComments();
      correctCommentSize();
      makeTreeComments();
      makeAvatarOnOldDesign();
    }
    makeAllUsersCommentsLink();

    userRemove(userOptions.data.BlockUsers);
    tagRemove(userOptions.data.BlockTags, true);

    subscribeShowComment();
    videoSoundController.subscribe();

    dynamicStyle();

  }catch(err){
    win.console.log("~~JRAS_ERROR: " + err + '\n' + err.stack)
  }

  win.console.log(' ================ end JRAS');

  //=====================================================================================================

  function initOptions(){
    const retVal = {
      data: {
        language: { dt: null,
          propData: function(){return{ def: 'ru', type: 'combobox'}},
          values: function(){return lng.getLangs()}
        },
        correctRedirectLink: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        removeShareButtons: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        makeAvatarOnOldDesign: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        makeAvatarOnlyFullPost: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        avatarHeight: { dt: null,
          propData: function(){return { def: 35, type: 'number', min: 5, max: 300}}
        },
        makeTreeComments: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        treeCommentsOnlyFullPost: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        whenCollapseMakeRead: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        isToBeLoadingUserData: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        hideUserAwardsWhen: { dt: null,
          propData: function(){return { def: 60, type: 'combobox'}},
          values: function(){const retVal = {}; for(let i = 0; i < 101; i += 5){ if (i != 0 && i < 20){continue} retVal[i] = i} return retVal}
        },
        minShowUserAwards: { dt: null,
          propData: function(){return { def: 40, type: 'combobox'}},
          values: function(){const retVal = {}; for(let i = 10; i < 101; i += 10){ retVal[i] = i} return retVal}
        },
        fixedTopbar: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        hideFixedTopbar: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showUTOnLine: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showUTOnComment: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showUTOnPrivateMess: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showUTOnPeople: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showUTOnSidebarTopUsers: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showUTOnTopComments: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showUTOnSidebarOnline: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showUTOnPostControl: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showHiddenComments: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        showHiddenCommentsMark: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        isToBeLoadingTagData: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showTTOnTrends: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showTTOnLikeTags: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showTTOnInteresting: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showTTOnLine: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        showTTFullPost: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        delUserComment: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        showUserNameDelComment: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        fullDelUserPost: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        delUserPost: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        showUserNameDelPost: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        chatlaneToPacaki: { dt: null,// Убирать цветовую отметку донатера
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        collapseComments: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        collapseCommentsOnlyFullPost: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        collapseCommentWhenSize: { dt: null,
          propData: function(){return { def: 110, type: 'number', min: 20, max: 10000}}
        },
        collapseCommentToSize: { dt: null,
          propData: function(){return { def: 72, type: 'number', min: 20, max: 10000}}
        },
        pcbShowPostControl: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        pcbShowInFullPost: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        pcbHideJRShareBlock: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        pcbHideJRRatingBlock: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        pcbTopBorder: { dt: null,
          propData: function(){return { def: 10, type: 'number', min: 0, max: 200}}
        },
        pcbBottomBorder: { dt: null,
          propData: function(){return { def: 10, type: 'number', min: 0, max: 200}}
        },
        pcbTopScreenPos: { dt: null,
          propData: function(){return { def: 30, type: 'number', min: 0, max: 200}}
        },
        showCommentDate: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        pcbAnimateMove: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        pcbAnimateMoveSpeed: { dt: null,
          propData: function(){return { def: 2, type: 'number', min: 1, max: 9}}
        },
        pcbHideShareButoons: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        stCorrectStyle: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        stHideSideBar: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        stStretchContent: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        stStretchSize: { dt: null,
          propData: function(){return { def: 90, type: 'number', min: 60, max: 100}}
        },
        stSideBarSizeToPage: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        stShowSideBarOnHideContent: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        stUseDynStyleChanges: { dt: null,
          propData: function(){return { def: false, type: 'checkbox'}}
        },
        stCenterContent: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        correctOldReactorLink: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        previewReactorLink: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        previewSizeX: { dt: null,
          propData: function(){return { def: 50, type: 'number', min: 20, max: 80}}
        },
        previewSizeY: { dt: null,
          propData: function(){return { def: 50, type: 'number', min: 20, max: 80}}
        },
        extendedGifLinks: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        videoSoundOptions: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        restartVideoOnUnmute: { dt: null,
          propData: function(){return { def: true, type: 'checkbox'}}
        },
        videoSoundMuteOnPostScroll: { dt: null,
          propData: function(){return { def: true, type: 'radio', group: 'videoSoundMuteOnScrollMode'}}
        },
        videoSoundMuteOnVideoScroll: { dt: null,
          propData: function(){return { def: false, type: 'radio', group: 'videoSoundMuteOnScrollMode'}}
        },
        autoUnmuteVideoNone: { dt: null,
          propData: function(){return { def: false, type: 'radio', group: 'autoUnmuteVideoMode'}}
        },
        autoUnmuteVideoOnHalfScreen: { dt: null,
          propData: function(){return { def: false, type: 'radio', group: 'autoUnmuteVideoMode'}}
        },
        autoUnmuteVideoOnScreenMiddle: { dt: null,
          propData: function(){return { def: true, type: 'radio', group: 'autoUnmuteVideoMode'}}
        },
        showUserLinks: { dt: null,
          propData: function () { return { def: true, type: 'checkbox' } }
        },
        showUserLinksProgressbar: { dt: null,
          propData: function () { return { def: true, type: 'checkbox' } }
        },
        loadFavoriteIcoForUserLinks: {
          dt: null,
          propData: function () { return { def: true, type: 'checkbox' } }
        },
        showUserLinksOnPost: { dt: null,
          propData: function () { return { def: true, type: 'checkbox' } }
        },
        showUserLinksOnComment: {
          dt: null,
          propData: function () { return { def: true, type: 'checkbox' } }
        },
        showUserLinksCount: {
          dt: null,
          propData: function () { return { def: 0, type: 'number', min: 0, max: 99 } }
        },
        makeQuotesOnComments: { dt: null,
          propData: function () { return { def: false, type: 'checkbox' } }
        },
        makeExtQuotes: { dt: null,
          propData: function () { return { def: true, type: 'checkbox' } }
        },
        makeQuoteTool: { dt: null,
          propData: function () { return { def: true, type: 'checkbox' } }
        },
        qTAddUserInfo: { dt: null,
          propData: function () { return { def: true, type: 'checkbox' } }
        },
        qTInsertIntoShowingInput: { dt: null,
          propData: function () { return { def: 'newAnswerAlways', type: 'combobox' } },
          values: function () { return {
            newAnswerAlways: lng.getVal('JRAS_GUI_NEWANSWERALWAYS'),
            findOpenedForm: lng.getVal('JRAS_GUI_FINDOPENEDFORM'),
            addCommentForm: lng.getVal('JRAS_GUI_ADDCOMMENTFORM')
          }}
        },

        BlockUsers: [],
        BlockTags: [],

        init: function(prop){ if (!this[prop]){return} this[prop].dt = this[prop].propData().def },
        validator: function (prop, val) { if (!this[prop]) { return } return (this[prop]['validator']) ? this[prop].validator() : $.isNumeric(val) && val >= this[prop].propData().min && val <= this[prop].propData().max },
        guiDesc: function (prop) { if (!this[prop]) { return } return lng.getVal('JRAS_GUI_' + prop.toUpperCase()) }
      },

      each: function(func){
        if (func === undefined){return}
        for(let dItm in this.data){
          if((dItm == undefined) || typeof(this.data[dItm]) == 'function'|| (dItm == 'BlockUsers') || (dItm == 'BlockTags')){continue}
          func(this.data, dItm, this.data[dItm]);
        }
      },

      val: function(option, value){
        if(this.data[option]){
          if(value === undefined){return this.data[option].dt}
          else{
            if (this.data[option].propData().type == 'number'){
              if (this.data.validator(option, value)){
                this.data[option].dt = value
              }
            }else{
              this.data[option].dt = value
            }
          }
        }
      },

      getGuiDesc: function(option){
        return (this.data[option]) ? this.data.guiDesc(option) : option;
      },

      setDef: function(){
        this.each(function(thd, optName){ thd.init(optName) });
        this.data.BlockUsers = [];
        this.data.BlockTags = [];
      },

      removeAllSavedData_old: function(){
        this.removeSavedUserData_old();
      },

      correctUserName_old: function(str){
        return str.replace(/[.*\W[\]\\]/g, '_');
      },

      removeSavedUserData_old: function (user) {
        user = this.correctUserName_old(user);
        let pref = (user === undefined) ? '' : user + '_';
        let keys = GMlistValues();
        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          if (key.match(new RegExp(pref + '.*'))) {
            GMdeleteValue(key);
          }
        }
      },

      saveUserData_old: function(forUser){
        forUser = this.correctUserName_old(forUser);
        this.removeSavedUserData_old(forUser);
        const pref = forUser + '_';
        this.each(function(thd, optName, opt){
          GMsetValue(pref + optName, opt.dt);
        });
        for(let i = 0; i < this.data.BlockUsers.length; i++){
          GMsetValue(pref + 'BlockUsers_name_' + i, this.data.BlockUsers[i]);
        }
        for(let i = 0; i < this.data.BlockTags.length; i++){
          GMsetValue(pref + 'BlockTags_name_' + i, this.data.BlockTags[i]);
        }
      },

      loadUserDataFrom_old: function(prefix){
        prefix = this.correctUserName_old(prefix);
        let retVal = false;
        const posf = '.*';
        let keys = GMlistValues();
        this.data.BlockUsers = [];
        this.data.BlockTags = [];
        for(let i = 0; i < keys.length; i++){
          let key = keys[i];
          if(!key.match(new RegExp(prefix + posf))){
            continue
          }
          if(key.match(new RegExp(prefix + 'BlockUsers_name_' + posf))){
            this.data.BlockUsers.push(GMgetValue(key, ''));
          }else{
            if(key.match(new RegExp(prefix + 'BlockTags_name_' + posf))){
              this.data.BlockTags.push(GMgetValue(key, ''));
            }else{
              const rkey = key.replace(prefix, '');
              if(this.data[rkey] === undefined){
                continue
              }
              this.data[rkey].dt = GMgetValue(key, this.data[rkey]);
              retVal = true;
            }
          }
        }
        this.data.BlockUsers.sort();
        this.data.BlockTags.sort();
        return retVal;
      },

      correctUserName: function (str) {
        return 'user_' + b64encode(str);
      },

      loadOpt: function () {
        return JSON.parse(win.localStorage.getItem('jras_options'));
      },

      saveOpt: function (jrasOptions) {
        if (!jrasOptions) {return}
        win.localStorage.setItem('jras_options', JSON.stringify(jrasOptions));
      },

      removeAllSavedData: function () {
        this.removeSavedUserData();
        this.removeAllSavedData_old();
      },

      removeSavedUserData: function (user, jrasOpt) {
        user = this.correctUserName(user);
        if (!user) {
          win.localStorage.clear();
        } else {
          const jrasOptions = (jrasOpt) ? jrasOpt : this.loadOpt();
          if (!jrasOptions && !jrasOptions[user]) {
            return
          }
          delete jrasOptions[user];
          if (jrasOpt) {
            return jrasOptions;
          } else {
            this.saveOpt(jrasOptions);
          }
        }
      },

      setUserDataFrom: function (jrasOptUser) {
        if (!jrasOptUser) { return }
        for (const prop of Object.keys(jrasOptUser)) {
          if (this.data[prop]) {
            if (Array.isArray(this.data[prop])) {
              this.data[prop] = jrasOptUser[prop];
            } else {
              this.data[prop].dt = jrasOptUser[prop].dt;
            }
          }
        }
      },

      saveUserData: function (forUser) {
        forUser = this.correctUserName(forUser);
        const jrasOptions = this.loadOpt() || {};
        jrasOptions[forUser] = this.data;
        this.saveOpt(jrasOptions);
      },

      loadUserDataFrom: function (forUser) {
        const user = this.correctUserName(forUser);
        const jrasOptions = this.loadOpt();
        if (!jrasOptions || !jrasOptions[user]){
          forUser = this.correctUserName_old(forUser);
          if (!this.loadUserDataFrom_old(forUser + '_')){
            if (!this.loadUserDataFrom_old(forUser)){
              return;
            }
          }
          this.removeSavedUserData_old(forUser);
          this.saveUserData(forUser);
          return;
        }
        this.setUserDataFrom(jrasOptions[user]);
      },

      loadUserData: function(forUser){
        this.loadUserDataFrom(forUser);
      },

      exportUserData: function (forUser) {
        const user = this.correctUserName(forUser);
        const jrasOptions = this.loadOpt();
        if (!jrasOptions || !jrasOptions[user]) {
          this.saveUserData(forUser);
          let a = this.exportUserData(forUser);
          if (!a){ a = 'no saved data'}
          return a;
        }
        return b64encode(JSON.stringify(jrasOptions[user]));
      },

      importUserData: function (forUser, impData) {
        const user = this.correctUserName(forUser);
        const jrasOptions = this.loadOpt();
        if (!jrasOptions) { return false}
        jrasOptions[user] = JSON.parse(b64decode(impData));
        this.saveOpt(jrasOptions);
        this.setUserDataFrom(jrasOptions[user]);
        return true;
      }
    };

    retVal.setDef();
    return retVal;
  }

  function b64encode(str){
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64decode(str){
    return decodeURIComponent(escape(atob(str)));
  }

  function escapeGraphqlString(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function removeRedirectLink($inElm){
    if(!userOptions.val('correctRedirectLink')){
      return;
    }
    const selector = 'a[href*="redirect?"]'
    const $selElmts = (!$inElm) ? $(selector) : $inElm.find(selector);
    $selElmts.each(function(){
      const $currA = $(this);
      const matches = /(?:\?|\&)([\w]+)(?:\=|\&?)([^&#]*)/g.exec($currA.attr('href'));
      $.each(matches, function(index){
        if (matches[index] == 'url'){
          $currA.attr('href', decodeURIComponent(matches[index + 1]));
          return false;
        }
      });
    });
  }

  function correctOldReactorLink($inElm) {
    if (!userOptions.val('correctOldReactorLink')) {
      return;
    }
    const selector = 'a[href*="joyreactor"]:contains("old.reactor")';
    const $selElmts = (!$inElm) ? $(selector) : $inElm.find(selector);
    if ($selElmts.length == 0){return}
    $selElmts.each(function(){
      $(this).attr("href", $(this).attr("href").replace(/joyreactor/, "old.reactor"));
    });
  }

  function removeShareButtons($inElm){
    if(!userOptions.val('removeShareButtons')){
      return;
    }
    const $selElmts = (!$inElm) ? $('body') : $inElm;
    $selElmts.find('a.share_vk, a.share_fb, a.share_twitter, a.share_mail').remove();
  }

  function previewReactorLink($srcElm) {
    if (!userOptions.val('previewReactorLink')) {
      return;
    }
    const glob = !$srcElm;
    const selectors = [
      'a[href*="reactor.cc/post/"]:not(a[href*="redirect?"], div.image>a)',
      'a[href^="/post/"]:not(a[href*="redirect?"], div.image>a, .csrfLink, .toggleComments, .link, [target="_blank"], span.reply-link>a)',
    ].map(s => glob ? `.post_content ${s}, .post_comment_list div.txt ${s}` : s).join(', ');
    const $selElmts = glob
      ? $(selectors)
      : $srcElm.find(selectors);
    if ($selElmts.length == 0) { return }
    makeAllPreviewTooltip($selElmts);
  }

  function makeAllTagTooltip(){
    if(!userOptions.val('isToBeLoadingTagData')){
      return;
    }
    let sel = [];
    if(userOptions.val('showTTOnLine')){
      sel.push('div.postContainer h2.taglist a');
    }
    if(userOptions.val('showTTFullPost')){
      sel.push('div.postContainer strong.taglist a');
    }
    if(userOptions.val('showTTOnTrends')){
      sel.push('div.sidebar_block.trends_wr > div.sidebarContent > div.blogs > table > tbody > tr > td:nth-child(2) > a');
    }
    if(userOptions.val('showTTOnLikeTags')){
      sel.push('div.sidebarContent > div.blogs#blogs_alltime_content > table > tbody > tr > td:nth-child(2) > a');
      sel.push('div.sidebarContent > div.blogs#blogs_week_content > table > tbody > tr > td:nth-child(2) > a');
      sel.push('div.sidebarContent > div.blogs#blogs_2days_content > table > tbody > tr > td:nth-child(2) > a');
    }
    if(userOptions.val('showTTOnInteresting')){  //интересное
      sel.push('div.sidebar_block.blogs_wr > div.sidebarContent > div.blogs > table > tbody > tr > td:nth-child(2) > a');
    }
    if(sel.length != 0){
      makeTagTooltips(sel.join(', '));
    }
  }

  function makeAllUserTooltip(){
    if(!userOptions.val('isToBeLoadingUserData')){
      return;
    }
    let sel = [];
    sel.push('div.comments_bottom > span >a.comment_username');
    if(userOptions.val('showUTOnLine')){
      sel.push('div.uhead_nick > a');
    }
    if(userOptions.val('showUTOnComment')){
      sel.push('span.reply-link > a:first-child');
    }
    if(userOptions.val('showUTOnPrivateMess')){
      sel.push('div.mess_from > a');
    }
    if(userOptions.val('showUTOnPeople')){
      sel.push('div.user > div.userblock > a');
    }
    if(userOptions.val('showUTOnSidebarTopUsers')){
      sel.push('div.user.week_top > a');
    }
    if(userOptions.val('showUTOnSidebarOnline')){
      sel.push('div.avatar_holder > a');
    }
    if(userOptions.val('showUTOnTopComments')){
      sel.push('div.topComments small > a');
    }
    if(sel.length != 0){
      makeUserTooltips(sel.join(', '));
    }
  }

  function procTopbar(){
    if (!page.isNewDesign){return}
    if(userOptions.val('fixedTopbar')){
      $('#topbar.topbar_wr').css({
        'position': 'fixed',
        'background': 'rgba(57, 47, 30, 0.85) none repeat scroll 0% 0%',
        'box-shadow': '0px -6px 10px 9px rgb(0, 0, 0)'});
      if(userOptions.val('hideFixedTopbar')){
        const checkPos = function(){
          let $topbar = $('#topbar.topbar_wr');
          $topbar.find('.topbar_inner').css({'transition': 'top .4s cubic-bezier(.45,.05,.55,.95)', 'top': '-40px'});
          $topbar.css({'transition': 'height .4s cubic-bezier(.45,.05,.55,.95)', 'height': '10px'});
          $topbar.hover(function(e) {
            let a = $(win).scrollTop() < 38 ? -$(window).scrollTop() : '-40px';
            $(this).find('.topbar_inner').css('top', e.type === 'mouseenter' ? '0' : a);
            a = $(win).scrollTop() < 38 ? 45 - $(window).scrollTop() : '10px';
            $(this).css('height', e.type === 'mouseenter' ? '45px' : a);
          });
          if ($(win).scrollTop() < 38){
            $topbar.mouseenter();
            $topbar.mouseleave();
          }
        };
        checkPos();
        $(window).on('scroll', function(){
          // $(win).scroll(function(){
          checkPos();
        });
      }
    }
  }

  function userRemove(userNameArr){
    let currentUser;
    const blockUsersAsFindStr = 'a:contains(' + userOptions.data.BlockUsers.join('), a:contains(') + ')';
    $(blockUsersAsFindStr).parent('div.uhead_nick').closest('div.article').each(function(idx, elm){
      currentUser = $(this).find(blockUsersAsFindStr).text();
      if(userNameArr.indexOf(currentUser) != -1){
        if (userOptions.val('fullDelUserPost')){
          $(this).remove();
          return;
        }
        elm.parentElement.style.paddingBottom = '40px';
        makeBlockPostElements(elm, elm.parentElement.id, lng.getVal('JRAS_POSTBLOCKBYUSER'), currentUser, '', false);
        // win.console.info('  user - ' + currentUser + ' : hide post - ' + elm.parentElement.id);
        $(this).hide();
      }
    });
    $(blockUsersAsFindStr).parent('span.reply-link').closest('div[id^=comment_txt_].txt').each(function(idx, elm){
      currentUser = $(this).find(blockUsersAsFindStr).text();
      if(userNameArr.indexOf(currentUser) != -1){
        //       $(this).remove(); // для просто удаления. Будет пустой комент
        //       return;
        makeBlockCommElements(elm, elm.parentElement.id, lng.getVal('JRAS_COMMBLOCKBYUSER'), currentUser);
        // win.console.info('  user - ' + currentUser + ' : hide comment - ' + elm.parentElement.id);
        $(this).hide();
      }
    })
  }

  function tagRemove(tagNameArr, strictComp){
    const findStr = 'a:contains(' + tagNameArr.join('), a:contains(') + ')';
    //     findStr = ':contains(Anime):not(:contains(Anime Coub))'; // тест варианта условной блокировки

    $('.taglist ' + findStr).closest('div.article').each(function(idx, elm){
      let foundTagStr = '';
      let validTag = strictComp !== true;
      $(this).find('.taglist').find(findStr).text(function(index, text){
        if(strictComp === true){
          validTag = validTag || tagNameArr.indexOf(text) != -1;
        }
        foundTagStr += ' "' + text + '"';
      });
      if(validTag){
        // $(this).remove();
        // return;
        elm.parentElement.style.paddingBottom = '40px';
        makeBlockPostElements(elm, elm.parentElement.id, lng.getVal('JRAS_POSTBLOCKBYTAG'), foundTagStr, '', true);
        // win.console.info('hide post by tag - ' + foundTagStr);
        $(this).hide();
      }
    })
  }

  function makeExtendedGifLinks($nodes){
    if (!userOptions.val('extendedGifLinks')){
      return;
    }
    let baseDiv;
    const f = function(url){
      const ext = url.split('.').pop();
      const currItem = baseDiv.append(`
        <div class="jras-ext-gif-cont">
          <a href="${url}" class="ant-btn css-s2p5hg jras-ext-gif-box">
            <span role="img" aria-label="download" class="anticon anticon-download">
              <svg viewBox="64 64 896 896" focusable="false" data-icon="download" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path>
              </svg>
            </span>
            <span>${ext}</span>
          </a>
          <span class="jras-ext-gif-box" ${!page.isSchemeLight()?'style="color :#7b7b7b;"':''} />
        </div>`).children().last();
      GMxmlhttpRequest({
        method: "HEAD",
        url: location.protocol + url,
        headers: {
          'Referer': location.origin
        },
        onload: function(response) {
          const tmp = response.responseHeaders.match(/Content-Length:\s?(\d+)/i);
          if (tmp){
            currItem.find('a').attr('title', lng.getVal('JRAS_EXTGIFTITLESIZESTR') + tmp[1] + ' bytes');
            currItem.find('>span').text(niceBytes(tmp[1]));
          };
        }
      });
    }
    const $nds = $nodes ? $nodes : $('body');
    $nds.find('div.image:not(:has(div.jras-ext-gif-cont)) span').filter('.video_gif_holder, .video_holder').each(function(idx, elm){
      baseDiv = $(elm).append('<div class="gifbuttons"></div>').parent().find('div.gifbuttons');

      $(elm).find('video source').each(function(videoId, videoElm) {
        f($(videoElm).attr('src'));
      });
      const gifSrc = $(elm).find('a.video_gif_source');
      if (gifSrc.length) {
        f(gifSrc.attr('href'));
        gifSrc.remove();
      };
    });
  }

  function showHiddenComments($inElm){
    if (!userOptions.val('showHiddenComments')){
      return;
    }
    const $selElmts = ($inElm === undefined)
        ? $('div[id^=comment].comment.hidden a.comment_show')
        : $inElm.find('a.comment_show')
      ;
    $selElmts.each(function(idx, elm){
      setTimeout(function(){
        elm.click();
        if (userOptions.val('showHiddenCommentsMark')){
          let $parElm = $(elm).parent('div[id^=comment].txt');
          if (page.isNewDesign && userOptions.val('collapseComments')){
            $parElm = $(elm).parent().parent('div[id^=comment].txt');
            if (userOptions.val('collapseCommentsOnlyFullPost') && !page.pageIs('post')){
              $parElm = $(elm).parent('div[id^=comment].txt');
            }
          }
          $parElm.addClass('jras-hidden-comm-color');
          $parElm.parent('div[id^=comment].comment').addClass('jras-hidden-comm-bg');
        }
      }, delay.showHiddenComments * idx);
    })
  }

  function correctCommentSize(){
    if (!userOptions.val('collapseComments')){
      return;
    }
    $('div[id^=comment].comment>div[id^=comment_txt_].txt').each(function(idx, elm){
      makeCommentSizer(elm);
    })
  }

  function makeCommentSizer(elm){

    const makeBody = function($newCommBoy){
      const origHeight = parseInt($newCommBoy.height());
      if (origHeight < userOptions.val('collapseCommentWhenSize')){
        return
      }
      $newCommBoy.attr('origheight', origHeight)
        .after('<div id="jras-commSizer-sizer-all" title="' + lng.getVal('JRAS_COMMENTS_EXPANDCOLL_ALL') + '" class="jras-comment-expand-all jras-comment-expand-all-img"></div><div id="jras-commSizer-sizer" class="jras-comment-sizer"></div><br>')
        .css({
          'height': userOptions.val('collapseCommentToSize') + 'px',
          'overflow': 'hidden'
        });
      $(elm).find('#jras-commSizer-sizer').click(function(e, option){
        let opt = option;
        if (!opt){
          opt = {action:'', correctPos:true}
        }
        const $commBody = $(this).parent().find('#jras-commSizer-newBody');
        let h = $commBody.attr('origheight');
        const op = userOptions.val('collapseCommentToSize');
        switch (opt.action) {
          case 'open':
            break;
          case 'close':
            h = op;
            break;
          default:
            h = parseInt($commBody.height()) == h ? op : h ;
            break;
        }
        $commBody.animate({ 'height': h }, {
          duration: 300,
          complete: function(){
            correctPageHeight();
            if (!opt.correctPos) {return}
            const tmp = $(this).closest('div[id^=comment].comment').offset().top;
            if(tmp < win.pageYOffset){
              $('html, body')
                .animate({
                  scrollTop: tmp - 20
                }, 'slow');
            }
          }
        });
      });
      $(elm).find('#jras-commSizer-sizer-all').click(function(){
        const h = parseInt($(this).parent().find('#jras-commSizer-newBody').css('height'));
        const action = (userOptions.val('collapseCommentToSize') == h) ? 'open' : 'close' ;
        $('div#jras-commSizer-sizer.jras-comment-sizer').each(function(){
          $(this).trigger('click', [{action: action, correctPos: false}]);
        });
      })
    };

    let selector;
    if (page.isNewDesign){
      selector = ':not(.comments_bottom)';
    } else{
      if (parseInt($(elm).height()) < userOptions.val('collapseCommentWhenSize')){
        return;
      }
      selector = ':not(.reply-link)';
    }

    const $newDiv = $(elm).prepend('<div id="jras-commSizer-newBody" style="overflow: hidden;"></div>')
      .find('#jras-commSizer-newBody');

    let $child = $(elm).find(' > :first-child').next();
    while($child.is(selector)){

      $newDiv.append($child);
      $child = $(elm).find(' > :first-child').next();
    }
    makeBody($newDiv);

  }

  function subscribeShowComment(){
    const observer = new MutationObserver(function(mutations){
      mutations.forEach(function(mutation){
        if (mutation.type === 'childList'){
          setTimeout(function () {

            if (userOptions.val('showUTOnComment')) {
              makeUserTooltips($(mutation.addedNodes).find('span.reply-link > a:first-child'), 'a');
            }
            makeExtendedGifLinks($(mutation.addedNodes));
            videoSoundController.initControls($(mutation.addedNodes));
            for (const itm of mutation.addedNodes) {
              removeRedirectLink($(itm));
              showHiddenComments($(itm));
              correctOldReactorLink($(itm));
              previewReactorLink($(itm));

              if (userOptions.val('collapseComments')
                && !userOptions.val('collapseCommentsOnlyFullPost')
                //&& !page.isChrome // в хроме не работает. Не хочу разбираться возвращает хз какой height
              ) {
                $(itm).find('div[id^=comment].comment>div[id^=comment_txt_].txt').each(function (idx, elm) {
                  makeCommentSizer(elm);
                })
              }

              if ($(itm).is('div[id^=comment_list_post].comment_list_post')) {
                $(itm).find('div[id^=comment].comment').each(function (idx, elm) {
                  if (userOptions.val('makeQuotesOnComments')) {
                    makeQuotesNode($(elm), elm.id.replace('comment', ''));
                  }
                  if (userOptions.val('makeTreeComments') && !userOptions.val('treeCommentsOnlyFullPost')) {
                    makeTreeCommentNode(elm, elm.id.replace('comment', ''));
                  }
                  if (userOptions.val('makeAvatarOnOldDesign') && !userOptions.val('makeAvatarOnlyFullPost')) {
                    makeAvatarOnOldDesign(elm);
                  }
                  if (userOptions.val('showUserLinks') && userOptions.val('showUserLinksOnComment')) {
                    setTimeout(function () {
                      makeUserLinks($(elm).find('span.reply-link'), $(elm).find('span.reply-link>a:first').text().trim(), {
                        insertAfter: '>a:first',
                        loaderClassName: 'jras-nick-comment-loader',
                        linkContainerClassName: 'jras-nick-comment-link-cntnr',
                        linkClassName: 'jras-nick-comment-link' });
                    }, delay.makeAllUsersCommentsLink * idx);
                  };
                })
              }
              const blockUsersAsFindStr = 'a:contains(' + userOptions.data.BlockUsers.join('), a:contains(') + ')';
              $(itm).find(blockUsersAsFindStr).closest('div[id^=comment_txt_].txt').each(function (idx, elm) {
                const currUser = $.trim($(this).find(blockUsersAsFindStr).text());
                if (userOptions.data.BlockUsers.indexOf(currUser) != -1) {
                  makeBlockCommElements(elm, elm.parentElement.id, lng.getVal('JRAS_COMMBLOCKBYUSER'), currUser);
                  $(this).hide();
                }
              })
            }
            correctPageHeight();
          }, 10);

        }
      });
    });

    $('div.post_comment_list').each(function(idx, elm){
      observer.observe(elm, {
        characterData: true,
        childList: true,
        subtree: true
      });
    })
  }

  function makeTreeComments(){
    if(userOptions.val('makeTreeComments')){
      setTimeout(function(){
          $('div[id^=comment].comment').each(function(idx, elm){
            makeTreeCommentNode(elm, elm.id.replace('comment', ''));
          })
        }, 10
      );

    }
  }

  function blinkElement($element, count){
    for(let i = 0; i < count; i++){
      $element.fadeTo('fast', 0.3).fadeTo('fast', 1.0);
    }
  }

  function makeTreeCommentNode(elm, commentID){
    if($(elm).find('span#treeColl' + commentID)[0]){
      return
    }

    const collapseToParent = function(design){
      let retVal = null;
      const $parentElm = $(elm).parent();
      if($parentElm.prev().is('div[id^=comment].comment') && $(elm).is(':not(:first-child)')){
        // если парент elm - div#comment???.comment и elm не первый чилд
        const parentNodeID = $parentElm.prop('id');
        const $newElm = $(elm).prepend(design.replace('##parentNodeID##', parentNodeID))
          .find('div#jras-colltoparent-' + commentID);

        $newElm.click(function(){
          const $par = $('div#' + $(this).attr('parentNodeID'));
          $par.prev().find('>div[id^=comment_txt_].txt>div#jras-commSizer-sizer').trigger('click', [{action: 'close', correctPos: false}]);
          const currID = $(this).parent().prop('id');
          let $child = $par.find('>:first-child');
          while($child.prop('id') != currID){
            // Сворачиваем ноды
            $child.find('>div[id^=jras-treecomm]:first-child').trigger('click', [{action: 'close'}]);
            // Сворачиваем большие коменты
            $child.find('>div[id^=comment_txt_].txt>div#jras-commSizer-sizer').trigger('click', [{action: 'close', correctPos: false}]);
            $child = $child.next();
          }
          // далее происходит следующее
          // сдвигаем все вверх, так чтобы парент был на четверть экрана ниже верхней границы
          // когда анимация закончится проверим виден ли основной комент
          // если он находится ниже видимой области экрана,
          // то сдвинем парент на самый верх экрана
          // и помигаем :)
          $('html, body')
            .animate({
              scrollTop: $par.prev().offset().top - (win.innerHeight / 4)
            }, {
              complete: function(){
                if($(elm).offset().top > win.pageYOffset + win.innerHeight){
                  $('html, body')
                    .animate({
                      scrollTop: $(elm).parent().prev().offset().top - 20
                    }, 'slow');
                }
                for(let i = 0; i < 3; i++){
                  $(elm).parent().prev().fadeTo('fast', 0.3).fadeTo('fast', 1.0);
                  $(elm).fadeTo('fast', 0.3).fadeTo('fast', 1.0);
                }
              }
            });
          correctPageHeight();
        });
        retVal = $newElm;
      }
      return retVal;
    };

    let colTreeCSSForPlus;
    let colTreeCSSForMinus;
    const collapseTreeClick = function(e, option){
      if (!option){
        option = {action: ''};
      }
      const setPlus = function(elm){
        elm.text('+');
        elm.css(colTreeCSSForPlus);
        if(userOptions.val('whenCollapseMakeRead')){
          $toggleContainer.find('div.new').removeClass('new');
        }
      };
      const setMinus = function(elm){
        elm.text('-');
        elm.css(colTreeCSSForMinus);
      };
      const slide = function(slideCont, act){
        switch (act) {
          case 'open':
            setMinus($treeColl);
            slideCont.slideDown('display');
            break;
          case 'close':
            setPlus($treeColl);
            slideCont.slideUp('display');
            break;
          default:
            if(slideCont.css('display') == 'none'){
              setMinus($treeColl);
            }else{
              setPlus($treeColl);
            }
            slideCont.slideToggle('display');
            break;
        }
      };
      const $toggleContainer = $('#comment_list_comment_' + commentID);
      const $treeColl = $('span#treeColl' + commentID);
      slide($toggleContainer, option.action);
    };

    let $collToPar;
    const needCollTree = $(elm).next().children().length != 0;

    if(page.isNewDesign){
      $collToPar = collapseToParent(`<div id="jras-colltoparent-${commentID}" parentNodeID="##parentNodeID##" class="treeCross-new treeCross-new-toparent">
            <t style="position: absolute;margin-left: 3px;margin-top: -5px;font-size: 11px;font-weight: bold;">^</t></div>`);
      if(needCollTree){
        colTreeCSSForPlus = {'margin-left': '-1px'};
        colTreeCSSForMinus = {'margin-left': '1px'};
        $(elm).prepend(`<div id="jras-treecomm-${commentID}" class="treeCross-new">
          <span id="treeColl${commentID}" style="margin-left: 1px; margin-top: -10px;">-</span></div>
        `).find('div#jras-treecomm-' + commentID)
          .click(collapseTreeClick);
      }
      if($collToPar !== null || needCollTree){
        $(elm).find('>div.txt').css('padding-left', '15px');
        if($collToPar !== null && !needCollTree){
          $collToPar.css('margin-top', '-3px')
        }
      }
    }else{
      $collToPar = collapseToParent(`<div id="jras-colltoparent-${commentID}"  parentNodeID="##parentNodeID##" class="comment treeCross-old treeCross-old-toparent">
        <t style="margin-left: -4px;margin-top: -3px;position: absolute;font-size: 8px;">^</t></div>`);

      if(needCollTree){
        colTreeCSSForPlus = {'margin-left': '-2px'};
        colTreeCSSForMinus = {'margin-left': '0px'};
        $(elm).prepend(`<div id="jras-treecomm-${commentID}" class="comment treeCross-old">
            <span id="treeColl${commentID}" style="margin-left: 0;">-</span></div>
        `).find('div#jras-treecomm-' + commentID)
          .click(collapseTreeClick);
        $(elm).find('>div.avatar')
          .addClass('avatarCorrect')
          .css('left', '-10px');
      }
      if($collToPar !== null || needCollTree){
        $(elm).find('>div.avatar').addClass('avatarCorrect').css('left', '-10px');
        if($collToPar !== null && !needCollTree){
          $collToPar.css({'margin-top': '-3px', 'margin-left': '-36px'})
        }
      }
    }
  }


  function makeQuotes() {
    if (!userOptions.val('makeQuotesOnComments')) return;
    $('div[id^=comment].comment:not(div[id^=comment].comment.quotes)').each(function (idx, elm) {
      makeQuotesNode($(elm), elm.id.replace('comment', ''));
    })
  }
  

  function makeQuotesNode($elm, commentID) {
    if ($elm.hasClass('quotes')) return;
    const $elmDivTxt = $elm.find('div.txt');
    const $elmText = $elmDivTxt.find('span').first().text();
    if (!$elmText) return;
    const createQT = async ($e) => {
      $e.contents().each((i, e) => {
        if (e.nodeType === 1) createQT($(e))
        else if (e.nodeType === 3 && $(e).text().trim()[0] === '>') {
          let
            qText = $(e).text().trim().substring(1).trim(),
            qUser, qCommId;
          const a = [...qText.matchAll(/ ::: _\[(.+):(\d+)]_/gm)].forEach((e)=>{
            qUser = e[1];
            qCommId = e[2];
            qText = qText.substring(0, e.index);
          });
          e.nodeValue = qText;
          const currQuoteId = `jras-quote-${i}-${commentID}`;
          const $qt = $(`<div class="jras-qt"><div id="${currQuoteId}"></div></div>`);
          $(e).wrap($qt)
          if (userOptions.val('makeExtQuotes') && qUser){
            $(e).wrap(`<div class="base-qt"><div class="qt-body"></div></div>`);
            let linkToComment = '';
            if (qCommId){
              const s = $elmDivTxt[0].id.replace('comment_txt_', '');
              linkToComment = ` <a qt-comment-link href="/post/${s.substring(0, s.search('_')) }#comment${qCommId}">#</a>`
            }
            $(e.parentNode)
              .before(`<div class="qt-header${page.isNewDesign ? '' : ' qt-header-old'}"><a qt-user-link href="/user/${qUser}">${qUser}</a>${linkToComment}</div>`)
              .addClass(page.isSchemeLight() ? 'qt-body-l' : 'qt-body-d')
              .prev().addClass(page.isSchemeLight() ? 'qt-header-l' : 'qt-header-d');

            makeUserTooltips($elmDivTxt.find('div.qt-header a[qt-user-link]'));
            makeAllPreviewTooltip($elmDivTxt.find('div.qt-header a[qt-comment-link]'));
          }
          $elm.addClass('quotes');
        }
      });
    }
    createQT($elm);
    // выдирание текста комента построчно
    // const getText = ($e) => {
    //   let retText = $e.text() ? '' : '\n';
    //   $e.contents().each((i, e) => {
    //     if (e.nodeType === 1) retText += getText($(e))
    //     else retText += e.nodeType === 3 ? $(e).text() : '\n'
    //   });
    //   return retText;
    // }
    // const text = getText($elm.find('div.txt span').first()).trim();
    // if (!text) return;
    // [...text.matchAll(/>.+\n/gm)].forEach((e)=>{
    //   console.log(`Found ${e[0]}`);
    // })
  }

  function makePopuperQuote(){
    const $baseContainer = $('div#pageinner');//$('div[id^=postContainer].single_post.postContainer');
    makePopupQuote($baseContainer);
    $baseContainer.mouseup(function (event) {
      if (event.button !== 0) return;
      const selected = getSelectedText();
      const selText = selected.toString().trim();
      if (selText !== '') {
        const $parDiv = $(selected.focusNode).parents('div.txt').parent();
        const quoteUser = $parDiv.find('a.comment_username').text();
        const commentId = $parDiv[0].id.replace('comment', '');
        quoteData.$commentContainer = $parDiv;
        // quoteData.quoteInsertData = '> ' + selText + `<font color=${page.commentBgColor()}> ::: _[${quoteUser}:${commentId}]_</font>`;
        quoteData.quoteInsertData = `>  ${selText}${userOptions.val('qTAddUserInfo') ? ` ::: _[${ quoteUser }:${ commentId }]_`: ''}\n`;
        // event.stopPropagation();
        const x = event.clientX - $baseContainer.offset().left + 5;
        const y = event.pageY - $baseContainer.offset().top - 35;
        quoteData.$popupQuote.css({ 'top': y + 'px', 'left': x + 'px' });
        popupQuoteVisible(true);
      } else {
        popupQuoteVisible(false);
      }
    });
  }

  function sendToCommentTextArea(text) {
    const $textArea = quoteData.$commentContainer.find('form.post_comment_form textarea.comment_text');
    if ($textArea.length === 0) return;
    const caretPos = $textArea[0].selectionStart;
    const textAreaTxt = $textArea.val();
    // if (textAreaTxt !== '' && text === quoteData.quoteInsertData) { text = '\n' + text }
    $textArea.val(textAreaTxt.substring(0, caretPos) + text + textAreaTxt.substring(caretPos));
    $textArea[0].selectionStart = caretPos + text.length;
    $textArea[0].selectionEnd = $textArea[0].selectionStart;
    $textArea[0].focus();
  }

  function getSelectedText() {
    if (window.getSelection) {
      return window.getSelection();
    } else if (document.getSelection) {
      return document.getSelection();
    } else if (document.selection) {
      return document.selection.createRange().text;
    }
  }

  function clearSelectedText() {
    (window.getSelection ? window.getSelection() : document.selection).empty();
  }

  function makePopupQuote($par) {
    if (!userOptions.val('makeQuoteTool')) return;
    if (quoteData.$popupQuote) { return }
    quoteData.$popupQuote = $(`<div id="jras-qt-popup" title="${lng.getVal('JRAS_GUI_QUOTEPOPUPERHINT')}\n  - ${lng.getVal('JRAS_GUI_NEWANSWERALWAYS')}\n  - ${lng.getVal('JRAS_GUI_FINDOPENEDFORM')}\n  - ${lng.getVal('JRAS_GUI_ADDCOMMENTFORM')}"></div>`)
      .on("mousedown", ()=>clearSelectedText())
      .click(function (e) {
        popupQuoteVisible(false);
        let $commentForm;
        const f_newAnswerAlways = ()=>{
          $commentForm = quoteData.$commentContainer.find('div.addcomment');
          if ($commentForm.length === 0 || !$commentForm.is(':visible')) {
            quoteData.$commentContainer.find('span.reply-link>a.response')[0].click();
          }
        }
        const f_findOpenedForm = () => {
          $commentForm = quoteData.$commentContainer.parents('div.comment_list_post').find('div.addcomment:visible');
          if ($commentForm.length === 0) {
            quoteData.$commentContainer.find('span.reply-link>a.response')[0].click();
          } else {
            quoteData.$commentContainer = $commentForm;
          }
        }
        const f_addCommentForm = () => {
          quoteData.$commentContainer = quoteData.$commentContainer.parents('div.post_comment_list').find('>div.addcomment');
        }
        if (e.ctrlKey || e.shiftKey){
          if (e.ctrlKey && e.shiftKey){f_addCommentForm()}
          else if (e.ctrlKey){f_newAnswerAlways()}
          else if (e.shiftKey){f_findOpenedForm()};
        }else{
          switch (userOptions.val('qTInsertIntoShowingInput')) {
            case 'newAnswerAlways':
              f_newAnswerAlways();
              break;
            case 'findOpenedForm':
              f_findOpenedForm();
              break;
            case 'addCommentForm':
              f_addCommentForm();
              break;
          };
        }

        sendToCommentTextArea(quoteData.quoteInsertData);
      }
    );
    $par.append(quoteData.$popupQuote);
  }

  function popupQuoteVisible(value) {
    if (!quoteData.$popupQuote) { return }
    if (value === undefined) {
      quoteData.$popupQuote.toggleClass('show hide');
    } else {
      if (value) {
        quoteData.$popupQuote.removeClass('hide');
        quoteData.$popupQuote.addClass('show');
      } else {
        quoteData.$popupQuote.removeClass('show');
        quoteData.$popupQuote.addClass('hide');
      }
    }
  }

  function makeAvatarOnOldDesign(elm){
    if (page.isNewDesign){
      return
    }
    if (elm === undefined){
      if (!userOptions.val('makeAvatarOnOldDesign')){
        return
      }
      $('div[id^=comment].comment').each(function(idx, elm){
        makeAvatarOnOldDesign(elm, elm.id.replace('comment', ''));
      })
    }else{
      const $elm = $(elm);
      const $avaOldElm = $elm.find('>div.avatar');
      let commDate = $avaOldElm.attr('title');
      $avaOldElm.before(`<img class="avatarForOldDesign" src="/pics/avatar/user/${$elm.attr('userid')}" title="${commDate}">`);
      const $avaNewElm =  $elm.find('>img.avatarForOldDesign');

      $avaNewElm.css({'height': userOptions.val('avatarHeight') + 'px'});
      //if(!userOptions.val('makeTreeComments')){
      //  $avaNewElm.css({'margin-left': '-16px'});
      //}
      $elm.find('>div[id^=comment_txt_].txt>span:not([class]):first').after('<br>');
      $avaOldElm.remove();
      if (userOptions.val('showCommentDate')){
        $(`<span style="font-size: 75%;opacity: 0.5;">${commDate} — </span>`).insertBefore($elm.find('span.reply-link'));
      }
    }
  }

  function correctPostDate($srcElm){
    const $src = ($srcElm) ? $srcElm : $('body');
    const $spanDate = $src.find('div.article.post-normal div.ufoot span.date');
    const reconnect = function($th, observe){
      observe.observe($th.get(0), {subtree: true, attributes: true, childList: true});
    };
    let obs = [];
    $spanDate.each(function(idx){
      const corrDate = function($th, observe){
        if (observe != null){observe.disconnect()}
        const $spanDateCurr = $($th).find('>span:first');
        $spanDateCurr.children().remove();
        $spanDateCurr.append(`<span style="margin-right: 20px;">${new Date(+$spanDateCurr.attr('data-time') * 1000).toLocaleString('ru', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric',  minute: 'numeric', second: 'numeric'})}</span>`);
      };
      const $th = $(this);
      corrDate($th, obs[idx]);
      obs[idx] = new MutationObserver(function(){corrDate($th, obs[idx])});
      reconnect($th, obs[idx]);
    });
  }

  function getPostID(strPostID){
    const ret = /[0-9]+(\d?\.\d+)?/g.exec(strPostID);
    return (ret == undefined) ? '' : ret[0];
  }

  function makePostControls(){
    if (!userOptions.val('pcbShowPostControl')) {return}
    const step = 25;
    const itmHeight = (page.isNewDesign) ? 24 : 16;
    const itmContentPos = itmHeight + 5;
    let st = (page.isNewDesign) ? 'new' : 'old';
    if (st == 'old' && !page.isSchemeLight()){
      st = st + '-dark';
    }
    const getFavData = function($container){
      let ret = {};
      if ($container.find('div.uhead_share span.favorite_link.favorite')[0]){
        ret.Img = 'jras-pcShareFAV-exists-img';
        ret.Title = lng.getVal('JRAS_REMOVEFAVORITE');
      }else{
        ret.Img = 'jras-pcShareFAV-img' ;
        ret.Title = lng.getVal('JRAS_ADDFAVORITE');
      }
      return ret;
    };
    const makePostCtrl = function($th){
      const $postContainer = $th;
      const postID = getPostID($postContainer.attr('id'));
      if (postID == ''){return}
      $postContainer.find('div#jras-PostControlBlock').remove();
      if (userOptions.val('pcbHideJRShareBlock')) {$postContainer.find('div.uhead_share').css('display', 'none')}
      if (userOptions.val('pcbHideJRRatingBlock')) {$postContainer.find('div.ufoot span.post_rating').css('display', 'none')}
      const favData = getFavData($postContainer);
      setTimeout(function(){
        const postUrl = location.protocol + '//' + location.hostname + '/post/' + postID;
        const postUrlShare = postUrl + '?social=1';
        const pcbShareButtons = (!userOptions.val('pcbHideShareButoons'))
          ? `<a href="https://t.me/share/url?url=${postUrlShare}" title="Telegram" class="jras-pcShareTEL-img" rel="nofollow" target="_blank"></a>
            <a href="http://vkontakte.ru/share.php?url=${postUrlShare}" title="Vkontakte" class="jras-pcShareVK-img" rel="nofollow" target="_blank"></a>
            <a href="http://connect.mail.ru/share?url=${postUrlShare}" title="Mail.ru" class="jras-pcShareMAIL-img" rel="nofollow" target="_blank"></a>
            <a href="http://twitter.com/home?status=${postUrlShare}" title="Twitter" class="jras-pcShareTWIT-img" rel="nofollow" target="_blank"></a>
            <a href="http://www.facebook.com/sharer.php?u=${postUrlShare}" title="Facebook" class="jras-pcShareFACE-img" rel="nofollow" target="_blank"></a>`
          : '';
        $postContainer.find('div.article').each(function(){
          $(this).css({'overflow':'hidden'});
          $(this).prepend(`
          <div id="jras-PostControlBlock" postID="${postID}" class="jras-PostControlBlock-${st}" style="white-space: nowrap; height: ${step * 4}px;">
            <sitm id="jras-PostControlInfo" class="jras-pcInfo-img" style="top:0; height: ${itmHeight}px; ${(page.isNewDesign)?'padding: 2px;':''}">
              <a id="jras-pcInfoUser" href="#" style="margin-left: ${itmContentPos}px;"></a>
            </sitm>
            <sitm id="jras-PostControlShare" class="jras-pcShare-img" style="top:${step}px; height: ${itmHeight}px;">
              <a id="jras-pcbShareFAV" href="#" title="${favData.Title}" class="${favData.Img}" style="margin-left: ${itmContentPos + 5}px;"></a>
              ${pcbShareButtons}
            </sitm>
            <sitm id="jras-PostControlRating" class="jras-pcRating-img" style="top:${step * 2}px; height: ${itmHeight}px; ${(page.isNewDesign)?'padding: 4px;':''}">
              <span style="margin-left: ${itmContentPos}px;">
            </sitm>
            <sitm id="jras-PostControlLinks" class="jras-pcLinks-img" style="top:${step * 3}px; height: ${itmHeight}px; ${(page.isNewDesign)?'padding: 2px;':''}"></sitm>
          </div>
        `);
        });

        const $postBlock = $postContainer.find('div#jras-PostControlBlock');
        if (userOptions.val('pcbAnimateMove')){
          $postBlock.css('transition', `0.${10 - +userOptions.val('pcbAnimateMoveSpeed')}s cubic-bezier(0.76, -0.48, 0.27, 1.42)`);
        }

        const $infoUserA = $postContainer.find('div.uhead div.uhead_nick a');
        const $infoUserDate = $postContainer.find('div.ufoot span.date > span');
        const $pcInfoUser = $postContainer.find('sitm#jras-PostControlInfo');
        $pcInfoUser.find('a#jras-pcInfoUser').attr('href', $infoUserA.attr('href')).text($infoUserA.text());
        $pcInfoUser.append('<span> — </span>');
        $pcInfoUser.append($infoUserDate.clone());
        if (userOptions.val('showUTOnPostControl')){makeUserTooltips($pcInfoUser.find('a#jras-pcInfoUser'))}
        postControlSlider($pcInfoUser, itmHeight + $infoUserA.width() + $infoUserDate.width(), itmHeight);

        const $favA = $postBlock.find('a#jras-pcbShareFAV');
        const $favLink = $postContainer.find('div.uhead_share span.favorite_link');
        if (!$favLink.length == 0){
          new MutationObserver(function(){
            const favData = getFavData($postContainer);
            $favA.removeClass();
            $favA.addClass(favData.Img);
            $favA.attr('title', favData.Title);
          }).observe($postContainer.find('div.uhead_share span.favorite_link').get(0), {attributes: true});
        }

        postControlSlider($postContainer.find('sitm#jras-PostControlShare'), (pcbShareButtons == '') ? 40 : 132, itmHeight);
        $favA.click(function(){ $postContainer.find('span.favorite_link').get(0).click(); return false; });

        if (page.isUserLogon){
          const $Rating = $postContainer.find('div.ufoot span.post_rating');
          $Rating.find('div.vote-plus, div.vote-minus').removeClass('abyss');
          const ratingStyle = function(){
            const $pcRating = $postContainer.find('sitm#jras-PostControlRating');
            $pcRating.children().remove();
            $pcRating.append(`<span style="margin-left: ${itmContentPos}px;">`);
            $pcRating.append($Rating.clone(true));
            const $pcRatingPost = $pcRating.find('span.post_rating');
            $pcRatingPost.css('display', '');
            // $pcRatingPost.css('right', 'unset');
            const $pcRatingPostPlus = $pcRatingPost.find('div.vote-plus');
            $pcRatingPostPlus.removeClass('vote-plus').addClass('jras-PostControlRatingVote').click(function(){
              $Rating.find('div.vote-plus').get(0).click()
            });
            const $pcRatingPostMinus = $pcRatingPost.find('div.vote-minus');
            $pcRatingPostMinus.removeClass('vote-minus').addClass('jras-PostControlRatingVote').click(function(){
              $Rating.find('div.vote-minus').get(0).click()
            });
            if (page.isNewDesign){
              $pcRatingPost.find('span:first').css({
                'font-size': '18px',
                'top': '-9px',
                'display': 'initial',
                'position': 'relative'
              });
              $pcRatingPostPlus.addClass('jras-PostControlRatingVote-new').css({'background-position-y': '1px'});
              $pcRatingPostMinus.addClass('jras-PostControlRatingVote-new').css({
                'background-position': '-22px 1px',
                'margin': '7px 0 0'
              });
            }else{
              $pcRatingPostPlus.addClass('jras-pcVotePlus-img').css({'top': '5px', 'position': 'relative'});
              $pcRatingPostMinus.addClass('jras-pcVoteMinus-img').css({'top': '5px', 'position': 'relative'});
            }
            postControlSlider($pcRating, itmHeight + 130, itmHeight);
          };
          ratingStyle();
          new MutationObserver(function(){
            ratingStyle()
          })
            .observe($Rating.get(0), {subtree: true, attributes: true, childList: true});
        }

        let $Links = $postContainer.find('div.ufoot span.manage');
        const makeLinks = function(){
          let itemW = 0;
          const $pcLinks = $postContainer.find('sitm#jras-PostControlLinks');
          $pcLinks.children().remove();
          $pcLinks.append(`<span style="margin-left: ${itmContentPos}px;">`);
          $pcLinks.append(`<s><div class="jras-pcToTop" ${(page.isNewDesign)?'style="margin-top: 2px; cursor: pointer;"':''}></div></s>`);
          $pcLinks.find('div.jras-pcToTop').click(function(){
            $('html, body').animate({ scrollTop: $postContainer.offset().top - 50}, 500);
          });
          $pcLinks.append(`<s><div class="jras-pcToDown" ${(page.isNewDesign)?'style="margin-top: 2px; cursor: pointer;"':''}></div></s>`);
          $pcLinks.find('div.jras-pcToDown').click(function(){
            $('html, body').animate({ scrollTop: $postContainer.offset().top + $postContainer.height() - win.innerHeight + 50}, 500);
          });
          if (page.isNewDesign){
            $pcLinks.append($postContainer.find('div.ufoot span.link_wr').clone());
            $pcLinks.append($postContainer.find('div.ufoot span.hidden_link').clone());
            $Links.children().each(function(){
              $pcLinks.append($(this).clone().css('display', $(this).css('display')));
            });
            $pcLinks.find('>span:gt(1):not(:last)').addClass('jras-pcLinksSepAfter');
            $pcLinks.find('>span.hidden_link').addClass('jras-pcLinksSepBefore');
            itemW = ($pcLinks.children().find(':visible').length > 3) ? 85: 95;
            itemW += itmHeight + $Links.outerWidth();
          }else{
            $pcLinks.append($Links.children().clone());
            $pcLinks.find('>span:not(:first):not(:last)').addClass('jras-pcLinksSepAfter');
            $pcLinks.find('>span.hidden_link').addClass('jras-pcLinksSepBefore');
            itemW = itmHeight + $Links.width() + $Links.children().find(':visible').length * 7;
          }
          itemW += 60;
          $pcLinks.find('span.setTag a.link.setTagLink').click(function(){
            const $tagEdit = $postContainer.find('div.ufoot span.post_add_tag');
            const hidden = $tagEdit.css('display') == 'none';
            $postContainer.find('div.ufoot span.setTag a.link.setTagLink').get(0).click();
            if (hidden){
              $('html, body').animate({ scrollTop: $tagEdit.offset().top - 150}, 500);
              blinkElement($tagEdit, 5);
            }
          });
          $pcLinks.find('span.setTag a.setHeaderLink').click(function(){
            const $captionEdit = $postContainer.find('div.ufoot span.post_set_header');
            const hidden = $captionEdit.css('display') == 'none';
            $postContainer.find('div.ufoot a.setHeaderLink').get(0).click();
            if (hidden){
              $('html, body').animate({ scrollTop: $captionEdit.offset().top - 150}, 500);
              blinkElement($captionEdit, 5);
            }
          });
          postControlSlider($pcLinks, itemW, itmHeight);
        };
        makeLinks();
        new MutationObserver(function(){ makeLinks()})
          .observe($Links.get(0), {subtree: true, attributes: true, childList: true});

        checkPostControlPos($th);
      },10);

    };

    let selector = 'div[id^=postContainer].postContainer';
    if (userOptions.val('pcbShowInFullPost')) {selector = 'div#pageinner div#contentinner > ' + selector}
    $(selector).each(function(){
      const $post = $(this);
      makePostCtrl($post);
      new MutationObserver(function(){ makePostCtrl($post) })
        .observe($(this).get(0), {childList: true});
    });

    $(window).on('scroll', function(){
      $('div[id^=postContainer].postContainer').each(function(){
        checkPostControlPos($(this));
      });
    });
  }

  function postControlSlider($postContainerItem, itmWidth, itmHeight){
    return $postContainerItem.css({'width': itmWidth + itmHeight + 'px', 'right': -itmWidth + 'px'})
      .mouseenter(function(){$(this).css('right', '-4px')})
      .mouseleave(function(){$(this).css('right', -itmWidth + 'px')});
  }

  function checkPostControlPos($PostContainer){
    const pco = $PostContainer.offset();
    const pch = $PostContainer.height();
    const pcbp = pco.top + pch;
    if (pco.top > win.pageYOffset + win.innerHeight){ return }
    if (pcbp < win.pageYOffset){ return }
    const $PostCrtlsBlock = $PostContainer.find('div#jras-PostControlBlock');
    const pbh = $PostCrtlsBlock.height();
    let newTop = win.pageYOffset - pco.top + +userOptions.val('pcbTopScreenPos');
    const pcbTopStop = +userOptions.val('pcbTopBorder');
    if (newTop + pbh + pcbTopStop > pch){
      newTop = pch - pbh - +userOptions.val('pcbBottomBorder');
    }
    newTop = (newTop < pcbTopStop) ? pcbTopStop : newTop;
    $PostCrtlsBlock.css({'top': newTop});
  }

  function HttpRequest(link, readyState, fonload){
    GMxmlhttpRequest({
      method: 'GET',
      url: link,
      onload: function(response) {
        if (response.readyState != readyState){return}
        fonload(response);
      }
    });
  }

  function graphqlRequest(query, variables = {}, options = {}) {
    const endpoint = options.endpoint || graphqlEndpoint;
    const operationName = options.operationName;

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        query,
        variables,
        operationName
      });

      GMxmlhttpRequest({
        method: 'POST',
        url: endpoint,
        headers: Object.assign({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }, options.headers || {}),
        // withCredentials: true,
        data: payload,
        timeout: options.timeoutMs || 15000,
        onload: function (res) {
          let body;
          try {
            body = JSON.parse(res.responseText || 'null');
          } catch (e) {
            reject({ type: 'parse_error', status: res.status, message: 'Invalid JSON in response', raw: res.responseText});
            return;
          }
          if (res.status < 200 || res.status >= 300) {
            reject({ type: 'http_error', status: res.status, body });
            return;
          }
          if (body && Array.isArray(body.errors) && body.errors.length) {
            reject({ type: 'graphql_error', status: res.status, errors: body.errors, data: body.data});
            return;
          }
          resolve(body);
        },
        onerror: function (err) {
          reject({type: 'network_error', error: err});
        },
        ontimeout: function () {
          reject({ type: 'timeout' });
        }
      });
    });
  }

  function getGraphqlJsonSkipError(query, variables = {}, options = {}) {
    return graphqlRequest(query, variables, options)
      .then((json) => json)
      .catch((e) => {
        win.console.log('JRAS graphqlRequest Error:', e);
        return null;
      });
  }

  function actionTooltipButton($button, link, buttonTxtID){
    $button.click({clickLink: link, updateContainer: $button}, function(eventObject){
      const t = eventObject.data.updateContainer.find('#' + buttonTxtID);
      const ct = t.text();
      t.text(ct + ' : wait');
      HttpRequest(eventObject.data.clickLink, 4, function(e){
        if(e.target.status != 200){
          t.text(ct + ' : error: ' + e.target.status);
        }else{
          t.text(ct + ' : ok');
        }
        eventObject.data.updateContainer
          .css('cursor', '')
          .removeClass('jras-tooltip-button')
          .unbind(eventObject);
      });
    });
  }

  function makeTooltips(selector, openCallBack){
    $(selector).tooltip({
      items: 'a',
      content: function(){
        return '<div id="jras-tooltipcontainer"' +
          ' style="height: 30px; line-height: 30px; margin: 8px; color: rgb(120, 120, 120); text-align: center;">' +
          lng.getVal('JRAS_LOADINGUSERDATA') + '</div>';
      },
      show: {effect: "fade", duration: 400},
      track: true,
      open: function(event, ui){
        openCallBack(event, ui)
      },
      close: function(event, ui){
        ui.tooltip.hover(function(){
          $(this).stop(true).fadeTo(400, 1);
        }, function(){
          $(this).fadeOut('400', function(){
            $(this).remove();
          });
        });
      }
    });
  }

  function clearContainer(container){
    container.find('*').remove();
    container.empty();
    container.css({
      'line-height': '',
      'text-align': '',
      'height': ''
    });
  }

  function setTooltipBounds($tooltip, {left, width, height}){
    if (width){
      $tooltip.width(width + 'px');
    }
    if (height){
      $tooltip.height(height + 'px');
    }
    if (left){
      $tooltip.offset({ left: left});
    }
  }

  function makeAllPreviewTooltip(selector) {
    makeTooltips(selector, function (event, ui) {
      const $item = $(event.target);
      let prevLink = $item.attr('href');
      const tempUrl = new URL(prevLink, location.href);
      tempUrl.host = location.host;
      prevLink = tempUrl.href;
      const $tooltip = $(ui.tooltip);
      $('div.ui-tooltip').not('#' + $tooltip.attr('id')).remove();
      $tooltip.css({
        'border-radius': '5px',
        'z-index': '500',
        'border': '1px solid rgb(102, 102, 102)',
        '-webkit-box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)',
        '-moz-box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)',
        'box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)',
        'word-break': 'break-all'
      });
      getPreviewData(prevLink, $tooltip, $tooltip.find('div#jras-tooltipcontainer'));
    });
  }

  function getPreviewData(previewLink, $tooltip, $outContainer) {
    setTooltipBounds($tooltip, { width: defLoadTooltipSize });
    HttpRequest(previewLink, 4, function (e) {
      if (e.status != 200) {
        $outContainer.text('Loading error: ' + e.status);
      } else {
        const doc = document.implementation.createHTMLDocument("");
        doc.documentElement.innerHTML = e.response;

        clearContainer($outContainer);

        let tmpW = win.innerWidth;
        const w = tmpW / 100 * userOptions.val('previewSizeX');
        const h = win.innerHeight / 100 * userOptions.val('previewSizeY');
        if ($tooltip.position().left + w > tmpW) {
          tmpW = tmpW - w - 30;
        } else {
          tmpW = null;
        }
        setTooltipBounds($tooltip, { left: tmpW, width: w});
        $tooltip.css({'max-height': h});

        $outContainer.append(`<div id="jras-preview-tooltip-container"></div>`);
        const $jrasTTCont = $outContainer.find('div#jras-preview-tooltip-container')
          .css({'width': '100%',
                'overflow-y': 'auto',
                'max-height': h - ($outContainer.css('margin-top').replace('px', '') * 2) + 'px'});

        const commID = previewLink.match(/comment\d+$/g);
        if (commID && commID[0]){
          // is comment
          const $arr = [];
          const divCom = 'div#' + commID[0];
          const $inCom = $(doc).find(divCom);
          $arr.push($inCom.parent().prev().clone().appendTo($jrasTTCont).css({opacity: 0.5}));
          $inCom.parent().clone().appendTo($jrasTTCont).children().not(divCom).remove();
          $arr.push($jrasTTCont.find(divCom));
          $inCom.next().clone().appendTo($arr[$arr.length - 1].parent())
            .css({opacity: 0.5}).children().remove('div.comment_list')
            .each(function(){$arr.push($(this))});
          $jrasTTCont.find('div.image img').css({'max-width': $jrasTTCont.innerWidth()});
          $arr.forEach(function(elm){
            makeQuotes();
            removeRedirectLink(elm);
            showHiddenComments(elm);
            correctOldReactorLink(elm);
            makeAvatarOnOldDesign(elm);
          });
        }else{
          // is post
          let postID = previewLink.match(/post\/\d+$/g);
          if (postID && postID[0]){
            postID = postID[0].replace('post/', '');
            const $post = $(doc).find('div#postContainer' + postID).clone().appendTo($jrasTTCont);
            $post.find('div.post_comment_list').remove();
            $post.find('div.image img').css({'max-width': $jrasTTCont.innerWidth()});
            correctPostDate($post);
            removeRedirectLink($post);
            removeShareButtons($post);
          }
        }
      }
    });
  }

  function makeTagTooltips(selector){
    makeTooltips(selector, function(event, ui){
      const $item = $(event.target);
      const TagName = $.trim($item.text());
      const TagLink = $item.attr('href');
      const $tooltip = $(ui.tooltip);
      $('div.ui-tooltip').not('#' + $tooltip.attr('id')).remove();
      $tooltip.css({
        'border-radius': '5px',
        'z-index': '500',
        'border': '1px solid rgb(102, 102, 102)',
        '-webkit-box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)',
        '-moz-box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)',
        'box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)',
        'word-break': 'break-all'
      });
      getTagData(TagName, TagLink, $tooltip, $tooltip.find('div#jras-tooltipcontainer'));
    });
  }

  function getTagData(tagName, tagLink, $tooltip, $outContainer){
    setTooltipBounds($tooltip, {width: defLoadTooltipSize});
    HttpRequest(tagLink, 4, function(e){
      if(e.status != 200){
        $outContainer.text('Loading error: ' + e.status);
      }else{
        const doc = document.implementation.createHTMLDocument("");
        doc.documentElement.innerHTML = e.response;

        clearContainer($outContainer);

        let tmpW = win.innerWidth;
        const w = defTagTooltipSize;//tmpW / 2 - 30;
        if ($tooltip.position().left + w > tmpW){
          tmpW = tmpW - w - 30;
        } else {
          tmpW = null;
        }
        setTooltipBounds($tooltip, {left: tmpW, width: w});

        const $tagHeaderPathBlock = $('<div id="jras-tagHeaderPathBlock">')
          .css({
            'font-size': '10px',
            'margin-top': '-6px',
            'margin-bottom': '4px'
          });
        $outContainer.append($tagHeaderPathBlock);
        const $tagDocHeaderSide = $(doc).find('div.sidebar_block div.sideheader.taginfo');
        const $tagSideBar = $tagDocHeaderSide.closest('div#sidebar');
        $tagDocHeaderSide.find('a').each(function(){
          $(this).appendTo($tagHeaderPathBlock);
          $tagHeaderPathBlock.append('<span>&nbsp&gt&nbsp;</span>');
        });
        const $tagHeaderBlock = $('<div id="jras-tagHeaderBlock">').css({'line-height': '22px'});
        $outContainer.append($tagHeaderBlock);
        const $tagDocStats = $(doc).find('div.sidebar_block div.blog_stats');
        $tagDocStats.closest('div.sidebarContent').find('img.blog_avatar').clone().appendTo($tagHeaderBlock);
        $tagDocHeaderSide.find('span.fn').appendTo($tagHeaderBlock).addClass('jras-tooltip-caption');

        makeTagModers($tagSideBar, $outContainer);
        makeTagStatistics($tagDocStats, $outContainer);

        const $mainBtnContainer = $('<div id="jras-tooltip-mainTagBtn" class="jras-tooltip-section-topborder"></div>').appendTo($outContainer);
        if(page.isUserLogon){
          const $tagDocHeader = $(doc).find('div#blogHeader');
          let txtToTagAction;
          let linkToTagAction;

          if($tagDocHeader.find('div#blogFavroiteLinks > p').is('.add_to_fav')){
            txtToTagAction = lng.getVal('JRAS_ADDTAGFAV');
            linkToTagAction = $tagDocHeader.find('div#blogFavroiteLinks > p.add_to_fav > a.change_favorite_link').attr('href');
          }else{
            if($tagDocHeader.find('div#blogFavroiteLinks > p').is('.remove_from_fav')){
              txtToTagAction = lng.getVal('JRAS_REMOVETAGFAV');
              linkToTagAction = $tagDocHeader.find('div#blogFavroiteLinks > p.remove_from_fav > a.change_favorite_link').attr('href');
            }
          }
          if(txtToTagAction){
            const $favTagBtn = $mainBtnContainer.append(`
                <div id="jras-tooltip-favtag" class="jras-tooltip-button" style="cursor: pointer;">
                  <i class="jras-tooltip-button-img jras-tooltip-favtag-img""></i>
                  <span id="jras-tooltip-favtag-txt" class="jras-tooltip-button-text">${txtToTagAction}</span>
                </div>
              `).find('#jras-tooltip-favtag');
            actionTooltipButton($favTagBtn, linkToTagAction, 'jras-tooltip-favtag-txt');
          }

          if($tagDocHeader.find('div#blogFavroiteLinks > p').is('.add_to_unpopular')){
            txtToTagAction = lng.getVal('JRAS_BLOCKTAG_JR');
            linkToTagAction = $tagDocHeader.find('div#blogFavroiteLinks > p.add_to_unpopular > a.change_favorite_link').attr('href');
          }else{
            if($tagDocHeader.find('div#blogFavroiteLinks > p').is('.remove_from_unpopular')){
              txtToTagAction = lng.getVal('JRAS_UNBLOCKTAG_JR');
              linkToTagAction = $tagDocHeader.find('div#blogFavroiteLinks > p.remove_from_unpopular > a.change_favorite_link').attr('href');
            }
          }
          if(txtToTagAction){
            const $blockTagBtn = $mainBtnContainer.append(`
                <div id="jras-tooltip-blocktag" class="jras-tooltip-button" style="cursor: pointer;">
                  <i class="jras-tooltip-button-img jras-tooltip-blockuser-img""></i>
                  <span id="jras-tooltip-blocktag-txt" class="jras-tooltip-button-text">${txtToTagAction}</span>
                </div>
              `).find('#jras-tooltip-blocktag');
            actionTooltipButton($blockTagBtn, linkToTagAction, 'jras-tooltip-blocktag-txt');
          }
        }
        makeJRASTagTooltipElm($mainBtnContainer, tagName);
      }
    });
  }

  function makeTagStatistics($tagDocStatsBlock, $container){
    const $tagStatContainer = $('<div id="jras-tagStatContainer" class="jras-tooltip-section-topborder" style="line-height: 16px; font-size: 10px;"></div>')
      .css({'margin-top': '6px'});
    $container.append($tagStatContainer);
    $tagDocStatsBlock.find('div').find('br').remove();
    $tagDocStatsBlock.find('div').appendTo($tagStatContainer);
    const a = $tagStatContainer.find('div:first > b')[0] ? '<br>' : '';
    $tagStatContainer.find('div:first').prepend(`<b>${lng.getVal('JRAS_TOOLTIP_STATISTICS')}</b>` + a);
  }

  function makeTagModers($tagSideBar, $container){
    if (!$tagSideBar || !$container) {
      return
    }
    const $tagDocModCont = getSideBarSection($tagSideBar, 'Модераторы');
    if (!$tagDocModCont[0]) {
      return
    }

    const $modBlock = $container.append(`
      <div style="line-height: 16px; font-size: 10px;" id="jras-tooltip-tagmoderators-block">
        <div id="jras-tooltip-tagmoderators-header" style="margin-bottom: 3px; margin-top: 3px; cursor: pointer;">
          <b>
            ${lng.getVal('JRAS_TOOLTIP_TAGMODERATORS')}
          </b>
        </div>
        <div id="jras-tooltip-tagmoderators-tags" style="margin-bottom: 0; display: none;">
        </div>
      </div>
    `).find('#jras-tooltip-tagmoderators-block');
    const $modTags = $modBlock.find('#jras-tooltip-tagmoderators-tags');
    $tagDocModCont.find('div').clone().appendTo($modTags);
    $modTags.find('div').each(function(){
      $(this).css({'margin-bottom': '3px'});
      $('<span>    </span>`').prependTo($(this));
      $(this).find('img').css({'width': '22px', 'vertical-align': 'middle'}).prependTo($(this));
      $(this).find('a').css({'vertical-align': 'middle'}).append(`<span>${$(this).attr('title')}</span>`);
    });
    $modBlock.find('#jras-tooltip-tagmoderators-header').click({updateContainer: $modTags}, function(eventObject){
      eventObject.data.updateContainer.slideToggle('display');
    });
    return true;
  }

  function makeJRASTagTooltipElm($container, tagName){
    const txtToTagAction = (userOptions.data.BlockTags.indexOf(tagName) == -1)
      ? lng.getVal('JRAS_BLOCKTAG_JRAS')
      : lng.getVal('JRAS_UNBLOCKTAG_JRAS');

    const $blockTagJRAS = $container.append(`
      <div id="jras-tooltip-blocktag-jras" class="jras-tooltip-button" style="cursor: pointer;">
        <i class="jras-tooltip-button-img jras-tooltip-blockuser-img" style="transform: scale(.7);"></i>
        <span id="jras-tooltip-blocktag-jras-text" class="jras-tooltip-button-text">${txtToTagAction}</span>
      </div>
    `).find('#jras-tooltip-blocktag-jras');
    $blockTagJRAS.click({dataTagName: tagName, updateContainer: $blockTagJRAS}, function(eventObject){
      const t = eventObject.data.updateContainer.find('#jras-tooltip-blocktag-jras-text');
      const iof = userOptions.data.BlockTags.indexOf(eventObject.data.dataTagName);
      if(iof == -1){
        t.text(lng.getVal('JRAS_UNBLOCKTAG_JRAS'));
        userOptions.data.BlockTags.push(eventObject.data.dataTagName);
      }else{
        t.text(lng.getVal('JRAS_BLOCKTAG_JRAS'));
        userOptions.data.BlockTags.splice(iof, 1);
      }
      userOptions.saveUserData(page.currentUser);
    })
  }

  function makeUserTooltips(selector){
    if(!userOptions.val('isToBeLoadingUserData')){ return }
    makeTooltips(selector, function(event, ui){
      const $item = $(event.target);
      const UserName = $.trim($item.text());
      const UserLink = $item.attr('href');
      const $tooltip = $(ui.tooltip);
      $('div.ui-tooltip').not('#' + $tooltip.attr('id')).remove();
      $tooltip.css({
        'border-radius': '5px',
        'z-index': '500',
        'border': '1px solid rgb(102, 102, 102)',
        '-webkit-box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)',
        '-moz-box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)',
        'box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)',
        'word-break': 'break-all'
      });
      getUserData(UserName, UserLink, $tooltip, $tooltip.find('div#jras-tooltipcontainer'));
    });
  }

  function getUserData(userName, userLink, $tooltip, $outContainer){
    let $mainBtnContainer;
    const mainBtnContainer =
      '<div id="jras-tooltip-mainBtnContainer" class="jras-tooltip-section-topborder"></div>';

    if(userOptions.val('isToBeLoadingUserData')){
      setTooltipBounds($tooltip, {width: defLoadTooltipSize});
      HttpRequest(userLink, 4, function(e){
        //win.console.log('Loading user data from "' + userLink + '" - ' + response.status);

        if(e.status != 200){
          $outContainer.text('Loading error: ' + e.status);
          // win.console.log("Loading user data error:  - " + response.status);
        }else{
          const doc = document.implementation.createHTMLDocument("");
          doc.documentElement.innerHTML = e.response;

          clearContainer($outContainer);
          setTooltipBounds($tooltip, {width: defUserTooltipSize});
          const $userSideBar = $(doc).find('div.user-awards').closest('div#sidebar');
          const $userData = $(doc).find('div.user-awards').parent('div.sidebarContent');
          $userData.find('div.user').clone().appendTo($outContainer).css({'line-height': '16px'})
            .find('span').addClass('jras-tooltip-caption');
          if (userOptions.val('chatlaneToPacaki')){
            $outContainer.find('div.user > span').css('color', $outContainer.find('div.user').css('color'));
          }
          const colUserOnline = ($.trim($userData.find('span.userOnline').text()) == 'Оффлайн') ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)';
          $outContainer.find('div.user').prepend(
            `<div style="background-color: ${colUserOnline}; height: 83%; margin-right: 4px; display: inline-block; width: 5px; border-radius: 10px;"></div>`
          );
          const $userLinkCtrl = $('<span style="padding-left: 5px;">&nbsp;</span>');
          $outContainer.find('div.user').append($userLinkCtrl);
          makeUserLinks($userLinkCtrl, $userData.find('div.user span').text().trim(), {linkClassName: 'jras-tooltip-nick-link'});

          makeUserAwardsBlock($userData.find('div.user-awards'), $outContainer);

          const $userStars = $userData.find('div.stars').clone().appendTo($outContainer);
          $userStars.css('width', '100%');
          $userStars.find('div[class*="star-row-"]')
            .css({
              'height': '15px',
              'margin-left': '15px',
              'transform': 'scale(0.7)'
            });
          let a = page.isNewDesign ? 'rgb(230, 230, 230)' : 'rgb(72, 72, 72)';
          $userStars.find('.progress_bar')
            .css({
              'border': 0,
              'margin-top': '3px',
              'background-color': a,
              'height': '4px'
            });
          a = makeModerElements($userSideBar, $outContainer) ? 'jras-tooltip-section-topborder' : '';
          $userData.find('div#rating-text').clone().appendTo($outContainer)
            .css('font-size', '10px')
            .css('line-height', '16px')
            .addClass(a);

          makePostsElements($userSideBar, $outContainer);

          const $mainBtnContainer = $outContainer.append(mainBtnContainer).find('#jras-tooltip-mainBtnContainer');

          if(page.isUserLogon){ // если залоген

            makeSendPMElements($mainBtnContainer, userName);

            let txtToUserAction;
            let linkToUserAction;

            if($userData.find('div#friend_link > p').is('.add_tofr_lnk.user_icons')){
              txtToUserAction = lng.getVal('JRAS_ADDFRIEND');
              linkToUserAction = $userData.find('div#friend_link > p.add_tofr_lnk.user_icons > a[href]').attr('href');
            }else{
              if($userData.find('div#friend_link > p').is('.remove_fromfr_lnk.user_icons')){
                txtToUserAction = lng.getVal('JRAS_REMOVEFRIEND');
                linkToUserAction = $userData.find('div#friend_link > p.remove_fromfr_lnk.user_icons > a[href]').attr('href');
              }
            }
            if(txtToUserAction){
              const $friendUser = $mainBtnContainer.append(
                '<div id="jras-tooltip-frienduser" class="jras-tooltip-button" style="cursor: pointer;">' +
                '<i class="jras-tooltip-button-img jras-tooltip-frienduser-img"></i>' +
                '<span id="jras-tooltip-frienduser-txt" class="jras-tooltip-button-text">' + txtToUserAction + '</span>' +
                '</div>'
              ).find('#jras-tooltip-frienduser');
              actionTooltipButton($friendUser, linkToUserAction, 'jras-tooltip-frienduser-txt');
            }


            txtToUserAction = null;
            if($userData.find('div#friend_link > p').is('.add_toblock_lnk.user_icons')){
              txtToUserAction = lng.getVal('JRAS_BLOCKUSER_JR');
              linkToUserAction = $userData.find('div#friend_link > p.add_toblock_lnk.user_icons > a[href]').attr('href');
            }else{
              if($userData.find('div#friend_link > p').is('.remove_fromblock_lnk.user_icons')){
                txtToUserAction = lng.getVal('JRAS_UNBLOCKUSER_JR');
                linkToUserAction = $userData.find('div#friend_link > p.remove_fromblock_lnk.user_icons > a[href]').attr('href');
              }
            }
            if(txtToUserAction){
              const $blockUserJR = $mainBtnContainer.append(
                '<div id="jras-tooltip-blockuser-jr" class="jras-tooltip-button" style="cursor: pointer;">' +
                '<i class="jras-tooltip-button-img jras-tooltip-blockuser-img"></i>' +
                '<span id="jras-tooltip-blockuser-jr-txt" class="jras-tooltip-button-text">' + txtToUserAction + '</span>' +
                '</div>'
              ).find('#jras-tooltip-blockuser-jr');
              actionTooltipButton($blockUserJR, linkToUserAction, 'jras-tooltip-blockuser-jr-txt');
            }
          }

          makeJRASUserTooltipElm($mainBtnContainer, userName);
        }
      });
    }else{
      clearContainer($outContainer);
      $mainBtnContainer = $outContainer.append(mainBtnContainer).find('#jras-tooltip-mainBtnContainer');
      $mainBtnContainer.css({
        'margin-top': '',
        'border-top': '',
        'padding-top': ''
      });
      makeJRASUserTooltipElm($mainBtnContainer, userName);
    }
  }

  function getUserUrls(userName) {
    const queryUserName = String(userName || '').trim();
    const cacheKey = queryUserName.toLowerCase();
    if (!cacheKey) return Promise.resolve(null);
    if (userUrlsByName.has(cacheKey)) return userUrlsByName.get(cacheKey);
    const userUrlsPromise = getGraphqlJsonSkipError(`query {user(username:"${escapeGraphqlString(queryUserName)}"){urls}}`)
      .then(json => {
        if (json === null) {
          userUrlsByName.delete(cacheKey);
          return null;
        }
        const urls = json?.data?.user?.urls;
        return urls?.length ? urls : null;
      });
    userUrlsByName.set(cacheKey, userUrlsPromise);
    return userUrlsPromise;
  }

  function makeUserLinkIcon(url) {
    const icoNotFound = $(`<span style="position: relative;top: -2px;" title="icon not found for ${url.hostname}">\u066d</span>`);
    const hostKey = url.hostname.split('.').reverse().slice(0, 2).reverse().join('_');
    const knownIcon = socialMediaIco[hostKey];
    if (knownIcon) {
      return $(knownIcon).addClass('jras-media-n jras-media-color');
    }
    if (!userOptions.val('loadFavoriteIcoForUserLinks')) return icoNotFound;
    const $img = $(`<img class="jras-media-n" loading="lazy">`);
    $img.on('error', function onFaviconError() {
      $img.off('error', onFaviconError);
      $img.replaceWith(icoNotFound);
    });
    $img.attr('src', `${url.origin}/favicon.ico`).addClass('jras-media-n jras-media-color');
    return $img;
  }

  function makeUserLinks($baseContainer, userName, options = {}){
    if (!userOptions.val('showUserLinks')) return;
    if (!$baseContainer) return;
    const $jrasLoadLinks = $(`<span class="${userOptions.val('showUserLinksProgressbar') ? 'jras-loader' : ''} jras-loader-normal jras-nick-comment-link-cntnr ${options.loaderClassName || ''}"></span>`);
    if (options.insertAfter) {
      $baseContainer.find(options.insertAfter).after($jrasLoadLinks);
    }else {
      $baseContainer.append($jrasLoadLinks);
    }
    getUserUrls(userName)
      .then(urls => {
        if (urls && urls.length) {
          const $container = $(`<span class="${options.linkContainerClassName || ''}"></span>`);
          urls.forEach((link, idx) => {
            const userLinksLimit = userOptions.val('showUserLinksCount');
            if (userLinksLimit != 0 && idx > userLinksLimit - 1) return;
            $container.append($(`<a href="${link}" target="_blank" rel="nofollow"></a>`).addClass(options.linkClassName || '').append(makeUserLinkIcon(new URL(link))));
          });
          $jrasLoadLinks.replaceWith($container);
        } else {
          $jrasLoadLinks.remove();
        }
      });
  }

  function makeAllUsersLink() {
    if (!userOptions.val('showUserLinks') || !userOptions.val('showUserLinksOnPost')) return;
    $('div.uhead_nick').each(function(){
      makeUserLinks($(this), $(this).find('>a').text().trim(), { loaderClassName: 'jras-nick-loader', linkClassName:'jras-nick-link'});
    });
  }

  function makeAllUsersCommentsLink() {
    if (!userOptions.val('showUserLinks') || !userOptions.val('showUserLinksOnComment')) return;
    $('div[id^="comment"] span.reply-link').each(function (idx, elm) {
      setTimeout(function () {
        makeUserLinks($(elm), $(elm).find('>a:first').text().trim(),{
          insertAfter: '>a:first',
          loaderClassName: 'jras-nick-comment-loader',
          linkContainerClassName: 'jras-nick-comment-link-cntnr',
          linkClassName: 'jras-nick-comment-link'});
      }, delay.makeAllUsersCommentsLink * idx);
    })
  }

  function getSideBarSection($sideBarUser, sectCaption){
    return $sideBarUser.find('.sidebar_block>.sideheader:contains(' + sectCaption + ') + div.sidebarContent');
  }

  function makeModerElements($sideBarUser, $containerFor){
    if (!$sideBarUser || !$containerFor) {
      return false
    }
    const $userModCont = getSideBarSection($sideBarUser, 'Модерирует');
    if (!$userModCont[0]) {
      return false
    }

    const $modBlock = $containerFor.append(`
      <div style="line-height: 16px; font-size: 10px;" id="jras-tooltip-moderator-block">
        <div id="jras-tooltip-moderator-header" style="cursor: pointer;">
          <b>
            ${lng.getVal('JRAS_TOOLTIP_MODERATOR')}
          </b>
        </div>
        <div id="jras-tooltip-moderator-tags" style="margin-bottom: 0; display: none;">
        </div>
      </div>
    `).find('#jras-tooltip-moderator-block');
    const $modTags = $modBlock.find('#jras-tooltip-moderator-tags');
    $modTags.append($userModCont.removeClass('sidebarContent').clone());
    $modBlock.find('#jras-tooltip-moderator-header').click({updateContainer: $modTags}, function(eventObject){
      eventObject.data.updateContainer.slideToggle('display');
    });
    return true;
  }

  function makePostsElements($sideBarUser, $containerFor){
    if (!$sideBarUser || !$containerFor) {
      return
    }
    const $userPostsCont = getSideBarSection($sideBarUser, 'Профиль');
    if (!$userPostsCont[0]) {
      return
    }

    let re = /(\d+)/gm;
    let m, arr = [];

    while ((m = re.exec($userPostsCont.find('>:first-child').text())) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      arr.push(m[0]);
    }

    re = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/gm;
    const regDate = new Date(re.exec($userPostsCont.find('span[id^=usertime]').text())[0]);

    let lastLogin = '';
    let i = 4;
    re = /^Последний раз заходил.+([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/gm;
    while ((m = re.exec($userPostsCont.find('>:nth-child(' + i + ')').text())) == null && i < 50) {
      i++;
    }
    if (m !== null){
      lastLogin = new Date(m[1]).toLocaleDateString();
    }

    const $modBlock = $containerFor.append(`
      <div class="jras-tooltip-section-topborder" style="line-height: 16px; font-size: 10px;" id="jras-tooltip-posts-block">
        ${lng.getVal('JRAS_TOOLTIP_POSTS')}<b>${arr[0] + ' (' + arr[1] + ' / ' + arr[2] + ')'}</b><br>
        ${lng.getVal('JRAS_TOOLTIP_COMMENTS')}<b> ${arr[3]}</b><br>
        ${lng.getVal('JRAS_TOOLTIP_REG')}<b>${regDate.toLocaleDateString()}</b><br>
        ${lng.getVal('JRAS_TOOLTIP_LASTLOGIN')}<b>${lastLogin}</b>
      </div>
    `).find('#jras-tooltip-posts-block');
  }

  function makeSendPMElements(containerFoElements, userName){
    if(!page.isUserLogon || userName == 'anon' || userName == page.currentUser){
      return
    }
    const $sendPM = containerFoElements.append(`
      <div id="jras-tooltip-sendPM" class="jras-tooltip-button" style="cursor: pointer;">
        <i class="jras-tooltip-button-img jras-tooltip-sendmess-img"></i>
        <span class="jras-tooltip-button-text">${lng.getVal('JRAS_SENDPRIVMESS')}</span>
      </div>
    `).find('#jras-tooltip-sendPM');
    $sendPM.click({user: userName}, function(eventObject){
      sendPM(eventObject.data.user)
    })
  }

  function makeJRASUserTooltipElm(containerFoElements, userName){
    const txtToUserAction = (userOptions.data.BlockUsers.indexOf(userName) == -1)
      ? lng.getVal('JRAS_BLOCKUSER_JRAS')
      : lng.getVal('JRAS_UNBLOCKUSER_JRAS');

    const $blockUserJRAS = containerFoElements.append(
      '<div id="jras-tooltip-blockuser-jras" class="jras-tooltip-button" style="cursor: pointer;">' +
      '<i class="jras-tooltip-button-img jras-tooltip-blockuser-img" style="transform: scale(.7);"></i>' +
      '<span id="jras-tooltip-blockuser-jras-text" class="jras-tooltip-button-text">' + txtToUserAction + '</span>' +
      '</div>'
    ).find('#jras-tooltip-blockuser-jras');
    $blockUserJRAS.click({dataUserName: userName, updateContainer: $blockUserJRAS}, function(eventObject){
      const t = eventObject.data.updateContainer.find('#jras-tooltip-blockuser-jras-text');
      const iof = userOptions.data.BlockUsers.indexOf(eventObject.data.dataUserName);
      if(iof == -1){
        t.text(lng.getVal('JRAS_UNBLOCKUSER_JRAS'));
        userOptions.data.BlockUsers.push(eventObject.data.dataUserName);
      }else{
        t.text(lng.getVal('JRAS_BLOCKUSER_JRAS'));
        userOptions.data.BlockUsers.splice(iof, 1);
      }
      userOptions.saveUserData(page.currentUser);
    })
  }

  function makeUserAwardsBlock($userAwards, $containerFor){
    let hideUserAwardsWhen = userOptions.val('hideUserAwardsWhen');
    let minShowUserAwards = userOptions.val('minShowUserAwards');
    if (hideUserAwardsWhen != 0 && hideUserAwardsWhen < minShowUserAwards){
      hideUserAwardsWhen = +minShowUserAwards + 1;
    }
    if(hideUserAwardsWhen != 0 && $userAwards.children().length > hideUserAwardsWhen){
      const $jrasTooltipUserAwards = $containerFor.append('<div id="jras-tooltip-user-awards" class="jras-user-awards-slice" style="-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;"></div>')
        .find('#jras-tooltip-user-awards');
      $jrasTooltipUserAwards.append($userAwards.children().slice(0, minShowUserAwards));
      $jrasTooltipUserAwards.append('<div id="jras-tooltip-user-awards-hide" class="jras-user-awards-slice" style="display: none;"></div>')
        .find('#jras-tooltip-user-awards-hide')
        .append($userAwards.children().clone());

      const $jrasTooltipUserAwardsHideBtn = $jrasTooltipUserAwards.append('<div id="jras-tooltip-user-awards-hide-btn"></div>')
        .find('#jras-tooltip-user-awards-hide-btn')
        .addClass('jras-tooltip-user-awards-hide-btn')
        .addClass('jras-tooltip-user-awards-hide-btn-close');

      const correctShadow = function(visible){
        if(!page.isNewDesign && !page.isSchemeLight()){
          return
        }
        $jrasTooltipUserAwardsHideBtn.css('background-color', '#C3C3C3');
        $jrasTooltipUserAwardsHideBtn.hover(function(){
          $(this).css('background-color', '#F0E400')
        }, function(){
          $(this).css('background-color', '#C3C3C3')
        });
        if(visible){
          $jrasTooltipUserAwardsHideBtn.css('box-shadow', '0px -4px 8px 0px rgb(138, 138, 138)');
        }else{
          $jrasTooltipUserAwardsHideBtn.css('box-shadow', '');
        }
      };

      correctShadow(true);
      $jrasTooltipUserAwardsHideBtn.click(function(){
        const $toggleContainer = $('#jras-tooltip-user-awards-hide');
        if($toggleContainer.css('display') == 'none'){
          $toggleContainer.slideToggle('display', function(){
            $jrasTooltipUserAwardsHideBtn.toggleClass('jras-tooltip-user-awards-hide-btn-close');
            correctShadow(false);
          });
        }else{
          $jrasTooltipUserAwardsHideBtn.toggleClass('jras-tooltip-user-awards-hide-btn-close');
          correctShadow(true);
          $toggleContainer.slideToggle('display');
        }
      });
    }else{
      $userAwards.clone().appendTo($containerFor).addClass('jras-user-awards');
    }
    $containerFor.find('img').css('border', 'none')
  }

  function sendPM(userName){
    let $pmDialog = $('body #jras-send-pm-dialog');
    if(!$pmDialog[0]){
      $pmDialog = $('body').append(`
          <div id="jras-send-pm-dialog" title="" style="width: 100%;height: 100%;">
            <form action="/private/create" method="POST" id="private_form" style="width: 100%;height: 100%;">
              <div id="private_form_flash" style="display:none;"></div>
              <input id="jras-send-pm-username" name="username" type="hidden" id="private_form_username" value="">
              <textarea style="width: 100%;height: 70%;" id="private_form_text" name="text" rows="12" cols="76"></textarea>
               <div class="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix" style="margin:0; padding:0;border: none;">
                 <div class="ui-dialog-buttonset">
                    <input type="submit" value="" id="jras-send-pm-sendbutton">
                 </div>
                <div id="private_form_uploading" style="display: none;">
                  <img src="http://css.joyreactor.cc/images/jquery-ui/ui-anim_basic_16x16.gif" alt="uploading...">
                  <span id="jras-send-pm-sendmess"></span>
                </div>
              </div>
            </form>
          </div>
        `).find('#jras-send-pm-dialog');
    }
    $pmDialog.attr('title', lng.getVal('JRAS_SENDPMDIALOG_HEADERCAPTION') + userName);
    $pmDialog.find('input#jras-send-pm-username').attr('value', userName);
    $pmDialog.find('input#jras-send-pm-sendbutton').attr('value', lng.getVal('JRAS_SENDPMDIALOG_SENDBUTTON'));
    const $pmSendMess = $pmDialog.find('span#jras-send-pm-sendmess');
    $pmSendMess.text(lng.getVal('JRAS_SENDPMDIALOG_SENDMESS'));
    if(!page.isSchemeLight()){
      $pmSendMess.css('color', 'rgb(172, 174, 173)');
    }

    $pmDialog.dialog({
      resizable: false,
      minWidth: 300,
      minHeight: 200,
      width: 550,
      height: 300,
      title: lng.getVal('JRAS_SENDPMDIALOG_HEADERCAPTION') + userName,
      closeText: lng.getVal('JRAS_SENDPMDIALOG_CLOSEBUTTON'),
      show: {
        effect: "drop",
        duration: 400
      },
      hide: {
        effect: "scale",
        duration: 300
      },
      open: function(){
        let magicNumber = 40;  //высота нижней панели
        if(page.isNewDesign){
          magicNumber = 55;
        }
        $('textarea#private_form_text').css({
          width: $(this).width(),
          height: $(this).height() - magicNumber
        });
      }
    });
  }

  function closeSettingDialog(){
    $('#jras-prop-gui-dialog').find('label.modal__close').click();
  }

  function newCssClass(cssClass){
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');

    style.type = 'text/css';
    if(style.styleSheet){
      style.styleSheet.cssText = cssClass;
    }else{
      style.appendChild(document.createTextNode(cssClass));
    }
    head.appendChild(style);
  }

  function themeDependentCSS(){
    if (!page.isSchemeLight()){
      newCssClass(`
        .post_content table td {
           border: 1px solid #474747;
        }
      `);
    }
    if (userOptions.val('extendedGifLinks')){
      newCssClass(`
        .video_gif_holder:hover .gifbuttons,
        .video_holder:hover .gifbuttons{
          display: block;
        }
        .gifbuttons {
          position: absolute;
          top: .1rem;
          right: .1rem;
          display: none;
          background-color: hsla(0,0%,80%,.8);
        }
        :where(.css-s2p5hg).ant-btn {
          padding: 2px 5px;
        }
        :where(.css-s2p5hg).ant-btn {
          outline: none;
          position: relative;
          display: inline-block;
          font-weight: 400;
          white-space: nowrap;
          text-align: center;
          background-image: none;
          background-color: transparent;
          border: 0px solid transparent;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
          user-select: none;
          touch-action: manipulation;
          line-height: 1.5333333333333334;
          color: unset;
        }
      `);
    }else{
      newCssClass(`
        .video_gif_source{
          top: 0;
          right: 0;
        }
        .video_gif_holder:hover .video_gif_source{
          display: block;
        }
      `);
    }
  }

  function addNewCSSClasses(){
    newCssClass(`
      .video_gif_holder {
        display: inline-block;
      }

      .video_holder{
        display: inline-block;
        position: relative;
      }

      .jras-video-sound-btn{
        position: absolute;
        top: 3.3em;
        right: 5px;
        padding: 5px 6px;
        cursor: pointer;
        user-select: none;
        transform: scale(1.7);
        opacity: .5;
      }

      .jras-ext-gif-cont {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        align-content: flex-start;
      }
      .jras-ext-gif-box {
        margin: -2px 3px;
        line-height: 1.5em !important;
        height: unset !important;
      }
      .post_content p, .post_content div {
        margin: 0;
      }
      .jras-media-n {
        width: 1em;
        height: 1em;
     }
      .jras-media-color {
        fill: currentColor;
      }

     /* для старого дизайна */
      .treeCross-old{
        float: left;
        width: 13px;
        margin-top: -8px;
        margin-left: -34px;
        font-weight: bold;
        border-radius: 14px;
        display: block;
        position: absolute;
        height: 20px;
        padding: 0 1px 0 6px;
        cursor: pointer;
      }
      .avatarCorrect{
        background: url("../images/comments.png") no-repeat;
        padding-left: 9px;
        left: -10px;
      }
      .avatarForOldDesign{
        float: left;
        border-radius: 3px;
        margin-left: -1.2em;
        margin-right: 1em;
        height: 35px;
      }
      .treeCross-old-toparent {
        border-radius: 6px;
        height: 10px;
        width: 4px;
        margin-left: -37px;
        margin-top: 6px;
      }

      table img {
        width: 100%;
        height: 100%;
      }

      table video {
        width: 100%;
        height: 100%;
      }

      /* для нового дизайна */
      .treeCross-new{
        float: left;
        width: 10px;
        border-radius: 14px;
        display: block;
        position: absolute;
        color: rgb(255, 255, 255);
        border: 2px solid rgb(255, 255, 255);
        margin-top: -8px;
        margin-left: -16px;
        background: #DFDFDF none repeat scroll 0 0;
        font-weight: bold;
        font-size: 18px;
        height: 28px;
        padding: 0 16px 0 8px;
        cursor: pointer;
      }
      .treeCross-new-toparent {
        margin-top: 10px;
        border-radius: 8px;
        height: 15px;
        padding: 0 12px 0 0;
        margin-left: -18px;
      }
      .treeCross-new:hover, .treeCross-new-toparent:hover {
        background-color: rgb(254, 204, 101);
      }
      .jras-tooltip-caption {
        font-size: large;
        position: absolute;
        overflow: hidden;
        max-width: 75%;
        word-wrap: break-word;
        padding-left: 8px;
        max-height: 20%;
      }
      .jras-comment-expand-all {
        cursor: pointer;
        width: 18px;
        height: 10px;
        display: inline-block;
        opacity: 0.6;
        margin-left: -1px;
      }
      .jras-comment-expand-all:hover {
        border-left: 3px solid rgb(255, 0, 0);
        margin-left: -3px;
        border-radius: 4px;
      }
      .jras-comment-sizer {
        display: inline-block;
        cursor: pointer;
        bottom: 0;
        overflow: hidden;
        height: 10px;
        width: 97%;
        background-image: linear-gradient(to right, rgba(244, 244, 240, 0.15), rgb(192, 192, 192), rgba(244, 244, 244, 0.15));
      }
      .jras-user-awards img {
        width: 16px;
        height: 16px;
      }
      .jras-user-awards-slice img {
        height: 16px;
        padding-left: 3px;
      }
      .jras-tooltip-button:hover span, .jras-tooltip-button:hover i {
        color: #CC9622;
        opacity: 1;
      }
      .jras-tooltip-button-img {
        vertical-align: middle;
        width: 16px;
        height: 16px;
        display: inline-block;
        opacity: 0.7;
      }
      .jras-tooltip-button-text {
        padding-left: 4px;
        font-size: 10px;
        vertical-align: middle;
        display: inline-block;
        line-height: 10px;
      }
      .jras-tooltip-favtag-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACOUlEQVQ4T6WTu4oaURiAz5kzXmaxUUgR8AKivoGVRcSIQjqJ40SCiqKMRSTISiJGLDRVQFALHRPICAEtBLt0EgttUqdZQt5AXS/MrNHoTJhhV5TVbJFT/9/3Xw8E//ngQ3w+n3eLohgHADw7jOU47geGYe5/CrLZrBvDsB5JkoTFYsEPBblc7s9ms6mcFWQyGTdC6AhuNBq/FQqFGI/HiWKxyPM8f3VSkE6n3RBCGbZarXLm5XIJyuWyaDabV5FI5KJYLHLr9fr6niCVSt2DJcFwOASr1Qp4PB65k1KpxG23W+5IkEgk3DiO9wKBwD7zXd/tdhvY7XZgtVqlaoRKpfITQvh4L4jFYvLATsGShGEYQFEUQAgJLMuu5vN5QaVSFWRBOByWyz4HSzG1Wg0Eg0Gh3W6vFotFYb1eV3U63RQGAgF52hRFETab7WhVh2urVqtgt9txi8Ui3+12q9Fo9JFSqfwO/X7/8iF4NpsJnU4HG4/Hb3u93gdJnEwmXYIgvIY+n28ZCoUuTCYTOnWV0+lUaLVaNxqNZovjuL1er/+6FbwTBOEaer3e50qlkpV2azAYjiQSzLLsDcdxb4xG4xMI4VeGYb6QJIm0Wu0VAOCpPESXy0USBPE5HA4Ter1elkwmkz3c7/cbNE1Toii+lyAMw0KiKBqbzSa9X6PT6XyhVqs/RSIRQqVSwdvMl4PB4ONdazRNlwEArwAA3xBCZL1ePz4kh8PxkiAIBiEEeJ6/HI1Ge/jcr/0L5NPyr4kFGRcAAAAASUVORK5CYII=") no-repeat scroll 0 0;
      }
      .jras-tooltip-blockuser-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADEUlEQVQ4T2WTW08USRTH/1U91TUXdAoV54Ibh8tu4sZkmOyD8cFFgzEaHzaExMBb9zfAT6B8Anj3oTvx2YyYrGtMNsL6xG42uMZkBGYDYZhpEMRiYKB7ZrrbdCeMRCo5D5VT53cu9T8E352iEELhXPOAYRAiQrfvS5/SeXBujq6tyZMh5OTlRSo1qQrxKHvjhogkkwidrgu32UTr8BBbCwvySMqpUcuaOY7rAJ5fvGj0FArahUIBslSC22ig5TjwPQ8RRQHxfZzp78fnchm7q6vmWK2mB5AQEGQ+PzQ0fXZgAAfLy7D397FnWSal9D8KoO15+WgyqSXicRBKsVOrBVU9HLOsGRL0HEulVn+4d0/UP3yA327Ds2041ao+UqmYx6UWe3uHunK5N8muLlFfW4Pc35eKqvaRF+m0dun2baNVr6OxsQFVVQFC4DsOmtvbpyDZkZFFlEqwNjfhep5Ogt77x8a0g5UVfFpeNs/4/jw7d87wDg7QlhLEtvWRRqNTye/XrhmXMhmtMjcHO5EwyfN0+s1PExM3dxYX4arq1K3Xrx//wZhGFcVQFAWhUar/KmUIKQ4OTv58//70xtOn+BKPz4WAHx88uPlpYQHo7p669erV4+Dhn4lECAl+gEUiYIqi/7K5aQaA/Pj4dO3JE1iMhQDj8t27Wm12FnYs1vmeAPKXEJrKmMEYQ2iRiP5/T8/w1Xxeq758CQswSTGd1lKFgvHl7Vu0olH4nBdGq9V3x9P/N53WGOeGylg4YO/OHbD371Eul/HZ93VSzOUEV9XVrnhc1JeW4GYy7zzH0U9CSgMDGufciHIOns3isFLB31JKSmlfKKRiJjMp+vqmnY8fwYVA5MoV1Hd2zKNabTbwR3t7fxvM57ULS0tQWy38s7WF7Wbz4fj6+kxHys+yWcNvtzV1bw9JIdB9/TpIMgmFc8RcF6RcBt3dxcrRURBsjq+vf5Pycb/PMplJz/MeEdsWcQAxRQFXVRDG4BCCXUA2gakg86ll6kg2lxNeq6X5hAwDEH6wzYRIQsh8hNJT6/wV5lBT8JU2J8oAAAAASUVORK5CYII=") no-repeat scroll 0 0;
      }
      .jras-tooltip-sendmess-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB2UlEQVQ4T2NkoBAwUqifAWyAm5OdkwAveyoDEwMTUQb+Y/j34fPP2bv2HdrHGBPm0RAWYVlrZa3GxMREnIP+/fvPcOTwjf9rVh1vZCzNj7xTVumrzMxMnOUwF/7584+hvXnjfcbUAPdV0ooiof5RlgzyCiJE+eD+vdcMm5YfZ7h+4/EmxoxAj2WqonyRH/79ZVAxU2Tw9jdmwOUVkNM3rz/NcO/MQwYBJmaGmy8/rAAbYKYgHvn152+GD1+/MTCK8zIExdowSEjwo7jm2bP3DOuWHGNgevWZgZ+bi4GbnZXh1IOXy+EGgFT//vuP4eqz1wx/2VkYHLz0GZxcdcCG7N5xieHgjksMLD/+MujIiDKwQsMLxYB3X38wvPz0jUFehI/h379/DB++fWdgEuJm+AeKmHffGAQ4ORgYGRkZ7r/9yCDJx80gzM0JcUGqn+tKQW6OMEEuDgZxPi64s//8/cvw4/dfMJ+DlZmBhZkZLvf841eG999/MHz8/ns1Y4yX8x0HNWllJkbi0gDMlL///jMcuPnwHqOPg029gaxwnaIwPxPIicSA////M9x78/Hf5edvGsA6rM2MbHk5ONL///lLVGpiZGH+9+XnzxlHTp49QpyVeJxFsQEAvJ+vaZNelxMAAAAASUVORK5CYII=") no-repeat scroll 0 0;
      }
      .jras-tooltip-frienduser-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADQUlEQVQ4T6WTaWxUZRSG32/u3O27M9y5s3SWdtqZ1rZDoB20LG0ADQSqVQoaKmltBGITFVH/WLZQhdSFRQlLgIAQHLcILSaAssRqQhNoaZMCAck4aiMtlU5S6D7MdjvXGOOE8lPPz3PyPsnJk5fgfw55OP9qZQmdkWPb7sj2zGW02JFlGwKHHr5ro0FLf2sjcVV+c+/ffRowt9BqZBITR0UkVjicDpisFrV/YOS1pvbQsd++qp0yNK41Sp6y5UPB84yaVDtyC7PWZi87djcNKHXQCobBuQxZgF6gUAmLnt5w89WB6IpTjZX1l6+FP86cosFiltE7nII/j25e0nD2ozSg5omsYrOFttVVzZFExYrhSBJfft3yycEfQ+u2VM8+evVWX92a1Qsxs6QA7207icec4oH6QMebacCNw8t9IzHdjTll01lWMkJLEfT83tPifWFPeUPVrO01S3wb8ktLwRqM6PypDa0Xr7+7/rMrH6QBt5pe5GSV/1xPhWqjokA0GlNEz9SR4s2BZ4tcG6sX5myrqq2AYJKxb/dJjEe1pQ2BS99NsnC6fnqxYjJ3ZrgsPMfTX7wv5U8jZGtqnsf0NmW1vZteLgKlPLZ+2tXn80/1725uH5wEOH74/TxzuLWTScXNdqsclGsCi91W65+lMtYXz/LveH3tSpiFOJq+b+t1S0NlNTsv/2Nh5a6zBQYD//y8Gd5XKrJiheLEfWiiGSGSd3swnmwe/+Id/2zuWrntyVUg9iKQByFgsCuo9gTfIqsOtNdyrLbf61ZMDqcBbpsJTipC1BOoiRgSIIiyInRdR1ASaYH2+BoQvQiE2xAPnTlDqvZ2XLQp/FNTvSa47CLsEg8H5eCQOKgpDaMJFcOqDt39d/BM5ARETzkgKEDoW8RvnrhJntt5qTvbTnN9XgVupwSHgYdNYGERWfz9X2wihdtjcfwxMILFQ4dgdeYCOorIuT0YG7v/K3n6w9ZQpl0q8OUoyHRR2GUBCsfCwDJgdASjcRXhaAJ370WT8oU3zutSkZFsTk0Md//c5831/kAWNF6YJiXH52cYtTJFZjxmEy9RjiMsAI0gOgHtjqoTOjXqvLJuUX77o+WdpPG/NPsvfmchq5NnMwsAAAAASUVORK5CYII=") no-repeat scroll 0 0;
      }
      .jras-comment-expand-all-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAnElEQVQ4T9XTOwoCQRCE4W/FVDyOiMcQxVv4yAUFQ0ExNjATwQuYi+eSgVkZDXYZVgM77v6nq7qm0LCKhvNSQBcjHHOgJSAM39DDGisMMK+A3bEvATOM0ccFO7QwrQA8cEglTHDmTVatmp8CsjwIq35KCH78kQeLeMaQgyu2aOfkoBODFHQvsYmZyPIgQIY41R4/afjqZ8p5+NX7BC5LHBGsTKWSAAAAAElFTkSuQmCC") no-repeat scroll 0 -3px;
      }
      .jras-tooltip-section-topborder {
        margin-top: 4px;
        border-top: 1px solid rgb(85, 85, 85);
        padding-top: 3px;
      }
      .jras-PostControlBlock-new sitm{
        right: -75px;
        background-color: #fecc65;
      }
      .jras-PostControlBlock-old sitm{
        right: -85px;
        background-color: #fab728;
      }
      .jras-PostControlBlock-old-dark sitm{
        right: -85px;
        background-color: #7B7B7B;
      }
      .jras-pcInfo-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAQCAYAAAArij59AAAAlUlEQVQoU72Q3Q3CMAyEfdkBxCYgZmjtwg6IlTpGnMyABKOUHairVv0LIuobfrEsf76zDRqD+XIl+tRtSwa4e4ze9y0sAL+J3G6smxD8IQGKghvn3D4LlGVVAVQPU7CbqsZEYbL6zvMOWYC5sl/NEPwwjE2gp0TkaIbnWmlWWP6QWv0bEJGzGR7rJQE7qeore+YEbwId8bxC57bEHC0AAAAASUVORK5CYII=") no-repeat scroll 8px 4px;
      }
      .jras-pcShare-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABUklEQVQ4T51TsUoDURCc3eMuWCgSFPELBD/DInCQt0mMacUmKf0EC1ttrEQrLdQixSV3nxBB/ALBWoLGQs4qBPJWTj1JTpFcXrszs292dgk5n0htG9AzwKqq06ScfIhUXwGsJDxr7SC3QLksfWZe/278kkvAmNqW6viGGSOAXSKd3UJKJnLqURTcptZn+kFKdhza6Xa7vcm5kTHmnpnHnuf57XY79n2/4LqFYwC7X0CNAC0RUT1LTqokUrkDaE3VFonQU2UlgsmkcxmGnb2/EvuxICKLqlwmwlUiPAlWtXEUhcv/CqRFkWoMYCkDfgvDTnEmAWMqJ0S0Pw22T47jlIIgeMiK/Eqh0Wh4w+HoSJU+h8iMCwCPAA4BHIRh53QqhVlXWUQ2AL5Wxbuq3WQG5b6FVqvl9vvPMTMvzH0LIjIAeHWuW0hIxtQqquNz5mRftPkB0mGAPwDQKeIAAAAASUVORK5CYII=") no-repeat scroll 4px 4px;
      }
      .jras-pcRating-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABcklEQVQ4T52TTUoDQRCFX3WbjaLukiuIezGoG92a7pngHcQT6Bn0CjmCyGR+IBtxmyhxL57An4UIEQKhq6RJIpmJmYiz66pXX1W/riGUfNaGDyJO0jTdXSSjMkCjEfa0Fo7jeG9GN60RH/sB+G7M4Cxr15dM9SgCTtP2Tg6woNscy9qgy0y+0X4OMKsMgmCbGVdEdAhARHAH6PM0vXkqEuc88MUi1AWwMSsW4U+gUi9CPCBnijFBRkTHAEVa42w4XJFKZdQCEDBTkmVRMAsma8OcKdaGXwBWtaZaFEVvXtxsNqvOySszD7IsWfcxa8M+ACZvCgCXJPHBJDEAsDYaVaqdzvX7OGZrgHrJA8Z1cx4YEyZEMABirenUOUciquVjRGjHcbuZu0LRVWNOtoBRj0htFnIfWlM9iqLnUoBPeogIXwLuyJ+1VrdK0cWkeOEm9kWcK9v7iUe/b6Ix5l4p5Qp7/79NnFb5p1o2Venf+JepvgFKmMR2kcNRhAAAAABJRU5ErkJggg==") no-repeat scroll 4px 4px;
      }
      .jras-pcLinks-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACEUlEQVQ4T52TvWtUQRTFz53Z1T8hH2h6BcHGUlFTiJt98zYLtlqJ2OqC2ugGK4topYilNoLI+xgWQcVEsBBWEoloqWlElIhW62bz3hyZ7Nu4LImgU87M/d0z95wR/MeqVE6Na73xlERH/lZvjJkE9AzAcRF+0Vq3sixzJBdE9D4Sb3YCiDG1OQBXAJQGTZxzPUB9VQp7AVkhs+ntAGKMuQ2o8865XGsVk/hA4rAIjhawT1rLoSiKvo8CtooBdABXTdN0of/m7gsvuwCsay1TURR9GwYMd/6lFGZ8cbPZVO3223daY39fNn6K8IgIzyRJcn8LEAThnIhcBdgVQZAkyXPfzQOWlpbfA9Ih8xNKlRokL5G8bG1yYxNQr9f39HrZRwBaRFWtjZ+MuOPv0e8FQa0lggqJ09bGDzYBYRieI+UuIFGaRvWdrA3DcJaUx865rginrLVrmwBjate8WgDXs6x8p1zuPXNO1qyNjw1gxhjjHB4ppXYBaKRpPO/PCsDsWYD3SCwC+VgRksUBYKR4Pk3jxgA8mMFEr5etFnQ4h2VyY7rVav3wsvOcD4uzm2kaXxx+YqHAjDmn2v2E+eVekvIKwEERqXilpNyyNrowOh8ZDkmeY1VrTADY/eciuySa3rLthitBUFsRwQEfEq1xfH29VC6VsgrASRF+Vkq1fOJ2ckaq1dprEWggP+lt+dff/Rtc5vxxeU5FtQAAAABJRU5ErkJggg==") no-repeat scroll 4px 4px;
      }
      .jras-pcShareFAV-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADGUlEQVRYR8WXW08TQRTH/zPb7hYoUC5CEIgxXqDBN4PcxAfUJwEjKvHF2yfwTb6CiC++m2jig1HACNWYKCFRICIYXxQBI4lRBI0CFWhpt7szZreB0LR0usvFSZpuds7ld87MObNDACDc/tirE/0GJ7SBAG7j3XYNBhakhPRLOr2utLWME8O5xtkwkUjWdjlNZJfrfNFBaDUJ3uzsAaHNO+l8zReHjwQ6upe2O+0bBccYAiTY0c3tRk+LcgCNgf3+a9cENgUgt9QCmg619+3OA9BCD5SLDabj8L0+sD+LtiBsZ0A+UwNpX5HpVJ/8AdVnLwu2AGiBB8qlaPSrw24WbAHIp6shHdgdA6BPTEN9OmJ5GSwD0PwsKFdOJHQUuvsSfG7JEoQ1AEIgNx2BdLA4oRMzC89GAZ56ZccDEALidoHkuEE9bvPffM7JAPG4AYkmj1DTwfwBcP8y+EL0xxYC0efllTjdGACSmwnlwjGQdMVSGlMV5oEQwg9em3CrIy4DtDgPytk6QHakajclOR6OQO0aApudj5FPuAdoUS7kc3UgijMl4yIhHopA7RwA++VPvgTrZ41OJ58/CuKSRfaTzvMVFeqjgQ3Pi6RVQHdlQ26tB0mzB8GD4ajzJG1aWIZG3ZsQFjemueEeDoDPJ+8LQgAjv5K3FPKpSktLofpGoE9OC3VSAnBUlcFZXyE0tl4g8uojtNHPQp2UAOTGSkjlpUJj6wX0sW9Qn78T6qQEoFw+DmNDWhlGyYXv9wtVxACUIu1ac+IWrOkAIRvOrdzuFZ4LQgCSlwnX1ZOxkTAO7cNXaG8mAErgrCmHdGhPFGbdCN15EdN2E6VDCCCVFUNuqlrT1ce/IzI0HmfYOEecdV5IZSVrsuqTYehfZpIugxDAWeuFo9YLfeontMEx4Rew8bXkqK+AtLcQkcFP0IYnNgfgOLwfbHYBbGZOuKFiWnlJPmhBNrT3U8kBljs6AxQ03ZL1LRKOXkxudfnASeMW2bRohvf8t8spGPNT8GqzbqLXc97OOBooRYbFMCyJG2mnlPdRxtpcba2T/wCSWmgLitIWxgAAAABJRU5ErkJggg==") no-repeat scroll 0px 0px;
      }
      .jras-pcShareFAV-exists-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM0OUVGMUYyQTAzNjExRTc4QUMyODg0QUZGQUI2RTc0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjM0OUVGMUYzQTAzNjExRTc4QUMyODg0QUZGQUI2RTc0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MzQ5RUYxRjBBMDM2MTFFNzhBQzI4ODRBRkZBQjZFNzQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MzQ5RUYxRjFBMDM2MTFFNzhBQzI4ODRBRkZBQjZFNzQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5H7LYwAAAD6klEQVR42sRX70+TVxR+7mlLu3aUX90maBSMOBmy8WFLzDZjJEHjB4dxGuZm1OAX/wJhkizLkm0sfF7CkiVjZmEfiJjFaDAQ4o8lLmaZZhkDGW7CHALjRwFbLPa9d+e+L5Ph20J5m8FN2t63vT3Pc55z7jn3CvB41NBWIslokKAKEngW/+OQkFGC6CKDTvvqDvYIDW4I+YMgEcQqDiXVtEvRDtKerza4HhpTCvUZadmxRkMCFZROzCk/B/RclmMCRAi4HUu48TbE7m85mBkQV96GGix3RsIxgQ2T/BZmC6MQ+VPOVXDsfXHHwvOLXeZ3q0dgvfZ+/D9Whh2rQM6877J/71CFlRPQnnLc7ZZYhRdmVkzAnarX1kSwp53J15V0QoxyTVPKqnYp7AwRbTynFgFpkOxZiFzO8CDH2j8GZDxYHPOUam0eMJcPREPAVB7URBAq7OPq44K6X5ZYAS2hKP1mxeVMjMWhnn9KTE3Yq188z+HHQn5pXj8fYwJJQqBGMiGeOQxsbl0e+JGCuyMC6o1ZPArciL+3dFVU/dVQY4HkSahjJu+FzIVLxm3SgKc5bIGTCygoBw3FOf7x5OB977D9XFte2HaBXmAu5D8kBB8z4P56CmKGtX/pLaDuHhDaMk9MJgbvfZdlz0mYlAl3gfjNA/fd70HtEmpzFLLMC7nJw2Flz89ychq86NUTwMEmoOUI8Mt5KD9BbbCbUz0M/iAr6Y6w/YNi3Zw7n84/GBDd/NEzDWOXH/RrzAJ/rQY49CXQWmOBBwjx41nm5yLw7qNmXi21HW0hoLk+a7L3DFB/F9jzAVtyw3U1CvE3oxe+wZ5/AXR9DPzYDOURiB8J2sAxsm9Z8IQKyIyt1uTyJ8AsV70DjcD6l1lqzokMPjoc5R3y+1Wg40NzmVHFIDkuu2V/OKVCZCfgLUUs730rDNc+BwLZQGU9cPIyEJ9lw7lA2yleaMB4xQdZ5Els2T9kFrblSCTsBRaJunklPrI8LnoTKK4EbrcA4/1mUhp7AsktuwbSa0bSux2PM6ush0u1Cz/caLJ+L/Gm0EREes0onnkYLs910J83gd6LQG4RwHMVckFuK4X6aSe7ICG2X2NLf9jxQw+hBtLshmrLOuDWEPDV/n/NQvrKIK9XPomvmPBbfYS7oW7LCwTG01PAlPp17mqZDHCf7zMjfgbfhLnYaWBQPFU9GVD3Ej4tia3t1nkxOJI+ARUphsGlVka4pc4sndFPiPzFx/UiPrTkDS+fJg8bWyME8q/JxUQiQvqiuFY3IyLVSfqWqi+Ka+B+mKRRS/qKrG+pfLK5oCVZDdk5W74jyB2+2uo7/wgwAKrre9ew1tbOAAAAAElFTkSuQmCC") no-repeat scroll 0px 0px;
      }
      .jras-pcShareTEL-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD5klEQVRYR8VXW0yTZxh+vq8HeuZYTqWyAroz06ATQp1KjDHZYpYtWeaF0TASLjaywwWYJSbOKzfjsiW7WbLsYsui7igBzXBGjBrnBcuC2SZgPQCjMCpSCm2hlP9b3p8UWlp6EApf0ov+//u+z/O87/u93/czAGg40/e0YPyEkFDHOQz0LF1LkiQfFOwyl0TzV29uus0InDF+UwCmdIHGissAjxBSNXvrrKOVAfvXEnwRi7Wx+tOOyXSnfXlxzMsazjrE+qifR10zAllaJTRKhpHJ2Qi9aSWg5AwvFOthLzPi2QIdBASOtA9g3B9cIJEWApZMNew2E6pLDTBkKCIUf3hhAK6pxSysGgGtimOb1QB7mQm2nIyYbeULSHjv3H2EN92KCWw0a2S1W60GqBVsAXhqZg5d/3qxq3xxvPw94sNnV4dX3gOZGgVqnjDKwAVGVZTaGw8m8VufGw3bC0DlCK3z/4zj3F+PHo8AZwyVxTrYbUY8X6QD/V+6Rqdm8W2XC25/EO/vLEaOThlh8sX1EXQ7vakRIIWklBST8lhrThL4tceN87fHsSErA007iqBX8yjTD1ofYHJmLjGBDCVHVYkeO8pMqMjTxJ1TjofTsmqnJyBnqLGmMKIXQs5jviCOtPdHxYpoQkrra5U52FlugkYZrSDc2z8r4adbY7h61yN3NZXm4FZzzNKQX9fgFL78/b/4BLK1ShzdWwLjkr271IuCnfnzISam59P58jPZePW5nLiZ+qF7DBd73fEJ0FuaXk/la7HZopd/4XV/5Aviuz9cuDXsm5/jDDiwJQ+7KzLjgtPLTzqHcMc1nZhAuAX1uS1Xgy0WPXZXmNDc1g/frCSbENGG6nxUlSS+v0gCaPr5HgJz0ede0oPoHXshOh0e0DChqfd2bSGezNcmVE4Gg+4Ajl8cjGmbNAHahhvzNPimyyUPmO2liZWHEK/d88h+sVbSBHQqjo/2WdHS3o/mOgvKc+Nvz3AwAicSKyJAzu++VISOHjcObTMjTz8/gqmu4WdALJBjHYMYmgisnAANJmuWGrU2kwxK2/DTK05YstQ4WGWWe2PpmglKaPrlPsQy966kS0CB6Ww/vs8qzwma96euOBduOGaDCo01BSjNjjyK+1x+nOx0LtusKREIlcGsV+Hza8MRF4vQ1ny9Mhd7Ni3OhY5eN37sHls9AsnsO7qGHX7RDINaIWepZ9S/tgQIjfqBjuPlmi/EKOUSJJOBVGxY/ek+L+dcl4rT6tkyL6v//k4bF+yV1QuafCTB0LpuH6cQklviymr5YkdfyGCKjwHUAUKfvIbHsWRewcQlAd7y9Rtlvf8DpDx2AbcgTJgAAAAASUVORK5CYII=") no-repeat scroll 0px 0px;
      }
      .jras-pcShareVK-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADo0lEQVRYR+1Xe0yNYRj/vd93zqmOIpHk0hWbFGYulTsZqzOTzV0mlsuykGs2xtwSYWQ2k402WaOcYrTcRqxIYrbchjT3ojpOdY5zvs/ej856+77SSszW8+fz/t7n+T2X93m+jwBA2PpT/YkoxosiJhDCOVJdW4lgRTVHxGsij/UXExYUk1/O8wCuY1s5VbYrVImEBBLdupN6gJv6d53/9CYAWSRs7UlDW6e9ieCMRLcuRfwX0df5bCfwf2bASWsHRweNVMZaswVfDTUtbiMmAx5uzgj07wWe48ARAkKAe8Vv8fRNmeSgg4MGu5dNgrd7Z8Zh6adKxBy4CItVsOm7OmsxbrA3yC87IJBs3npYgrefq2w4hkDIUF+snBnEGC+vrMbi3RmwCj8fi5uLI5JidbDXqBhcVPx5fPjyzaaLnR2M8UN8ZJlJOpeH7PwXygQ0Kh7Jm8Lh7GjPXNx/5g6uF7606XYuCcHAPt0ZTOSudJRVVEs6l44OSI4Lh4rnGEzlt1pE7dGjxvRdmQDVTh/rh8iwIczFd2UGRCdm2VIct2AMgv09GMz8bWdRaayVdMvDhyM0qJ8s+sTU27jx4BWjl70CO7UKx+OmybJw4sJ9ZNwsli5vmDcaowZ5Mobmbk2DodoML/fOOLgyFDxHmPObRa+x93SujJTiM6TsaRT1hXY7bbT35QZsj5qIwX3dZQRqTBYkrpgCn54uzBltutWHLjGprwMoEqDsD8fq0LtbJ8ZQyYcKHM24i80Lx0kvor4cyyyAv3c3BAewpTF/t0rO33yskEVPFY0OItpktNlaK2lXHyMlu6hRM01OwpgZQZg0zLdVHK4XvsL+M7dbRkBrr5Yayr2LU6tI6G89QfKFAogKe/e3u8CruzMSoifDwU7dJAmzxYoqowldO2kVcZfznuNIen7zXkFDVICvG7ZEjpdNv/o4OuGuFrzExogxGOHXS5FEas4jnM551PQcaCxMuifWzBkJnx7sHqjDL03Qgw4sjZrHjiUh6O/pKjNFS7A26RKelZbbzn5bgvpW6GIZOdADdGf4ebnaykIH0KJd6dJmpNLBXo1Vs4IROKA3Q4Luk32puch9WNIyAg1Dok1KSZnMFmYT1uGctBqoVby0yARBgMlsBe0VJqj2b8L2DITGphg5HsrTo1Xzr1mXjUS35lQWOKJrFvwPg0QQ/T/7ORWAChVBoPTZQv+QRZHs4YAJdI784UAbmjOKIFd4Im7ITIh4+gOHIWRqYeEoEAAAAABJRU5ErkJggg==") no-repeat scroll 0px 0px;
      }
      .jras-pcShareMAIL-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAF+klEQVRYR8VXaXBTVRg9772kSZpuSZt0QyzFyrSAFMrWAQYopayiLJZtGFCpAg4q4wIz8scNRaEMMyAjMIJOizBSoAUBleI4DlBls8NSyiJVaEqbrkmTJk3y4nz3NW2eTWh/CH6/3rvv3vude+75zr2PA4D4LVWpHpH/FKKYBZ4Po7ZHFSJEOwfhtIL3vFuzJqmCY8ndfBl4RDyqpAHnFWERFOJozrj572IAsx5r8o5kXi+OcsbPq6yPmvZgixMh2ogBb29XP9gYgpkpGoxMVCFFr0C0RgDHAU1tIv5sduOCyYmTd9pQdt+J3k7aKwBjnlDhvbFRyIgP6RXWW40ufH7WgpKb9h6BPBSARsHhk0k6LByolSV2eby42ehGi0MEOCBWK6BflAI8J8d36q4Dq082oLFNDAo8KACdmsf+uQakx3atuvimHYVXbDh334l2j5zkKDWP8X3VyBsWhhEJqs6EVc1uzD1oxn2LOyCIgABUCg4luUakx0nJq60eLD9Wj0s17bJJaMVeL2Q0EwnZyRpsnaJHtIZn/W83uTF9Xy1anN2ZCAjg44k6LB8q+RGtYOb+OpjtHvY+KlGFF4eEgXRh0AqwtXtxocaJgis2fH/LDrGDGKNWwL7ZMSDhUhy4bsPrJxu7sdANQJpBidNL4mhr4XR7MamgFiSqEIHDxkk6LBok14P/jGfvObHjohXbpulRVGHHpnMtKF0Sh/gwgXXLLqjFlTo5i90AbJuqxwtpUpKNZ1uQX2aBwAF7ZsVgSn8Na6+zeXDiThuqLR5EqHhMSFJjkEHJvhEBBJ72PGN3DaY/pWFjKfZfs+GNH+QsyACoFRwqViYiVMmhze3FkC9NbN9ezQjHB+Oj2CRHKu1Y82Mj7K4uEVJCAp2fo4OyoxR8AOj1zLJ4JOsUsDhFpO0wweXbJwLrb0SZfVQ4kmtkiaiG8441gECVv5IAUnlFvQuTC2tBZRgo8oaF46MJElAfAHp+f3wUVmSEs/YphbX4o7ZrG2QAlg0JY/tMsf7nZuy6bMXkZA0KnpcopJXvu2oLmJwaSSdXVyQgUsXLAMxLDcX2adFsHAmRBOkLGYC3MyPwTmYk+7aspB4nbrdh9YgIrB8ntY3d+4AJ8mFxcJ4B4/qqZQCyktT4do6BDfvw12ZsO2/tGcDCQ2acrnJg3ZhIrBklndRDd5lgskrlGCwKZxuQ3U8OwJ/FDWdasPU3S2AAL6eHYUOWtAU+uqnstuToWdtzB+pQVu0MmpzEeGF5PPpEKGQMLH0mDJ9lS/OuLW3C3vLWwACIOqKQgjpRZ6rhS3kJzOf3lLdiXWlTUAD+VPuLMH+yHosHS6WdW2TGL385AgPQKjlUrkqEUuBYrafvNIEET7a6YKCWPdPW+E/gm+nJSAWK5xs7TccHgDzkYl4Ca6fxA7ZXw9reZcndjIhMg8yDYuXxBhy6YWcl+NPiWPSNVMAtArsvW3H4hh2mVg8MoTxykjVYNTycmZIvfABmpGjw1bNSFZXedWDRYbOMwW4ARiaocHSB5AW1Ng8mfvMADW0iS07enqKXHC9QNDlEkB1TUpvLi5dK6pGfo0diuGTFc76rw5l7cg0FPIy+mBaNuamhbBCdgPMPmZmLkSmtzAgH+UVch79Tn9Z2L4pu2LDpnAVkZjtnSDXvH3Q2rDrR0K09IACi/PjCWPTXKdgAOk5fO97Q6WAkSLqAGEIFZtW3G92d9kpmVJxrxDC/2xOxsviIWWbfPiRBLyREedE8A6Oegsy3uNLOquP3aicTlH8Q6OHxIThvaofD48WCNC1SDUpcM7vYIRTMvh96JYsJFUCn48QktSwZqfi62QWzXWTl2SdCQFpMCBQ82KV0aXF9UJ38+0OPl1Iyl1lPh+KtzAgMiA4uQN/EwS4ewRD1CKBzr8iK40MwNVnDbsfJOiV0Gh5UeI0OkZ0RVGZfl7eyo7y3wcVsrrLx4CXJP+ZgPyaGzfeOcvDOfMy5WToRKP4/f06bRaUwmv1K0B+y28Nv9HJiFg8++K3zP6CJaAf4UxCEtfVvJlb+AzeJolL+5GMJAAAAAElFTkSuQmCC") no-repeat scroll 0px 0px;
      }
      .jras-pcShareTWIT-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACeUlEQVRYR+2Xy2sTURSHvzuZWpsmFR9orZKtVsSNVKLVLKqLClZFUET8E1y5qFDcuBAUF7ryD1DwudA+sFhrKfjGhailJVSp2IVGWmqTTprXzJWbWqEmM2byaBf1LGfmnt93zzn3zLkCZXdijXisS0AL4Ms+q5RZxBHWAJbezkn/iPgt/hqoq5Smjd8ophYU3J/uBA4vsvicnKRbAcScwh5c4+HABp1oWnJrPM1EUpaT1VAAth47tlZzcXv1H8EfSUlo0CAcs8oGYQsQ8GqMHfShiYVaPd8ytL2IVx6gbaNOV7M3RyiSkNT3qKyVx2wjcLRB58GeXIDJlGRd13+A5RwBU8KnGedjqM7117jFheEkLydNx2p1XYRuaj9hws6nMwxH7YErCqBgr4RTtH9M2HJXHODqaIqz75cIQNXL7gGDt1P2dVBUBIyM8w9JvR0zJB1DCVTrdjLXAMunE9r9jGIZSd3DReiEahB51VKbN337Bg2eTzg3mEL7hW0N+HTB1BE/+l/zgHL8xbCyM8GQQ4MpGUA56N3rpbVez+vLkjAUNYnZFHnSlPR+z3BtNIXToXEcyfav1+kP5c4Ehe5OfXd7PM2pN7PuO+H8ipu7ajgdqHKjmfPttr4ZRmzS5RgB5cnrEfSFvDSv9RQN0foszuNI/lz9E0Cp1uqCG00rObbJfSRSFgQexVCzZD4rCGB+4fHNVZxvXMGOVYVFQ0meeZfg+ueUQw3cnTbQcFVpW/waTas9NNQIqjRBnpPKrCl5EjH5MO3YLwzBvaluhHao6ASXslDSuXSXU4ufCBGci566nmvWZUT2ep6//5ay04VrDST9IM5xoi78C3TSNveIzXAyAAAAAElFTkSuQmCC") no-repeat scroll 0px 0px;
      }
      .jras-pcShareFACE-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACJ0lEQVRYR2NkYGBgsAifqsnMxNLxj+G/ExMDAw9IjGaA8d+3//+Y9v37/7fsxMrs64xgyxmYTzAwMfDRzFJsBv9j+PSX4a8Fo3XkzI0MDP/96Go51LJ///5tZrSMnPGZkmDn4WJjMNWVYZCV4GdgZ2Nh+PXnL8PXb78Yzl17xnDv8Tu8/vr3799XRuvIGf/J9X2kjz5DUpAxAycHK4YRs1efZli4/hxBo8l2QHyAEUNqmClOC2jqABFBbobVEyIZWFmZB8YBga7aDMWJNiiW//j5h+HMlScM3378BovvP3GP4fDZB7SJguIkW4ZAFy0Uw5Oq1zLcuv+GoIXoCshKAw05zgwuVipws758+8XgkTKfZMtBGshyQGOuC4OzpTLcwo9ffjB4py0cxg5QlhNmUJETgvswyE2bQVtFHM7//uM3Q8+8wyghcP7aM4ZX774SDBWioiAp2IQhKdiYoGHICtLq1jNcu/OKoB6aOcAnYyHDh08/BsYBoDLBJXEuQcuJzgWkRgGoEoorX009B4AqG+QKpzTZlsHWWAFuwacvPxliylbB+X/+/GUAiREDiEoD6AaNvHJgNARGQ2A0BIZ5CERN+8rwn4mLmGITpsbRXIlBUQbRPvj56w/D0s0XSDECrBbcMbGKmLGZkZHBh2Td1NDwn2HjgHVO//1j+MDE+s+CEeQRUA+ZkYGxk4GBwYmJiYmbGp7DZQYo2JkYmfYwsPwrP7ok6yYA8Y0pwEbg9PYAAAAASUVORK5CYII=") no-repeat scroll 0px 0px;
      }
      .jras-pcVotePlus-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAD+klEQVQ4y32VTWwbRRTHfzO7Xu9ubCe2yUfrpFWaRC1CoajQD7USCKQGJBBRe+GABBVICKlSj6VUSMAFWgSXqkg5ABLiwoV+XEClqFBEoQ1wCFUbRL6aJlZpIOvEsb3eXe8OB7uWWgwzl9Gbef95b97//UfQYoxdG4j7YWlUqXBECm0niFx9Ry1EKhwXQjtvaImzrz4w493rK+41fHg194IfVo6krf77e5M7yLYNYcXSoKBSc3DK0yyujVNw5yYNzX734HD+s/8EPDHRdTymtx0e7nqOwcxe2mQXigiBrMfXWJejJaad81xd+pygVjl+aOvSkX8BnpjoOm4ZmcOPbnidPnsXHqsEVFokoYhhE6edhcpPfH/zGK7vNEFFI819Uhinnhh4m43mHtbIo4havUgTVCBJkmO++gMXZt4iUv7+g8P509rYtYGkFxRPbcsdSG9JPUOJW0TUiGFhkibEIyICQKJhk0UBIR4BJTr1LYRawMLK5e37DuU+kX5YejJj928aTO+lShFFhI5FMcgzuXIaL1pDI4ZEpxZVmVw5S8GfRcdEoahSZDA9Qtru3+SHpaekUuForn0HtuzEp4xAEifF4uoVvvzjDQruDQwSxLAp+bc5N3WUOecCBgkEEp8ybbKT3vbtKBWO6lLoD2WtoUYFBQqFxyp9Hbt5dsv7ZKx+fNZQQDLew9ObP6DD3NCw3fGJyFpDSKFv1YFeK5ZpUgOghkdC7yaTGqDKKiE1BKCJOIOpEQLKBLhNH4HEimUBevVW1ZPECPFxcRoOosnDuk2hYaCIUIR3IUhg0Q2cRvgagXKpKR+DBKBaUiZOiiAq40clBFr9omAZYFFGqjax7E4hGlNTBvMrl1j2pkiyHoMEOiY6FgYJkqxn2ZtirnARTRkIJALJsjtNpGoTuhDamfzqz89XOv/GkAl0aZI2N/JL/iPus4bozzyOpacBqNYKzDrfseReZ1vPi1haBxEhlegv8qvjCKGd1Q0tcc6pzMxNF873b8seYI0/6bEe5OF1L/HrrY+ZnfkWQ0sA4IclkvEeHln3Mt32MFWKJOnmeuE0TmVu1jIy5+603n4pjC/qrbebInniJAkJuF35jYJ7AyEk7fE+utuG0THxKJIix3z1Ry7MvNlsvXvEIXv4sQ1H6bV3UGWFiBAD+66SBFQQaJh0sFi5wsWb7+D6znuHti69BqDdOfjVWPmbva9I+2bx0p5IhHSYfVgi3aCN1uScjokXrXB9+RSX8yfxgmITrKXAnryaOxDUBXZzX2onWXsIM5YBFG7g4JSnWKgL7O+GZh87OJz/9H8VG2Ds2oDp10qjinBECn0XiPUNTuYjVbsihPa1oSXOtPoC/gE20blbeN5SvAAAAABJRU5ErkJggg==") no-repeat scroll 0px 0px;
      }
      .jras-pcVoteMinus-img {
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAD2klEQVQ4y32VS2hUZxiGn3OZxGacXCbeEiNpJJrEJFYtJelQqpZiC1kEJVIotHRjkS5LC3ZRuqzR7grGRRuwtmgVtFlqrBTTCnUhiEJUTGJ0wtiYmZPJxMzlXN4ujtZGox8c/sN3+J7/fJf//Q2WMCfRVK5crhff24Vld2EYawGQ7uN7V7DsYSMWG6q5PFF8NtZ41pHZVvex5ucO2M1tbZHEDuzWTswVq0AQzEzj3bqOe/kPvDujo8byym/jV1PHeZGlO+L9Tlej8kf6FUyOSYUFaWE+XP/3HkyOKX+kX05Xo9Id8YMvhu1olXvpvKRAmk1LybvS1OTiJ3k3/KZA7qVzcra3LIIaj9PcbZSVnYkd/gHrrXchlYTAB8NYOhUJLAvWNOCPDJP7ch9yS3viV1NnLSfRFNNs5kzF/i9qIns+ggdJ8FyoiEJ8JRQL4HshyLJhxWoQUMhDfh6zfQuG61K6NPzGVy1rB03Nz71nNbetL+/pg9kM+D68UkFwf4LSyUGUnYVIOdgRVFigdPoY/p3RcMMggFmH8p4+rOaW9Zqfe9/E83rLEjthVR0s5MA0oaoGd+R3svv244/fglglRKMEqSRzn31K6dwQLK8E0wpjVtdRlngHPK/Xxo5ssds6w7pghGvWIbJ9F9XH12I1t0EuCxJW/TqqBn/CatoQ+oLgvxi7tQPsyGs2htFg1q5a3IBCHrO+AbOlHZwMuG7oL19GpGcvPMrBwqMwGwDD4DGjwV6yi6YJxSIYOYjXhjVUEIKcmbDOT2DPmI2UDNLT1Zb0dCTsCNTE0fhtSmd/IZi6h1ERJbK1C6vr7XCk5rJPoRJBehqkpI3nXfNu3uiI9PSFsLIyWFZBcfB78scHwLQwTBMMg8KpY1ibNhP9+jvM1fWQdcJJNgy8WzfAc68Zmc21fea6ptNVA6egqhokiid+xB25QNnuD7E7X8esroFSCW9yjOLQCTSXpeLzbzBXrgn/Mpclu/8DguTEXpxEUyy9MTpeGDgkSfKvXVHx56PSgynJdyVnRppOSQ8fhGfZd1UaOqnSr4NS5qEkqTDQr/TG6JiTaIo9UZg9Tver8v68IHmeNPNPCFjqLKfuS86MgonbUuDL++uCnO5GZbbV7X5eHLa3yr18UZKkzMxLxCEjSXJHhp+IQ//SitMe73e6G5U/eljBvfEXyFdewb0x5QcOyeluVLp9Mex5gd265hM9yh2wN2xqiSR2Yrd1YtauDAU2/RDv5nXcvy7i3Rm9aSyvPBi/mjr2UiCA82bTMs3P9eL7u7DtbgyjHoBAU/je31jWeSNW+dtSV8C/Gxd0zlRsvhIAAAAASUVORK5CYII=") no-repeat scroll 0px 0px;
      }
      .jras-pcToTop{
        width: 24px;
        height: 18px;
        display: inline-block;
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAA+0lEQVRIS+3UrU5DMRjG8d/AgEIjuQYEhqBx8zOAGTdAguIbMbMrAAR3gCWgp9Ek3MDsPJAXzknIcnbaJkwsWZOmafL0+ff9aDvmPDpz9rcEJDPclqIdbCYdfgVjjJq0bYAndDMBz9gvBWxhIxMwwUcpoEl/iS9cZYKL2jTMLyrjWK9zILnvoDb/5OdSMc9xk4LkAGrzB0Rd1vGOgxxIClCb36OPF6xhDwE8xBluZ0XSBjjFAHc4ror7WgF2sYIAH+EEw9Iu2kavOhydE+MvIPYBCeNHvJUCmvTTgFSNi9q0KYLFA8QHuDrrY/uPGiRTMi1IvYNiwyWgOGXf4uYlGUp2/rYAAAAASUVORK5CYII=") no-repeat scroll 3px -3px;
      }
      .jras-pcToDown{
        width: 33px;
        height: 18px;
        display: inline-block;
        background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAA6ElEQVRIS+3TIU4EQRBG4W8xSBwOuRdAoBAEi+ECbELwBAkOFDgugAa9CZYEgSFcgQvguACBdFIknQV6qknWTasRVe/1/FU9seQzWTLfKBhMuDei7SA+DZKjoFfwGH07o6AksIkjHOMjIlmMaAXXuMXzb7G1ZnBSNc9CUgsK/AaHOMNVr6DUn+ISdzjAQ0B2K/gFzv8aemaLaskGPvEaN2/CizQjqP+kfBdB6RuE9wgWJSl4r+Bbshq3T721VkRTrKUovMdcfpS3BPfYSwrm2O9d0y2sJwVveOkVJNntsuya/ls2Cgaj+wJTFiUZUSeJ8gAAAABJRU5ErkJggg==") no-repeat scroll 3px -3px;
      }
      .jras-pcLinksSepAfter:after{
        color: #535353;
        content: " | ";
      }
      .jras-pcLinksSepBefore:before{
        color: #535353;
        content: " | ";
      }
      .jras-PostControlRatingVote {
        width: 20px;
        height: 21px;
        cursor: pointer;
        display: inline-block;
      }
      .jras-PostControlRatingVote-new {
        line-height: 33px;
        margin: 7px 0 0 14px;
        background-image: url(../images/icon_smiles.png);
        width: 22px;
        height: 22px;
        background-size: 42px;
        vertical-align: top;
      }
      #jras-PostControlShare a{
        height: 16px;
        width: 16px;
        display: inline-block;
      }
      #jras-PostControlShare a{
        display: inline-block;
        background-size: 16px 16px;
        -o-transition: all 0.5s ease-in-out;
        -moz-transition: all 0.5s ease-in-out;
        -webkit-transition: all 0.5s ease-in-out;
        transition: all 0.2s ease-in-out;
      }
      #jras-PostControlShare a:hover{
        -o-transform: scale(2, 2);
        -ms-transform: scale(2, 2);
        -moz-transform: scale(2, 2);
        -webkit-transform: scale(2, 2);
        transform: scale(2, 2);
        box-shadow: 0 0 4px 1px rgba(128, 128, 128, 0.53);
      }
      #jras-PostControlBlock{
        position: absolute;
        right: 0;
        z-index: 1;
        border-left: 1px solid rgba(0, 0, 0, 0.3);
      }
      #jras-PostControlBlock sitm {
        position: absolute;
        transition: 0.5s cubic-bezier(0.56, 1.35, 0.37, 0.97);
        padding: 4px;
        width: 100px;
        border-radius: 4px 0px 0px 4px;
        box-shadow: 1px 1px 4px 0px rgba(0,0,0, .5);
        opacity: 0.6;
        font-size: 12px;
        display: inline-flex;
      }
      #jras-PostControlBlock sitm:hover {
        opacity: 1;
      }
      .jras-gui-btn-newdesign {
        border-radius: 3px;
        padding-left: 3px;
        padding-right: 3px;
        width: 24px;
        height: 22px;
      }
      .jras-gui-btn-pmme {
        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA/ElEQVQ4T63TTyvEQRwH4GddnLko+XNycZe2nJRyc5OUHPw5yMlhSzns5qo4uEi5Skk5SznsRl6BG0ki70CbNJnR9sPP2jXHaT7Pd+Y7MwVtjkKbeQEYRLFFqBaAGYzg8o/IGKoJqGAKN00iwzjFegK6MI9tHP2CzGIFh3hOQB0nKKMba3jNQJ3YwRM2MY16I3AcA5PYxTju41xo9AWWcRbnQu++BQawhyGsoiMe7RaLeMgDUngBL9jCG0rowT6WIvJlB9excgg//tDIvgYkXOPnEXoxgbxwMhNyjrvUxANs5FTObigg4SbmAtCP0SYfUHbZ1b98phaLf8TeAXUaOZJ+0HVlAAAAAElFTkSuQmCC");
        background-repeat: no-repeat;
        background-position: center center;
        border: medium none;
      }
      .jras-gui-btn-deleteall {
        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABV0lEQVQ4T4XTPUiXURTH8Y9D0NDkGCqNDb0NkRLS1GYQBL04+DJpQ1BQuJQiqIsGtQQlFASJgbS6pNAiKNJUBCJCQU0NbkHgG0fOH54uPv3v8jz3nN/93nPPS4v6dRoX0r2OraOkLWk8j9FC0Im2tH3H58I/jq8NwFk8/k80pWsfE/jWAITgAbqxh6cYwSccRxem0xbaJbyMnyrgWULCfhMLmMMJXEcv5jOUuH2sBDzMm+sAd/A+AcOYLQG3K4KjIqgCerBYAi5jJW9oBjiHLyWgAz9qANcwgHfpb8V2CTiGv5nYPrzOREYSozqRtBf4k4mNUv5Thdj/wkncywMfU3wGbzCFDUSXHq5qGWO/hkt4gn5EC0cE0ZHL2QfxvVoH+IAbWc4r2ExAQGIWhvAWg3WA57if72/H7wTsYBe3MFmdm/IJjzDTZCbu4lVdBKdwsQlgFT8bmgPWFkcRlMznyAAAAABJRU5ErkJggg==");
        background-repeat: no-repeat;
        background-position: center center;
        border: medium none;
      }
      .jras-gui-btn-resetdef {
        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABF0lEQVQ4T6XTyypGURjG8d93A8pp4gIkp5AUIxegGMlhggsQkhswUJQBZaakMHO4DFPikwswxNRA9Grt7HZ2e5c12+t93/9+1rOe1fDP1SiZH8IMulP9GZe4K/YXAR04wAvO8ZgG+rCIqK/hNQPlAZ04wzoeSpQNYBcLeIuePOAC27m/lrkziA0s5QEjmMNWTU8ncIvPUDCVzveUzv8jrcbqCq8CEG5f4QQr+KoxHH07GMs8mMUNPmoMt+MIozguy0EVZxyToSID9CdXN6smU/0wqWjmFZxiD/cVkGGsYrmYg7YUpLjKMkhEPMybx3sREN+t2E/FSGUkMlRmUW5JIfoZ/guQ7fdiGj1pIzJyjWbVY6rp4W/bN3aAMKpdgLqNAAAAAElFTkSuQmCC");
        background-repeat: no-repeat;
        background-position: center center;
        border: medium none;
      }
      .jras-tooltip-user-awards-hide-btn-close{
        position: relative;
        box-shadow: 0 -4px 8px 0 rgb(0, 0, 0);
        margin-bottom: -6px;
      }
      .jras-tooltip-user-awards-hide-btn{
        background-color: rgb(80, 80, 80);
        height: 5px;
        width: 105%;
        margin-left: -5px;
        top: -4px;
        border-radius: 0 0 10px 10px;
      }
      .jras-tooltip-user-awards-hide-btn:hover{
        background-color: rgb(0, 135, 21);
      }
      .jras-prop-gui-content, .jras-prop-gui-contentTop, .jras-prop-gui-contentBottom{
        background-color: #2F2E2E;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 30px;
        overflow: hidden;
      }
      .jras-prop-gui-contentTop{
        margin-bottom: 5px;
      }
      .jras-prop-gui-contentBottom{
        top: auto;
        bottom: 0;
        height: 30px;
        overflow: hidden;
        margin-top: 5px;
      }
      .jras-prop-gui-contentMain{
        position: absolute;
        top: 30px;
        left: 0;
        right: 0;
        bottom: 30px;
        overflow: auto;
        background-color: #262626;
      }
      .jras-prop-gui-section{
        margin-top: 5px;
        margin-bottom: 14px;
      }
      .jras-prop-gui-subsection{
        margin-left: 20px;
        margin-top: -10px;
      }
      .jras-prop-gui-small-section{
        margin-top: -10px;
      }
      .jras-prop-gui-radio-group{
        margin: 5px 0;
        border-left: 1px solid #515151;
        padding: 2px 3px;
        display: block;
        background-image: linear-gradient(to top, #515151 1px, rgba(255,255,255,0) 1px), linear-gradient(to bottom, #515151 0.1rem, rgba(255,255,255,0) 1px);
        background-size: 13px 100%;
        background-repeat: no-repeat;
      }
      .jras-prop-gui-button-right{
        padding-left: 20px;
        right: 0px;
        padding-right: 20px;
        margin-right: 5px;
        position: absolute;
        margin-top: 4px;
        height: 22px;
      }
      .jras-prop-gui-button-left{
        left: 0px;
        margin-left: 5px;
        margin-top: 4px;
        cursor: pointer;
      }

     .jras-tabs-panel-content {padding: 6px 10px;}

     #jras-prop-gui-dialog{
       border: 0;
       width: 100%;
     }
     #jras-prop-gui-dialog .jras-tabs-nav{
       margin-left: 6px;
       margin-top: 6px;
       float: left;
       width: 25%;
       border: 0;
       background: none;
     }
     #jras-prop-gui-dialog .jras-tabs-nav li{
       height: 30px;
       clear: left;
       width: 100%;
       margin: 0 0 5px 0;
       background: #2d2d2d none repeat scroll 0 0;
       border: 0 none;
       padding: 0 0 3px 5px;
       font-weight: normal;
       border-radius: 3px;
     }
     #jras-prop-gui-dialog .jras-tabs-nav li.ui-tabs-active{
       background-color: #3e7a35;
     }
     #jras-prop-gui-dialog .jras-tabs-nav li.ui-state-focus{
       background-color: #2b5326;
     }
     #jras-prop-gui-dialog .ui-state-default a, .ui-state-default a:link, .ui-state-default a:visited{
       line-height: 30px;
       color: #818181;
       text-decoration: none;
     }
     #jras-prop-gui-dialog .ui-state-active a, .ui-state-active a:link, .ui-state-active a:visited{
       color: #d4d4d4;
       font-weight: bold;
       text-decoration: none;
       line-height: 30px;
     }
     #jras-prop-gui-dialog .jras-tabs-panel{
       box-shadow: -1px 0 20px 0 #000000;
       border: 0;
       left: 25%;
       height: 100%;
       overflow: auto;
       position: absolute;
       float: right;
       right: 0;
       width: 75%;
     }
     .jras-qt {
        opacity: 0.6;
        font-style: italic;
        font-size: 105%;
     /*    display: inline-block; */
        margin-bottom: 0.5em;
        padding-left: 0.8em;
      }
      .jras-qt:last-of-type{
        margin-bottom: -1em;
      }
      .jras-qt>div{
        margin-top: -0.8em;
        margin-left: 1.8em;
      }
      .jras-qt div.base-qt{
        margin-left: 1.2em;
        margin-top: -1.2em;
        padding-bottom: 0.4em;
      }
      .jras-qt div.qt-header{
       /* font-weight: 600; */
        font-style: normal;
        padding-left: 0.7em;
        font-size: 90%;
      }
      .jras-qt div.qt-header-old{
        padding-bottom: 0.2em;
      }
      .jras-qt div.qt-header-l{
        background: linear-gradient(90deg, lightgray 0%, rgba(255, 254, 254, 0) 100%);
      }
      .jras-qt div.qt-header-d{
        background: linear-gradient(90deg, rgb(80, 80, 80) 0%, rgba(255, 254, 254, 0) 100%);
      }
      .jras-qt div.qt-body{
        padding-left: 0.4em;
      }
      .jras-qt div.qt-body-l{
        border-left: solid 1px lightgray;
      }
      .jras-qt div.qt-body-d{
        border-left: solid 1px rgb(80, 80, 80);
      }
      .jras-qt>div::before {
        content: ',,';
        font-size: 4.3em;
        margin-left: -0.2em;
        margin-right: 0.2em;
        position: relative;
        color: #9f9f9f;
        font-family: times-new-roman;
        letter-spacing: -0.07em;
        font-style: normal;
        top: -0.13em;
      }
      #jras-qt-popup {
        position: absolute;
        top: -1000px;
        left: -1000px;
        height: 24px;
        width: 28px;
        z-index: 1;
        -webkit-box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.2);
        -moz-box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.2);
        box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.2);
        border: 1px solid lightgray;
        border-radius: 4px;
        background: #3cff00 url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACISURBVEhL7ZVLDoAgDES5ndH7b/ydRdvEMaQFBUpgw0veYgp2dugGqSzkQV6PpeB73sU7X04ShzUK2J0HwLpYovY1L0DOFcgcvZArkFkPjPQvQE4xhDqTA+QUQ6izr8sl9C9AzhXIHL2QK5BZD4y0L/D/BZYif8fKAzCT/H7XKtjIiQeDH5y7Abh/oWWhH+N/AAAAAElFTkSuQmCC") no-repeat scroll 2px 0px;
        animation: simple-translate-showButton 200ms;
        opacity: 0.3;
      }
      #jras-qt-popup:hover {
        opacity: 1;
        background-color: yellow;
        transition: .2s;
      }
      #jras-qt-popup.show {
        display: block;
      }
      #jras-qt-popup.hide {
        display: none;
      }
      .jras-loader-normal{
        width: 1em;
        height: 1em;
      }
      .jras-nick-loader{
        vertical-align: top;
        margin-top: 11px;
        margin-left: 5px;
      }
      .jras-nick-comment-loader{
        margin-left: 5px;
        height: 1em !important;
      }
      .jras-nick-link{
        margin-top: 9px !important;
      }
      .jras-tooltip-nick-link{
        padding-right: 2px;
      }
      .jras-nick-comment-link{
        /*font-size: 75%;*/
      }
      .jras-nick-comment-link-cntnr{
        position: relative;
        top: 2px;
      }
      .jras-hidden-comm-color{
        color: rgb(255, 57, 57);
      }
      .jras-hidden-comm-bg{
        position: relative;
        background: transparent !important;
      }
      .jras-hidden-comm-bg::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        background: repeating-linear-gradient(-55deg, #ff000010, #ff000010 10px, #ff000025 10px, #ff000025 20px) !important;
        mask-image: linear-gradient(90deg, transparent 0%, white 100%) !important;
        -webkit-mask-image: linear-gradient(90deg, #00000050 0%, white 100%) !important;
      }

      .jras-loader {
        border: 0.2em dotted;
        border-radius: 50%;
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        animation: rotation 2s linear infinite; 
      }
      @keyframes rotation {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Окно настроек  */
      .modal {
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        text-align: left;
        background: rgba(0,0,0, .9);
        transition: opacity .25s ease;
      }
      .modal__bg {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        cursor: pointer;
      }
      .modal-state {
        display: none;
      }
      .modal-state:checked + .modal {
        opacity: 1;
        visibility: visible;
      }
      .modal-state:checked + .modal .modal__inner {
        top: 0;
      }
      .modal__inner {
        transition: top .25s ease;
        position: absolute;
        top: -20%;
        width: 55%;
        margin-left: 42%;
        margin-top: 20px;
        overflow: auto;
        background: #fff;
        border-radius: 5px;
        height: 55%;
      }
      .modal__close {
        position: absolute;
        right: 8px;
        top: 8px;
        width: 1.1em;
        height: 1.1em;
        cursor: pointer;
      }
      .modal__close:after,
      .modal__close:before {
        content: "";
        position: absolute;
        width: 2px;
        height: 1.5em;
        background: #ccc;
        display: block;
        transform: rotate(45deg);
        left: 50%;
        margin: -3px 0 0 -1px;
        top: 0;
      }
      .modal__close:hover:after,
      .modal__close:hover:before {
        background: #aaa;
      }
      .modal__close:before {
        transform: rotate(-45deg);
        }
      @media screen and (max-width: 768px) {
        .modal__inner {
          width: 93%;
          height: 93%;
          margin-left: 3%;
          box-sizing: border-box;
        }
      }
      @media screen and (max-height: 600px) {
        .modal__inner {
          height: 75%;
          box-sizing: border-box;
        }
      }
      @media screen and (max-height: 400px) {
        .modal__inner {
          height: 91%;
          box-sizing: border-box;
        }
      }
    `);
  }

  function correctStyle(){
    if (!userOptions.val('stCorrectStyle')){
      return;
    }
    const stretchContent = (userOptions.val('stStretchContent'))
      ? `div#header{width: ${userOptions.val('stStretchSize')}%;} div#page{width: ${userOptions.val('stStretchSize')}%;}`
      : '';
    let sideBarHover = '';
    let divContainer = '';
    let sideBar = '';
    let divContent = '';
    let commentListLine = '';
    if (userOptions.val('stHideSideBar')){
      divContent = 'div#content{width: 100%;}';
      if (page.isNewDesign){
        sideBar = 'right: -310px; width: 320px; border-left: 2px solid lightgray; border-bottom: 2px solid lightgray; background-color: white;';
        sideBarHover = 'right: 0;';
        divContainer = 'width: 100%;';
      }else{
        sideBar = 'right: -285px; width: 259px; padding-right: 26px; margin-top: 1px; padding-top: 10px; background-color: ';
        sideBar += (page.isSchemeLight()) ? 'white;' : '#3B3B3B;';
        sideBarHover = 'right: -15px;';
        divContainer = 'width: 98%;';
        commentListLine = `.comment_list { border-left: 1px solid ${(page.isSchemeLight())?'#f4f4f4':'#2b2b2c'} ; }
                           .comment_list:hover { border-left: 1px dashed ${(page.isSchemeLight())?'#d5d5d5':'#3F6B36'}; }`;
      }
      sideBar = `div#sidebar{${sideBar} transition: 0.2s; position: absolute;padding-left: 10px; z-index: 10;}`;
    }
    const form_addPost = (!page.isNewDesign && !page.isSchemeLight())
      ? 'form#add_post{ background-size: 100% !important;}'
      : '';
    const centerContent = (userOptions.val('stCenterContent'))
      ? '.image { text-align: center !important; }'
      : '';

    const style = `
      ${stretchContent}
      ${divContent}
      div#tagArticle{width: 100%;}
      ${sideBar}
      div#sidebar:hover, div#sidebar.hovered { ${sideBarHover} box-shadow: -6px 0px 20px -5px rgba(0, 0, 0, 0.47);}
      div#contentinner { ${divContainer} }
      div#showCreatePost { width: 100%; }
      div#add_post_holder { width: 100%; }
      div[id^=postContainer]{ box-shadow: 10px 0px 20px -10px rgba(0, 0, 0, 0.4); }
      div#navcontainer { background-size: 100%; }
      div#searchBar { background-size: 100%; }
      div.blogs a img { width: 100%; }
      div#searchBar{ display: flex; }
      form#searchform{ float: right; }
      div#submenu{ width: 75%; }
      div#blogName{ max-width: 85%; }
      div.tagname{ max-width: 60%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
      div#searchmenu{ width: 25%; }
      textarea#add_post_text { width: 99%; border: 1px ${(page.isSchemeLight()) ? 'solid #bbbbbb; background: none;' : 'border-color: #444 !important;'} }
      input[name="tag"], input[name="header"] { width: 99% !important; margin-top: -6px !important; }
      .article .ufoot { width: 100% !important; }
      ${centerContent}
      ${form_addPost}
      .post_content table { margin: 0 auto; }
      .post_content_expand{ width: 100% !important; }
      ${commentListLine}
    `;
    newCssClass(style);
    if (!userOptions.val('stHideSideBar')){
      newCssClass(`div#content{width: ${$('div#page').width() - $('div#sidebar').width()}px;}`);
    }
  }

  function dynamicStyle(){
    if (!(userOptions.val('stCorrectStyle') || (!userOptions.val('stCorrectStyle') && userOptions.val('stUseDynStyleChanges')))){
      return;
    }
    if (userOptions.val('stSideBarSizeToPage')){
      if (!userOptions.val('stCorrectStyle')){
        newCssClass(`div#sidebar.hovered { ${(page.isNewDesign)?'right: 0;':'right: -15px;'} box-shadow: -6px 0px 20px -5px rgba(0, 0, 0, 0.47);}`);
      }
      correctPageHeight();
      $('div.post_content_expand').each(function(){
        new MutationObserver(function(){ correctPageHeight() }).observe(this, {attributes: true});
      });
    }
  }

  function correctPageHeight(){
    if (!(userOptions.val('stCorrectStyle') || (!userOptions.val('stCorrectStyle') && userOptions.val('stUseDynStyleChanges')))){
      return;
    }
    if (userOptions.val('stSideBarSizeToPage')){
      const $divSideBar = $('div#sidebar');
      const sbh = $divSideBar.height();
      const $divPageInner = $('div#pageinner');
      $divPageInner.css('height', 'auto');
      if ($divPageInner.height() < sbh){
        $divPageInner.height(sbh);
        const $contentBlock = $('div#content');
        if (userOptions.val('stShowSideBarOnHideContent')){
          $(window).on('scroll', function(){
            if ($contentBlock.offset().top + $contentBlock.height() < win.pageYOffset){
              $divSideBar.addClass('hovered');
            }else{
              $divSideBar.removeClass('hovered');
            }
          })
        }
      }
    }
  }

  function makeBlockPostElements(forElm, parentID, blockMess, blockMessBold, blockMessDesc, fromTag){
    // буээээ
    if($('#togglebutton' + parentID)[0]){
      return
    }
    let newElement;
    if (!userOptions.val('delUserPost') || fromTag){
      newElement = document.createElement("input");
      newElement.style.marginRight = '30px';
      newElement.style.paddingLeft = '20px';
      newElement.style.paddingRight = '20px';
      newElement.id = 'togglebutton' + parentID;
      newElement.type = 'button';
      newElement.value = lng.getVal('JRAS_TOGGLEBUTTONCAPTIONSHOW');
      newElement.onclick = function(){
        const toggleContainer = $('#' + parentID + ' > div');
        const buttonCaption = toggleContainer.css('display') != 'none'
          ? lng.getVal('JRAS_TOGGLEBUTTONCAPTIONHIDE')
          : lng.getVal('JRAS_TOGGLEBUTTONCAPTIONSHOW');
        toggleContainer.slideToggle('display', function(){
          correctPageHeight();
        });
        $('#togglebutton' + parentID).attr("value", buttonCaption);
      };
      forElm.parentElement.insertBefore(newElement, forElm);
    }
    const newDIV = document.createElement("div");
    newDIV.style.display = 'inline';
    forElm.parentElement.insertBefore(newDIV, forElm);
    newElement = document.createElement("span");
    newElement.textContent = blockMess;
    newDIV.appendChild(newElement);
    newElement = document.createElement("span");
    newElement.style.fontWeight = 'bold';
    if (userOptions.val('showUserNameDelPost') || fromTag){
      newElement.textContent = blockMessBold;
    }else{
      newElement.textContent = '---';
    }
    newDIV.appendChild(newElement);
    newElement = document.createElement("span");
    newElement.textContent = blockMessDesc;
    newDIV.appendChild(newElement);
  }

  function makeBlockCommElements(forElm, parentID, blockMess, blockMessBold, blockMessDesc){
    // древние копролиты
    if($('#newToggle_' + parentID)[0]){
      return
    }
    const newDIV = document.createElement("div");
    newDIV.id = 'newToggle_' + parentID;
    newDIV.style.display = 'inline';
    forElm.parentElement.insertBefore(newDIV, forElm);
    let newElement = document.createElement("span");
    newElement.textContent = blockMess;
    newElement.style.color = 'rgb(242, 119, 119)';
    //     newElement.className = 'comment_show';
    if(page.isNewDesign){
      newElement.style.paddingLeft = '20px';
    }
    if (!userOptions.val('delUserComment')){
      newElement.style.cursor = 'pointer';
      newElement.onclick = function(){
        $('#' + parentID + ' > div.txt').slideToggle('display', function(){
          correctPageHeight();
        });
      };
    }
    newDIV.appendChild(newElement);
    newElement = document.createElement("span");
    newElement.style.fontWeight = 'bold';
    if (userOptions.val('showUserNameDelComment')){
      newElement.textContent = blockMessBold;
    }else{
      newElement.textContent = '---';
      if (userOptions.val('makeAvatarOnOldDesign') && !page.isNewDesign){
        $(forElm).parent().find('>img.avatarForOldDesign').css('display', 'none');
      }
    }
    newDIV.appendChild(newElement);
    newElement = document.createElement("span");
    newElement.textContent = blockMessDesc;
    newDIV.appendChild(newElement);
  }


  function getPropID(prop){
    return 'jras-gui-' + prop;
  }

  function makePropElements(){
    const getHTMLProp = function(prop, styleFor, style){
      let retVal = '';
      if (prop === undefined){return}
      const propObj = userOptions.data[prop];
      if (propObj === undefined){return}
      const propID = getPropID(prop);
      const propData = propObj.propData();
      switch(propData.type) {
        case 'checkbox':
          retVal = `<input id="${propID}Val" type="${propData.type}" style="vertical-align: middle;"/>
                    <label id="${propID}Caption" for="${prop}" style="cursor: pointer;vertical-align: middle;"/>`;
          break;
        case 'radio':
          retVal = `<input id="${propID}Val" type="${propData.type}" name="${propData.group || prop}" value="${propData.value || prop}" style="vertical-align: middle;"/>
                    <label id="${propID}Caption" for="${propID}Val" style="cursor: pointer;vertical-align: middle;"/>`;
          break;
        case 'combobox':
          retVal = `<span id="${propID}Caption" style="vertical-align: middle;"/>
                    <select id="${propID}Val" name="jras-${prop}" style="vertical-align: middle;">`;
          const values = propObj.values();
          for (let a in values){ retVal += '<option value="' + a + '">' + values[a] + '</option>'}
          retVal += '</select>';
          break;
        case 'number':
          retVal = `<span id="${propID}Caption" style="vertical-align: middle;margin-left: 3px;line-height: 28px;"/>
                    <input id="${propID}Val" type="${propData.type}" min="${propData.min}" max="${propData.max}" style="width: 50px; vertical-align: middle;"/>`;
          break;
      }
      if (styleFor !== undefined){ $(retVal).find('#' + propID + styleFor).css(style) }
      return retVal;
    };
    if(page.isNewDesign){
      $('div.topbar_right:first div.lang_select').after(
        '<label id="jras_prop-button" style="cursor: pointer;" class="lang_select" for="modal-1">JRAS</label>'
      );
      $('label#jras_prop-button').click(openProp);
    }else{
      $('div#header:first div.lang_select').after(`
        <label id="navcontainer" class="lang_select" for="modal-1"
          style="cursor: pointer; right: 39px; padding: 1px 2px 2px;
          font-size: 9px; border-radius: 0 0 5px 5px; height: 17px;
          ${ (!page.isSchemeLight()) ? "background: transparent url('../images/mainmenu_active_bg1.png') repeat-x scroll 0 0;" : 'background-position-x: -4px; background-position-y: -2px;'}">
          JRAS
        </label>
      `);
      $('div#header:first div.lang_select + label').click(openProp);
    }
    $('body').append(`
      <div id="jras-prop-gui-dialog">
        <input class="modal-state" id="modal-1" type="checkbox" />
        <div class="modal">
          <label class="modal__bg" for="modal-1"></label>
          <div class="modal__inner">
            <div class="jras-prop-gui-contentTop">
              <span style="color: #8B857B;font-weight: bold; line-height: 27px; padding-left: 8px;">
                JRAS - JoyReactor Advanced Script v.${JRAS_CurrVersion}
              </span>
              <label class="modal__close" for="modal-1"></label>
            </div>
            <div class="jras-prop-gui-contentMain">
              <div id="jras-prop-gui-tabs" style="border: 0 none;">
                <ul class="jras-tabs-nav">
                  <li id="jras-tabs-nav-0"><a href="#jras-prop-gui-tab-1"></a></li>
                  <li id="jras-tabs-nav-1"><a href="#jras-prop-gui-tab-2"></a></li>
                  <li id="jras-tabs-nav-2"><a href="#jras-prop-gui-tab-3"></a></li>
                  <li id="jras-tabs-nav-3"><a href="#jras-prop-gui-tab-4"></a></li>
                  <li id="jras-tabs-nav-4"><a href="#jras-prop-gui-tab-5"></a></li>
                  <li id="jras-tabs-nav-5"><a href="#jras-prop-gui-tab-6"></a></li>
                </ul>
                <div id="jras-prop-gui-tab-1" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section"> ${getHTMLProp('language', 'Val', {'width': '30%'})} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('removeShareButtons')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('fixedTopbar')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection"> ${getHTMLProp('hideFixedTopbar')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('correctRedirectLink')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('correctOldReactorLink')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('showHiddenComments')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection"> ${getHTMLProp('showHiddenCommentsMark')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('extendedGifLinks')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('videoSoundOptions')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('restartVideoOnUnmute')} <br>
                      <div class="jras-prop-gui-radio-group">
                        ${getHTMLProp('videoSoundMuteOnPostScroll')} <br>
                        ${getHTMLProp('videoSoundMuteOnVideoScroll')}
                      </div>
                      <div class="jras-prop-gui-radio-group">
                        ${getHTMLProp('autoUnmuteVideoNone')} <br>
                        ${getHTMLProp('autoUnmuteVideoOnHalfScreen')} <br>
                        ${getHTMLProp('autoUnmuteVideoOnScreenMiddle')}
                      </div>
                    </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('showUserLinks')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('showUserLinksOnPost')} <br>
                      ${getHTMLProp('showUserLinksOnComment')} <br>
                      ${getHTMLProp('showUserLinksProgressbar')} <br>
                      ${getHTMLProp('loadFavoriteIcoForUserLinks')} <br>
                      ${getHTMLProp('showUserLinksCount')}
                    </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('pcbShowPostControl')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('pcbShowInFullPost')} <br>
                      ${getHTMLProp('pcbHideShareButoons')} <br>
                      ${getHTMLProp('pcbHideJRShareBlock')} <br>
                      ${getHTMLProp('pcbHideJRRatingBlock')}<br>
                      ${getHTMLProp('pcbAnimateMove')} <br>
                      ${getHTMLProp('pcbAnimateMoveSpeed')}<br>
                      ${getHTMLProp('pcbTopScreenPos')} <br>
                      ${getHTMLProp('pcbTopBorder')} <br>
                      ${getHTMLProp('pcbBottomBorder')}
                    </section>
                  </div>
                </div>
                <div id="jras-prop-gui-tab-2" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section"> ${getHTMLProp('delUserComment')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-small-section"> ${getHTMLProp('showUserNameDelComment')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-small-section"> ${getHTMLProp('fullDelUserPost')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-small-section"> ${getHTMLProp('delUserPost')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-small-section"> ${getHTMLProp('showUserNameDelPost')} </section>
                    <span id="jras-guiBlockUserListCaption"></span>
                    <textarea id="jras-guiBlockUserList" style="width: 98%; border: 1px solid rgb(216, 216, 216); height: 139px;">
                    </textarea>
                    <span id="jras-guiBlockTagListCaption"></span>
                    <textarea id="jras-guiBlockTagList" style="width: 98%; border: 1px solid rgb(216, 216, 216); height: 139px;">
                    </textarea>
                  </div>
                </div>
                <div id="jras-prop-gui-tab-3" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section"> ${getHTMLProp('isToBeLoadingUserData')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('showUTOnLine')} <br>
                      ${getHTMLProp('showUTOnComment')}<br>
                      ${getHTMLProp('showUTOnPrivateMess')} <br>
                      ${getHTMLProp('showUTOnPeople')} <br>
                      ${getHTMLProp('showUTOnSidebarTopUsers')} <br>
                      ${getHTMLProp('showUTOnSidebarOnline')} <br>
                      ${getHTMLProp('showUTOnPostControl')} <br>
                      ${getHTMLProp('hideUserAwardsWhen', 'Val', {'width': '60px'})}
                      ${getHTMLProp('minShowUserAwards', 'Val', {'width': '60px'})} <br>
                      ${getHTMLProp('chatlaneToPacaki')} <br>
                      ${getHTMLProp('showUTOnTopComments')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-small-section"> ${getHTMLProp('isToBeLoadingTagData')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('showTTOnLine')} <br>
                      ${getHTMLProp('showTTFullPost')} <br>
                      ${getHTMLProp('showTTOnTrends')} <br>
                      ${getHTMLProp('showTTOnLikeTags')} <br>
                      ${getHTMLProp('showTTOnInteresting')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-small-section"> ${getHTMLProp('previewReactorLink')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('previewSizeX')} <br>
                      ${getHTMLProp('previewSizeY')} </section>
                  </div>
                </div>
                <div id="jras-prop-gui-tab-4" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section"> ${getHTMLProp('makeTreeComments')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('treeCommentsOnlyFullPost')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('makeAvatarOnOldDesign')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('makeAvatarOnlyFullPost')} <br>
                      ${getHTMLProp('showCommentDate')} <br>
                      ${getHTMLProp('avatarHeight')}</section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('whenCollapseMakeRead')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('collapseComments')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('collapseCommentsOnlyFullPost')} <br>
                      ${getHTMLProp('collapseCommentWhenSize')} <br>
                      ${getHTMLProp('collapseCommentToSize')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('makeQuotesOnComments')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('makeExtQuotes')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('makeQuoteTool')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('qTAddUserInfo')} <br>
                      ${getHTMLProp('qTInsertIntoShowingInput')} </section>
                  </div>
                </div>
                <div id="jras-prop-gui-tab-5" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section"> ${getHTMLProp('stCorrectStyle')} </section>
                    <section class="jras-prop-gui-section jras-prop-gui-subsection">
                      ${getHTMLProp('stHideSideBar')} <br>
                      ${getHTMLProp('stStretchContent')} <br>
                      ${getHTMLProp('stCenterContent')} <br>
                      ${getHTMLProp('stStretchSize')}
                    </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('stUseDynStyleChanges')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('stSideBarSizeToPage')}
                    <section class="jras-prop-gui-section" style="margin-left: 20px;">${getHTMLProp('stShowSideBarOnHideContent')} </section>
                    </section>
                    <div style="opacity: .7; line-height: 12px; font-size: 80%; padding: 15px; border-top: 1px dashed; width: 90%;">
                      * JRAS style так же можно найти в виде стилей для Stylish и подобных. Мне кажется что использовать их отдельно от скрипта удобнее, хотя и настроить сложно.<br>
                      Они доступны по ссылкам<br>
                        - Для нового дизайна - <a href="https://userstyles.org/styles/148705/jras-style-for-new-reactor-cc" target="_blank" rel="nofollow">ссылка</a><br>
                        - Для старого дизайна - <a href="https://userstyles.org/styles/148704/jras-style-for-old-reactor-cc" target="_blank" rel="nofollow">ссылка</a><br>
                        - Для старого со стилем Steam - <a href="https://userstyles.org/styles/148702/jras-style-for-old-black-reactor-cc-steam" target="_blank" rel="nofollow">ссылка</a> (Сам стиль Steam доступен <a href="https://userstyles.org/styles/102457/joyreactor-old-steam" target="_blank" rel="nofollow">здесь</a>)
                    </div>
                  </div>
                </div>
                <div id="jras-prop-gui-tab-6" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <span id="jras-gui-ExpImpCaption"></span>
                    <textarea id="jras-gui-ExpImpData" needClick="true" style="width: 98%; border: 1px solid rgb(216, 216, 216); height: 30vh; margin-top: 5px;"></textarea>
                    <input id="jras-gui-Import" needClick="true" style="padding-left: 20px;padding-right: 20px;height: 22px;right: 0px;padding-right: 20px;margin-right: 5px;" value="Импорт" type="button">
                  </div>
                </div>
              </div>
            </div>
            <div  id="jras-prop-gui-bottomCcontent" class="jras-prop-gui-contentBottom">
              <input id="jras-gui-SaveSettings" needClick="true" style="padding-left: 20px; padding-right: 20px; height: 22px;" class="jras-prop-gui-button-right" value="" type="button">
            </div>
          </div>
        </div>
      </div>
   `);

    $(`body label[id*=${getPropID('')}]`).click(function(){
      $(this).parent().find('input#' + getPropID($(this).attr('for')) + 'Val').get(0).click();
    });

    const $propDialog = $('#jras-prop-gui-dialog');

    if(page.isSchemeLight()){$propDialog.find('[id*=jras-prop-gui-tab]').css('color', '#686868');
    }else{$propDialog.find('[id*=jras-prop-gui-tab]').css('color', '#BBBBBB');}
    if(!page.isNewDesign){$propDialog.find('ul.jras-tabs-nav li a').css('padding-top', '11px');}

    makeServiceGUIButton();
    updateGuiLocalize();

    propDlgTabsClick($propDialog);
    propDlgItemsNeedClick($propDialog);
  }

  function propDlgTabsClick($propDialog){
    $propDialog.find('[id*=jras-tabs-nav-]').click(function () {
      const currTabNum = $(this).attr('id').replace('jras-tabs-nav-', '');
      switch (currTabNum) {
        case '5':
          updateUserOptions();
          $propDialog.find('#jras-gui-ExpImpData').val(userOptions.exportUserData(page.currentUser));
          break;
      }
      $propDialog.find('#jras-prop-gui-tabs').tabs({ active: currTabNum });
    });
  }

  function propDlgItemsNeedClick($propDialog) {
    $propDialog.find('[needClick="true"]').click(function () {
      switch ($(this).attr('id')) {
        case 'jras-gui-ExpImpData':
          $(this).focus();
          $(this).select();
          break;
        case 'jras-gui-Import':
          userOptions.importUserData(page.currentUser, $propDialog.find('textarea#jras-gui-ExpImpData').val());
          closeSettingDialog();
          break;
        case 'jras-gui-SaveSettings':
          updateUserOptions();
          userOptions.saveUserData(page.currentUser);
          updateGuiLocalize();
          closeSettingDialog();
          break;
        case 'jras-gui-sendPMforMe':
          closeSettingDialog();
          sendPM('AntiUser');
          break;
        case 'jras-gui-DeleteAllSavedSettings':
          closeSettingDialog();
          userOptions.removeAllSavedData();
          break;
        case 'jras-gui-ResetSettings':
          closeSettingDialog();
          userOptions.setDef();
          break;
      }
    });
  }

  function openProp(){
    const $propDialog = $('#jras-prop-gui-dialog');
    userOptions.each(function(thd, optName, opt){
      switch(opt.propData().type) {
        case 'checkbox':
          $propDialog.find('#' + getPropID(optName) + 'Val').prop('checked', userOptions.val(optName));
          break;
        case 'radio':
          $propDialog.find('#' + getPropID(optName) + 'Val').prop('checked', userOptions.val(optName));
          break;
        case 'combobox':
        case 'number':
          $propDialog.find('#' + getPropID(optName) + 'Val').val(userOptions.val(optName));
          break;
      }
    });
    $propDialog.find('#jras-guiBlockUserList').val(userOptions.data.BlockUsers.join("\n"));
    $propDialog.find('#jras-guiBlockTagList').val(userOptions.data.BlockTags.join("\n"));
    $propDialog.find('#jras-prop-gui-tabs').tabs({active: 0});
    $propDialog.find('#jras-prop-gui-tabs').tabs({selected: 0});
    $propDialog.find('#jras-prop-gui-tabs').tabs({focused: 0});
  }

  function updateGuiLocalize(){
    const $propDialog = $('#jras-prop-gui-dialog');
    $propDialog.find('#jras-gui-Import').attr('value', lng.getVal('JRAS_GUI_BTNIMPORT'));
    $propDialog.find('#jras-gui-SaveSettings').attr('value', lng.getVal('JRAS_GUI_BTNSAVE'));
    $propDialog.find('#jras-gui-sendPMforMe').attr('title', lng.getVal('JRAS_GUI_BTNSENDPMME'));
    $propDialog.find('#jras-gui-DeleteAllSavedSettings').attr('title', lng.getVal('JRAS_GUI_BTNDELETESETT'));
    $propDialog.find('#jras-gui-ResetSettings').attr('title', lng.getVal('JRAS_GUI_BTNRESETSETT'));
    $propDialog.find('#jras-tabs-nav-0 a').text(lng.getVal('JRAS_GUI_TABMAIN'));
    $propDialog.find('#jras-tabs-nav-1 a').text(lng.getVal('JRAS_GUI_TABBLOCK'));
    $propDialog.find('#jras-tabs-nav-2 a').text(lng.getVal('JRAS_GUI_TABTOOLTIP'));
    $propDialog.find('#jras-tabs-nav-3 a').text(lng.getVal('JRAS_GUI_TABCOMMENTS'));
    $propDialog.find('#jras-tabs-nav-4 a').text(lng.getVal('JRAS_GUI_TABSTYLE'));
    $propDialog.find('#jras-tabs-nav-5 a').text(lng.getVal('JRAS_GUI_TABEXPIMP'));
    $propDialog.find('#jras-guiBlockUserListCaption').text(lng.getVal('JRAS_GUI_BLOCKUSERLIST'));
    $propDialog.find('#jras-guiBlockTagListCaption').text(lng.getVal('JRAS_GUI_BLOCKTAGLIST'));
    $propDialog.find('#jras-gui-ExpImpCaption').text(lng.getVal('JRAS_GUI_EXPIMP'));

    userOptions.each(function(thd, optName){
      $propDialog.find('#' + getPropID(optName) + 'Caption').text(userOptions.getGuiDesc(optName));
    });
  }

  function makeServiceGUIButton(){
    const $propDialog = $('#jras-prop-gui-dialog');
    if(page.isNewDesign){
      $propDialog.find('#jras-gui-SaveSettings').css('border-radius', '3px');
      $propDialog.find('#jras-prop-gui-bottomCcontent').prepend(`
      <div id="jras-gui-sendPMforMe" needClick="true" class="big_button jras-gui-btn-newdesign jras-prop-gui-button-left jras-gui-btn-pmme" title=""> </div>
      <div id="jras-gui-DeleteAllSavedSettings" needClick="true" class="big_button jras-gui-btn-newdesign jras-prop-gui-button-left jras-gui-btn-deleteall" title="" > </div>
      <div id="jras-gui-ResetSettings" needClick="true" class="big_button jras-gui-btn-newdesign jras-prop-gui-button-left jras-gui-btn-resetdef" title="" > </div>
     `);
    }else{
      $propDialog.find('#jras-prop-gui-bottomCcontent').prepend(`
      <input id="jras-gui-sendPMforMe" needClick="true" style="padding-left: 3px;padding-right: 3px;width: 24px;height: 22px;" class="jras-prop-gui-button-left jras-gui-btn-pmme" title="" value="" type="button">
      <input id="jras-gui-DeleteAllSavedSettings" needClick="true" style="padding-left: 3px; padding-right: 3px; width: 24px; height: 22px;" class="jras-prop-gui-button-left jras-gui-btn-deleteall" title="" value="" type="button">
      <input id="jras-gui-ResetSettings" needClick="true" style="padding-left: 3px; padding-right: 3px; width: 24px; height: 22px;" class="jras-prop-gui-button-left jras-gui-btn-resetdef" title="" value="" type="button">
     `);
    }
  }

  function updateUserOptions() {
    const $propDialog = $('#jras-prop-gui-dialog');
    userOptions.each(function(thd, optName, opt){
      switch(opt.propData().type) {
        case 'checkbox':
          userOptions.val(optName, $propDialog.find('#' + getPropID(optName) + 'Val').prop('checked'));
          break;
        case 'radio':
          userOptions.val(optName, $propDialog.find('#' + getPropID(optName) + 'Val').prop('checked'));
          break;
        case 'combobox':
        case 'number':
          userOptions.val(optName, $propDialog.find('#' + getPropID(optName) + 'Val').val());
          break;
      }
    });
    userOptions.data.BlockUsers = $propDialog.find('#jras-guiBlockUserList').val().split('\n');
    userOptions.data.BlockTags = $propDialog.find('#jras-guiBlockTagList').val().split('\n');
  }

  function VideoSoundController(deps) {
    const win = deps.win;
    const $ = deps.$;
    const userOptions = deps.userOptions;
    const lng = deps.lng;
    const controller = this;

    const videoSoundStates = new WeakMap();
    const videoSoundAutoChanges = new WeakMap();
    let lastVideoVolume = loadVideoSoundVolume();
    let videoSoundScrollObserver;
    let videoSoundVideoScrollObserver;
    let videoSoundCommentObserver;
    let videoSoundHalfObserver;
    let videoSoundScreenMiddleRaf;
    let currentScreenMiddleVideo;

    this.init = function () {
      if (!userOptions.val('videoSoundOptions')) {
        return;
      }
      controller.initControls();
      initCommentVideoSoundObserver($('div.post_comment_list'));
      initVideoSoundScrollObserver();
      initVideoSoundVideoScrollObserver();
      initVideoSoundHalfObserver();
      initVideoSoundScreenMiddleObserver();
    };

    function loadVideoSoundVolume() {
      // сохраним это значение отдельно от опций, для быстрого доступа мимо настроек
      const savedVolume = parseFloat(win.localStorage.getItem('jras_video_volume'));
      if ($.isNumeric(savedVolume)) {
        return Math.min(1, Math.max(0, savedVolume));
      }
      return 1;
    }

    function saveVideoSoundVolume(volume) {
      if (!$.isNumeric(volume)) { return }
      const safeVolume = Math.min(1, Math.max(0, volume));
      lastVideoVolume = safeVolume;
      win.localStorage.setItem('jras_video_volume', safeVolume);
    }

    function getVideoSoundVolume() {
      if (!$.isNumeric(lastVideoVolume)) {
        lastVideoVolume = loadVideoSoundVolume();
      }
      return lastVideoVolume;
    }

    function getTargetVideoSoundVolume() {
      const savedVolume = getVideoSoundVolume();
      return ($.isNumeric(savedVolume) && savedVolume > 0) ? savedVolume : 1;
    }

    function applyVideoSoundVolume(video) {
      const volume = getVideoSoundVolume();
      if ($.isNumeric(volume)) {
        setVideoVolumeAuto(video, volume);
      }
    }

    function addVideoSoundAutoChange(video, count) {
      const prev = videoSoundAutoChanges.get(video) || 0;
      videoSoundAutoChanges.set(video, prev + (count || 1));
    }

    function consumeVideoSoundAutoChange(video) {
      const prev = videoSoundAutoChanges.get(video) || 0;
      if (prev <= 1) {
        videoSoundAutoChanges.delete(video);
      } else {
        videoSoundAutoChanges.set(video, prev - 1);
      }
      return prev > 0;
    }

    function setVideoMutedAuto(video, muted) {
      addVideoSoundAutoChange(video);
      video.muted = muted;
    }

    function setVideoVolumeAuto(video, volume) {
      if (!$.isNumeric(volume)) { return }
      addVideoSoundAutoChange(video);
      video.volume = volume;
    }

    function getVideoSoundState(video) {
      if (!video) { return 'unknown' }
      if (typeof video.mozHasAudio !== 'undefined') {
        return video.mozHasAudio ? 'yes' : 'unknown';
      }
      if (video.audioTracks && typeof video.audioTracks.length === 'number') {
        return video.audioTracks.length ? 'yes' : 'unknown';
      }
      if (typeof video.webkitAudioDecodedByteCount !== 'undefined') {
        return video.webkitAudioDecodedByteCount > 0 ? 'yes' : 'unknown';
      }
      return 'unknown';
    }

    function updateVideoSoundButton(video) {
      const $btn = $(video).data('jrasSoundBtn');
      if (!$btn || !$btn.length) { return }
      const isMuted = video.muted || video.volume === 0;
      $btn.toggleClass('jras-video-sound-muted', isMuted);
      $btn.text(isMuted ? '🔇' : '🔊');
      $btn.attr('title', isMuted ? lng.getVal('JRAS_VIDEO_SOUND_UNMUTE') : lng.getVal('JRAS_VIDEO_SOUND_MUTE'));
    }

    function toggleVideoMute(video) {
      if (!video) { return }
      if (video.muted || video.volume === 0) {
        if (userOptions.val('restartVideoOnUnmute')) {
          try {
            video.currentTime = 0;
          } catch (e) { }
        }
        video.volume = getTargetVideoSoundVolume();
        video.muted = false;
      } else {
        video.muted = true;
      }
    }

    function createVideoSoundButton(video) {
      const $holder = $(video).closest('.video_holder');
      if (!$holder.length) { return }
      if ($holder.find('.jras-video-sound-btn').length) { return }
      const $btn = $('<div class="jras-video-sound-btn" />');
      $btn.on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleVideoMute(video);
      });
      $holder.append($btn);
      $(video).data('jrasSoundBtn', $btn);
      updateVideoSoundButton(video);
    }

    function handleVideoVolumeChange(video) {
      const wasAutoChange = consumeVideoSoundAutoChange(video);
      const prevState = videoSoundStates.get(video) || { muted: video.muted, volume: video.volume };
      const isMuted = video.muted;
      const currentVolume = video.volume;
      const savedVolume = getVideoSoundVolume();

      if (!wasAutoChange && !isMuted && prevState.muted && currentVolume === prevState.volume) {
        if ($.isNumeric(savedVolume) && savedVolume !== currentVolume) {
          setVideoVolumeAuto(video, savedVolume);
        }
      }

      if (!wasAutoChange && !isMuted && $.isNumeric(currentVolume) && currentVolume !== savedVolume) {
        saveVideoSoundVolume(currentVolume);
      }

      videoSoundStates.set(video, { muted: isMuted, volume: currentVolume });
      updateVideoSoundButton(video);
    }

    function tryAttachVideoSoundButton(video) {
      const state = getVideoSoundState(video);
      if (state === 'yes') {
        createVideoSoundButton(video);
        if (video.dataset) {
          video.dataset.jrasSoundHasAudio = '1';
        }
        return true;
      }
      return false;
    }

    function bindVideoSoundLoadListeners(video) {
      const tryAttach = function () {
        if (tryAttachVideoSoundButton(video)) {
          $(video).off('loadedmetadata.jrasSound loadeddata.jrasSound canplay.jrasSound play.jrasSound playing.jrasSound timeupdate.jrasSound durationchange.jrasSound');
        }
      };
      $(video).on('loadedmetadata.jrasSound loadeddata.jrasSound canplay.jrasSound play.jrasSound playing.jrasSound timeupdate.jrasSound durationchange.jrasSound', tryAttach);
      $(video).on('loadstart.jrasSound', function () {
        if (video.dataset) {
          delete video.dataset.jrasSoundHasAudio;
        }
      });
    }

    function isVideoInContentContainer(video) {
      if (!video) { return false }
      return $(video).closest('div.content-container, div#post_list').length > 0;
    }

    function intersectRects(a, b) {
      const left = Math.max(a.left, b.left);
      const top = Math.max(a.top, b.top);
      const right = Math.min(a.right, b.right);
      const bottom = Math.min(a.bottom, b.bottom);
      if (right <= left || bottom <= top) { return null }
      return {
        left: left,
        top: top,
        right: right,
        bottom: bottom,
        width: right - left,
        height: bottom - top
      };
    }

    function getVideoActualVisibleRect(video) {
      if (!video || !video.getBoundingClientRect || !document.contains(video)) { return null }
      if (video.getClientRects && video.getClientRects().length === 0) { return null }

      let visibleRect = video.getBoundingClientRect();
      if (visibleRect.width <= 0 || visibleRect.height <= 0) { return null }

      visibleRect = intersectRects(visibleRect, {
        left: 0,
        top: 0,
        right: win.innerWidth || document.documentElement.clientWidth || 0,
        bottom: win.innerHeight || document.documentElement.clientHeight || 0
      });
      if (!visibleRect) { return null }

      let parent = video.parentElement;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        const style = win.getComputedStyle ? win.getComputedStyle(parent) : null;
        if (style && style.display === 'none') { return null }
        if (style && style.visibility === 'hidden') { return null }
        const overflow = style ? `${style.overflow} ${style.overflowX} ${style.overflowY}` : '';
        if (/(auto|scroll|hidden|clip)/.test(overflow)) {
          const parentRect = parent.getBoundingClientRect();
          visibleRect = intersectRects(visibleRect, parentRect);
          if (!visibleRect) { return null }
        }
        parent = parent.parentElement;
      }

      return visibleRect;
    }

    function isVideoActuallyVisible(video, minVisibleRatio) {
      const visibleRect = getVideoActualVisibleRect(video);
      if (!visibleRect) { return false }
      if (!$.isNumeric(minVisibleRatio)) { return true }

      const videoRect = video.getBoundingClientRect();
      const videoArea = videoRect.width * videoRect.height;
      if (videoArea <= 0) { return false }
      return (visibleRect.width * visibleRect.height) / videoArea >= minVisibleRatio;
    }

    this.initControls = function ($nodes) {
      if (!userOptions.val('videoSoundOptions')) { return }
      const $scope = $nodes ? $nodes : $('body');
      const $videos = $scope.is('video') ? $scope : $scope.find('video');
      $videos.each(function () {
        const video = this;
        if (video.dataset && video.dataset.jrasSoundInit) { return }
        if (!isVideoInContentContainer(video)) { return }
        if (video.dataset) {
          video.dataset.jrasSoundInit = '1';
        }
        applyVideoSoundVolume(video);
        videoSoundStates.set(video, { muted: video.muted, volume: video.volume });
        $(video).on('volumechange.jrasSound', function () {
          handleVideoVolumeChange(video);
        });

        if (!tryAttachVideoSoundButton(video)) {
          bindVideoSoundLoadListeners(video);
        }
        observeVideoForAutoSound(video);
        observeVideoForSoundScroll(video);
      });
      initCommentVideoSoundObserver($nodes);
      handleScreenMiddleAutoSound();
    };

    function initCommentVideoSoundObserver($nodes) {
      if (!('IntersectionObserver' in window)) { return }
      if (!videoSoundCommentObserver) {
        videoSoundCommentObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || entry.intersectionRatio <= 0) {
              const video = entry.target;
              if (!isVideoInContentContainer(video)) { return }
              if (!video.muted) {
                setVideoMutedAuto(video, true);
              }
            }
          });
        }, { root: null, threshold: 0.1 });
      }
      const $scope = $nodes ? $nodes : $('body');
      const $videos = $scope.is('video') ? $scope : $scope.find('video');
      $videos.each(function () {
        if ($(this).closest('div.post_comment_list').length === 0 || !isVideoInContentContainer(this)) { return }
        observeOnce(this, videoSoundCommentObserver, 'jrasSoundCommentObserved');
      });
    }

    function findPostContainers($nodes) {
      if (!$nodes) {
        return $('div[id^=postContainer].postContainer').filter(function () {
          return $(this).closest('div.post_comment_list').length === 0;
        });
      }
      const $arr = $();
      $nodes.each(function () {
        const $node = $(this);
        if ($node.is('div[id^=postContainer].postContainer')
          && $node.closest('div.post_comment_list').length === 0) {
          $arr.push(this);
        }
        $node.find('div[id^=postContainer].postContainer').each(function () {
          if ($(this).closest('div.post_comment_list').length !== 0) { return }
          $arr.push(this);
        });
      });
      return $arr;
    }

    function findPostVideos($post) {
      return $post.find('video').filter(function () {
        return $(this).closest('div.post_comment_list').length === 0;
      });
    }

    function setPostVisibilityState(post, isVisible) {
      if (!userOptions.val('videoSoundMuteOnPostScroll')) { return }
      const $videos = findPostVideos($(post));
      if (!$videos.length) { return }
      $videos.each(function () {
        if (!isVideoInContentContainer(this)) { return }
        applyVisibilitySoundState(this, isVisible && isVideoActuallyVisible(this));
      });
    }

    function setVideoVisibilityState(video, isVisible) {
      if (!userOptions.val('videoSoundMuteOnVideoScroll')) { return }
      if (!isVideoInContentContainer(video)) { return }
      applyVisibilitySoundState(video, isVisible && isVideoActuallyVisible(video));
    }

    function applyVisibilitySoundState(video, isVisible) {
      if (!video) { return }
      if (!isVideoInContentContainer(video)) { return }
      if (isVisible) { return }
      if (currentScreenMiddleVideo === video) {
        currentScreenMiddleVideo = null;
      }
      if (!video.muted) {
        setVideoMutedAuto(video, true);
      }
    }

    function observePostContainerForSound(post) {
      observeOnce(post, videoSoundScrollObserver, 'jrasSoundPostObserved');
    }

    function observeVideoForSoundScroll(video) {
      observeOnce(video, videoSoundVideoScrollObserver, 'jrasSoundVideoScrollObserved');
    }

    function observeOnce(element, observer, flagName) {
      if (!observer || !element) { return }
      if (element.dataset) {
        if (element.dataset[flagName]) { return }
        element.dataset[flagName] = '1';
      }
      observer.observe(element);
    }

    function createVisibilityObserver(callback) {
      if (!('IntersectionObserver' in window)) { return null }
      return new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          callback(entry);
        });
      }, { root: null, threshold: 0.1 });
    }

    function initVideoSoundScrollObserver() {
      videoSoundScrollObserver = createVisibilityObserver(function (entry) {
        setPostVisibilityState(entry.target, entry.isIntersecting && entry.intersectionRatio > 0);
      });
      if (!videoSoundScrollObserver) { return }

      findPostContainers().each(function () {
        observePostContainerForSound(this);
      });

      const postList = document.getElementById('post_list') || document.body;
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type !== 'childList' || !mutation.addedNodes.length) { return }
          const $posts = findPostContainers($(mutation.addedNodes));
          $posts.each(function () {
            observePostContainerForSound(this);
          });
        });
      });
      observer.observe(postList, { childList: true, subtree: true });
    }

    function initVideoSoundVideoScrollObserver() {
      videoSoundVideoScrollObserver = createVisibilityObserver(function (entry) {
        setVideoVisibilityState(entry.target, entry.isIntersecting && entry.intersectionRatio > 0);
      });
      if (!videoSoundVideoScrollObserver) { return }

      $('video').each(function () {
        if (!isVideoInContentContainer(this)) { return }
        observeVideoForSoundScroll(this);
      });
    }

    this.subscribe = function () {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type !== 'childList' || !mutation.addedNodes.length) { return }
          controller.initControls($(mutation.addedNodes));
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    };

    function canAutoUnmuteVideo(video) {
      if (video.dataset && video.dataset.jrasSoundHasAudio === '1') {
        return true;
      }
      const $btn = $(video).data('jrasSoundBtn');
      if ($btn && $btn.length) {
        return true;
      }
      return getVideoSoundState(video) === 'yes';
    }

    function muteOtherVideos(activeVideo) {
      $('video').each(function () {
        if (this === activeVideo) { return }
        if (!isVideoInContentContainer(this)) { return }
        if (!this.muted) {
          setVideoMutedAuto(this, true);
        }
      });
    }

    function ensureVideoSoundOn(video) {
      if ((userOptions.val('autoUnmuteVideoNone'))) { return }
      if (!isVideoInContentContainer(video)) { return }
      if (!isVideoActuallyVisible(video)) { return }
      if (!video || !canAutoUnmuteVideo(video)) { return }
      if (!video.muted && video.volume > 0) { return }
      const wasPlaying = !video.paused && !video.ended;
      muteOtherVideos(video);
      const targetVolume = getTargetVideoSoundVolume();
      if (video.volume !== targetVolume) {
        setVideoVolumeAuto(video, targetVolume);
      }
      if (video.muted) {
        setVideoMutedAuto(video, false);
      }
      const shouldRestart = userOptions.val('restartVideoOnUnmute');
      if (shouldRestart) {
        video.currentTime = 0;
      }
      if (wasPlaying || shouldRestart) {
        video.play();
      }
    }

    function observeVideoForAutoSound(video) {
      if (!videoSoundHalfObserver) { return }
      if (video.dataset && video.dataset.jrasSoundHalfObserved) { return }
      if (!isVideoInContentContainer(video)) { return }
      if (video.dataset) {
        video.dataset.jrasSoundHalfObserved = '1';
      }
      videoSoundHalfObserver.observe(video);
    }

    function initVideoSoundHalfObserver() {
      if (!('IntersectionObserver' in window)) { return }
      videoSoundHalfObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (userOptions.val('autoUnmuteVideoOnHalfScreen') && isVideoActuallyVisible(entry.target, 0.5)) {
              ensureVideoSoundOn(entry.target);
            }
          }
        });
      }, { root: null, threshold: [0.5] });

      $('video').each(function () {
        observeVideoForAutoSound(this);
      });
    }

    function initVideoSoundScreenMiddleObserver() {
      const onScroll = function () {
        if (videoSoundScreenMiddleRaf) { return }
        videoSoundScreenMiddleRaf = win.requestAnimationFrame(function () {
          videoSoundScreenMiddleRaf = null;
          handleScreenMiddleAutoSound();
        });
      };
      $(window).on('scroll', onScroll);
      $(window).on('resize', onScroll);
      onScroll();
    }

    function handleScreenMiddleAutoSound() {
      if (!userOptions.val('autoUnmuteVideoOnScreenMiddle')) { return }
      const video = findVideoAtScreenMiddle();
      if (!video) {
        currentScreenMiddleVideo = null;
        return;
      }
      if (video === currentScreenMiddleVideo) { return }
      currentScreenMiddleVideo = video;
      ensureVideoSoundOn(video);
    }

    function findVideoAtScreenMiddle() {
      const midY = (win.innerHeight || document.documentElement.clientHeight || 0) / 2;
      if (!midY) { return null }
      let target = null;
      $('video').each(function () {
        if (!isVideoInContentContainer(this)) { return }
        const rect = getVideoActualVisibleRect(this);
        if (!rect) { return }
        if (rect.top <= midY && rect.bottom >= midY) {
          target = this;
          return false;
        }
      });
      return target;
    }

  }

  function PageData(){
    const getColorSchema = function(){ // light or dark
      let c = window.getComputedStyle($('body')[0], null).getPropertyValue('background-color');
      if (!c){c = $('body').css('background-color')}
      const rgb = (/^#[0-9A-F]{6}$/i.test(c)) ? c : c.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      const mono = (rgb !== null)
        ? parseInt((0.2125 * rgb[1]) + (0.7154 * rgb[2]) + (0.0721 * rgb[3]), 10)
        : 0;
      return (mono <= 128) ? 'dark' : 'light';
    };

    // Opera 8.0+
    this.isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Firefox 1.0+
    this.isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    this.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // Internet Explorer 6-11
    this.isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    this.isEdge = !this.isIE && !!window.StyleMedia;
    // Chrome 1+
    this.isChrome = !!window.chrome && !!window.chrome.webstore;
    // Blink engine detection
    this.isBlink = (this.isChrome || this.isOpera) && !!window.CSS;

    let regEx;
    let matches;
    this.currentPage = win.location.href;
    this.isUserLogon = $('li.login.lastitem a').is('#logout');

    this.currentUser = this.isUserLogon ? $('li.login a#settings').attr('href') : defUserName;
    if (this.currentUser != defUserName){
      regEx = /(^.user.)(.+)/g;
      matches = regEx.exec(this.currentUser);
      this.currentUser = matches[2];
      if (this.currentUser === undefined || this.currentUser == ''){
        this.currentUser = defUserName;
      }
    }
    this.isSchemeLight = function(){
      return getColorSchema() == 'light'
    };
    this.isNewDesignFunc = function(){
      regEx = /^((https?:)(\/\/\/?)([\w]*(?::[\w]*)?@)?([\d\w\.-]+)(?::(\d+))?)?([\/\\\w\.()-]*)?(?:([?][^#]*)?(#.*)?)*/gmi;
      matches = regEx.exec(this.currentPage);
      if (matches[5] == undefined){
        return false
      }
      return (matches[5] != 'old.reactor.cc') && (matches[5] != 'old.jr-proxy.com');
    };
    this.isNewDesign = this.isNewDesignFunc();
    this.pageIs = function(page){
      let retVal = false;
      const regEx = /^((https?:)(\/\/\/?)([\w]*(?::[\w]*)?@)?([\d\w\.-]+)(?::(\d+))?)?([\/\\\w\.()-]*)?(?:([?][^#]*)?(#.*)?)*/gmi;
      const matches = regEx.exec(this.currentPage);
      if (matches[7] !== undefined){
        if (matches[7].match(new RegExp('.*(' + page + ').*'))){
          retVal = true;
        }
      }
      return retVal;
    };
    this.rgb2hex = (rgb) => `#${rgb?.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)?.slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`;
    this.commentBgColor = () => this.rgb2hex($('.comment').css('background-color'));
  }

  function niceBytes(a){let b=0,c=parseInt(a,10)||0;for(;1024<=c&&++b;)c/=1024;return c.toFixed(10>c&&0<b?1:0)+" "+["bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][b]}

  function SocialMediaIcons(){
    this.artstation_com = `<svg viewBox="0 0 24 24"><path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 0 0-2.142-1.289H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z"/></svg>`;
    this.behance_net    = `<svg viewBox="0 0 24 24"><path d="M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.393c-.005-.8.129-1.595.396-2.349a5.313 5.313 0 0 1 5.088-3.604 4.87 4.87 0 0 1 2.376.563c.661.362 1.231.87 1.668 1.485a6.2 6.2 0 0 1 .943 2.133c.194.821.263 1.666.205 2.508h-7.699c-.063.79.184 1.574.688 2.187ZM6.947 4.084a8.065 8.065 0 0 1 1.928.198 4.29 4.29 0 0 1 1.49.638c.418.303.748.711.958 1.182.241.579.357 1.203.341 1.83a3.506 3.506 0 0 1-.506 1.961 3.726 3.726 0 0 1-1.503 1.287 3.588 3.588 0 0 1 2.027 1.437c.464.747.697 1.615.67 2.494a4.593 4.593 0 0 1-.423 2.032 3.945 3.945 0 0 1-1.163 1.413 5.114 5.114 0 0 1-1.683.807 7.135 7.135 0 0 1-1.928.259H0V4.084h6.947Zm-.235 12.9c.308.004.616-.029.916-.099a2.18 2.18 0 0 0 .766-.332c.228-.158.411-.371.534-.619.142-.317.208-.663.191-1.009a2.08 2.08 0 0 0-.642-1.715 2.618 2.618 0 0 0-1.696-.505h-3.54v4.279h3.471Zm13.635-5.967a2.13 2.13 0 0 0-1.654-.619 2.336 2.336 0 0 0-1.163.259 2.474 2.474 0 0 0-.738.62 2.359 2.359 0 0 0-.396.792c-.074.239-.12.485-.137.734h4.769a3.239 3.239 0 0 0-.679-1.785l-.002-.001Zm-13.813-.648a2.254 2.254 0 0 0 1.423-.433c.399-.355.607-.88.56-1.413a1.916 1.916 0 0 0-.178-.891 1.298 1.298 0 0 0-.495-.533 1.851 1.851 0 0 0-.711-.274 3.966 3.966 0 0 0-.835-.073H3.241v3.631h3.293v-.014ZM21.62 5.122h-5.976v1.527h5.976V5.122Z"/></svg>`;
    this.bsky_social    = `<svg viewBox="0 0 24 24"><path d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/></svg>`;
    this.boosty_to      = '<svg viewBox="0 0 24 24"><path d="M2.661 14.337 6.801 0h6.362L11.88 4.444l-.038.077-3.378 11.733h3.15c-1.321 3.289-2.35 5.867-3.086 7.733-5.816-.063-7.442-4.228-6.02-9.155M8.554 24l7.67-11.035h-3.25l2.83-7.073c4.852.508 7.137 4.33 5.791 8.952C20.16 19.81 14.344 24 8.68 24h-.127z"/></svg>';
    this.deviantart_com = `<svg viewBox="0 0 24 24"><path d="M19.207 4.794l.23-.43V0H15.07l-.436.44-2.058 3.925-.646.436H4.58v5.993h4.04l.36.436-4.175 7.98-.24.43V24H8.93l.436-.44 2.07-3.925.644-.436h7.35v-5.993h-4.05l-.36-.438 4.186-7.977z"/></svg>`;
    this.discord_com    = `<svg viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>`;
    this.dribbble_com   = `<svg viewBox="0 0 24 24"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>`;
    this.facebook_com   = `<svg viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>`;
    this.github_com     = `<svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;
    this.instagram_com  = `<svg viewBox="0 0 24 24"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>`;
    this.itch_io        = `<svg viewBox="0 0 24 24"><path d="M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.102 2.436-2.41 0 1.308 1.07 2.41 2.4 2.41 1.328 0 2.362-1.102 2.362-2.41 0 1.308 1.137 2.41 2.466 2.41h.024c1.33 0 2.466-1.102 2.466-2.41 0 1.308 1.034 2.41 2.363 2.41 1.33 0 2.4-1.102 2.4-2.41 0 1.308 1.106 2.41 2.435 2.41C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.62-2.082-2.99-3.13-3.612-3.253-.114-5.508-.134-8.87-.133-3.362 0-7.945.053-8.87.133zm6.376 6.477a2.74 2.74 0 0 1-.468.602c-.5.49-1.19.795-1.947.795a2.786 2.786 0 0 1-1.95-.795c-.182-.178-.32-.37-.446-.59-.127.222-.303.412-.486.59a2.788 2.788 0 0 1-1.95.795c-.092 0-.187-.025-.264-.052-.107 1.113-.152 2.176-.168 2.95v.005l-.006 1.167c.02 2.334-.23 7.564 1.03 8.85 1.952.454 5.545.662 9.15.663 3.605 0 7.198-.21 9.15-.664 1.26-1.284 1.01-6.514 1.03-8.848l-.006-1.167v-.004c-.016-.775-.06-1.838-.168-2.95-.077.026-.172.052-.263.052a2.788 2.788 0 0 1-1.95-.795c-.184-.178-.36-.368-.486-.59-.127.22-.265.412-.447.59a2.786 2.786 0 0 1-1.95.794c-.76 0-1.446-.303-1.948-.793a2.74 2.74 0 0 1-.468-.602 2.738 2.738 0 0 1-.463.602 2.787 2.787 0 0 1-1.95.794h-.16a2.787 2.787 0 0 1-1.95-.793 2.738 2.738 0 0 1-.464-.602zm-2.004 2.59v.002c.795.002 1.5 0 2.373.953.687-.072 1.406-.108 2.125-.107.72 0 1.438.035 2.125.107.873-.953 1.578-.95 2.372-.953.376 0 1.876 0 2.92 2.934l1.123 4.028c.832 2.995-.266 3.068-1.636 3.07-2.03-.075-3.156-1.55-3.156-3.025-1.124.184-2.436.276-3.748.277-1.312 0-2.624-.093-3.748-.277 0 1.475-1.125 2.95-3.156 3.026-1.37-.004-2.468-.077-1.636-3.072l1.122-4.027c1.045-2.934 2.545-2.934 2.92-2.934zM12 12.714c-.002.002-2.14 1.964-2.523 2.662l1.4-.056v1.22c0 .056.56.033 1.123.007.562.026 1.124.05 1.124-.008v-1.22l1.4.055C14.138 14.677 12 12.713 12 12.713z"/></svg>`;
    this.linkedin_com   = `<svg viewBox="0 0 72 72"><path d="M8,72 L64,72 C68.418278,72 72,68.418278 72,64 L72,8 C72,3.581722 68.418278,-8.11624501e-16 64,0 L8,0 C3.581722,8.11624501e-16 -5.41083001e-16,3.581722 0,8 L0,64 C5.41083001e-16,68.418278 3.581722,72 8,72 Z"/><path d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z" fill="#c7c7c7"/></svg>`;
    this.linktr_ee      = `<svg viewBox="0 0 24 24"><path d="m13.73635 5.85251 4.00467-4.11665 2.3248 2.3808-4.20064 4.00466h5.9085v3.30473h-5.9365l4.22865 4.10766-2.3248 2.3338L12.0005 12.099l-5.74052 5.76852-2.3248-2.3248 4.22864-4.10766h-5.9375V8.12132h5.9085L3.93417 4.11666l2.3248-2.3808 4.00468 4.11665V0h3.4727zm-3.4727 10.30614h3.4727V24h-3.4727z"/></svg>`;
    this.patreon_com    = `<svg viewBox="0 0 24 24"><path d="M22.957 7.21c-.004-3.064-2.391-5.576-5.191-6.482-3.478-1.125-8.064-.962-11.384.604C2.357 3.231 1.093 7.391 1.046 11.54c-.039 3.411.302 12.396 5.369 12.46 3.765.047 4.326-4.804 6.068-7.141 1.24-1.662 2.836-2.132 4.801-2.618 3.376-.836 5.678-3.501 5.673-7.031Z"/></svg>`;
    this.pinterest_com  = `<svg viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>`;
    this.pixiv_net      = `<svg viewBox="0 0 24 24"><path d="M4.94 0A4.953 4.953 0 0 0 0 4.94v14.12A4.953 4.953 0 0 0 4.94 24h14.12A4.953 4.953 0 0 0 24 19.06c-.014 1.355 0-14.12 0-14.12A4.953 4.953 0 0 0 19.06 0Zm1.783 5.465h.904a.37.37 0 0 1 .31.17l.752 1.17a6.172 6.172 0 0 1 10.01 4.834 6.172 6.172 0 0 1-9.394 5.265v2.016a.37.37 0 0 1-.37.367H6.724a.37.37 0 0 1-.37-.367V5.834a.37.37 0 0 1 .37-.37m5.804 2.951a3.222 3.222 0 1 0-.002 6.443 3.222 3.222 0 0 0 .002-6.443"/></svg>`;
    this.reddit_com     = `<svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"/></svg>`;
    this.signal_org     = `<svg viewBox="0 0 24 24"><path d="M12 0q-.934 0-1.83.139l.17 1.111a11 11 0 0 1 3.32 0l.172-1.111A12 12 0 0 0 12 0M9.152.34A12 12 0 0 0 5.77 1.742l.584.961a10.8 10.8 0 0 1 3.066-1.27zm5.696 0-.268 1.094a10.8 10.8 0 0 1 3.066 1.27l.584-.962A12 12 0 0 0 14.848.34M12 2.25a9.75 9.75 0 0 0-8.539 14.459c.074.134.1.292.064.441l-1.013 4.338 4.338-1.013a.62.62 0 0 1 .441.064A9.7 9.7 0 0 0 12 21.75c5.385 0 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25m-7.092.068a12 12 0 0 0-2.59 2.59l.909.664a11 11 0 0 1 2.345-2.345zm14.184 0-.664.909a11 11 0 0 1 2.345 2.345l.909-.664a12 12 0 0 0-2.59-2.59M1.742 5.77A12 12 0 0 0 .34 9.152l1.094.268a10.8 10.8 0 0 1 1.269-3.066zm20.516 0-.961.584a10.8 10.8 0 0 1 1.27 3.066l1.093-.268a12 12 0 0 0-1.402-3.383M.138 10.168A12 12 0 0 0 0 12q0 .934.139 1.83l1.111-.17A11 11 0 0 1 1.125 12q0-.848.125-1.66zm23.723.002-1.111.17q.125.812.125 1.66c0 .848-.042 1.12-.125 1.66l1.111.172a12.1 12.1 0 0 0 0-3.662M1.434 14.58l-1.094.268a12 12 0 0 0 .96 2.591l-.265 1.14 1.096.255.36-1.539-.188-.365a10.8 10.8 0 0 1-.87-2.35m21.133 0a10.8 10.8 0 0 1-1.27 3.067l.962.584a12 12 0 0 0 1.402-3.383zm-1.793 3.848a11 11 0 0 1-2.345 2.345l.664.909a12 12 0 0 0 2.59-2.59zm-19.959 1.1L.357 21.48a1.8 1.8 0 0 0 2.162 2.161l1.954-.455-.256-1.095-1.953.455a.675.675 0 0 1-.81-.81l.454-1.954zm16.832 1.769a10.8 10.8 0 0 1-3.066 1.27l.268 1.093a12 12 0 0 0 3.382-1.402zm-10.94.213-1.54.36.256 1.095 1.139-.266c.814.415 1.683.74 2.591.961l.268-1.094a10.8 10.8 0 0 1-2.35-.869zm3.634 1.24-.172 1.111a12.1 12.1 0 0 0 3.662 0l-.17-1.111q-.812.125-1.66.125a11 11 0 0 1-1.66-.125"/></svg>`;
    this.snapchat_com   = `<svg viewBox="0 0 24 24"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/></svg>`;
    this.telegram_org   = `<svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;
    this.threads_net    = `<svg viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/></svg>`;
    this.tiktok_com     = `<svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`;
    this.twitch_tv      = `<svg viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`;
    this.vk_com         = `<svg viewBox="0 0 24 24"><path d="m9.489.004.729-.003h3.564l.73.003.914.01.433.007.418.011.403.014.388.016.374.021.36.025.345.03.333.033c1.74.196 2.933.616 3.833 1.516.9.9 1.32 2.092 1.516 3.833l.034.333.029.346.025.36.02.373.025.588.012.41.013.644.009.915.004.98-.001 3.313-.003.73-.01.914-.007.433-.011.418-.014.403-.016.388-.021.374-.025.36-.03.345-.033.333c-.196 1.74-.616 2.933-1.516 3.833-.9.9-2.092 1.32-3.833 1.516l-.333.034-.346.029-.36.025-.373.02-.588.025-.41.012-.644.013-.915.009-.98.004-3.313-.001-.73-.003-.914-.01-.433-.007-.418-.011-.403-.014-.388-.016-.374-.021-.36-.025-.345-.03-.333-.033c-1.74-.196-2.933-.616-3.833-1.516-.9-.9-1.32-2.092-1.516-3.833l-.034-.333-.029-.346-.025-.36-.02-.373-.025-.588-.012-.41-.013-.644-.009-.915-.004-.98.001-3.313.003-.73.01-.914.007-.433.011-.418.014-.403.016-.388.021-.374.025-.36.03-.345.033-.333c.196-1.74.616-2.933 1.516-3.833.9-.9 2.092-1.32 3.833-1.516l.333-.034.346-.029.36-.025.373-.02.588-.025.41-.012.644-.013.915-.009ZM6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z"/></svg>`;
    this.whatsapp_com   = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;
    this.x_com          = `<svg viewBox="0 0 24 24"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg>`;
    this.youtube_com    = `<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    this.bsky_app       = this.bsky_social;
    this.discord_gg     = this.discord_com;
    this.github_io      = this.github_com;
    this.t_me           = this.telegram_org;
    this.youtu_be       = this.youtube_com;
  }

  function LanguageData(){

    this.getVal = function(val){
      if (this[val] === undefined){return val}
      const cl = userOptions.val('language');
      if(!this[val][cl]){
        return this[val]['ru'];
      }
      return this[val][cl];
    };

    this.getLangs = function(){
      let retVal = {};
      for(let a in this.JRAS_LANGLIST){
        retVal[a] = this.JRAS_LANGLIST[a];
      }
      return retVal;
    };

    this.JRAS_LANGLIST = {
      ru: 'Русский',
      en: 'English'
    };
    this.JRAS_POSTBLOCKBYUSER = {
      ru: 'Пост заблокированного пользователя: '
    };
    this.JRAS_TOGGLEBUTTONCAPTIONHIDE = {
      ru: 'Скрыть'
    };
    this.JRAS_TOGGLEBUTTONCAPTIONSHOW = {
      ru: 'Показать'
    };
    this.JRAS_EXTGIFTITLESIZESTR = {
      ru: 'Размер: '
    };
    this.JRAS_POSTBLOCKBYTAG = {
      ru: 'Пост заблокированый по тегам: '
    };
    this.JRAS_COMMBLOCKBYUSER = {
      ru: 'Комментарий заблокированного пользователя: '
    };
    this.JRAS_GUI_LANGUAGE = {
      ru: 'Язык интерфейса: '
    };
    this.JRAS_GUI_MAKEAVATARONOLDDESIGN = {
      ru: ' Создавать аватары для старого дизайна'
    };
    this.JRAS_GUI_MAKEAVATARONLYFULLPOST = {
      ru: ' Создавать аватары только для полного поста'
    };
    this.JRAS_GUI_AVATARHEIGHT = {
      ru: ' Размер аватара (px)'
    };
    this.JRAS_GUI_MAKETREECOMMENTS = {
      ru: ' Создавать дерево комментариев'
    };
    this.JRAS_GUI_CORRECTREDIRECTLINK = {
      ru: ' Раскрывать ссылки из редиректа'
    };
    this.JRAS_GUI_REMOVESHAREBUTTONS = {
      ru: ' Удалить кнопки "Поделиться..." (vk, fb, twitter и т.п.)'
    };
    this.JRAS_GUI_TREECOMMENTSONLYFULLPOST = {
      ru: ' Дерево комментариев только для полного поста'
    };
    this.JRAS_GUI_WHENCOLLAPSEMAKEREAD = {
      ru: ' При сворачивании ветки комментариев все дочерние помечаются прочитанными'
    };
    this.JRAS_GUI_FIXEDTOPBAR = {
      ru: ' Зафиксировать верхнюю панель наверху окна'
    };
    this.JRAS_GUI_HIDEFIXEDTOPBAR = {
      ru: ' Скрывать зафиксированную верхнюю панель'
    };
    this.JRAS_GUI_ISTOBELOADINGUSERDATA = {
      ru: ' Загружать данные пользователя для Tooltip\u0027а'
    };
    this.JRAS_GUI_HIDEUSERAWARDSWHEN = {
      ru: ' Если медалек больше чем: '
    };
    this.JRAS_GUI_MINSHOWUSERAWARDS = {
      ru: ' то показывать первые: '
    };
    this.JRAS_GUI_SHOWUTONLINE = {
      ru: ' Показывать в ленте'
    };
    this.JRAS_GUI_SHOWUTONCOMMENT = {
      ru: ' Показывать в комментариях'
    };
    this.JRAS_GUI_SHOWUTONPRIVATEMESS = {
      ru: ' Показывать на странице ПМ'
    };
    this.JRAS_GUI_SHOWUTONPEOPLE = {
      ru: ' Показывать на странице Люди'
    };
    this.JRAS_GUI_SHOWUTONSIDEBARTOPUSERS = {
      ru: ' Показывать в правом баре для юзеров топа'
    };
    this.JRAS_GUI_SHOWUTONSIDEBARONLINE = {
      ru: ' Показывать в правом баре для аватарок'
    };
    this.JRAS_GUI_SHOWUTONPOSTCONTROL = {
      ru: ' Показывать на авторе в блоке управления постом'
    };
    this.JRAS_GUI_SHOWHIDDENCOMMENTS = {
      ru: 'Загружать скрытые заминусованные коменты сразу'
    };
    this.JRAS_GUI_SHOWHIDDENCOMMENTSMARK = {
      ru: 'Отмечать загруженные коменты'
    };
    this.JRAS_GUI_EXTENDEDGIFLINKS = {
      ru: 'Ссылка на гифку как в новом дизижине'
    };
    this.JRAS_GUI_SHOWUTONTOPCOMMENTS = {
      ru: ' Показывать в правом баре для лучших коментов'
    };
    this.JRAS_GUI_ISTOBELOADINGTAGDATA = {
      ru: 'Загружать данные тега для Tooltip\u0027а'
    };
    this.JRAS_GUI_SHOWTTONLINE = {
      ru: 'Показывать в ленте'
    };
    this.JRAS_GUI_SHOWTTFULLPOST = {
      ru: 'Показывать в полном посте'
    };
    this.JRAS_GUI_SHOWTTONTRENDS = {
      ru: ' Показывать в правом баре для трендов'
    };
    this.JRAS_GUI_SHOWTTONLIKETAGS = {
      ru: ' Показывать в правом баре для любимых тегов'
    };
    this.JRAS_GUI_SHOWTTONINTERESTING = {
      ru: ' Показывать в правом баре для интересного'
    };
    this.JRAS_GUI_CHATLANETOPACAKI = {
      ru: ' Убирать цветовую отметку донатера'
    };
    this.JRAS_GUI_DELUSERCOMMENT = {
      ru: 'Скрывать комментарий без возможности просмотра'
    };
    this.JRAS_GUI_SHOWUSERNAMEDELCOMMENT = {
      ru: 'Показывать в заблокированном комментарии ник юзера'
    };
    this.JRAS_GUI_FULLDELUSERPOST = {
      ru: 'Удалять пост из ленты полностью'
    };
    this.JRAS_GUI_DELUSERPOST = {
      ru: 'Скрывать пост без возможности просмотра'
    };
    this.JRAS_GUI_SHOWUSERNAMEDELPOST = {
      ru: 'Показывать в заблокированном посте ник юзера'
    };
    this.JRAS_GUI_BLOCKUSERLIST = {
      ru: 'Заблокированные пользователи'
    };
    this.JRAS_GUI_BLOCKTAGLIST = {
      ru: 'Заблокированные теги'
    };
    this.JRAS_GUI_COLLAPSECOMMENTS = {
      ru: 'Уменьшать большие комментарии'
    };
    this.JRAS_GUI_COLLAPSECOMMENTSONLYFULLPOST = {
      ru: 'Уменьшать большие комментарии только в полном посте'
    };
    this.JRAS_GUI_COLLAPSECOMMENTWHENSIZE = {
      ru: 'Уменьшать если размер больше (px)'
    };
    this.JRAS_GUI_COLLAPSECOMMENTTOSIZE = {
      ru: 'Уменьшать до (px)'
    };
    this.JRAS_GUI_BTNSAVE = {
      ru: 'Сохранить'
    };
    this.JRAS_GUI_BTNSENDPMME = {
      ru: 'Отправить мне персональное сообщение'
    };
    this.JRAS_GUI_BTNDELETESETT = {
      ru: 'Удалить все сохраненные данные'
    };
    this.JRAS_GUI_BTNRESETSETT = {
      ru: 'Настройки по умолчанию'
    };
    this.JRAS_GUI_TABMAIN = {
      ru: 'Общие'
    };
    this.JRAS_GUI_TABBLOCK = {
      ru: 'Блокировки'
    };
    this.JRAS_GUI_TABTOOLTIP = {
      ru: 'Tooltip\u0027ы'
    };
    this.JRAS_GUI_TABCOMMENTS = {
      ru: 'Комментарии'
    };
    this.JRAS_GUI_TABSTYLE = {
      ru: 'Стиль'
    };
    this.JRAS_GUI_TABEXPIMP = {
      ru: 'Экспорт/Импорт'
    };
    this.JRAS_LOADINGUSERDATA = {
      ru: 'Загрузка данных...'
    };
    this.JRAS_SENDPRIVMESS = {
      ru: 'Отправить сообщение'
    };
    this.JRAS_ADDFRIEND = {
      ru: 'Добавить в друзья'
    };
    this.JRAS_REMOVEFRIEND = {
      ru: 'Удалить из друзей'
    };
    this.JRAS_ADDTAGFAV = {
      ru: 'Подписаться на тег'
    };
    this.JRAS_REMOVETAGFAV = {
      ru: 'Отписаться от тега'
    };
    this.JRAS_TOOLTIP_MODERATOR = {
      ru: 'Модератор...'
    };
    this.JRAS_TOOLTIP_TAGMODERATORS = {
      ru: 'Модераторы...'
    };
    this.JRAS_TOOLTIP_STATISTICS = {
      ru: 'Статистика: '
    };
    this.JRAS_TOOLTIP_POSTS = {
      ru: 'Постов (х/л): '
    };
    this.JRAS_TOOLTIP_COMMENTS = {
      ru: 'Комментариев:'
    };
    this.JRAS_TOOLTIP_REG = {
      ru: 'Регистрация: '
    };
    this.JRAS_TOOLTIP_LASTLOGIN = {
      ru: 'Посл. раз был: '
    };
    this.JRAS_BLOCKUSER_JR = {
      ru: 'Блокировать юзера (JR)'
    };
    this.JRAS_UNBLOCKUSER_JR = {
      ru: 'Разблокировать юзера (JR)'
    };
    this.JRAS_BLOCKUSER_JRAS = {
      ru: 'Блокировать юзера (JRAS)'
    };
    this.JRAS_UNBLOCKUSER_JRAS = {
      ru: 'Разблокировать юзера (JRAS)'
    };
    this.JRAS_BLOCKTAG_JR = {
      ru: 'Блокировать тег (JR)'
    };
    this.JRAS_UNBLOCKTAG_JR = {
      ru: 'Разблокировать тег (JR)'
    };
    this.JRAS_BLOCKTAG_JRAS = {
      ru: 'Блокировать тег (JRAS)'
    };
    this.JRAS_UNBLOCKTAG_JRAS = {
      ru: 'Разблокировать тег (JRAS)'
    };
    this.JRAS_COMMENTS_EXPANDCOLL_ALL = {
      ru: 'Свернуть/развернуть всё'
    };
    this.JRAS_SENDPMDIALOG_SENDBUTTON = {
      ru: 'Отправить'
    };
    this.JRAS_SENDPMDIALOG_CLOSEBUTTON = {
      ru: 'Закрыть'
    };
    this.JRAS_SENDPMDIALOG_HEADERCAPTION = {
      ru: 'Отправка сообщения для '
    };
    this.JRAS_SENDPMDIALOG_SENDMESS = {
      ru: 'Отправка данных...'
    };
    this.JRAS_GUI_PCBSHOWPOSTCONTROL = {
      ru: 'Блок управления постом'
    };
    this.JRAS_GUI_PCBSHOWINFULLPOST = {
      ru: 'Только в полном посте'
    };
    this.JRAS_GUI_PCBHIDEJRSHAREBLOCK = {
      ru: 'Скрывать блок шарных кнопок поста'
    };
    this.JRAS_GUI_PCBHIDEJRRATINGBLOCK = {
      ru: 'Скрывать блок рейтинга поста'
    };
    this.JRAS_GUI_PCBTOPBORDER = {
      ru: 'Верхний стопор для блока внутри поста (px)'
    };
    this.JRAS_GUI_PCBBOTTOMBORDER = {
      ru: 'Нижний стопор для блока внутри поста (px)'
    };
    this.JRAS_GUI_PCBTOPSCREENPOS = {
      ru: 'Верхняя позиция на экране (px)'
    };
    this.JRAS_ADDFAVORITE = {
      ru: 'Добавить в избранное'
    };
    this.JRAS_REMOVEFAVORITE = {
      ru: 'Удалить из избранного'
    };
    this.JRAS_GUI_SHOWCOMMENTDATE = {
      ru: 'Показывать в коменте его дату'
    };
    this.JRAS_GUI_PCBANIMATEMOVE = {
      ru: 'Анимировать перемещения блока'
    };
    this.JRAS_GUI_PCBANIMATEMOVESPEED = {
      ru: 'Скорость перемещения при анимации (1-9)'
    };
    this.JRAS_GUI_PCBHIDESHAREBUTOONS = {
      ru: 'Скрыть кнопки шары оставить только избранное'
    };
    this.JRAS_GUI_STCORRECTSTYLE = {
      ru: 'Корректировать дизайн и стиль сайта'
    };
    this.JRAS_GUI_STHIDESIDEBAR = {
      ru: 'Скрывать правое меню'
    };
    this.JRAS_GUI_STSTRETCHCONTENT = {
      ru: 'Растягивать контент по границам экрана'
    };
    this.JRAS_GUI_STSTRETCHSIZE = {
      ru: 'Растягивать контент на (%)'
    };
    this.JRAS_GUI_STSIDEBARSIZETOPAGE = {
      ru: 'Устанавливать высоту страницы по высоте правого меню'
    };
    this.JRAS_GUI_STSHOWSIDEBARONHIDECONTENT = {
      ru: 'Показывать правое меню когда контент вышел за границы'
    };
    this.JRAS_GUI_STUSEDYNSTYLECHANGES = {
      ru: 'Мне нужны только динамические эффекты нового стиля (я использую JRAS style)'
    };
    this.JRAS_GUI_STCENTERCONTENT = {
      ru: 'Центровать контент'
    };
    this.JRAS_GUI_EXPIMP = {
      ru: 'Данные экпорта/импорта'
    };
    this.JRAS_GUI_BTNIMPORT = {
      ru: 'Импортировать данные'
    };
    this.JRAS_GUI_CORRECTOLDREACTORLINK = {
      ru: 'Поправить ссылки на old.reactor'
    };
    this.JRAS_GUI_PREVIEWREACTORLINK = {
      ru: 'Превью для внутренних ссылок на посты и коменты'
    };
    this.JRAS_GUI_PREVIEWSIZEX = {
      ru: 'Размер тултипа превью по горизонтали. % от окна страницы'
    };
    this.JRAS_GUI_PREVIEWSIZEY = {
      ru: 'Размер тултипа превью по ветрикали. % от окна страницы'
    };
    this.JRAS_GUI_MAKEQUOTESONCOMMENTS = {
      ru: 'Цитаты из строк начинающихся с символа ">"'
    };
    this.JRAS_GUI_QUOTEPOPUPERHINT = {
      ru: 'Процитировать выделенный текст.\n Можно использовать хоткеи (перекрывает настройки)'
    };
    this.JRAS_GUI_MAKEEXTQUOTES = {
      ru: 'Расширенная цитата (заголовок + текст)'
    };
    this.JRAS_GUI_MAKEQUOTETOOL = {
      ru: 'Инструмент цитирования'
    };
    this.JRAS_GUI_QTADDUSERINFO = {
      ru: 'При цитировании добавлять информацию о пользователе, которого цитируют'
    };
    this.JRAS_GUI_QTINSERTINTOSHOWINGINPUT = {
      ru: 'Вставлять цитату в:'
    };
    this.JRAS_GUI_NEWANSWERALWAYS = {
      ru: 'открывать форму ответа на цитируемое сообщение [ctrl]'
    };
    this.JRAS_GUI_FINDOPENEDFORM = {
      ru: 'найти уже открытую форму ответа [shift]'
    };
    this.JRAS_GUI_ADDCOMMENTFORM = {
      ru: 'форму создания нового коментария [ctrl+shift]'
    };
    this.JRAS_GUI_VIDEOSOUNDOPTIONS = {
      ru: 'Управлять звуком на видео'
    };
    this.JRAS_VIDEO_SOUND_MUTE = {
      ru: 'Выключить звук'
    };
    this.JRAS_VIDEO_SOUND_UNMUTE = {
      ru: 'Включить звук'
    };
    this.JRAS_GUI_RESTARTVIDEOONUNMUTE = {
      ru: 'При включении звука начинать видео сначала'
    };
    this.JRAS_GUI_VIDEOSOUNDMUTEONPOSTSCROLL = {
      ru: 'Выключать звук когда пост уходит с экрана'
    };
    this.JRAS_GUI_VIDEOSOUNDMUTEONVIDEOSCROLL = {
      ru: 'Выключать звук когда видео уходит с экрана'
    };
    this.JRAS_GUI_AUTOUNMUTEVIDEONONE = {
      ru: 'Не включать звук автоматически'
    };
    this.JRAS_GUI_AUTOUNMUTEVIDEOONHALFSCREEN = {
      ru: 'Автоматически включать звук при 50% видимости видео'
    };
    this.JRAS_GUI_AUTOUNMUTEVIDEOONSCREENMIDDLE = {
      ru: 'Автоматически включать звук при пересечении середины экрана'
    };
    this.JRAS_GUI_SHOWUSERLINKS = {
      ru: 'Загружать пользовательские ссылки'
    };
    this.JRAS_GUI_SHOWUSERLINKSPROGRESSBAR = {
      ru: 'Показывать прогрессбар ожидания загрузки пользовательских ссылок'
    };
    this.JRAS_GUI_LOADFAVORITEICOFORUSERLINKS = {
      ru: 'Пытаться загрузить favicon.ico для неизвестных сайтов'
    };
    this.JRAS_GUI_SHOWUSERLINKSONPOST = {
      ru: 'Пользовательские ссылки на посте'
    };
    this.JRAS_GUI_SHOWUSERLINKSONCOMMENT = {
      ru: 'Пользовательские ссылки в комментариях'
    };
    this.JRAS_GUI_SHOWUSERLINKSCOUNT = {
      ru: 'Показывать только это количество ссылок (0=все): '
    };
  }

  $(window).on('load', function () {
    correctPageHeight();
  });

}(typeof unsafeWindow != undefined ? unsafeWindow : window));
