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
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js
// @require     https://code.jquery.com/ui/1.11.4/jquery-ui.min.js
// @version     2.3.0
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

const JRAS_CurrVersion = '2.3.0';

/* RELEASE NOTES
 2.3.0
   + механизм выделения и цитирования коментариев
   + отображение пользователя при цитировании
   + вывод ссылок на гифки так же в коментариях
 2.2.11
   + Сделал выделение цитат в коментах, если срока начинается с ">" то вся считается цитатой
 2.2.10
   * убрал тултип комента на ссылке в блоке самого комента
 2.2.9
   * Поправлено отображения прогресса звезды в тултипе юзера (Issue-95)
 2.2.8
   * Поправлен запрос размеров "гифок" для ссылок на...
 2.2.7
   * Исправлен предпросмотр постов и комментариев по наведению на ссылку
 2.2.6
   + Поменял отображение ссылок на скачивание гифок. Теперь выводятся с размерами (Issue-92)
 2.2.5.4
   * Баг определения элемента для добавления размера
 2.2.5.3
   + Размер в хинте для файлов webm, mp4 и gif
 2.2.5.2
   * Ссылки на видео в постах без гифок
 2.2.5.1
   * Баг ссылки на webm и mp4 вели на гифку
 2.2.5 - https://old.reactor.cc/post/5511493
   + Ссылки на гифку как в новом дизижине. В разных форматах webm, mp4 и gif (Issue-85)
 2.2.4
   * Нет тултипа на фендомных тегах (Issue-78)
 2.2.3
   * При попытке найти дату последнего входа, если у юзера введен всякий шлак
       типа интересов, дата не находилась. (Issue-76)
 2.2.2 - http://old.reactor.cc/post/3732196
   + в тултип юзера выведена инфа о последнем входе (Issue-74)
   * заминусованные коменты теперь открываются с задержкой (Issue-72)
 2.2.0 - http://old.reactor.cc/post/3565867
   + переработка механизма сохранения настроек (Issue-59)
   + импорт/экспорт настроек (Issue-59)
   + корректировка размера страницы после окончательной ее загрузки (Issue-55)
   + корректировка ссылок на old (Issue-64)
   + превью внутренних ссылок реактора. Только ссылки на пост или комент (Issue-58)
 1.9.1 - http://old.reactor.cc/post/3533506
   * Поддержка нового движка FireFox и нового GreaseMonkey (Issue-51)
 1.9.0 - http://old.reactor.cc/post/3375590
   * кнопки перехода в начало и конец поста (Issue-48)
 1.8.9
   * перенос длинных ников в тултипе
 1.8.8
   * Центрование контента (изображения, гифки, фреймы) (Issue-46)
   * поправлена ширина коментов с новыми стилями на не черном олде
   + Опция Центровать контент [true]
 1.8.7
   * Размер страницы (динамический стиль) теперь считается нормально при разворачивании разных элементов (Issue-43)
   * В свете длинных тегов поправлены стили. Не в скрипте, а в JRAS styles
 1.8.5
   * Мелкие фиксы
 1.8.4 - http://old.reactor.cc/post/3250349
   + Опция: мне нужны только динамические эффекты нового стиля [false]
   + Опции по поведению правого меню (Issue-39)
   + Устанавливать высоту страницы по высоте правого меню [true]
   + Показывать правое меню когда контент вышел за границы [true]
 1.8.0 - http://reactor.cc/post/3249308
   * Фикс определения цвета темы (Issue-13)
   + Опция скрывать шарные кнопки в БУП [false] (Issue-18.1)
   * Корректировка даты поста (Issue-33)
   + Возможность скрыть правое меню и/или настроить ширину контента (Issue-36)
 Опции
   + Корректировать дизайн и стиль сайта [false]
   + Скрывать правое меню [true]
   + Растягивать контент по границам экрана [true]
   + Растягивать контент на (%) [90]
 1.7.16
   * Исправлен баг даты комментария, которая пропадала или вообще не появлялась (Issue-29)
 1.7.15 - http://old.reactor.cc/post/3247143
   * Исправлен баг сохранения настроек (спасибо Silent John за тесты и терпение) (Issue-25)
   * Исправлен баг добавления в избранное на новом дизайне (Issue-27)
   + Разная иконка для постов, которые уже в избранном и которые еще можно добавить (Issue-20)
   + Вывод даты комментария. Только в старом дизайне и только при включенной опции аватаров для старого дизайна (Issue-17)
   + Опция - "Показывать в коменте его дату" [true] в "Комментарии" > "Создавать аватары для старого дизайна"
   + Опции теперь чекаются при клике по label'у (Issue-11)
   + Опция - Анимировать перемещения блока' [true] (Issue-19)
   + Опция - Скорость перемещения при анимации (1-9) [2]
 1.7.2
   * Переделал иконки кнопок шары в блоке управления постом (Issue-12)
 1.7.1
   + Тултип на юзере в блоке управления постом (Issue-7)
   + Опция показывать тултип на юзере в блоке управления [true]
 1.7.0 - http://old.reactor.cc/post/3243856
   + Блок управления постом доступный в любом месте самого поста
   + Информация (автор, дата)
   + шары (все что было плюс добавил телеграм)
   + рейтинг
   + ссылки
 Опции
   + Блок управления постом [true] (Issue-1)
   + Только в полном посте [false]
   + Скрывать блок шарных кнопок поста [false]
   + Скрывать блок рейтинга поста [false]
   + Верхний стопор для блока внутри поста (px) [10]
   + Нижний стопор для блока внутри поста (px) [10]
   + Верхняя позиция на экране (px) [30]
 1.6.7 - http://old.reactor.cc/post/3235468
   + Показывать в правом баре для лучших коментов [true]
   + Загружать данные тега для Tooltip'а [true]
   + Показывать в ленте [true]
   + Показывать в полном посте [true]
   + Показывать в правом баре для трендов [true]
   + Показывать в правом баре для любимых тегов [true]
   + Показывать в правом баре для интересного [true]
 1.6.0 - http://old.reactor.cc/post/3233487
   + Tooltip'ы для тегов
 1.5.23
   * fix таблиц с гифками на олде
   + версия скрипта в заголовке окна скрипта
 1.5.21 - http://old.reactor.cc/post/3151778
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
 1.5.15 - http://old.reactor.cc/post/3079550
   + Скрывать комментарий без возможности просмотра [false]
   + Показывать в заблокированном комментрарии ник юзера [true]
   + Удалять пост из ленты полностью [false]
   + Скрывать пост без возможности просмотра [false]
   + Показывать в заблокированном посте ник юзера [true]
 1.5.12
   + Определение логина юзера по ссылке, а не по тексту (в свете Soldat AntiUser)
 1.5.11 - http://old.reactor.cc/post/2832945
   + В Tooltip'е юзера отметка о том Online ли он или нет (красный - нет, зеленый - да)
 1.5.10
   * Анимация показа/скрытия верхней панели
   + Опция удаление Share buttons [false]
 1.5.8
   + Теперь работает на странице "Обсуждаемое"
 1.5.7 - http://old.reactor.cc/post/2760618
   + Показывать аватары пользователей в комментариях [true] (ТОЛЬКО СТАРЫЙ ДИЗАЙН)
   + Показывать аватары только в полном посте [false] (ТОЛЬКО СТАРЫЙ ДИЗАЙН)
   + Размер показываемых аватаров в пикселях [35] (ТОЛЬКО СТАРЫЙ ДИЗАЙН)
   + Опция показывать сразу скрытые заминусованные коменты [false]
   + Опция отмечать раскрытые заминусованные коменты [true]
   * Поменял жирноту в Tooltip'е юзера
   * Вернул на гифки линк "Ссылка на гифку" в старом дизайне
   * мелкие исправления
 1.5.0 - http://old.reactor.cc/post/2611233
   + В Tooltip'е юзера информация модератор ли
   + В Tooltip'е юзера информация из блока "Профиль"
 1.4.11
   * разрешил уменьшение комментариев для хрома
   * обработка редиректных ссылок везде, а не только в посте
 1.4.10
   * при сворачивании к паренту (collapseToParent) не учитывалось текущее состояние ветвей и
     некотрые ветви разворачивались если были свернуты
 1.4.9 - http://old.reactor.cc/post/2536817
   + добавлен новый адрес на котором работает скрипт - jr-proxy.com
   + свернуть/развернуть все комментарии
   + раскрытие редиректных ссылок. опция - [true]
   + опция уменьшать комментарии только в полном посте [false]
 1.4.3
   + Уменьшение комментариев при раскрытии их в ленте (кроме хрома)
   * мелкие исправления
 1.4.0 - http://old.reactor.cc/post/2527831
   + Уменьшение больших комментариев (опционально)
   + Новые опции
     - Уменьшать большие комментарии [true]
     - Уменьшать если размер больше (px) [110]
     - Уменьшать до (px) [72]
 1.3.18
   + Диалог настроек закрывается при нажатии "сохранить"
 1.3.17 - http://old.reactor.cc/post/2524192
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
 1.3.6 - http://old.reactor.cc/post/2514832
   + сворачивание комментариев наверх к паренту
   * не блокировался юзер в комментариях при раскрытии их в ленте в новом дизайне
 1.3.2 - http://old.reactor.cc/post/2513114
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
 1.2.0 - http://old.reactor.cc/post/2504300
   + просмотр информации по пользователю при наведении мыши на его ник
   + возможность добавить в друзья, заблокировать пользователя из tooltip'а
   * мелкие исправления
 1.1.3
   * в хроме на новом дизайне не строилось дерево комментариев при раскрытии их в ленте
   * по той же причине не блокировались комментарии пользователей
 1.1.0 - http://old.reactor.cc/post/2497823
   + GUI для настройки JRAS
   * не блокировались теги на новом дизайне
 1.0.6
   * в список заблокированных тегов, котрый выводится при блокировке поста
     могло попасть содержимое поста, а не только теги
 1.0.5
   * в случае нахождения блокированного юзера в коментах, мог быть заблокирован пост
 1.0.2
   * Не работал в хроме из-за неверного определения адреса документа
 1.0.0 - http://old.reactor.cc/post/2485300
   + release

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

  const defLoadTooltipSize = 212;
  const defUserTooltipSize = 212;
  const defTagTooltipSize = 270;

  const lng = new LanguageData();
  const page = new PageData();
  
  const quoteData = {
    $commentContainer: undefined,
    $popupQuote: undefined,
    quoteInsertData: undefined };

  const userOptions = initOptions();
  userOptions.loadUserData(page.currentUser);
  try{
    correctStyle();
    correctPostDate();
    addNewCSSClasses();
    themeDependentCSS();
    makePropElements();
    makeAllUserTooltip();
    makeAllTagTooltip();
    makePostControls();
    procTopbar();
    removeRedirectLink();
    removeShareButtons();
    correctOldReactorLink();
    previewReactorLink();
    makeExtendedGifLinks();
    makeQuotes();
    makePopuperQuote();

    if (page.pageIs('post') || page.pageIs('discussion')){
      showHiddenComments();
      correctCommentSize();
      makeTreeComments();
      makeAvatarOnOldDesign();
    }

    userRemove(userOptions.data.BlockUsers);
    tagRemove(userOptions.data.BlockTags, true);

    subscribeShowComment();

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
        makeQuotesOnComments: { dt: null,
          propData: function () { return { def: true, type: 'checkbox' } }
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
          $parElm.css({'color': 'rgb(255, 57, 57)'});
        }
      }, 500 * idx);
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
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const itm = mutation.addedNodes[i];

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
        .video_gif_holder:hover .gifbuttons, .video_holder:hover .gifbuttons{
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

      .jras-ext-gif-cont {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        align-content: flex-start;
      }
      .jras-ext-gif-box {
        margin: -2px 3px;
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
        margin-bottom: -1em;
        padding-left: 0.8em;
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
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;"> ${getHTMLProp('hideFixedTopbar')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('correctRedirectLink')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('correctOldReactorLink')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('showHiddenComments')} </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;"> ${getHTMLProp('showHiddenCommentsMark')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('extendedGifLinks')} </section>
                    <section class="jras-prop-gui-section""> ${getHTMLProp('pcbShowPostControl')} </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      ${getHTMLProp('pcbShowInFullPost')} <br>
                      ${getHTMLProp('pcbHideShareButoons')} <br>
                      ${getHTMLProp('pcbHideJRShareBlock')} <br>
                      ${getHTMLProp('pcbHideJRRatingBlock')}<br>
                      ${getHTMLProp('pcbAnimateMove')} <br>
                      ${getHTMLProp('pcbAnimateMoveSpeed')}<br>
                      ${getHTMLProp('pcbTopScreenPos')} <br>
                      ${getHTMLProp('pcbTopBorder')} <br>
                      ${getHTMLProp('pcbBottomBorder')} </section>
                  </div>
                </div>
                <div id="jras-prop-gui-tab-2" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section"> ${getHTMLProp('delUserComment')} </section>
                    <section class="jras-prop-gui-section" style="margin-top: -10px;"> ${getHTMLProp('showUserNameDelComment')} </section>
                    <section class="jras-prop-gui-section" style="margin-top: -10px;"> ${getHTMLProp('fullDelUserPost')} </section>
                    <section class="jras-prop-gui-section" style="margin-top: -10px;"> ${getHTMLProp('delUserPost')} </section>
                    <section class="jras-prop-gui-section" style="margin-top: -10px;"> ${getHTMLProp('showUserNameDelPost')} </section>
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
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
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
                    <section class="jras-prop-gui-section" style="margin-top: -10px;"> ${getHTMLProp('isToBeLoadingTagData')} </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      ${getHTMLProp('showTTOnLine')} <br>
                      ${getHTMLProp('showTTFullPost')} <br>
                      ${getHTMLProp('showTTOnTrends')} <br>
                      ${getHTMLProp('showTTOnLikeTags')} <br>
                      ${getHTMLProp('showTTOnInteresting')} </section>
                    <section class="jras-prop-gui-section" style="margin-top: -10px;"> ${getHTMLProp('previewReactorLink')} </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      ${getHTMLProp('previewSizeX')} <br>
                      ${getHTMLProp('previewSizeY')} </section>
                  </div>
                </div>
                <div id="jras-prop-gui-tab-4" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section"> ${getHTMLProp('makeTreeComments')} </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      ${getHTMLProp('treeCommentsOnlyFullPost')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('makeAvatarOnOldDesign')} </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      ${getHTMLProp('makeAvatarOnlyFullPost')} <br>
                      ${getHTMLProp('showCommentDate')} <br>
                      ${getHTMLProp('avatarHeight')}</section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('whenCollapseMakeRead')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('collapseComments')} </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      ${getHTMLProp('collapseCommentsOnlyFullPost')} <br>
                      ${getHTMLProp('collapseCommentWhenSize')} <br>
                      ${getHTMLProp('collapseCommentToSize')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('makeQuotesOnComments')} </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      ${getHTMLProp('makeExtQuotes')} </section>
                    <section class="jras-prop-gui-section"> ${getHTMLProp('makeQuoteTool')} </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
                      ${getHTMLProp('qTAddUserInfo')} <br>
                      ${getHTMLProp('qTInsertIntoShowingInput')} </section>
                  </div>
                </div>
                <div id="jras-prop-gui-tab-5" class="jras-tabs-panel">
                  <div class="jras-tabs-panel-content">
                    <section class="jras-prop-gui-section"> ${getHTMLProp('stCorrectStyle')} </section>
                    <section class="jras-prop-gui-section" style="margin-left: 20px; margin-top: -10px;">
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
        case 'combobox':
        case 'number':
          userOptions.val(optName, $propDialog.find('#' + getPropID(optName) + 'Val').val());
          break;
      }
    });
    userOptions.data.BlockUsers = $propDialog.find('#jras-guiBlockUserList').val().split('\n');
    userOptions.data.BlockTags = $propDialog.find('#jras-guiBlockTagList').val().split('\n');
  }

  function PageData(){
    const getColorSchema = function(){ // light or dark
      let c = window.getComputedStyle(document.body, null).getPropertyValue('background-color');
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
    };
    this.rgb2hex = (rgb) => `#${rgb?.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)?.slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`;
    this.commentBgColor = () => this.rgb2hex($('.comment').css('background-color'));
  }

  function niceBytes(a){let b=0,c=parseInt(a,10)||0;for(;1024<=c&&++b;)c/=1024;return c.toFixed(10>c&&0<b?1:0)+" "+["bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][b]}

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
  }

  $(window).on('load', function () {
    correctPageHeight();
  });

}(typeof unsafeWindow != undefined ? unsafeWindow : window));
