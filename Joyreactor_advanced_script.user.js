// ==UserScript==
// @name        Joyreactor advanced script
// @namespace   joyreactor.cc
// @description comment tree collapse, remove/hide posts/comments by username/tag, remove share buttons and more
// @description http://joyreactor.cc/tag/jras
// @include     *reactor.cc*
// @include     *joyreactor.cc*
// @include     *jr-proxy.com*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require     https://code.jquery.com/ui/1.11.4/jquery-ui.min.js
// @version     1.6.7
// @author      AntiUser (http://joyreactor.cc/user/AntiUser)
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// @grant       GM_xmlhttpRequest
// ==/UserScript==

const JRAS_CurrVersion = '1.6.7';

/* RELEASE NOTES
 1.6.7
   + Показывать в правом баре для лучших коментов [true]
   + Загружать данные тега для Tooltip'а [true]
   + Показывать в ленте [true]
   + Показывать в полном посте [true]
   + Показывать в правом баре для трендов [true]
   + Показывать в правом баре для любимых тегов [true]
   + Показывать в правом баре для интересного [true]
 1.6.0
   + Tooltip'ы для тегов
 1.5.23
   * fix таблиц с гифками на олде
   + версия скрипта в заголовке окна скрипта
 1.5.21
   + fix таблиц на олде
   * поправлено определение цветовой гаммы страницы
 1.5.19
   + user tooltip на лучшем комменте
 1.5.18
   * исправлен регексп определения стиля страницы
 1.5.17
   * поддержка сайта old.jr-proxy.com
 1.5.16
   * опечатки
 1.5.15
   + Скрывать комментарий без возможности просмотра [false]
   + Показывать в заблокированном комментрарии ник юзера [true]
   + Удалять пост из ленты полностью [false]
   + Скрывать пост без возможности просмотра [false]
   + Показывать в заблокированном посте ник юзера [true]
 1.5.12
   + Определение логина юзера по ссылке, а не по тексту (в свете Soldat AntiUser)
 1.5.11
   + В Tooltip'е юзера отметка о том Online ли он или нет (красный - нет, зеленый - да)
 1.5.10
   * Анимация показа/скрытия верхней панели
   + Опция удаление Share buttons [false]
 1.5.8
   + Теперь работает на странице "Обсуждаемое"
 1.5.7
   + Показывать аватары пользователей в комментариях [true] (ТОЛЬКО СТАРЫЙ ДИЗАЙН)
   + Показывать аватары только в полном посте [false] (ТОЛЬКО СТАРЫЙ ДИЗАЙН)
   + Размер показываемых аватаров в пикселях [35] (ТОЛЬКО СТАРЫЙ ДИЗАЙН)
   + Опция показывать сразу скрытые заминусованные коменты [false]
   + Опция отмечать раскрытые заминусованные коменты [true]
   * Поменял жирноту в Tooltip'е юзера
   * Вернул на гифки линк "Ссылка на гифку" в старом дизайне
   * мелкие исправления
 1.5.0
   + В Tooltip'е юзера информация модератор ли
   + В Tooltip'е юзера информация из блока "Профиль"
 1.4.11
   * разрешил уменьшение комментариев для хрома
   * обработка редиректных ссылок везде, а не только в посте
 1.4.10
   * при сворачивании к паренту (collapseToParent) не учитывалось текущее состояние ветвей и
     некотрые ветви разворачивались если были свернуты
 1.4.9
   + добавлен новый адрес на котором работает скрипт - jr-proxy.com
   + свернуть/развернуть все комментарии
   + раскрытие редиректных ссылок. опция - [true]
   + опция уменьшать комментарии только в полном посте [false]
 1.4.3
   + Уменьшение комментариев при раскрытии их в ленте (кроме хрома)
   * мелкие исправления
 1.4.0
   + Уменьшение больших комментариев (опционально)
   + Новые опции
   - Уменьшать большие комментарии [true]
   - Уменьшать если размер больше (px) [110]
   - Уменьшать до (px) [72]
 1.3.18
   + Диалог настроек закрывается при нажатии "сохранить"
 1.3.17
   + опция "Убирать цветовую отметку донатера" в тултипах [false]
   + опция при каком количестве медальки скрывать [60] (0 - показывать все)
   * опция сколько показывать, если скрывать  [40]
   * добавлены кнопки в GUI настроек
   - Отправить мне персональное сообщение
   - Удалить все сохраненные данные
   - Настройки по умолчанию
   * поправлены медальки в тултипе
   + дерево комментариев теперь строится также и в старом дизайне при разворачивании коментов в ленте
   + для комментариев маленькая кнопка collapseToParent при отсутствии большой collapseNode рисуется выше
   * поправлена высота ника в тултипе
   * мелкие исправления
 1.3.6
   + сворачивание комментариев наверх к паренту
   * не блокировался юзер в комментариях при раскрытии их в ленте в новом дизайне
 1.3.2
   + отправка сообщения пользователю из tooltip'а
   + возможность ограничить количество сразу выводимых в tooltip'е медалек
   + плавающая верхняя панель в новой дизайне
   + автоматическая отметка комментариев как прочитанных при сворачивании ветки
   + настройки сохраняются для каждого пользователя реактора отдельно
   + добавлены опции для настройки работы скрипта
   - создавать ли дерево комментариев [true]
   - дерево комментариев только для полного поста (в ленте при раскрытии не будет создаваться) [false]
   - когда ветка комментариев сворачивается все дочерние коменты помечаются прочитанными [true]
   - загружать ли данные пользователя для Tooltip'а [true]
   - сколько медалек показывать при загрузке [40] (0 - все)
   - зафиксировать верхнюю панель наверху окна (только новый дизайн) [true]
   - скрывать зафиксированную верхнюю панель (только новый дизайн) [true]
   - показывать Tooltip'ы в ленте [true]
   - показывать Tooltip'ы в комментариях [true]
   - показывать Tooltip'ы на странице ПМ [true]
   - показывать Tooltip'ы на странице Люди [true]
   - показывать Tooltip'ы в правом баре для юзеров топа [true]
   - показывать Tooltip'ы в правом баре для аватарок [true]
   * мелкие исправления
 1.2.3
   - некоторый фунционал был удален
   Если вы обнаружили его недостачу и он вам нужен - пишите ПМ
 1.2.2
   * добавиил tooltip'ы на:
   - страница личных сообщений
   - страница люди
   - топы в правой колонке
   - на авах в правой колонке
   * мелкие исправления
 1.2.0
   + просмотр информации по пользователю при наведении мыши на его ник
   + возможность добавить в друзья, заблокировать пользователя из tooltip'а
   * мелкие исправления
 1.1.3
   * в хроме на новом дизайне не строилось дерево комментариев при раскрытии их в ленте
   * по той же причине не блокировались комментарии пользователей
 1.1.0
   + GUI для настройки JRAS
   * не блокировались теги на новом дизайне
 1.0.6
   * в список заблокированных тегов, котрый выводится при блокировке поста
     могло попасть содержимое поста, а не только теги
 1.0.5
   * в случае нахождения блокированного юзера в коментах, мог быть заблокирован пост
 1.0.2
   * Не работал в хроме из-за неверного определения адреса документа
 1.0.0
   + release


 TODO:
   Свое избранное
   переработать блокировку тегов
   Экспорт/импорт настроек
 Хотелки
   * при добавлении комментария (на олде) аватарка у нового коммента не отображается
   * для олда бы кнопку добавления в избранное перенести в конец поста
   * блок управления постом отвязать от контента и привязать к экрану
 */

(function(){

  'use strict';

  console.log(' ================ start JRAS - ');

  const defLoadTooltipSize = 212;
  const defUserTooltipSize = 212;
  const defTagTooltipSize = 270;

  const lng = new LanguageData();
  const page = new PageData();

  const userOptions = initOptions();
  userOptions.loadUserData(page.currentUser);

  addNewCSSClasses();
  themeDependentCSS();
  makePropElements();
  makeAllUserTooltip();
  makeAllTagTooltip();
  procTopbar();
  removeRedirectLink();
  removeShareButtons();

  if (page.pageIs('post') || page.pageIs('discussion')){
    showHiddenComments();
    correctImageInComment();
    correctCommentSize();
    makeTreeComments();
    makeAvatarOnOldDesign();
  }

  let blockUsersAsFindStr = 'a:contains(' + userOptions.data.BlockUsers.join('), a:contains(') + ')';
  userRemove(userOptions.data.BlockUsers);
  tagRemove(userOptions.data.BlockTags, true);

  subscribeShowComment();

  console.log(' ================ end JRAS');


  //=====================================================================================================

  function initOptions(){
    const retVal = {
      data: {
        currentLng: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SELECTLANGUAGE')
          }
        },
        correctRedirectLink: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_CORRECTREDIRECTLINK')
          }
        },
        removeShareButtons: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_REMOVESHAREBUTTONS')
          }
        },
        makeAvatarOnOldDesign: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_MAKEAVATARONOLDDESIGN')
          }
        },
        makeAvatarOnlyFullPost: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_MAKEAVATARONLYFULLPOST')
          }
        },
        avatarHeight: {
          dt: null,
          validator: function(val){
            return $.isNumeric(val) && val >= 5 && val <= 300;
          },
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_AVATARHEIGHT')
          }
        },
        makeTreeComments: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_MAKETREECOMMENTS')
          }
        },
        treeCommentsOnlyFullPost: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_TREECOMMENTSONLYFULLPOST')
          }
        },
        whenCollapseMakeRead: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_WHENCOLLAPSEMAKEREAD')
          }
        },
        isToBeLoadingUserData: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_ISTOBELOADINGUSERDATA')
          }
        },
        hideUserAwardsWhen: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_HIDEUSERAWARDSWHEN')
          }
        },
        minShowUserAwards: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_MINSHOWUSERAWARDS')
          }
        },
        fixedTopbar: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_FIXEDTOPBAR')
          }
        },
        hideFixedTopbar: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_HIDEFIXEDTOPBAR')
          }
        },
        showUTOnLine: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWUTONLINE')
          }
        },
        showUTOnComment: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWUTONCOMMENT')
          }
        },
        showUTOnPrivateMess: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWUTONPRIVATEMESS')
          }
        },
        showUTOnPeople: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWUTONPEOPLE')
          }
        },
        showUTOnSidebarTopUsers: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWUTONSIDEBARTOPUSERS')
          }
        },
        showUTOnTopComments: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWUTONTOPCOMMENTS')
          }
        },
        showUTOnSidebarOnline: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWUTONSIDEBARONLINE')
          }
        },
        showHiddenComments: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWHIDDENCOMMENTS')
          }
        },
        showHiddenCommentsMark: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWHIDDENCOMMENTSMARK')
          }
        },
        isToBeLoadingTagData: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_ISTOBELOADINGTAGDATA')
          }
        },
        showTTOnTrends: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWTTONTRENDS')
          }
        },
        showTTOnLikeTags: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWTTONLIKETAGS')
          }
        },
        showTTOnInteresting: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWTTONINTERESTING')
          }
        },
        showTTOnLine: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWTTONLINE')
          }
        },
        showTTFullPost: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWTTFULLPOST')
          }
        },
        delUserComment: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_DELUSERCOMMENT')
          }
        },
        showUserNameDelComment: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWUSERNAMEDELCOMMENT')
          }
        },
        fullDelUserPost: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_FULLDELUSERPOST')
          }
        },
        delUserPost: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_DELUSERPOST')
          }
        },
        showUserNameDelPost: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_SHOWUSERNAMEDELPOST')
          }
        },
        chatlaneToPacaki: {   // Убирать цветовую отметку донатера
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_CHATLANETOPACAKI')
          }
        },
        collapseComments: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_COLLAPSECOMMENTS')
          }
        },
        collapseCommentsOnlyFullPost: {
          dt: null,
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_COLLAPSECOMMENTSONLYFULLPOST')
          }
        },
        collapseCommentWhenSize: {
          dt: null,
          validator: function(val){
            return $.isNumeric(val) && val >= 20 && val <= 10000;
          },
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_COLLAPSECOMMENTWHENSIZE')
          }
        },
        collapseCommentToSize: {
          dt: null,
          validator: function(val){
            return $.isNumeric(val) && val >= 20 && val <= 10000;
          },
          guiDesc: function(){
            return lng.getVal('JRAS_GUI_COLLAPSECOMMENTTOSIZE')
          }
        },
        BlockUsers: [],
        BlockTags: []
      },

      val: function(option, value){
        if(this.data[option]){
          if(value === undefined){
            return this.data[option].dt
          }else{
            if (this.data[option]['validator']){
              if (this.data[option].validator(value)){
                this.data[option].dt = value;
              }
            }else{
              this.data[option].dt = value;
            }
          }
        }
      },
      getGuiDesc: function(option){
        return this.data[option].guiDesc();
      },

      setDef: function(){
        this.data.currentLng.dt = 'ru';
        this.data.correctRedirectLink.dt = true;
        this.data.removeShareButtons.dt = false;
        this.data.makeAvatarOnOldDesign.dt = true;
        this.data.makeAvatarOnlyFullPost.dt = false;
        this.data.avatarHeight.dt = 35;
        this.data.makeTreeComments.dt = true;
        this.data.treeCommentsOnlyFullPost.dt = false;
        this.data.whenCollapseMakeRead.dt = true;
        this.data.isToBeLoadingUserData.dt = true;
        this.data.hideUserAwardsWhen.dt = 60;
        this.data.minShowUserAwards.dt = 40;
        this.data.fixedTopbar.dt = true;
        this.data.hideFixedTopbar.dt = true;
        this.data.showUTOnLine.dt = true;
        this.data.showUTOnComment.dt = true;
        this.data.showUTOnPrivateMess.dt = true;
        this.data.showUTOnPeople.dt = true;
        this.data.showUTOnSidebarTopUsers.dt = true;
        this.data.showUTOnSidebarOnline.dt = true;
        this.data.showHiddenComments.dt = false;
        this.data.showHiddenCommentsMark.dt = true;
        this.data.showUTOnTopComments.dt = true;
        this.data.isToBeLoadingTagData.dt = true;
        this.data.showTTOnLine.dt = true;
        this.data.showTTFullPost.dt = true;
        this.data.showTTOnTrends.dt = true;
        this.data.showTTOnLikeTags.dt = true;
        this.data.showTTOnInteresting.dt = true;
        this.data.chatlaneToPacaki.dt = false;
        this.data.delUserComment.dt = false;
        this.data.showUserNameDelComment.dt = true;
        this.data.fullDelUserPost.dt = false;
        this.data.delUserPost.dt = false;
        this.data.showUserNameDelPost.dt = true;
        this.data.collapseComments.dt = false;
        this.data.collapseCommentsOnlyFullPost.dt = false;
        this.data.collapseCommentWhenSize.dt = 110;
        this.data.collapseCommentToSize.dt = 72;
        this.data.BlockUsers = [];
        this.data.BlockTags = [];
      },

      removeAllSavedData: function(){
        this.removeSavedUserData();
      },

      removeSavedUserData: function(user){
        let pref = (user === undefined) ? '' : user + '_';
        let keys = GM_listValues();
        for(let i = 0; i < keys.length; i++){
          let key = keys[i];
          if(key.match(new RegExp(pref + '.*'))){
            GM_deleteValue(key);
          }
        }
      },

      saveUserData: function(forUser){
        this.removeSavedUserData(forUser);
        const pref = forUser + '_';

        for(let i in this.data){
          if((i === undefined) || (i == 'BlockUsers') || (i == 'BlockTags')){
            continue
          }
          GM_setValue(pref + i, this.data[i].dt);
        }
        for(let i = 0; i < this.data.BlockUsers.length; i++){
          GM_setValue(pref + 'BlockUsers_name_' + i, this.data.BlockUsers[i]);
        }
        for(let i = 0; i < this.data.BlockTags.length; i++){
          GM_setValue(pref + 'BlockTags_name_' + i, this.data.BlockTags[i]);
        }
      },

      loadUserDataFrom: function(prefix){
        let retVal = false;
        const posf = '.*';

        let keys = GM_listValues();
        this.data.BlockUsers = [];
        this.data.BlockTags = [];
        for(let i = 0; i < keys.length; i++){
          let key = keys[i];
          if(!key.match(new RegExp(prefix + posf))){
            continue
          }
          if(key.match(new RegExp(prefix + 'BlockUsers_name_' + posf))){
            this.data.BlockUsers.push(GM_getValue(key, ''));
          }else{
            if(key.match(new RegExp(prefix + 'BlockTags_name_' + posf))){
              this.data.BlockTags.push(GM_getValue(key, ''));
            }else{
              const rkey = key.replace(prefix, '');
              if(this.data[rkey] === undefined){
                continue
              }
              this.data[rkey].dt = GM_getValue(key, this.data[rkey]);
              retVal = true;
            }
          }
        }
        this.data.BlockUsers.sort();
        this.data.BlockTags.sort();
        return retVal;
      },

      loadUserData: function(forUser){
        if(this.loadUserDataFrom(forUser + '_')){
          return
        }
        if(this.loadUserDataFrom(forUser)){
          this.saveUserData(forUser);
        }
      }

    };

    retVal.setDef();
    return retVal;
  }

  function removeRedirectLink($inElm){
    if(!userOptions.val('correctRedirectLink')){
      return;
    }
    let $selElmts;
    if ($inElm === undefined){
      $selElmts = $(('a[href*="redirect?"]'));
    } else{
      $selElmts = $inElm.find('a[href*="redirect?"]');
    }
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

  function removeShareButtons(){
    if(!userOptions.val('removeShareButtons')){
      return;
    }
    removeElementsByClass('a', ['share_vk', 'share_fb', 'share_twitter', 'share_mail']);
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

  function removeElementsByClass(elm, removeClassArr){
    if(removeClassArr == null){
      return
    }
    for(let i = 0; i < removeClassArr.length; i++){
      $(elm + '.' + removeClassArr[i]).each(function(){
        $(this).remove();
      })
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
            let a = $(window).scrollTop() < 38 ? -$(window).scrollTop() : '-40px';
            $(this).find('.topbar_inner').css('top', e.type === 'mouseenter' ? '0' : a);
            a = $(window).scrollTop() < 38 ? 45 - $(window).scrollTop() : '10px';
            $(this).css('height', e.type === 'mouseenter' ? '45px' : a);
          });
          if ($(window).scrollTop() < 38){
            $topbar.mouseenter();
            $topbar.mouseleave();
          }
        };
        checkPos();
        $(window).scroll(function(){
          checkPos();
        });
      }
    }
  }

  function userRemove(userNameArr){
    let currentUser;
    $(blockUsersAsFindStr).parent('div.uhead_nick').closest('div.article').each(function(idx, elm){
      currentUser = $(this).find(blockUsersAsFindStr).text();
      if(userNameArr.indexOf(currentUser) != -1){
        if (userOptions.val('fullDelUserPost')){
          $(this).remove();
          return;
        }
        elm.parentElement.style.paddingBottom = '40px';
        makeBlockPostElements(elm, elm.parentElement.id, lng.getVal('JRAS_POSTBLOCKBYUSER'), currentUser, '', false);
        console.info('  user - ' + currentUser + ' : hide post - ' + elm.parentElement.id);
        $(this).hide();
      }
    });
    $(blockUsersAsFindStr).parent('span.reply-link').closest('div[id^=comment_txt_].txt').each(function(idx, elm){
      currentUser = $(this).find(blockUsersAsFindStr).text();
      if(userNameArr.indexOf(currentUser) != -1){
        //       $(this).remove(); // для просто удаления. Будет пустой комент
        //       return;
        makeBlockCommElements(elm, elm.parentElement.id, lng.getVal('JRAS_COMMBLOCKBYUSER'), currentUser);
        console.info('  user - ' + currentUser + ' : hide comment - ' + elm.parentElement.id);
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
        console.info('hide post by tag - ' + foundTagStr);
        $(this).hide();
      }
    })
  }

  function correctImageInComment(){
    //$('div[id^=comment].comment>div[id^=comment_txt_].txt>div.image').each(function(idx, elm){
    //console.log(elm);
    //})
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
      elm.click();
      if (userOptions.val('showHiddenCommentsMark')){
        let $parElm = $(elm).parent('div[id^=comment].txt');
        if (page.isNewDesign && userOptions.val('collapseComments')){
          $parElm = $(elm).parent().parent('div[id^=comment].txt');
          if (userOptions.val('collapseCommentsOnlyFullPost') && !page.pageIs('post')){
            $parElm = $(elm).parent('div[id^=comment].txt');
          }
        }
        $parElm.css({'color': 'rgb(255, 57, 57)'});
      }
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
        .after('<div id="jras-commSizer-sizer-all" title="' + lng.getVal('JRAS_COMMENTS_EXPANDCOLL_ALL') + '" class="jras-comment-expand-all jras-comment-expand-all-img"></div><div id="jras-commSizer-sizer" class="jras-comment-sizer"></div>')
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
            if (!opt.correctPos) {return}
            const tmp = $(this).closest('div[id^=comment].comment').offset().top;
            if(tmp < unsafeWindow.pageYOffset){
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
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    const observer = new MutationObserver(function(mutations){
      mutations.forEach(function(mutation){
        if (mutation.type === 'childList'){

          setTimeout(function(){


              if (userOptions.val('showUTOnComment')){
                makeUserTooltips($(mutation.addedNodes).find('span.reply-link > a:first-child'), 'a');
              }
              for (let i = 0; i < mutation.addedNodes.length; i++){
                const itm = mutation.addedNodes[i];

                removeRedirectLink($(itm));
                showHiddenComments($(itm));

                if (userOptions.val('collapseComments')
                  && !userOptions.val('collapseCommentsOnlyFullPost')
                //&& !page.isChrome // в хроме не работает. Не хочу разбираться возвращает хз какой height
                ){
                  $(itm).find('div[id^=comment].comment>div[id^=comment_txt_].txt').each(function(idx, elm){
                    makeCommentSizer(elm);
                  })
                }

                if ($(itm).is('div[id^=comment_list_post].comment_list_post')){
                  $(itm).find('div[id^=comment].comment').each(function(idx, elm){
                    if (userOptions.val('makeTreeComments') && !userOptions.val('treeCommentsOnlyFullPost')){
                      makeTreeCommentNode(elm, elm.id.replace('comment', ''));
                    }
                    if (userOptions.val('makeAvatarOnOldDesign') && !userOptions.val('makeAvatarOnlyFullPost')){
                      makeAvatarOnOldDesign(elm);
                    }
                  })
                }

                $(itm).find(blockUsersAsFindStr).closest('div[id^=comment_txt_].txt').each(function(idx, elm){
                  const currUser = $.trim($(this).find(blockUsersAsFindStr).text());
                  if (userOptions.data.BlockUsers.indexOf(currUser) != -1){
                    makeBlockCommElements(elm, elm.parentElement.id, lng.getVal('JRAS_COMMBLOCKBYUSER'), currUser);
                    $(this).hide();
                  }
                })
              }

            }, 10
          );


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
              scrollTop: $par.prev().offset().top - (unsafeWindow.innerHeight / 4)
            }, {
              complete: function(){
                if($(elm).offset().top > unsafeWindow.pageYOffset + unsafeWindow.innerHeight){
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
      $avaOldElm.before(`<img class="avatarForOldDesign" src="/pics/avatar/user/${$elm.attr('userid')}" title="${$avaOldElm.attr('title')}">`);
      const $avaNewElm =  $elm.find('>img.avatarForOldDesign');

      $avaNewElm.css({'height': userOptions.val('avatarHeight') + 'px'});
      //if(!userOptions.val('makeTreeComments')){
      //  $avaNewElm.css({'margin-left': '-16px'});
      //}
      $elm.find('>div[id^=comment_txt_].txt>span:not([class]):first').after('<br>');
      $avaOldElm.remove();
    }
  }

  function makePropElements(){
    if(page.isNewDesign){
      $('div.topbar_right:first div.lang_select').after(
        '<label id="jras_prop-button" style="cursor: pointer;" class="lang_select" for="modal-1">JRAS</label>'
      );
      $('label#jras_prop-button').click(openProp);
    }else{
      $('div#header:first div.lang_select').after(`
        <label id="navcontainer" class="lang_select" for="modal-1"
          style="cursor: pointer; right: 39px; padding: 1px 2px 2px;
          font-size: 9px; border-radius: 0 0 5px 5px; height: 17px; cursor: pointer;
          background: transparent url('../images/mainmenu_active_bg1.png') repeat-x scroll 0 0;">
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
                </ul>
                <div id="jras-prop-gui-tab-1" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section">
                      <span id="jras-gui-SelectLngCaption" style="vertical-align: middle;"></span>
                      <select id="jras-gui-SelectLngcbb" name="jras-lngSelect" style="vertical-align: middle; width: 30%;height: 1.4em;;">
                      </select>
                    </section>
                    <section class="jras-prop-gui-section">
                      <input id="jras-gui-removeShareButtonsVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-removeShareButtonsCaption" for="jras-gui-removeShareButtonsVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section">
                      <input id="jras-gui-fixedTopbarVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-fixedTopbarCaption" for="jras-gui-fixedTopbarVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      <input id="jras-gui-hideFixedTopbarVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-hideFixedTopbarCaption" for="jras-gui-hideFixedTopbarVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section">
                      <input id="jras-gui-correctRedirectLinkVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-correctRedirectLinkCaption" for="jras-gui-correctRedirectLinkVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section">
                      <input id="jras-gui-showHiddenCommentsVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showHiddenCommentsCaption" for="jras-gui-showHiddenCommentsVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      <input id="jras-gui-showHiddenCommentsMarkVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showHiddenCommentsMarkCaption" for="jras-gui-showHiddenCommentsMarkVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                  </div>
                </div>
                <div id="jras-prop-gui-tab-2" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section">
                      <input id="jras-gui-delUserCommentVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-delUserCommentCaption" for="jras-gui-delUserCommentVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-top: -10px;">
                      <input id="jras-gui-showUserNameDelCommentVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showUserNameDelCommentCaption" for="jras-gui-showUserNameDelCommentVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-top: -10px;">
                      <input id="jras-gui-fullDelUserPostVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-fullDelUserPostCaption" for="jras-gui-fullDelUserPostVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-top: -10px;">
                      <input id="jras-gui-delUserPostVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-delUserPostCaption" for="jras-gui-delUserPostVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-top: -10px;">
                      <input id="jras-gui-showUserNameDelPostVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showUserNameDelPostCaption" for="jras-gui-showUserNameDelPostVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
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
                    <section class="jras-prop-gui-section">
                      <input id="jras-gui-isToBeLoadingUserDataVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-isToBeLoadingUserDataCaption" for="jras-gui-isToBeLoadingUserDataVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      <input id="jras-gui-showUTOnLineVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showUTOnLineCaption" for="jras-gui-showUTOnLineVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <input id="jras-gui-showUTOnCommentVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showUTOnCommentCaption" for="jras-gui-showUTOnCommentVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <input id="jras-gui-showUTOnPrivateMessVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showUTOnPrivateMessCaption" for="jras-gui-showUTOnPrivateMessVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <input id="jras-gui-showUTOnPeopleVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showUTOnPeopleCaption" for="jras-gui-showUTOnPeopleVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <input id="jras-gui-showUTOnSidebarTopUsersVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showUTOnSidebarTopUsersCaption" for="jras-gui-showUTOnSidebarTopUsersVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <input id="jras-gui-showUTOnSidebarOnlineVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showUTOnSidebarOnlineCaption" for="jras-gui-showUTOnSidebarOnlineVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <span id="jras-gui-hideUserAwardsWhenCaption" style="vertical-align: middle;"></span>
                      <select id="jras-gui-hideUserAwardsWhencbb" name="jras-hideUserAwardsWhen" style="vertical-align: middle; width: 60px;height: 20px;">
                      </select>
                      <span id="jras-gui-minShowUserAwardsCaption" style="vertical-align: middle;margin-left: 3px;"></span>
                      <select id="jras-gui-minShowUserAwardscbb" name="jras-minShowUserAwards" style="vertical-align: middle; width: 60px;height: 20px;">
                      </select>
                      <br>
                      <input id="jras-gui-chatlaneToPacakiVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-chatlaneToPacakiCaption" for="jras-gui-chatlaneToPacakiVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <input id="jras-gui-showUTOnTopCommentsVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showUTOnTopCommentsCaption" for="jras-gui-showUTOnTopCommentsVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-top: -10px;">
                      <input id="jras-gui-isToBeLoadingTagDataVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-isToBeLoadingTagDataCaption" for="jras-gui-isToBeLoadingTagDataVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>     
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      <input id="jras-gui-showTTOnLineVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showTTOnLineCaption" for="jras-gui-showTTOnLineVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <input id="jras-gui-showTTFullPostVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showTTFullPostCaption" for="jras-gui-showTTFullPostVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <input id="jras-gui-showTTOnTrendsVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showTTOnTrendsCaption" for="jras-gui-showTTOnTrendsVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <input id="jras-gui-showTTOnLikeTagsVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showTTOnLikeTagsCaption" for="jras-gui-showTTOnLikeTagsVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <input id="jras-gui-showTTOnInterestingVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-showTTOnInterestingCaption" for="jras-gui-showTTOnInterestingVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>  
                  </div>
                </div>
                <div id="jras-prop-gui-tab-4" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section">
                      <input id="jras-gui-makeTreeCommentsVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-makeTreeCommentsCaption" for="jras-gui-makeTreeCommentsVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      <input id="jras-gui-treeCommentsOnlyFullPostVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-treeCommentsOnlyFullPostCaption" for="jras-gui-treeCommentsOnlyFullPostVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section">
                      <input id="jras-gui-makeAvatarOnOldDesignVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-makeAvatarOnOldDesignCaption" for="jras-gui-makeAvatarOnOldDesignVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      <input id="jras-gui-makeAvatarOnlyFullPostVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-makeAvatarOnlyFullPostCaption" for="jras-gui-makeAvatarOnlyFullPostVal" style="cursor: pointer;vertical-align: middle;"> </label>
                      <br>
                      <span id="jras-gui-avatarHeightCaption" style="vertical-align: middle;margin-left: 3px;line-height: 28px;"></span>
                      <input id="jras-gui-avatarHeightVal" type="number" min="5" max="300" style="width: 50px; vertical-align: middle;"/>
                    </section>
                    <section class="jras-prop-gui-section">
                      <input id="jras-gui-whenCollapseMakeReadVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-whenCollapseMakeReadCaption" for="jras-gui-whenCollapseMakeReadsVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section">
                      <input id="jras-gui-collapseCommentsVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-collapseCommentsCaption" for="jras-gui-collapseCommentsVal" style="cursor: pointer;vertical-align: middle;"> </label>
                    </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      <input id="jras-gui-collapseCommentsOnlyFullPostVal" type="checkbox" style="vertical-align: middle;"/>
                      <label id="jras-gui-collapseCommentsOnlyFullPostCaption" for="jras-gui-collapseCommentsOnlyFullPostVal" style="cursor: pointer;vertical-align: middle;line-height: 28px;"> </label>
                      <br>
                      <span id="jras-gui-collapseCommentWhenSizeCaption" style="vertical-align: middle;margin-left: 3px;"></span>
                      <input id="jras-gui-collapseCommentWhenSizeVal" type="number" min="20" max="500" style="width: 50px; vertical-align: middle;"/>
                      <br>
                      <span id="jras-gui-collapseCommentToSizeCaption" style="vertical-align: middle;margin-left: 3px;line-height: 28px;"></span>
                      <input id="jras-gui-collapseCommentToSizeVal" type="number" min="20" max="500" style="width: 50px; vertical-align: middle;"/>
                    </section>
                  </div>
                </div>
              </div>
            </div>
            <div  id="jras-prop-gui-bottomCcontent" class="jras-prop-gui-contentBottom">
              <input id="jras-gui-SaveSettings" style="padding-left: 20px; padding-right: 20px; height: 22px;" class="jras-prop-gui-button-right" value="" type="button">
            </div>
          </div>
        </div>
      </div>
   `);

    const $propDialog = $('#jras-prop-gui-dialog');
    $propDialog.find('select#jras-gui-SelectLngcbb').append(lng.getHTMLListLangs());
    $propDialog.find('select#jras-gui-hideUserAwardsWhencbb').append(getHideAwardsCountList());
    $propDialog.find('select#jras-gui-minShowUserAwardscbb').append(getShowAwardsCountList());

    $propDialog.find('[id*=jras-tabs-nav-]').click(function(){
      $propDialog.find('#jras-prop-gui-tabs').tabs({active: $(this).attr('id').replace('jras-tabs-nav-', '')});
    });

    if(page.isSchemeLight()){
      $propDialog.find('[id*=jras-prop-gui-tab]').css('color', '#686868');
    }else{
      $propDialog.find('[id*=jras-prop-gui-tab]').css('color', '#BBBBBB');
    }
    if(!page.isNewDesign){
      $propDialog.find('ul.jras-tabs-nav li a').css('padding-top', '11px');
    }

    makeServiceGUIButton();
    updateGuiLocalize();

  }

  function openProp(){
    const $propDialog = $('#jras-prop-gui-dialog');
    $propDialog.find('#jras-gui-SelectLngcbb').val(userOptions.val('currentLng'));
    $propDialog.find('#jras-gui-correctRedirectLinkVal').prop('checked', userOptions.val('correctRedirectLink'));
    $propDialog.find('#jras-gui-removeShareButtonsVal').prop('checked', userOptions.val('removeShareButtons'));
    $propDialog.find('#jras-gui-makeTreeCommentsVal').prop('checked', userOptions.val('makeTreeComments'));
    $propDialog.find('#jras-gui-treeCommentsOnlyFullPostVal').prop('checked', userOptions.val('treeCommentsOnlyFullPost'));
    $propDialog.find('#jras-gui-makeAvatarOnOldDesignVal').prop('checked', userOptions.val('makeAvatarOnOldDesign'));
    $propDialog.find('#jras-gui-makeAvatarOnlyFullPostVal').prop('checked', userOptions.val('makeAvatarOnlyFullPost'));
    $propDialog.find('#jras-gui-avatarHeightVal').val(userOptions.val('avatarHeight'));
    $propDialog.find('#jras-gui-whenCollapseMakeReadVal').prop('checked', userOptions.val('whenCollapseMakeRead'));
    $propDialog.find('#jras-gui-fixedTopbarVal').prop('checked', userOptions.val('fixedTopbar'));
    $propDialog.find('#jras-gui-hideFixedTopbarVal').prop('checked', userOptions.val('hideFixedTopbar'));
    $propDialog.find('#jras-gui-isToBeLoadingUserDataVal').prop('checked', userOptions.val('isToBeLoadingUserData'));
    $propDialog.find('#jras-gui-showUTOnLineVal').prop('checked', userOptions.val('showUTOnLine'));
    $propDialog.find('#jras-gui-showUTOnCommentVal').prop('checked', userOptions.val('showUTOnComment'));
    $propDialog.find('#jras-gui-showUTOnPrivateMessVal').prop('checked', userOptions.val('showUTOnPrivateMess'));
    $propDialog.find('#jras-gui-showUTOnPeopleVal').prop('checked', userOptions.val('showUTOnPeople'));
    $propDialog.find('#jras-gui-showUTOnSidebarTopUsersVal').prop('checked', userOptions.val('showUTOnSidebarTopUsers'));
    $propDialog.find('#jras-gui-showUTOnSidebarOnlineVal').prop('checked', userOptions.val('showUTOnSidebarOnline'));
    $propDialog.find('#jras-gui-showHiddenCommentsVal').prop('checked', userOptions.val('showHiddenComments'));
    $propDialog.find('#jras-gui-showHiddenCommentsMarkVal').prop('checked', userOptions.val('showHiddenCommentsMark'));
    $propDialog.find('#jras-gui-showUTOnTopCommentsVal').prop('checked', userOptions.val('showUTOnTopComments'));
    $propDialog.find('#jras-gui-isToBeLoadingTagDataVal').prop('checked', userOptions.val('isToBeLoadingTagData'));
    $propDialog.find('#jras-gui-showTTOnLineVal').prop('checked', userOptions.val('showTTOnLine'));
    $propDialog.find('#jras-gui-showTTFullPostVal').prop('checked', userOptions.val('showTTFullPost'));
    $propDialog.find('#jras-gui-showTTOnTrendsVal').prop('checked', userOptions.val('showTTOnTrends'));
    $propDialog.find('#jras-gui-showTTOnLikeTagsVal').prop('checked', userOptions.val('showTTOnLikeTags'));
    $propDialog.find('#jras-gui-showTTOnInterestingVal').prop('checked', userOptions.val('showTTOnInteresting'));
    $propDialog.find('#jras-gui-chatlaneToPacakiVal').prop('checked', userOptions.val('chatlaneToPacaki'));
    $propDialog.find('#jras-gui-delUserCommentVal').prop('checked', userOptions.val('delUserComment'));
    $propDialog.find('#jras-gui-showUserNameDelCommentVal').prop('checked', userOptions.val('showUserNameDelComment'));
    $propDialog.find('#jras-gui-fullDelUserPostVal').prop('checked', userOptions.val('fullDelUserPost'));
    $propDialog.find('#jras-gui-delUserPostVal').prop('checked', userOptions.val('delUserPost'));
    $propDialog.find('#jras-gui-showUserNameDelPostVal').prop('checked', userOptions.val('showUserNameDelPost'));
    $propDialog.find('#jras-gui-hideUserAwardsWhencbb').val(userOptions.val('hideUserAwardsWhen'));
    $propDialog.find('#jras-gui-minShowUserAwardscbb').val(userOptions.val('minShowUserAwards'));
    $propDialog.find('#jras-gui-collapseCommentsVal').prop('checked', userOptions.val('collapseComments'));
    $propDialog.find('#jras-gui-collapseCommentsOnlyFullPostVal').prop('checked', userOptions.val('collapseCommentsOnlyFullPost'));
    $propDialog.find('#jras-gui-collapseCommentWhenSizeVal').val(userOptions.val('collapseCommentWhenSize'));
    $propDialog.find('#jras-gui-collapseCommentToSizeVal').val(userOptions.val('collapseCommentToSize'));
    $propDialog.find('#jras-guiBlockUserList').val(userOptions.data.BlockUsers.join("\n"));
    $propDialog.find('#jras-guiBlockTagList').val(userOptions.data.BlockTags.join("\n"));
    $propDialog.find('#jras-prop-gui-tabs').tabs({active: 0});
    $propDialog.find('#jras-prop-gui-tabs').tabs({selected: 0});
    $propDialog.find('#jras-prop-gui-tabs').tabs({focused: 0});
  }

  function updateGuiLocalize(){
    const $propDialog = $('#jras-prop-gui-dialog');
    $propDialog.find('#jras-gui-SaveSettings').attr('value', lng.getVal('JRAS_GUI_BTNSAVE'));
    $propDialog.find('#jras-gui-sendPMforMe').attr('title', lng.getVal('JRAS_GUI_BTNSENDPMME'));
    $propDialog.find('#jras-gui-DeleteAllSavedSettings').attr('title', lng.getVal('JRAS_GUI_BTNDELETESETT'));
    $propDialog.find('#jras-gui-ResetSettings').attr('title', lng.getVal('JRAS_GUI_BTNRESETSETT'));
    $propDialog.find('#jras-tabs-nav-0 a').text(lng.getVal('JRAS_GUI_TABMAIN'));
    $propDialog.find('#jras-tabs-nav-1 a').text(lng.getVal('JRAS_GUI_TABBLOCK'));
    $propDialog.find('#jras-tabs-nav-2 a').text(lng.getVal('JRAS_GUI_TABTOOLTIP'));
    $propDialog.find('#jras-tabs-nav-3 a').text(lng.getVal('JRAS_GUI_TABCOMMENTS'));
    $propDialog.find('#jras-gui-SelectLngCaption').text(userOptions.getGuiDesc('currentLng'));
    $propDialog.find('#jras-gui-correctRedirectLinkCaption').text(userOptions.getGuiDesc('correctRedirectLink'));
    $propDialog.find('#jras-gui-removeShareButtonsCaption').text(userOptions.getGuiDesc('removeShareButtons'));
    $propDialog.find('#jras-gui-makeTreeCommentsCaption').text(userOptions.getGuiDesc('makeTreeComments'));
    $propDialog.find('#jras-gui-treeCommentsOnlyFullPostCaption').text(userOptions.getGuiDesc('treeCommentsOnlyFullPost'));
    $propDialog.find('#jras-gui-makeAvatarOnOldDesignCaption').text(userOptions.getGuiDesc('makeAvatarOnOldDesign'));
    $propDialog.find('#jras-gui-makeAvatarOnlyFullPostCaption').text(userOptions.getGuiDesc('makeAvatarOnlyFullPost'));
    $propDialog.find('#jras-gui-avatarHeightCaption').text(userOptions.getGuiDesc('avatarHeight'));
    $propDialog.find('#jras-gui-whenCollapseMakeReadCaption').text(userOptions.getGuiDesc('whenCollapseMakeRead'));
    $propDialog.find('#jras-gui-fixedTopbarCaption').text(userOptions.getGuiDesc('fixedTopbar'));
    $propDialog.find('#jras-gui-hideFixedTopbarCaption').text(userOptions.getGuiDesc('hideFixedTopbar'));
    $propDialog.find('#jras-gui-isToBeLoadingUserDataCaption').text(userOptions.getGuiDesc('isToBeLoadingUserData'));
    $propDialog.find('#jras-gui-showUTOnLineCaption').text(userOptions.getGuiDesc('showUTOnLine'));
    $propDialog.find('#jras-gui-showUTOnCommentCaption').text(userOptions.getGuiDesc('showUTOnComment'));
    $propDialog.find('#jras-gui-showUTOnPrivateMessCaption').text(userOptions.getGuiDesc('showUTOnPrivateMess'));
    $propDialog.find('#jras-gui-showUTOnPeopleCaption').text(userOptions.getGuiDesc('showUTOnPeople'));
    $propDialog.find('#jras-gui-showUTOnSidebarTopUsersCaption').text(userOptions.getGuiDesc('showUTOnSidebarTopUsers'));
    $propDialog.find('#jras-gui-showUTOnSidebarOnlineCaption').text(userOptions.getGuiDesc('showUTOnSidebarOnline'));
    $propDialog.find('#jras-gui-showHiddenCommentsCaption').text(userOptions.getGuiDesc('showHiddenComments'));
    $propDialog.find('#jras-gui-showHiddenCommentsMarkCaption').text(userOptions.getGuiDesc('showHiddenCommentsMark'));
    $propDialog.find('#jras-gui-showUTOnTopCommentsCaption').text(userOptions.getGuiDesc('showUTOnTopComments'));
    $propDialog.find('#jras-gui-isToBeLoadingTagDataCaption').text(userOptions.getGuiDesc('isToBeLoadingTagData'));
    $propDialog.find('#jras-gui-showTTOnLineCaption').text(userOptions.getGuiDesc('showTTOnLine'));
    $propDialog.find('#jras-gui-showTTFullPostCaption').text(userOptions.getGuiDesc('showTTFullPost'));
    $propDialog.find('#jras-gui-showTTOnTrendsCaption').text(userOptions.getGuiDesc('showTTOnTrends'));
    $propDialog.find('#jras-gui-showTTOnLikeTagsCaption').text(userOptions.getGuiDesc('showTTOnLikeTags'));
    $propDialog.find('#jras-gui-showTTOnInterestingCaption').text(userOptions.getGuiDesc('showTTOnInteresting'));
    $propDialog.find('#jras-gui-chatlaneToPacakiCaption').text(userOptions.getGuiDesc('chatlaneToPacaki'));
    $propDialog.find('#jras-gui-delUserCommentCaption').text(userOptions.getGuiDesc('delUserComment'));
    $propDialog.find('#jras-gui-showUserNameDelCommentCaption').text(userOptions.getGuiDesc('showUserNameDelComment'));
    $propDialog.find('#jras-gui-fullDelUserPostCaption').text(userOptions.getGuiDesc('fullDelUserPost'));
    $propDialog.find('#jras-gui-delUserPostCaption').text(userOptions.getGuiDesc('delUserPost'));
    $propDialog.find('#jras-gui-showUserNameDelPostCaption').text(userOptions.getGuiDesc('showUserNameDelPost'));
    $propDialog.find('#jras-gui-hideUserAwardsWhenCaption').text(userOptions.getGuiDesc('hideUserAwardsWhen'));
    $propDialog.find('#jras-gui-minShowUserAwardsCaption').text(userOptions.getGuiDesc('minShowUserAwards'));
    $propDialog.find('#jras-gui-collapseCommentsCaption').text(userOptions.getGuiDesc('collapseComments'));
    $propDialog.find('#jras-gui-collapseCommentsOnlyFullPostCaption').text(userOptions.getGuiDesc('collapseCommentsOnlyFullPost'));
    $propDialog.find('#jras-gui-collapseCommentWhenSizeCaption').text(userOptions.getGuiDesc('collapseCommentWhenSize'));
    $propDialog.find('#jras-gui-collapseCommentToSizeCaption').text(userOptions.getGuiDesc('collapseCommentToSize'));
    $propDialog.find('#jras-guiBlockUserListCaption').text(lng.getVal('JRAS_GUI_BLOCKUSERLIST'));
    $propDialog.find('#jras-guiBlockTagListCaption').text(lng.getVal('JRAS_GUI_BLOCKTAGLIST'));
  }

  function makeServiceGUIButton(){
    const $propDialog = $('#jras-prop-gui-dialog');
    if(page.isNewDesign){
      $propDialog.find('#jras-gui-SaveSettings').css('border-radius', '3px');
      $propDialog.find('#jras-prop-gui-bottomCcontent').prepend(`
       <div id="jras-gui-sendPMforMe" class="big_button jras-gui-btn-newdesign jras-prop-gui-button-left jras-gui-btn-pmme" title=""> </div>
       <div id="jras-gui-DeleteAllSavedSettings" class="big_button jras-gui-btn-newdesign jras-prop-gui-button-left jras-gui-btn-deleteall" title="" > </div>
       <div id="jras-gui-ResetSettings" class="big_button jras-gui-btn-newdesign jras-prop-gui-button-left jras-gui-btn-resetdef" title="" > </div>
      `);
    }else{
      $propDialog.find('#jras-prop-gui-bottomCcontent').prepend(`
       <input id="jras-gui-sendPMforMe" style="padding-left: 3px;padding-right: 3px;width: 24px;height: 22px;" class="jras-prop-gui-button-left jras-gui-btn-pmme" title="" value="" type="button">
       <input id="jras-gui-DeleteAllSavedSettings" style="padding-left: 3px; padding-right: 3px; width: 24px; height: 22px;" class="jras-prop-gui-button-left jras-gui-btn-deleteall" title="" value="" type="button">
       <input id="jras-gui-ResetSettings" style="padding-left: 3px; padding-right: 3px; width: 24px; height: 22px;" class="jras-prop-gui-button-left jras-gui-btn-resetdef" title="" value="" type="button">
      `);
    }

    $propDialog.find('#jras-gui-sendPMforMe').click(function(){
      closeSettingDialog();
      sendPM('AntiUser')
    });
    $propDialog.find('#jras-gui-DeleteAllSavedSettings').click(function(){
      closeSettingDialog();
      userOptions.removeAllSavedData();
    });
    $propDialog.find('#jras-gui-ResetSettings').click(function(){
      closeSettingDialog();
      userOptions.setDef();
    });
    $propDialog.find('#jras-gui-SaveSettings').click(function(){
      const $propDialog = $('#jras-prop-gui-dialog');
      userOptions.val('currentLng', $propDialog.find('#jras-gui-SelectLngcbb').val());
      userOptions.val('correctRedirectLink', $propDialog.find('#jras-gui-correctRedirectLinkVal').prop('checked'));
      userOptions.val('removeShareButtons', $propDialog.find('#jras-gui-removeShareButtonsVal').prop('checked'));
      userOptions.val('makeTreeComments', $propDialog.find('#jras-gui-makeTreeCommentsVal').prop('checked'));
      userOptions.val('treeCommentsOnlyFullPost', $propDialog.find('#jras-gui-treeCommentsOnlyFullPostVal').prop('checked'));
      userOptions.val('makeAvatarOnOldDesign', $propDialog.find('#jras-gui-makeAvatarOnOldDesignVal').prop('checked'));
      userOptions.val('makeAvatarOnlyFullPost', $propDialog.find('#jras-gui-makeAvatarOnlyFullPostVal').prop('checked'));
      userOptions.val('avatarHeight', $propDialog.find('#jras-gui-avatarHeightVal').val());
      userOptions.val('whenCollapseMakeRead', $propDialog.find('#jras-gui-whenCollapseMakeReadVal').prop('checked'));
      userOptions.val('fixedTopbar', $propDialog.find('#jras-gui-fixedTopbarVal').prop('checked'));
      userOptions.val('hideFixedTopbar', $propDialog.find('#jras-gui-hideFixedTopbarVal').prop('checked'));
      userOptions.val('isToBeLoadingUserData', $propDialog.find('#jras-gui-isToBeLoadingUserDataVal').prop('checked'));
      userOptions.val('showUTOnLine', $propDialog.find('#jras-gui-showUTOnLineVal').prop('checked'));
      userOptions.val('showUTOnComment', $propDialog.find('#jras-gui-showUTOnCommentVal').prop('checked'));
      userOptions.val('showUTOnPrivateMess', $propDialog.find('#jras-gui-showUTOnPrivateMessVal').prop('checked'));
      userOptions.val('showUTOnPeople', $propDialog.find('#jras-gui-showUTOnPeopleVal').prop('checked'));
      userOptions.val('showUTOnSidebarTopUsers', $propDialog.find('#jras-gui-showUTOnSidebarTopUsersVal').prop('checked'));
      userOptions.val('showUTOnSidebarOnline', $propDialog.find('#jras-gui-showUTOnSidebarOnlineVal').prop('checked'));
      userOptions.val('showHiddenComments', $propDialog.find('#jras-gui-showHiddenCommentsVal').prop('checked'));
      userOptions.val('showHiddenCommentsMark', $propDialog.find('#jras-gui-showHiddenCommentsMarkVal').prop('checked'));
      userOptions.val('showUTOnTopComments', $propDialog.find('#jras-gui-showUTOnTopCommentsVal').prop('checked'));
      userOptions.val('isToBeLoadingTagData', $propDialog.find('#jras-gui-isToBeLoadingTagDataVal').prop('checked'));
      userOptions.val('showTTOnLine', $propDialog.find('#jras-gui-showTTOnLineVal').prop('checked'));
      userOptions.val('showTTFullPost', $propDialog.find('#jras-gui-showTTFullPostVal').prop('checked'));
      userOptions.val('showTTOnTrends', $propDialog.find('#jras-gui-showTTOnTrendsVal').prop('checked'));
      userOptions.val('showTTOnLikeTags', $propDialog.find('#jras-gui-showTTOnLikeTagsVal').prop('checked'));
      userOptions.val('showTTOnInteresting', $propDialog.find('#jras-gui-showTTOnInterestingVal').prop('checked'));
      userOptions.val('chatlaneToPacaki', $propDialog.find('#jras-gui-chatlaneToPacakiVal').prop('checked'));
      userOptions.val('delUserComment', $propDialog.find('#jras-gui-delUserCommentVal').prop('checked'));
      userOptions.val('showUserNameDelComment', $propDialog.find('#jras-gui-showUserNameDelCommentVal').prop('checked'));
      userOptions.val('fullDelUserPost', $propDialog.find('#jras-gui-fullDelUserPostVal').prop('checked'));
      userOptions.val('delUserPost', $propDialog.find('#jras-gui-delUserPostVal').prop('checked'));
      userOptions.val('showUserNameDelPost', $propDialog.find('#jras-gui-showUserNameDelPostVal').prop('checked'));
      userOptions.val('hideUserAwardsWhen', $propDialog.find('#jras-gui-hideUserAwardsWhencbb').val());
      userOptions.val('minShowUserAwards', $propDialog.find('#jras-gui-minShowUserAwardscbb').val());
      userOptions.val('collapseComments', $propDialog.find('#jras-gui-collapseCommentsVal').prop('checked'));
      userOptions.val('collapseCommentsOnlyFullPost', $propDialog.find('#jras-gui-collapseCommentsOnlyFullPostVal').prop('checked'));
      userOptions.val('collapseCommentWhenSize', $propDialog.find('#jras-gui-collapseCommentWhenSizeVal').val());
      userOptions.val('collapseCommentToSize', $propDialog.find('#jras-gui-collapseCommentToSizeVal').val());
      userOptions.data.BlockUsers = $propDialog.find('#jras-guiBlockUserList').val().split('\n');
      userOptions.data.BlockTags = $propDialog.find('#jras-guiBlockTagList').val().split('\n');
      updateGuiLocalize();
      userOptions.saveUserData(page.currentUser);
      closeSettingDialog()
    });
  }

  function actionButton($button, link, buttonTxtID){
    $button.click({clickLink: link, updateContainer: $button}, function(eventObject){
      const t = eventObject.data.updateContainer.find('#' + buttonTxtID);
      const ct = t.text();
      t.text(ct + ' : wait');
      GM_xmlhttpRequest({
        method: 'GET', url: eventObject.data.clickLink,
        onload: function(response){
          if(response.status != 200){
            t.text(ct + ' : error: ' + response.status);
          }else{
            t.text(ct + ' : ok');
          }
          eventObject.data.updateContainer
            .css('cursor', '')
            .removeClass('jras-tooltip-button')
            .unbind(eventObject);
        }
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

  function setTooltipBounds($tooltip, {left, width}){
    if (width !== undefined){
      $tooltip.width(width + 'px');
    }
    if (left !== undefined){
      $tooltip.offset({ left: left});
    }
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
        'box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)'
      });
      getTagData(TagName, TagLink, $tooltip, $tooltip.find('div#jras-tooltipcontainer'));
    });
  }

  function getTagData(tagName, tagLink, $tooltip, $outContainer){
    setTooltipBounds($tooltip, {width: defLoadTooltipSize});
    GM_xmlhttpRequest({
      method: 'GET',
      url: tagLink,
      onload: function(response){
        if(response.status != 200){
          $outContainer.text('Loading error: ' + response.status);
          console.log("Loading tag data error:  - " + response.status);
        }else{
          const doc = document.implementation.createHTMLDocument("");
          doc.documentElement.innerHTML = response.responseText;

          clearContainer($outContainer);

          let tmpW = unsafeWindow.innerWidth;
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
          const $tagHeaderInfo = $tagDocHeaderSide.find('a').each(function(idx, elm){
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
              actionButton($favTagBtn, linkToTagAction, 'jras-tooltip-favtag-txt');
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
              actionButton($blockTagBtn, linkToTagAction, 'jras-tooltip-blocktag-txt');
            }
          }
          makeJRASTagTooltipElm($mainBtnContainer, tagName);
        }
      }
    });
  }

  function makeTagStatistics($tagDocStatsBlock, $container){
    const $tagStatContainer = $('<div id="jras-tagStatContainer" class="jras-tooltip-section-topborder" style="line-height: 16px; font-size: 10px"></div>')
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
    if ($tagDocModCont.length == 0) {
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
    $modTags.find('div').each(function(idx, elm){
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
        'box-shadow': '6px 6px 8px 0px rgba(0, 0, 0, 0.5)'
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
      GM_xmlhttpRequest({
        method: 'GET',
        url: userLink,
        onload: function(response){
          //           console.log('Loading user data from "' + userLink + '" - ' + response.status);

          if(response.status != 200){
            $outContainer.text('Loading error: ' + response.status);
            console.log("Loading user data error:  - " + response.status);
          }else{
            const doc = document.implementation.createHTMLDocument("");
            doc.documentElement.innerHTML = response.responseText;

            clearContainer($outContainer);
            setTooltipBounds($tooltip, {width: defUserTooltipSize});
            const $userSideBar = $(doc).find('div.user-awards').closest('div#sidebar');
            const $userData = $(doc).find('div.user-awards').parent('div.sidebarContent');
            $userData.find('div.user').clone().appendTo($outContainer).css({'line-height': '22px'})
              .find('span').addClass('jras-tooltip-caption');
            if (userOptions.val('chatlaneToPacaki')){
              $outContainer.find('div.user > span').css('color', $outContainer.find('div.user').css('color'));
            }
            const colUserOnline = ($.trim($userData.find('span.userOnline').text()) == 'Оффлайн') ? 'rgb(255, 0, 0)' : 'rgb(0, 255, 0)';
            $outContainer.find('div.user').prepend(
              `<div style="background-color: ${colUserOnline}; height: 83%; margin-right: 4px; display: inline-block; width: 5px; border-radius: 10px;"></div>`
            );


            makeUserAwardsBlock($userData.find('div.user-awards'), $outContainer);

            const $userStars = $userData.find('div.stars').clone().appendTo($outContainer);
            $userStars.css('width', '100%');
            $userStars.find('div:not([class])').not('[style*="border: black solid 1px"]').remove();
            $userStars.find('div[class*="star-row-"]')
              .css({
                'height': '15px',
                'margin-left': '15px',
                'transform': 'scale(0.7)'
              });
            let a = page.isNewDesign ? 'rgb(230, 230, 230)' : 'rgb(72, 72, 72)';
            $userStars.find('[style*="border: black solid 1px"]')
              .css({
                'border': '',
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
                actionButton($friendUser, linkToUserAction, 'jras-tooltip-frienduser-txt');
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
                actionButton($blockUserJR, linkToUserAction, 'jras-tooltip-blockuser-jr-txt');
              }
            }

            makeJRASUserTooltipElm($mainBtnContainer, userName);
          }
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

  function getSideBarSection($sideBarUser, sectCaption){
    return $sideBarUser.find('.sidebar_block>.sideheader:contains(' + sectCaption + ') + div.sidebarContent');
  }

  function makeModerElements($sideBarUser, $containerFor){
    if (!$sideBarUser || !$containerFor) {
      return false
    }
    const $userModCont = getSideBarSection($sideBarUser, 'Модерирует');
    if ($userModCont.length == 0) {
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
    if ($userPostsCont.length == 0) {
      return
    }

    const re = /(\d+)/gm;
    let m, arr = [];

    while ((m = re.exec($userPostsCont.find('>:first-child').text())) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      arr.push(m[0]);
    }

    const $modBlock = $containerFor.append(`
      <div class="jras-tooltip-section-topborder" style="line-height: 16px; font-size: 10px;" id="jras-tooltip-posts-block">
        ${lng.getVal('JRAS_TOOLTIP_POSTS')}<b>${arr[0] + ' (' + arr[1] + ' / ' + arr[2] + ')'}</b><br>
        ${lng.getVal('JRAS_TOOLTIP_COMMENTS')}<b> ${arr[3]}</b><br>
        ${lng.getVal('JRAS_TOOLTIP_REG')}<b><span id="jras-tooltip-posts-regdate"></b></span>
      </div>
    `).find('#jras-tooltip-posts-block');

    $modBlock.find('#jras-tooltip-posts-regdate').append($userPostsCont.find('span[id^=usertime]').clone());
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
      const $jrasTooltipUserAwardsHideBtn = $jrasTooltipUserAwards.append('<div id="jras-tooltip-user-awards-hide-btn"></div>')
        .find('#jras-tooltip-user-awards-hide-btn')
        .addClass('jras-tooltip-user-awards-hide-btn')
        .addClass('jras-tooltip-user-awards-hide-btn-close');
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
    if($pmDialog.length == 0){
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

  function themeDependentCSS(){
    if (!page.isSchemeLight()){
      newCssClass(`
        .post_content table td {
           border: 1px solid #474747;
        }
      `);
    }
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

  function addNewCSSClasses(){
    newCssClass(`

    	.video_gif_source{
        top: 0;
        right: 0;
      }
      .video_gif_holder {
        display: inline-block;
      }
      .video_gif_holder:hover .video_gif_source{
        display: block;
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
        margin-left: -15px;
        margin-right: 6px;
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
        max-width: 60%;
        word-wrap: break-word;
        padding-left: 8px;
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

  function makeBlockPostElements(forElm, parentID, blockMess, blockMessBold, blockMessDesc, fromTag){
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
        toggleContainer.slideToggle('display');
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
        $('#' + parentID + ' > div.txt').slideToggle('display');
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

  function getHideAwardsCountList(){
    let retVal = '';
    for(let i = 0; i < 101; i += 5){
      if (i != 0 && i < 20){continue}
      retVal += '<option value="' + i + '">' + i + '</option>';
    }
    return retVal;
  }

  function getShowAwardsCountList(){
    let retVal = '';
    for(let i = 10; i < 101; i += 10){
      retVal += '<option value="' + i + '">' + i + '</option>';
    }
    return retVal;
  }

  function PageData(){
    const getColorSchema = function(){ // light or dark
      // const c = $('body').css('background-color');
      const c = $('#background').css('background-color');
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
    this.currentPage = unsafeWindow.location.href;
    this.isUserLogon = $('li.login.lastitem a').is('#logout');

    this.currentUser = this.isUserLogon ? $('li.login a#settings').attr('href') : 'Anonymous';
    if (this.currentUser != 'Anonymous'){
      regEx = /(^.user.)(.+)/g;
      matches = regEx.exec(this.currentUser);
      this.currentUser = matches[2];
      if (this.currentUser === undefined || this.currentUser == ''){
        this.currentUser = 'Anonymous';
      }
    }
    this.scheme = getColorSchema();
    this.isSchemeLight = function(){
      return this.scheme == 'light'
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
    }
  }

  function LanguageData(){

    this.getVal = function(val){
      const cl = userOptions.val('currentLng');
      if(!this[val][cl]){
        return this[val]['ru'];
      }
      return this[val][cl];
    };

    this.getHTMLListLangs = function(){
      let retVal = '';
      for(let a in this.JRAS_LANGLIST){
        retVal += '<option value="' + a + '">' + this.JRAS_LANGLIST[a] + '</option>';
      }
      return retVal;
    };

    this.JRAS_LANGLIST = {
      ru: 'Русский',
      en: 'English'
    };
    this.JRAS_POSTBLOCKBYUSER = {
      ru: 'Пост заблокированного пользователя: ',
      en: 'Post is blocked by Username: '
    };
    this.JRAS_TOGGLEBUTTONCAPTIONHIDE = {
      ru: 'Скрыть',
      en: 'Hide'
    };
    this.JRAS_TOGGLEBUTTONCAPTIONSHOW = {
      ru: 'Показать',
      en: 'Show'
    };
    this.JRAS_POSTBLOCKBYTAG = {
      ru: 'Пост заблокированый по тегам: ',
      en: 'Post is blocked by Tag: '
    };
    this.JRAS_COMMBLOCKBYUSER = {
      ru: 'Комментарий заблокированного пользователя: ',
      en: 'Comment is blocked by Username: '
    };
    this.JRAS_GUI_SELECTLANGUAGE = {
      ru: 'Язык интерфейса: ',
      en: 'Language: '
    };
    this.JRAS_GUI_MAKEAVATARONOLDDESIGN = {
      ru: ' Создавать аватары для старого дизайна',
      en: ' MAKEAVATARONOLDDESIGN'
    };
    this.JRAS_GUI_MAKEAVATARONLYFULLPOST = {
      ru: ' Создавать аватары только для полного поста',
      en: ' MAKEAVATARONLYFULLPOST'
    };
    this.JRAS_GUI_AVATARHEIGHT = {
      ru: ' Размер аватара (px)',
      en: ' AVATARHEIGHT'
    };
    this.JRAS_GUI_MAKETREECOMMENTS = {
      ru: ' Создавать дерево комментариев',
      en: ' Makr tree comments'
    };
    this.JRAS_GUI_CORRECTREDIRECTLINK = {
      ru: ' Раскрывать ссылки из редиректа',
      en: ' correctRedirectLink'
    };
    this.JRAS_GUI_REMOVESHAREBUTTONS = {
      ru: ' Удалить кнопки "Поделиться..." (vk, fb, twitter и т.п.)',
      en: ' removeShareButtons'
    };
    this.JRAS_GUI_TREECOMMENTSONLYFULLPOST = {
      ru: ' Дерево комментариев только для полного поста',
      en: ' treeCommentsOnlyFullPost'
    };
    this.JRAS_GUI_WHENCOLLAPSEMAKEREAD = {
      ru: ' При сворачивании ветки комментариев все дочерние помечаются прочитанными',
      en: ' whenCollapseMakeRead'
    };
    this.JRAS_GUI_FIXEDTOPBAR = {
      ru: ' Зафиксировать верхнюю панель наверху окна',
      en: ' fixedTopbar'
    };
    this.JRAS_GUI_HIDEFIXEDTOPBAR = {
      ru: ' Скрывать зафиксированную верхнюю панель',
      en: ' hideFixedTopbar'
    };
    this.JRAS_GUI_ISTOBELOADINGUSERDATA = {
      ru: ' Загружать данные пользователя для Tooltip\u0027а',
      en: ' isToBeLoadingUserData'
    };
    this.JRAS_GUI_HIDEUSERAWARDSWHEN = {
      ru: ' Если медалек больше чем: ',
      en: ' hideUserAwardsWhen: '
    };
    this.JRAS_GUI_MINSHOWUSERAWARDS = {
      ru: ' то показывать первые: ',
      en: ' minShowUserAwards: '
    };
    this.JRAS_GUI_SHOWUTONLINE = {
      ru: ' Показывать в ленте',
      en: ' showUTOnLine'
    };
    this.JRAS_GUI_SHOWUTONCOMMENT = {
      ru: ' Показывать в комментариях',
      en: ' showUTOnComment'
    };
    this.JRAS_GUI_SHOWUTONPRIVATEMESS = {
      ru: ' Показывать на странице ПМ',
      en: ' showUTOnPrivateMess'
    };
    this.JRAS_GUI_SHOWUTONPEOPLE = {
      ru: ' Показывать на странице Люди',
      en: ' showUTOnPeople'
    };
    this.JRAS_GUI_SHOWUTONSIDEBARTOPUSERS = {
      ru: ' Показывать в правом баре для юзеров топа',
      en: ' showUTOnSidebarTopUsers'
    };
    this.JRAS_GUI_SHOWUTONSIDEBARONLINE = {
      ru: ' Показывать в правом баре для аватарок',
      en: ' showUTOnSidebarOnline'
    };
    this.JRAS_GUI_SHOWHIDDENCOMMENTS = {
      ru: 'Загружать скрытые заминусованные коменты сразу',
      en: 'showHiddenComments'
    };
    this.JRAS_GUI_SHOWHIDDENCOMMENTSMARK = {
      ru: 'Отмечать загруженные коменты',
      en: 'showHiddenCommentsMark'
    };
    this.JRAS_GUI_SHOWUTONTOPCOMMENTS = {
      ru: ' Показывать в правом баре для лучших коментов',
      en: 'showUTOnTopComments'
    };
    this.JRAS_GUI_ISTOBELOADINGTAGDATA = {
      ru: 'Загружать данные тега для Tooltip\u0027а',
      en: 'isToBeLoadingTagData'
    };
    this.JRAS_GUI_SHOWTTONLINE = {
      ru: 'Показывать в ленте',
      en: 'showTTOnLine'
    };
    this.JRAS_GUI_SHOWTTFULLPOST = {
      ru: 'Показывать в полном посте',
      en: 'showTTFullPost'
    };
    this.JRAS_GUI_SHOWTTONTRENDS = {
      ru: ' Показывать в правом баре для трендов',
      en: 'showTTOnTrends'
    };
    this.JRAS_GUI_SHOWTTONLIKETAGS = {
      ru: ' Показывать в правом баре для любимых тегов',
      en: 'showTTOnLikeTags'
    };
    this.JRAS_GUI_SHOWTTONINTERESTING = {
      ru: ' Показывать в правом баре для интересного',
      en: 'showTTOnInteresting'
    };
    this.JRAS_GUI_CHATLANETOPACAKI = {
      ru: ' Убирать цветовую отметку донатера',
      en: ' chatlaneToPacaki'
    };
    this.JRAS_GUI_DELUSERCOMMENT = {
      ru: 'Скрывать комментарий без возможности просмотра',
      en: 'delUserComment'
    };
    this.JRAS_GUI_SHOWUSERNAMEDELCOMMENT = {
      ru: 'Показывать в заблокированном комментарии ник юзера',
      en: 'showUserNameDelComment'
    };
    this.JRAS_GUI_FULLDELUSERPOST = {
      ru: 'Удалять пост из ленты полностью',
      en: 'fullDelUserPost'
    };
    this.JRAS_GUI_DELUSERPOST = {
      ru: 'Скрывать пост без возможности просмотра',
      en: 'delUserPost'
    };
    this.JRAS_GUI_SHOWUSERNAMEDELPOST = {
      ru: 'Показывать в заблокированном посте ник юзера',
      en: 'showUserNameDelPost'
    };
    this.JRAS_GUI_BLOCKUSERLIST = {
      ru: 'Заблокированные пользователи',
      en: 'Blocked users'
    };
    this.JRAS_GUI_BLOCKTAGLIST = {
      ru: 'Заблокированные теги',
      en: 'Blocked tags'
    };
    this.JRAS_GUI_COLLAPSECOMMENTS = {
      ru: 'Уменьшать большие комментарии',
      en: 'Collapse big comments'
    };
    this.JRAS_GUI_COLLAPSECOMMENTSONLYFULLPOST = {
      ru: 'Уменьшать большие комментарии только в полном посте',
      en: 'Collapse big comments full post only'
    };
    this.JRAS_GUI_COLLAPSECOMMENTWHENSIZE = {
      ru: 'Уменьшать если размер больше (px)',
      en: 'Collapse when size'
    };
    this.JRAS_GUI_COLLAPSECOMMENTTOSIZE = {
      ru: 'Уменьшать до (px)',
      en: 'Collapse to size'
    };
    this.JRAS_GUI_BTNSAVE = {
      ru: 'Сохранить',
      en: 'Save'
    };
    this.JRAS_GUI_BTNSENDPMME = {
      ru: 'Отправить мне персональное сообщение',
      en: 'Send PM for me'
    };
    this.JRAS_GUI_BTNDELETESETT = {
      ru: 'Удалить все сохраненные данные',
      en: 'Delete all saved data'
    };
    this.JRAS_GUI_BTNRESETSETT = {
      ru: 'Настройки по умолчанию',
      en: 'Reset settings to default'
    };
    this.JRAS_GUI_TABMAIN = {
      ru: 'Общие',
      en: 'General'
    };
    this.JRAS_GUI_TABBLOCK = {
      ru: 'Блокировки',
      en: 'Blocks'
    };
    this.JRAS_GUI_TABTOOLTIP = {
      ru: 'Tooltip\u0027ы',
      en: 'Tooltips'
    };
    this.JRAS_GUI_TABCOMMENTS = {
      ru: 'Комментарии',
      en: 'Comments'
    };
    this.JRAS_LOADINGUSERDATA = {
      ru: 'Загрузка данных...',
      en: 'Load data...'
    };
    this.JRAS_SENDPRIVMESS = {
      ru: 'Отправить сообщение',
      en: 'Send message'
    };
    this.JRAS_ADDFRIEND = {
      ru: 'Добавить в друзья',
      en: 'Add as friend'
    };
    this.JRAS_REMOVEFRIEND = {
      ru: 'Удалить из друзей',
      en: 'Remove from friends'
    };
    this.JRAS_ADDTAGFAV = {
      ru: 'Подписаться на тег',
      en: 'Add as favorite'
    };
    this.JRAS_REMOVETAGFAV = {
      ru: 'Отписаться от тега',
      en: 'Remove from favorite'
    };
    this.JRAS_TOOLTIP_MODERATOR = {
      ru: 'Модератор...',
      en: 'Moderator...'
    };
    this.JRAS_TOOLTIP_TAGMODERATORS = {
      ru: 'Модераторы...',
      en: 'Moderators...'
    };
    this.JRAS_TOOLTIP_STATISTICS = {
      ru: 'Статистика: ',
      en: 'Statistics: '
    };
    this.JRAS_TOOLTIP_POSTS = {
      ru: 'Постов (хор / луч): ',
      en: 'Posts (good / better):'
    };
    this.JRAS_TOOLTIP_COMMENTS = {
      ru: 'Комментариев:',
      en: 'Comments:'
    };
    this.JRAS_TOOLTIP_REG = {
      ru: 'Регистрация:',
      en: 'Registered:'
    };
    this.JRAS_BLOCKUSER_JR = {
      ru: 'Блокировать юзера (JR)',
      en: 'Block user (JR)'
    };
    this.JRAS_UNBLOCKUSER_JR = {
      ru: 'Разблокировать юзера (JR)',
      en: 'Unblock user (JR)'
    };
    this.JRAS_BLOCKUSER_JRAS = {
      ru: 'Блокировать юзера (JRAS)',
      en: 'Block user (JRAS)'
    };
    this.JRAS_UNBLOCKUSER_JRAS = {
      ru: 'Разблокировать юзера (JRAS)',
      en: 'Unblock user (JRAS)'
    };
    this.JRAS_BLOCKTAG_JR = {
      ru: 'Блокировать тег (JR)',
      en: 'Block tag (JR)'
    };
    this.JRAS_UNBLOCKTAG_JR = {
      ru: 'Разблокировать тег (JR)',
      en: 'Unblock tag (JR)'
    };
    this.JRAS_BLOCKTAG_JRAS = {
      ru: 'Блокировать тег (JRAS)',
      en: 'Block tag (JRAS)'
    };
    this.JRAS_UNBLOCKTAG_JRAS = {
      ru: 'Разблокировать тег (JRAS)',
      en: 'Unblock tag (JRAS)'
    };
    this.JRAS_COMMENTS_EXPANDCOLL_ALL = {
      ru: 'Свернуть/развернуть всё',
      en: 'Expand/Collapse All'
    };
    this.JRAS_SENDPMDIALOG_SENDBUTTON = {
      ru: 'Отправить',
      en: 'Send'
    };
    this.JRAS_SENDPMDIALOG_CLOSEBUTTON = {
      ru: 'Закрыть',
      en: 'Close'
    };
    this.JRAS_SENDPMDIALOG_HEADERCAPTION = {
      ru: 'Отправка сообщения для ',
      en: 'Send message for '
    };
    this.JRAS_SENDPMDIALOG_SENDMESS = {
      ru: 'Отправка данных...',
      en: 'Sending...'
    }
  }

}());