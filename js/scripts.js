/*!
  * Native JavaScript for Bootstrap v3.0.14 (https://thednp.github.io/bootstrap.native/)
  * Copyright 2015-2020 © dnp_theme
  * Licensed under MIT (https://github.com/thednp/bootstrap.native/blob/master/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.BSN = factory());
}(this, (function () { 'use strict';

  var transitionEndEvent = 'webkitTransition' in document.head.style ? 'webkitTransitionEnd' : 'transitionend';

  var supportTransition = 'webkitTransition' in document.head.style || 'transition' in document.head.style;

  var transitionDuration = 'webkitTransition' in document.head.style ? 'webkitTransitionDuration' : 'transitionDuration';

  var transitionProperty = 'webkitTransition' in document.head.style ? 'webkitTransitionProperty' : 'transitionProperty';

  function getElementTransitionDuration(element) {
    var computedStyle = getComputedStyle(element),
        property = computedStyle[transitionProperty],
        duration = supportTransition && property && property !== 'none'
                 ? parseFloat(computedStyle[transitionDuration]) : 0;
    return !isNaN(duration) ? duration * 1000 : 0;
  }

  function emulateTransitionEnd(element,handler){
    var called = 0, duration = getElementTransitionDuration(element);
    duration ? element.addEventListener( transitionEndEvent, function transitionEndWrapper(e){
                !called && handler(e), called = 1;
                element.removeEventListener( transitionEndEvent, transitionEndWrapper);
              })
             : setTimeout(function() { !called && handler(), called = 1; }, 17);
  }

  function queryElement(selector, parent) {
    var lookUp = parent && parent instanceof Element ? parent : document;
    return selector instanceof Element ? selector : lookUp.querySelector(selector);
  }

  function bootstrapCustomEvent(eventName, componentName, eventProperties) {
    var OriginalCustomEvent = new CustomEvent( eventName + '.bs.' + componentName, {cancelable: true});
    if (typeof eventProperties !== 'undefined') {
      Object.keys(eventProperties).forEach(function (key) {
        Object.defineProperty(OriginalCustomEvent, key, {
          value: eventProperties[key]
        });
      });
    }
    return OriginalCustomEvent;
  }

  function dispatchCustomEvent(customEvent){
    this && this.dispatchEvent(customEvent);
  }

  function Alert(element) {
    var self = this,
      alert,
      closeCustomEvent = bootstrapCustomEvent('close','alert'),
      closedCustomEvent = bootstrapCustomEvent('closed','alert');
    function triggerHandler() {
      alert.classList.contains('fade') ? emulateTransitionEnd(alert,transitionEndHandler) : transitionEndHandler();
    }
    function toggleEvents(action){
      action = action ? 'addEventListener' : 'removeEventListener';
      element[action]('click',clickHandler,false);
    }
    function clickHandler(e) {
      alert = e && e.target.closest(".alert");
      element = queryElement('[data-dismiss="alert"]',alert);
      element && alert && (element === e.target || element.contains(e.target)) && self.close();
    }
    function transitionEndHandler() {
      toggleEvents();
      alert.parentNode.removeChild(alert);
      dispatchCustomEvent.call(alert,closedCustomEvent);
    }
    self.close = function () {
      if ( alert && element && alert.classList.contains('show') ) {
        dispatchCustomEvent.call(alert,closeCustomEvent);
        if ( closeCustomEvent.defaultPrevented ) { return; }
        self.dispose();
        alert.classList.remove('show');
        triggerHandler();
      }
    };
    self.dispose = function () {
      toggleEvents();
      delete element.Alert;
    };
    element = queryElement(element);
    alert = element.closest('.alert');
    element.Alert && element.Alert.dispose();
    if ( !element.Alert ) {
      toggleEvents(1);
    }
    self.element = element;
    element.Alert = self;
  }

  function Button(element) {
    var self = this, labels,
        changeCustomEvent = bootstrapCustomEvent('change', 'button');
    function toggle(e) {
      var input,
          label = e.target.tagName === 'LABEL' ? e.target
                : e.target.closest('LABEL') ? e.target.closest('LABEL') : null;
      input = label && label.getElementsByTagName('INPUT')[0];
      if ( !input ) { return; }
      dispatchCustomEvent.call(input, changeCustomEvent);
      dispatchCustomEvent.call(element, changeCustomEvent);
      if ( input.type === 'checkbox' ) {
        if ( changeCustomEvent.defaultPrevented ) { return; }
        if ( !input.checked ) {
          label.classList.add('active');
          input.getAttribute('checked');
          input.setAttribute('checked','checked');
          input.checked = true;
        } else {
          label.classList.remove('active');
          input.getAttribute('checked');
          input.removeAttribute('checked');
          input.checked = false;
        }
        if (!element.toggled) {
          element.toggled = true;
        }
      }
      if ( input.type === 'radio' && !element.toggled ) {
        if ( changeCustomEvent.defaultPrevented ) { return; }
        if ( !input.checked || (e.screenX === 0 && e.screenY == 0) ) {
          label.classList.add('active');
          label.classList.add('focus');
          input.setAttribute('checked','checked');
          input.checked = true;
          element.toggled = true;
          Array.from(labels).map(function (otherLabel){
            var otherInput = otherLabel.getElementsByTagName('INPUT')[0];
            if ( otherLabel !== label && otherLabel.classList.contains('active') )  {
              dispatchCustomEvent.call(otherInput, changeCustomEvent);
              otherLabel.classList.remove('active');
              otherInput.removeAttribute('checked');
              otherInput.checked = false;
            }
          });
        }
      }
      setTimeout( function () { element.toggled = false; }, 50 );
    }
    function keyHandler(e) {
      var key = e.which || e.keyCode;
      key === 32 && e.target === document.activeElement && toggle(e);
    }
    function preventScroll(e) {
      var key = e.which || e.keyCode;
      key === 32 && e.preventDefault();
    }
    function focusToggle(e) {
      if (e.target.tagName === 'INPUT' ) {
        var action = e.type === 'focusin' ? 'add' : 'remove';
        e.target.closest('.btn').classList[action]('focus');
      }
    }
    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      element[action]('click',toggle,false );
      element[action]('keyup',keyHandler,false), element[action]('keydown',preventScroll,false);
      element[action]('focusin',focusToggle,false), element[action]('focusout',focusToggle,false);
    }
    self.dispose = function () {
      toggleEvents();
      delete element.Button;
    };
    element = queryElement(element);
    element.Button && element.Button.dispose();
    labels = element.getElementsByClassName('btn');
    if (!labels.length) { return; }
    if ( !element.Button ) {
      toggleEvents(1);
    }
    element.toggled = false;
    element.Button = self;
    Array.from(labels).map(function (btn){
      !btn.classList.contains('active')
        && queryElement('input:checked',btn)
        && btn.classList.add('active');
      btn.classList.contains('active')
        && !queryElement('input:checked',btn)
        && btn.classList.remove('active');
    });
  }

  var mouseHoverEvents = ('onmouseleave' in document) ? [ 'mouseenter', 'mouseleave'] : [ 'mouseover', 'mouseout' ];

  var supportPassive = (function () {
    var result = false;
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function() {
          result = true;
        }
      });
      document.addEventListener('DOMContentLoaded', function wrap(){
        document.removeEventListener('DOMContentLoaded', wrap, opts);
      }, opts);
    } catch (e) {}
    return result;
  })();

  var passiveHandler = supportPassive ? { passive: true } : false;

  function isElementInScrollRange(element) {
    var bcr = element.getBoundingClientRect(),
        viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return bcr.top <= viewportHeight && bcr.bottom >= 0;
  }

  function Carousel (element,options) {
    options = options || {};
    var self = this,
      vars, ops,
      slideCustomEvent, slidCustomEvent,
      slides, leftArrow, rightArrow, indicator, indicators;
    function pauseHandler() {
      if ( ops.interval !==false && !element.classList.contains('paused') ) {
        element.classList.add('paused');
        !vars.isSliding && ( clearInterval(vars.timer), vars.timer = null );
      }
    }
    function resumeHandler() {
      if ( ops.interval !== false && element.classList.contains('paused') ) {
        element.classList.remove('paused');
        !vars.isSliding && ( clearInterval(vars.timer), vars.timer = null );
        !vars.isSliding && self.cycle();
      }
    }
    function indicatorHandler(e) {
      e.preventDefault();
      if (vars.isSliding) { return; }
      var eventTarget = e.target;
      if ( eventTarget && !eventTarget.classList.contains('active') && eventTarget.getAttribute('data-slide-to') ) {
        vars.index = parseInt( eventTarget.getAttribute('data-slide-to'));
      } else { return false; }
      self.slideTo( vars.index );
    }
    function controlsHandler(e) {
      e.preventDefault();
      if (vars.isSliding) { return; }
      var eventTarget = e.currentTarget || e.srcElement;
      if ( eventTarget === rightArrow ) {
        vars.index++;
      } else if ( eventTarget === leftArrow ) {
        vars.index--;
      }
      self.slideTo( vars.index );
    }
    function keyHandler(ref) {
      var which = ref.which;
      if (vars.isSliding) { return; }
      switch (which) {
        case 39:
          vars.index++;
          break;
        case 37:
          vars.index--;
          break;
        default: return;
      }
      self.slideTo( vars.index );
    }
    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      if ( ops.pause && ops.interval ) {
        element[action]( mouseHoverEvents[0], pauseHandler, false );
        element[action]( mouseHoverEvents[1], resumeHandler, false );
        element[action]( 'touchstart', pauseHandler, passiveHandler );
        element[action]( 'touchend', resumeHandler, passiveHandler );
      }
      ops.touch && slides.length > 1 && element[action]( 'touchstart', touchDownHandler, passiveHandler );
      rightArrow && rightArrow[action]( 'click', controlsHandler,false );
      leftArrow && leftArrow[action]( 'click', controlsHandler,false );
      indicator && indicator[action]( 'click', indicatorHandler,false );
      ops.keyboard && window[action]( 'keydown', keyHandler,false );
    }
    function toggleTouchEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      element[action]( 'touchmove', touchMoveHandler, passiveHandler );
      element[action]( 'touchend', touchEndHandler, passiveHandler );
    }
    function touchDownHandler(e) {
      if ( vars.isTouch ) { return; }
      vars.touchPosition.startX = e.changedTouches[0].pageX;
      if ( element.contains(e.target) ) {
        vars.isTouch = true;
        toggleTouchEvents(1);
      }
    }
    function touchMoveHandler(e) {
      if ( !vars.isTouch ) { e.preventDefault(); return; }
      vars.touchPosition.currentX = e.changedTouches[0].pageX;
      if ( e.type === 'touchmove' && e.changedTouches.length > 1 ) {
        e.preventDefault();
        return false;
      }
    }
    function touchEndHandler (e) {
      if ( !vars.isTouch || vars.isSliding ) { return }
      vars.touchPosition.endX = vars.touchPosition.currentX || e.changedTouches[0].pageX;
      if ( vars.isTouch ) {
        if ( (!element.contains(e.target) || !element.contains(e.relatedTarget) )
            && Math.abs(vars.touchPosition.startX - vars.touchPosition.endX) < 75 ) {
          return false;
        } else {
          if ( vars.touchPosition.currentX < vars.touchPosition.startX ) {
            vars.index++;
          } else if ( vars.touchPosition.currentX > vars.touchPosition.startX ) {
            vars.index--;
          }
          vars.isTouch = false;
          self.slideTo(vars.index);
        }
        toggleTouchEvents();
      }
    }
    function setActivePage(pageIndex) {
      Array.from(indicators).map(function (x){x.classList.remove('active');});
      indicators[pageIndex] && indicators[pageIndex].classList.add('active');
    }
    function transitionEndHandler(e){
      if (vars.touchPosition){
        var next = vars.index,
            timeout = e && e.target !== slides[next] ? e.elapsedTime*1000+100 : 20,
            activeItem = self.getActiveIndex(),
            orientation = vars.direction === 'left' ? 'next' : 'prev';
        vars.isSliding && setTimeout(function () {
          if (vars.touchPosition){
            vars.isSliding = false;
            slides[next].classList.add('active');
            slides[activeItem].classList.remove('active');
            slides[next].classList.remove(("carousel-item-" + orientation));
            slides[next].classList.remove(("carousel-item-" + (vars.direction)));
            slides[activeItem].classList.remove(("carousel-item-" + (vars.direction)));
            dispatchCustomEvent.call(element, slidCustomEvent);
            if ( !document.hidden && ops.interval && !element.classList.contains('paused') ) {
              self.cycle();
            }
          }
        }, timeout);
      }
    }
    self.cycle = function () {
      if (vars.timer) {
        clearInterval(vars.timer);
        vars.timer = null;
      }
      vars.timer = setInterval(function () {
        var idx = vars.index || self.getActiveIndex();
        isElementInScrollRange(element) && (idx++, self.slideTo( idx ) );
      }, ops.interval);
    };
    self.slideTo = function (next) {
      if (vars.isSliding) { return; }
      var activeItem = self.getActiveIndex(), orientation, eventProperties;
      if ( activeItem === next ) {
        return;
      } else if  ( (activeItem < next ) || (activeItem === 0 && next === slides.length -1 ) ) {
        vars.direction = 'left';
      } else if  ( (activeItem > next) || (activeItem === slides.length - 1 && next === 0 ) ) {
        vars.direction = 'right';
      }
      if ( next < 0 ) { next = slides.length - 1; }
      else if ( next >= slides.length ){ next = 0; }
      orientation = vars.direction === 'left' ? 'next' : 'prev';
      eventProperties = { relatedTarget: slides[next], direction: vars.direction, from: activeItem, to: next };
      slideCustomEvent = bootstrapCustomEvent('slide', 'carousel', eventProperties);
      slidCustomEvent = bootstrapCustomEvent('slid', 'carousel', eventProperties);
      dispatchCustomEvent.call(element, slideCustomEvent);
      if (slideCustomEvent.defaultPrevented) { return; }
      vars.index = next;
      vars.isSliding = true;
      clearInterval(vars.timer);
      vars.timer = null;
      setActivePage( next );
      if ( getElementTransitionDuration(slides[next]) && element.classList.contains('slide') ) {
        slides[next].classList.add(("carousel-item-" + orientation));
        slides[next].offsetWidth;
        slides[next].classList.add(("carousel-item-" + (vars.direction)));
        slides[activeItem].classList.add(("carousel-item-" + (vars.direction)));
        emulateTransitionEnd(slides[next], transitionEndHandler);
      } else {
        slides[next].classList.add('active');
        slides[next].offsetWidth;
        slides[activeItem].classList.remove('active');
        setTimeout(function () {
          vars.isSliding = false;
          if ( ops.interval && element && !element.classList.contains('paused') ) {
            self.cycle();
          }
          dispatchCustomEvent.call(element, slidCustomEvent);
        }, 100 );
      }
    };
    self.getActiveIndex = function () { return Array.from(slides).indexOf(element.getElementsByClassName('carousel-item active')[0]) || 0; };
    self.dispose = function () {
      var itemClasses = ['left','right','prev','next'];
      Array.from(slides).map(function (slide,idx) {
        slide.classList.contains('active') && setActivePage( idx );
        itemClasses.map(function (cls) { return slide.classList.remove(("carousel-item-" + cls)); });
      });
      clearInterval(vars.timer);
      toggleEvents();
      vars = {};
      ops = {};
      delete element.Carousel;
    };
    element = queryElement( element );
    element.Carousel && element.Carousel.dispose();
    slides = element.getElementsByClassName('carousel-item');
    leftArrow = element.getElementsByClassName('carousel-control-prev')[0];
    rightArrow = element.getElementsByClassName('carousel-control-next')[0];
    indicator = element.getElementsByClassName('carousel-indicators')[0];
    indicators = indicator && indicator.getElementsByTagName( "LI" ) || [];
    if (slides.length < 2) { return }
    var
      intervalAttribute = element.getAttribute('data-interval'),
      intervalData = intervalAttribute === 'false' ? 0 : parseInt(intervalAttribute),
      touchData = element.getAttribute('data-touch') === 'false' ? 0 : 1,
      pauseData = element.getAttribute('data-pause') === 'hover' || false,
      keyboardData = element.getAttribute('data-keyboard') === 'true' || false,
      intervalOption = options.interval,
      touchOption = options.touch;
    ops = {};
    ops.keyboard = options.keyboard === true || keyboardData;
    ops.pause = (options.pause === 'hover' || pauseData) ? 'hover' : false;
    ops.touch = touchOption || touchData;
    ops.interval = typeof intervalOption === 'number' ? intervalOption
                : intervalOption === false || intervalData === 0 || intervalData === false ? 0
                : isNaN(intervalData) ? 5000
                : intervalData;
    if (self.getActiveIndex()<0) {
      slides.length && slides[0].classList.add('active');
      indicators.length && setActivePage(0);
    }
    vars = {};
    vars.direction = 'left';
    vars.index = 0;
    vars.timer = null;
    vars.isSliding = false;
    vars.isTouch = false;
    vars.touchPosition = {
      startX : 0,
      currentX : 0,
      endX : 0
    };
    toggleEvents(1);
    if ( ops.interval ){ self.cycle(); }
    element.Carousel = self;
  }

  function Collapse(element,options) {
    options = options || {};
    var self = this;
    var accordion = null,
        collapse = null,
        activeCollapse,
        activeElement,
        showCustomEvent,
        shownCustomEvent,
        hideCustomEvent,
        hiddenCustomEvent;
    function openAction(collapseElement, toggle) {
      dispatchCustomEvent.call(collapseElement, showCustomEvent);
      if ( showCustomEvent.defaultPrevented ) { return; }
      collapseElement.isAnimating = true;
      collapseElement.classList.add('collapsing');
      collapseElement.classList.remove('collapse');
      collapseElement.style.height = (collapseElement.scrollHeight) + "px";
      emulateTransitionEnd(collapseElement, function () {
        collapseElement.isAnimating = false;
        collapseElement.setAttribute('aria-expanded','true');
        toggle.setAttribute('aria-expanded','true');
        collapseElement.classList.remove('collapsing');
        collapseElement.classList.add('collapse');
        collapseElement.classList.add('show');
        collapseElement.style.height = '';
        dispatchCustomEvent.call(collapseElement, shownCustomEvent);
      });
    }
    function closeAction(collapseElement, toggle) {
      dispatchCustomEvent.call(collapseElement, hideCustomEvent);
      if ( hideCustomEvent.defaultPrevented ) { return; }
      collapseElement.isAnimating = true;
      collapseElement.style.height = (collapseElement.scrollHeight) + "px";
      collapseElement.classList.remove('collapse');
      collapseElement.classList.remove('show');
      collapseElement.classList.add('collapsing');
      collapseElement.offsetWidth;
      collapseElement.style.height = '0px';
      emulateTransitionEnd(collapseElement, function () {
        collapseElement.isAnimating = false;
        collapseElement.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-expanded','false');
        collapseElement.classList.remove('collapsing');
        collapseElement.classList.add('collapse');
        collapseElement.style.height = '';
        dispatchCustomEvent.call(collapseElement, hiddenCustomEvent);
      });
    }
    self.toggle = function (e) {
      if (e && e.target.tagName === 'A' || element.tagName === 'A') {e.preventDefault();}
      if (element.contains(e.target) || e.target === element) {
        if (!collapse.classList.contains('show')) { self.show(); }
        else { self.hide(); }
      }
    };
    self.hide = function () {
      if ( collapse.isAnimating ) { return; }
      closeAction(collapse,element);
      element.classList.add('collapsed');
    };
    self.show = function () {
      if ( accordion ) {
        activeCollapse = accordion.getElementsByClassName("collapse show")[0];
        activeElement = activeCollapse && (queryElement(("[data-target=\"#" + (activeCollapse.id) + "\"]"),accordion)
                      || queryElement(("[href=\"#" + (activeCollapse.id) + "\"]"),accordion) );
      }
      if ( !collapse.isAnimating ) {
        if ( activeElement && activeCollapse !== collapse ) {
          closeAction(activeCollapse,activeElement);
          activeElement.classList.add('collapsed');
        }
        openAction(collapse,element);
        element.classList.remove('collapsed');
      }
    };
    self.dispose = function () {
      element.removeEventListener('click',self.toggle,false);
      delete element.Collapse;
    };
      element = queryElement(element);
      element.Collapse && element.Collapse.dispose();
      var accordionData = element.getAttribute('data-parent');
      showCustomEvent = bootstrapCustomEvent('show', 'collapse');
      shownCustomEvent = bootstrapCustomEvent('shown', 'collapse');
      hideCustomEvent = bootstrapCustomEvent('hide', 'collapse');
      hiddenCustomEvent = bootstrapCustomEvent('hidden', 'collapse');
      collapse = queryElement(options.target || element.getAttribute('data-target') || element.getAttribute('href'));
      collapse.isAnimating = false;
      accordion = element.closest(options.parent || accordionData);
      if ( !element.Collapse ) {
        element.addEventListener('click',self.toggle,false);
      }
      element.Collapse = self;
  }

  function setFocus (element){
    element.focus ? element.focus() : element.setActive();
  }

  function Dropdown(element,option) {
    var self = this,
        showCustomEvent,
        shownCustomEvent,
        hideCustomEvent,
        hiddenCustomEvent,
        relatedTarget = null,
        parent, menu, menuItems = [],
        persist;
    function preventEmptyAnchor(anchor) {
      (anchor.href && anchor.href.slice(-1) === '#' || anchor.parentNode && anchor.parentNode.href
        && anchor.parentNode.href.slice(-1) === '#') && this.preventDefault();
    }
    function toggleDismiss() {
      var action = element.open ? 'addEventListener' : 'removeEventListener';
      document[action]('click',dismissHandler,false);
      document[action]('keydown',preventScroll,false);
      document[action]('keyup',keyHandler,false);
      document[action]('focus',dismissHandler,false);
    }
    function dismissHandler(e) {
      var eventTarget = e.target,
            hasData = eventTarget && (eventTarget.getAttribute('data-toggle')
                                  || eventTarget.parentNode && eventTarget.parentNode.getAttribute
                                  && eventTarget.parentNode.getAttribute('data-toggle'));
      if ( e.type === 'focus' && (eventTarget === element || eventTarget === menu || menu.contains(eventTarget) ) ) {
        return;
      }
      if ( (eventTarget === menu || menu.contains(eventTarget)) && (persist || hasData) ) { return; }
      else {
        relatedTarget = eventTarget === element || element.contains(eventTarget) ? element : null;
        self.hide();
      }
      preventEmptyAnchor.call(e,eventTarget);
    }
    function clickHandler(e) {
      relatedTarget = element;
      self.show();
      preventEmptyAnchor.call(e,e.target);
    }
    function preventScroll(e) {
      var key = e.which || e.keyCode;
      if( key === 38 || key === 40 ) { e.preventDefault(); }
    }
    function keyHandler(e) {
      var key = e.which || e.keyCode,
          activeItem = document.activeElement,
          isSameElement = activeItem === element,
          isInsideMenu = menu.contains(activeItem),
          isMenuItem = activeItem.parentNode === menu || activeItem.parentNode.parentNode === menu,
          idx = menuItems.indexOf(activeItem);
      if ( isMenuItem ) {
        idx = isSameElement ? 0
                            : key === 38 ? (idx>1?idx-1:0)
                            : key === 40 ? (idx<menuItems.length-1?idx+1:idx) : idx;
        menuItems[idx] && setFocus(menuItems[idx]);
      }
      if ( (menuItems.length && isMenuItem
            || !menuItems.length && (isInsideMenu || isSameElement)
            || !isInsideMenu )
            && element.open && key === 27
      ) {
        self.toggle();
        relatedTarget = null;
      }
    }
    self.show = function () {
      showCustomEvent = bootstrapCustomEvent('show', 'dropdown', { relatedTarget: relatedTarget });
      dispatchCustomEvent.call(parent, showCustomEvent);
      if ( showCustomEvent.defaultPrevented ) { return; }
      menu.classList.add('show');
      parent.classList.add('show');
      element.setAttribute('aria-expanded',true);
      element.open = true;
      element.removeEventListener('click',clickHandler,false);
      setTimeout(function () {
        setFocus( menu.getElementsByTagName('INPUT')[0] || element );
        toggleDismiss();
        shownCustomEvent = bootstrapCustomEvent('shown', 'dropdown', { relatedTarget: relatedTarget });
        dispatchCustomEvent.call(parent, shownCustomEvent);
      },1);
    };
    self.hide = function () {
      hideCustomEvent = bootstrapCustomEvent('hide', 'dropdown', { relatedTarget: relatedTarget });
      dispatchCustomEvent.call(parent, hideCustomEvent);
      if ( hideCustomEvent.defaultPrevented ) { return; }
      menu.classList.remove('show');
      parent.classList.remove('show');
      element.setAttribute('aria-expanded',false);
      element.open = false;
      toggleDismiss();
      setFocus(element);
      setTimeout(function () {
        element.Dropdown && element.addEventListener('click',clickHandler,false);
      },1);
      hiddenCustomEvent = bootstrapCustomEvent('hidden', 'dropdown', { relatedTarget: relatedTarget });
      dispatchCustomEvent.call(parent, hiddenCustomEvent);
    };
    self.toggle = function () {
      if (parent.classList.contains('show') && element.open) { self.hide(); }
      else { self.show(); }
    };
    self.dispose = function () {
      if (parent.classList.contains('show') && element.open) { self.hide(); }
      element.removeEventListener('click',clickHandler,false);
      delete element.Dropdown;
    };
    element = queryElement(element);
    element.Dropdown && element.Dropdown.dispose();
    parent = element.parentNode;
    menu = queryElement('.dropdown-menu', parent);
    Array.from(menu.children).map(function (child){
      child.children.length && (child.children[0].tagName === 'A' && menuItems.push(child.children[0]));
      child.tagName === 'A' && menuItems.push(child);
    });
    if ( !element.Dropdown ) {
      !('tabindex' in menu) && menu.setAttribute('tabindex', '0');
      element.addEventListener('click',clickHandler,false);
    }
    persist = option === true || element.getAttribute('data-persist') === 'true' || false;
    element.open = false;
    element.Dropdown = self;
  }

  function Modal(element,options) {
    options = options || {};
    var self = this, modal,
      showCustomEvent,
      shownCustomEvent,
      hideCustomEvent,
      hiddenCustomEvent,
      relatedTarget = null,
      scrollBarWidth,
      overlay,
      overlayDelay,
      fixedItems,
      ops = {};
    function setScrollbar() {
      var openModal = document.body.classList.contains('modal-open'),
          bodyPad = parseInt(getComputedStyle(document.body).paddingRight),
          bodyOverflow = document.documentElement.clientHeight !== document.documentElement.scrollHeight
                      || document.body.clientHeight !== document.body.scrollHeight,
          modalOverflow = modal.clientHeight !== modal.scrollHeight;
      scrollBarWidth = measureScrollbar();
      modal.style.paddingRight = !modalOverflow && scrollBarWidth ? (scrollBarWidth + "px") : '';
      document.body.style.paddingRight = modalOverflow || bodyOverflow ? ((bodyPad + (openModal ? 0:scrollBarWidth)) + "px") : '';
      fixedItems.length && fixedItems.map(function (fixed){
        var itemPad = getComputedStyle(fixed).paddingRight;
        fixed.style.paddingRight = modalOverflow || bodyOverflow ? ((parseInt(itemPad) + (openModal?0:scrollBarWidth)) + "px") : ((parseInt(itemPad)) + "px");
      });
    }
    function resetScrollbar() {
      document.body.style.paddingRight = '';
      modal.style.paddingRight = '';
      fixedItems.length && fixedItems.map(function (fixed){
        fixed.style.paddingRight = '';
      });
    }
    function measureScrollbar() {
      var scrollDiv = document.createElement('div'), widthValue;
      scrollDiv.className = 'modal-scrollbar-measure';
      document.body.appendChild(scrollDiv);
      widthValue = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return widthValue;
    }
    function createOverlay() {
      var newOverlay = document.createElement('div');
      overlay = queryElement('.modal-backdrop');
      if ( overlay === null ) {
        newOverlay.setAttribute('class', 'modal-backdrop' + (ops.animation ? ' fade' : ''));
        overlay = newOverlay;
        document.body.appendChild(overlay);
      }
      return overlay;
    }
    function removeOverlay () {
      overlay = queryElement('.modal-backdrop');
      if ( overlay && !document.getElementsByClassName('modal show')[0] ) {
        document.body.removeChild(overlay); overlay = null;
      }
      overlay === null && (document.body.classList.remove('modal-open'), resetScrollbar());
    }
    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      window[action]( 'resize', self.update, passiveHandler);
      modal[action]( 'click',dismissHandler,false);
      document[action]( 'keydown',keyHandler,false);
    }
    function beforeShow() {
      modal.style.display = 'block';
      setScrollbar();
      !document.getElementsByClassName('modal show')[0] && document.body.classList.add('modal-open');
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', false);
      modal.classList.contains('fade') ? emulateTransitionEnd(modal, triggerShow) : triggerShow();
    }
    function triggerShow() {
      setFocus(modal);
      modal.isAnimating = false;
      toggleEvents(1);
      shownCustomEvent = bootstrapCustomEvent('shown', 'modal', { relatedTarget: relatedTarget });
      dispatchCustomEvent.call(modal, shownCustomEvent);
    }
    function triggerHide(force) {
      modal.style.display = '';
      element && (setFocus(element));
      overlay = queryElement('.modal-backdrop');
      if (force !== 1 && overlay && overlay.classList.contains('show') && !document.getElementsByClassName('modal show')[0]) {
        overlay.classList.remove('show');
        emulateTransitionEnd(overlay,removeOverlay);
      } else {
        removeOverlay();
      }
      toggleEvents();
      modal.isAnimating = false;
      hiddenCustomEvent = bootstrapCustomEvent('hidden', 'modal');
      dispatchCustomEvent.call(modal, hiddenCustomEvent);
    }
    function clickHandler(e) {
      if ( modal.isAnimating ) { return; }
      var clickTarget = e.target,
          modalID = "#" + (modal.getAttribute('id')),
          targetAttrValue = clickTarget.getAttribute('data-target') || clickTarget.getAttribute('href'),
          elemAttrValue = element.getAttribute('data-target') || element.getAttribute('href');
      if ( !modal.classList.contains('show')
          && (clickTarget === element && targetAttrValue === modalID
          || element.contains(clickTarget) && elemAttrValue === modalID) ) {
        modal.modalTrigger = element;
        relatedTarget = element;
        self.show();
        e.preventDefault();
      }
    }
    function keyHandler(ref) {
      var which = ref.which;
      if (!modal.isAnimating && ops.keyboard && which == 27 && modal.classList.contains('show') ) {
        self.hide();
      }
    }
    function dismissHandler(e) {
      if ( modal.isAnimating ) { return; }
      var clickTarget = e.target,
          hasData = clickTarget.getAttribute('data-dismiss') === 'modal',
          parentWithData = clickTarget.closest('[data-dismiss="modal"]');
      if ( modal.classList.contains('show') && ( parentWithData || hasData
          || clickTarget === modal && ops.backdrop !== 'static' ) ) {
        self.hide(); relatedTarget = null;
        e.preventDefault();
      }
    }
    self.toggle = function () {
      if ( modal.classList.contains('show') ) {self.hide();} else {self.show();}
    };
    self.show = function () {
      if (modal.classList.contains('show') && !!modal.isAnimating ) {return}
      showCustomEvent = bootstrapCustomEvent('show', 'modal', { relatedTarget: relatedTarget });
      dispatchCustomEvent.call(modal, showCustomEvent);
      if ( showCustomEvent.defaultPrevented ) { return; }
      modal.isAnimating = true;
      var currentOpen = document.getElementsByClassName('modal show')[0];
      if (currentOpen && currentOpen !== modal) {
        currentOpen.modalTrigger && currentOpen.modalTrigger.Modal.hide();
        currentOpen.Modal && currentOpen.Modal.hide();
      }
      if ( ops.backdrop ) {
        overlay = createOverlay();
      }
      if ( overlay && !currentOpen && !overlay.classList.contains('show') ) {
        overlay.offsetWidth;
        overlayDelay = getElementTransitionDuration(overlay);
        overlay.classList.add('show');
      }
      !currentOpen ? setTimeout( beforeShow, overlay && overlayDelay ? overlayDelay:0 ) : beforeShow();
    };
    self.hide = function (force) {
      if ( !modal.classList.contains('show') ) {return}
      hideCustomEvent = bootstrapCustomEvent( 'hide', 'modal');
      dispatchCustomEvent.call(modal, hideCustomEvent);
      if ( hideCustomEvent.defaultPrevented ) { return; }
      modal.isAnimating = true;
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', true);
      modal.classList.contains('fade') && force !== 1 ? emulateTransitionEnd(modal, triggerHide) : triggerHide();
    };
    self.setContent = function (content) {
      queryElement('.modal-content',modal).innerHTML = content;
    };
    self.update = function () {
      if (modal.classList.contains('show')) {
        setScrollbar();
      }
    };
    self.dispose = function () {
      self.hide(1);
      if (element) {element.removeEventListener('click',clickHandler,false); delete element.Modal; }
      else {delete modal.Modal;}
    };
    element = queryElement(element);
    var checkModal = queryElement( element.getAttribute('data-target') || element.getAttribute('href') );
    modal = element.classList.contains('modal') ? element : checkModal;
    fixedItems = Array.from(document.getElementsByClassName('fixed-top'))
                      .concat(Array.from(document.getElementsByClassName('fixed-bottom')));
    if ( element.classList.contains('modal') ) { element = null; }
    element && element.Modal && element.Modal.dispose();
    modal && modal.Modal && modal.Modal.dispose();
    ops.keyboard = options.keyboard === false || modal.getAttribute('data-keyboard') === 'false' ? false : true;
    ops.backdrop = options.backdrop === 'static' || modal.getAttribute('data-backdrop') === 'static' ? 'static' : true;
    ops.backdrop = options.backdrop === false || modal.getAttribute('data-backdrop') === 'false' ? false : ops.backdrop;
    ops.animation = modal.classList.contains('fade') ? true : false;
    ops.content = options.content;
    modal.isAnimating = false;
    if ( element && !element.Modal ) {
      element.addEventListener('click',clickHandler,false);
    }
    if ( ops.content ) {
      self.setContent( ops.content.trim() );
    }
    if (element) {
      modal.modalTrigger = element;
      element.Modal = self;
    } else {
      modal.Modal = self;
    }
  }

  var mouseClickEvents = { down: 'mousedown', up: 'mouseup' };

  function getScroll() {
    return {
      y : window.pageYOffset || document.documentElement.scrollTop,
      x : window.pageXOffset || document.documentElement.scrollLeft
    }
  }

  function styleTip(link,element,position,parent) {
    var tipPositions = /\b(top|bottom|left|right)+/,
        elementDimensions = { w : element.offsetWidth, h: element.offsetHeight },
        windowWidth = (document.documentElement.clientWidth || document.body.clientWidth),
        windowHeight = (document.documentElement.clientHeight || document.body.clientHeight),
        rect = link.getBoundingClientRect(),
        scroll = parent === document.body ? getScroll() : { x: parent.offsetLeft + parent.scrollLeft, y: parent.offsetTop + parent.scrollTop },
        linkDimensions = { w: rect.right - rect.left, h: rect.bottom - rect.top },
        isPopover = element.classList.contains('popover'),
        arrow = element.getElementsByClassName('arrow')[0],
        halfTopExceed = rect.top + linkDimensions.h/2 - elementDimensions.h/2 < 0,
        halfLeftExceed = rect.left + linkDimensions.w/2 - elementDimensions.w/2 < 0,
        halfRightExceed = rect.left + elementDimensions.w/2 + linkDimensions.w/2 >= windowWidth,
        halfBottomExceed = rect.top + elementDimensions.h/2 + linkDimensions.h/2 >= windowHeight,
        topExceed = rect.top - elementDimensions.h < 0,
        leftExceed = rect.left - elementDimensions.w < 0,
        bottomExceed = rect.top + elementDimensions.h + linkDimensions.h >= windowHeight,
        rightExceed = rect.left + elementDimensions.w + linkDimensions.w >= windowWidth;
    position = (position === 'left' || position === 'right') && leftExceed && rightExceed ? 'top' : position;
    position = position === 'top' && topExceed ? 'bottom' : position;
    position = position === 'bottom' && bottomExceed ? 'top' : position;
    position = position === 'left' && leftExceed ? 'right' : position;
    position = position === 'right' && rightExceed ? 'left' : position;
    var topPosition,
      leftPosition,
      arrowTop,
      arrowLeft,
      arrowWidth,
      arrowHeight;
    element.className.indexOf(position) === -1 && (element.className = element.className.replace(tipPositions,position));
    arrowWidth = arrow.offsetWidth; arrowHeight = arrow.offsetHeight;
    if ( position === 'left' || position === 'right' ) {
      if ( position === 'left' ) {
        leftPosition = rect.left + scroll.x - elementDimensions.w - ( isPopover ? arrowWidth : 0 );
      } else {
        leftPosition = rect.left + scroll.x + linkDimensions.w;
      }
      if (halfTopExceed) {
        topPosition = rect.top + scroll.y;
        arrowTop = linkDimensions.h/2 - arrowWidth;
      } else if (halfBottomExceed) {
        topPosition = rect.top + scroll.y - elementDimensions.h + linkDimensions.h;
        arrowTop = elementDimensions.h - linkDimensions.h/2 - arrowWidth;
      } else {
        topPosition = rect.top + scroll.y - elementDimensions.h/2 + linkDimensions.h/2;
        arrowTop = elementDimensions.h/2 - (isPopover ? arrowHeight*0.9 : arrowHeight/2);
      }
    } else if ( position === 'top' || position === 'bottom' ) {
      if ( position === 'top') {
        topPosition =  rect.top + scroll.y - elementDimensions.h - ( isPopover ? arrowHeight : 0 );
      } else {
        topPosition = rect.top + scroll.y + linkDimensions.h;
      }
      if (halfLeftExceed) {
        leftPosition = 0;
        arrowLeft = rect.left + linkDimensions.w/2 - arrowWidth;
      } else if (halfRightExceed) {
        leftPosition = windowWidth - elementDimensions.w*1.01;
        arrowLeft = elementDimensions.w - ( windowWidth - rect.left ) + linkDimensions.w/2 - arrowWidth/2;
      } else {
        leftPosition = rect.left + scroll.x - elementDimensions.w/2 + linkDimensions.w/2;
        arrowLeft = elementDimensions.w/2 - ( isPopover ? arrowWidth : arrowWidth/2 );
      }
    }
    element.style.top = topPosition + 'px';
    element.style.left = leftPosition + 'px';
    arrowTop && (arrow.style.top = arrowTop + 'px');
    arrowLeft && (arrow.style.left = arrowLeft + 'px');
  }

  function Popover(element,options) {
    options = options || {};
    var self = this;
    var popover = null,
        timer = 0,
        isIphone = /(iPhone|iPod|iPad)/.test(navigator.userAgent),
        titleString,
        contentString,
        ops = {};
    var triggerData,
        animationData,
        placementData,
        dismissibleData,
        delayData,
        containerData,
        closeBtn,
        showCustomEvent,
        shownCustomEvent,
        hideCustomEvent,
        hiddenCustomEvent,
        containerElement,
        containerDataElement,
        modal,
        navbarFixedTop,
        navbarFixedBottom,
        placementClass;
    function dismissibleHandler(e) {
      if (popover !== null && e.target === queryElement('.close',popover)) {
        self.hide();
      }
    }
    function getContents() {
      return {
        0 : options.title || element.getAttribute('data-title') || null,
        1 : options.content || element.getAttribute('data-content') || null
      }
    }
    function removePopover() {
      ops.container.removeChild(popover);
      timer = null; popover = null;
    }
    function createPopover() {
      titleString = getContents()[0] || null;
      contentString = getContents()[1];
      contentString = !!contentString ? contentString.trim() : null;
      popover = document.createElement('div');
      var popoverArrow = document.createElement('div');
      popoverArrow.classList.add('arrow');
      popover.appendChild(popoverArrow);
      if ( contentString !== null && ops.template === null ) {
        popover.setAttribute('role','tooltip');
        if (titleString !== null) {
          var popoverTitle = document.createElement('h3');
          popoverTitle.classList.add('popover-header');
          popoverTitle.innerHTML = ops.dismissible ? titleString + closeBtn : titleString;
          popover.appendChild(popoverTitle);
        }
        var popoverBodyMarkup = document.createElement('div');
        popoverBodyMarkup.classList.add('popover-body');
        popoverBodyMarkup.innerHTML = ops.dismissible && titleString === null ? contentString + closeBtn : contentString;
        popover.appendChild(popoverBodyMarkup);
      } else {
        var popoverTemplate = document.createElement('div');
        popoverTemplate.innerHTML = ops.template.trim();
        popover.className = popoverTemplate.firstChild.className;
        popover.innerHTML = popoverTemplate.firstChild.innerHTML;
        var popoverHeader = queryElement('.popover-header',popover),
            popoverBody = queryElement('.popover-body',popover);
        titleString && popoverHeader && (popoverHeader.innerHTML = titleString.trim());
        contentString && popoverBody && (popoverBody.innerHTML = contentString.trim());
      }
      ops.container.appendChild(popover);
      popover.style.display = 'block';
      !popover.classList.contains( 'popover') && popover.classList.add('popover');
      !popover.classList.contains( ops.animation) && popover.classList.add(ops.animation);
      !popover.classList.contains( placementClass) && popover.classList.add(placementClass);
    }
    function showPopover() {
      !popover.classList.contains('show') && ( popover.classList.add('show') );
    }
    function updatePopover() {
      styleTip(element, popover, ops.placement, ops.container);
    }
    function forceFocus () {
      if (popover === null) { element.focus(); }
    }
    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      if (ops.trigger === 'hover') {
        element[action]( mouseClickEvents.down, self.show );
        element[action]( mouseHoverEvents[0], self.show );
        if (!ops.dismissible) { element[action]( mouseHoverEvents[1], self.hide ); }
      } else if ('click' == ops.trigger) {
        element[action]( ops.trigger, self.toggle );
      } else if ('focus' == ops.trigger) {
        isIphone && element[action]( 'click', forceFocus, false );
        element[action]( ops.trigger, self.toggle );
      }
    }
    function touchHandler(e){
      if ( popover && popover.contains(e.target) || e.target === element || element.contains(e.target)) ; else {
        self.hide();
      }
    }
    function dismissHandlerToggle(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      if (ops.dismissible) {
        document[action]('click', dismissibleHandler, false );
      } else {
        'focus' == ops.trigger && element[action]( 'blur', self.hide );
        'hover' == ops.trigger && document[action]( 'touchstart', touchHandler, passiveHandler );
      }
      window[action]('resize', self.hide, passiveHandler );
    }
    function showTrigger() {
      dismissHandlerToggle(1);
      dispatchCustomEvent.call(element, shownCustomEvent);
    }
    function hideTrigger() {
      dismissHandlerToggle();
      removePopover();
      dispatchCustomEvent.call(element, hiddenCustomEvent);
    }
    self.toggle = function () {
      if (popover === null) { self.show(); }
      else { self.hide(); }
    };
    self.show = function () {
      clearTimeout(timer);
      timer = setTimeout( function () {
        if (popover === null) {
          dispatchCustomEvent.call(element, showCustomEvent);
          if ( showCustomEvent.defaultPrevented ) { return; }
          createPopover();
          updatePopover();
          showPopover();
          !!ops.animation ? emulateTransitionEnd(popover, showTrigger) : showTrigger();
        }
      }, 20 );
    };
    self.hide = function () {
      clearTimeout(timer);
      timer = setTimeout( function () {
        if (popover && popover !== null && popover.classList.contains('show')) {
          dispatchCustomEvent.call(element, hideCustomEvent);
          if ( hideCustomEvent.defaultPrevented ) { return; }
          popover.classList.remove('show');
          !!ops.animation ? emulateTransitionEnd(popover, hideTrigger) : hideTrigger();
        }
      }, ops.delay );
    };
    self.dispose = function () {
      self.hide();
      toggleEvents();
      delete element.Popover;
    };
    element = queryElement(element);
    element.Popover && element.Popover.dispose();
    triggerData = element.getAttribute('data-trigger');
    animationData = element.getAttribute('data-animation');
    placementData = element.getAttribute('data-placement');
    dismissibleData = element.getAttribute('data-dismissible');
    delayData = element.getAttribute('data-delay');
    containerData = element.getAttribute('data-container');
    closeBtn = '<button type="button" class="close">×</button>';
    showCustomEvent = bootstrapCustomEvent('show', 'popover');
    shownCustomEvent = bootstrapCustomEvent('shown', 'popover');
    hideCustomEvent = bootstrapCustomEvent('hide', 'popover');
    hiddenCustomEvent = bootstrapCustomEvent('hidden', 'popover');
    containerElement = queryElement(options.container);
    containerDataElement = queryElement(containerData);
    modal = element.closest('.modal');
    navbarFixedTop = element.closest('.fixed-top');
    navbarFixedBottom = element.closest('.fixed-bottom');
    ops.template = options.template ? options.template : null;
    ops.trigger = options.trigger ? options.trigger : triggerData || 'hover';
    ops.animation = options.animation && options.animation !== 'fade' ? options.animation : animationData || 'fade';
    ops.placement = options.placement ? options.placement : placementData || 'top';
    ops.delay = parseInt(options.delay || delayData) || 200;
    ops.dismissible = options.dismissible || dismissibleData === 'true' ? true : false;
    ops.container = containerElement ? containerElement
                            : containerDataElement ? containerDataElement
                            : navbarFixedTop ? navbarFixedTop
                            : navbarFixedBottom ? navbarFixedBottom
                            : modal ? modal : document.body;
    placementClass = "bs-popover-" + (ops.placement);
    var popoverContents = getContents();
    titleString = popoverContents[0];
    contentString = popoverContents[1];
    if ( !contentString && !ops.template ) { return; }
    if ( !element.Popover ) {
      toggleEvents(1);
    }
    element.Popover = self;
  }

  function ScrollSpy(element,options) {
    options = options || {};
    var self = this,
      vars,
      targetData,
      offsetData,
      spyTarget,
      scrollTarget,
      ops = {};
    function updateTargets(){
      var links = spyTarget.getElementsByTagName('A');
      if (vars.length !== links.length) {
        vars.items = [];
        vars.targets = [];
        Array.from(links).map(function (link){
          var href = link.getAttribute('href'),
            targetItem = href && href.charAt(0) === '#' && href.slice(-1) !== '#' && queryElement(href);
          if ( targetItem ) {
            vars.items.push(link);
            vars.targets.push(targetItem);
          }
        });
        vars.length = links.length;
      }
    }
    function updateItem(index) {
      var item = vars.items[index],
        targetItem = vars.targets[index],
        dropmenu = item.classList.contains('dropdown-item') && item.closest('.dropdown-menu'),
        dropLink = dropmenu && dropmenu.previousElementSibling,
        nextSibling = item.nextElementSibling,
        activeSibling = nextSibling && nextSibling.getElementsByClassName('active').length,
        targetRect = vars.isWindow && targetItem.getBoundingClientRect(),
        isActive = item.classList.contains('active') || false,
        topEdge = (vars.isWindow ? targetRect.top + vars.scrollOffset : targetItem.offsetTop) - ops.offset,
        bottomEdge = vars.isWindow ? targetRect.bottom + vars.scrollOffset - ops.offset
                   : vars.targets[index+1] ? vars.targets[index+1].offsetTop - ops.offset
                   : element.scrollHeight,
        inside = activeSibling || vars.scrollOffset >= topEdge && bottomEdge > vars.scrollOffset;
       if ( !isActive && inside ) {
        item.classList.add('active');
        if (dropLink && !dropLink.classList.contains('active') ) {
          dropLink.classList.add('active');
        }
        dispatchCustomEvent.call(element, bootstrapCustomEvent( 'activate', 'scrollspy', { relatedTarget: vars.items[index] }));
      } else if ( isActive && !inside ) {
        item.classList.remove('active');
        if (dropLink && dropLink.classList.contains('active') && !item.parentNode.getElementsByClassName('active').length ) {
          dropLink.classList.remove('active');
        }
      } else if ( isActive && inside || !inside && !isActive ) {
        return;
      }
    }
    function updateItems() {
      updateTargets();
      vars.scrollOffset = vars.isWindow ? getScroll().y : element.scrollTop;
      vars.items.map(function (l,idx){ return updateItem(idx); });
    }
    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      scrollTarget[action]('scroll', self.refresh, passiveHandler );
      window[action]( 'resize', self.refresh, passiveHandler );
    }
    self.refresh = function () {
      updateItems();
    };
    self.dispose = function () {
      toggleEvents();
      delete element.ScrollSpy;
    };
    element = queryElement(element);
    element.ScrollSpy && element.ScrollSpy.dispose();
    targetData = element.getAttribute('data-target');
    offsetData = element.getAttribute('data-offset');
    spyTarget = queryElement(options.target || targetData);
    scrollTarget = element.offsetHeight < element.scrollHeight ? element : window;
    if (!spyTarget) { return }
    ops.target = spyTarget;
    ops.offset = parseInt(options.offset || offsetData) || 10;
    vars = {};
    vars.length = 0;
    vars.items = [];
    vars.targets = [];
    vars.isWindow = scrollTarget === window;
    if ( !element.ScrollSpy ) {
      toggleEvents(1);
    }
    self.refresh();
    element.ScrollSpy = self;
  }

  function Tab(element,options) {
    options = options || {};
    var self = this,
      heightData,
      tabs, dropdown,
      showCustomEvent,
      shownCustomEvent,
      hideCustomEvent,
      hiddenCustomEvent,
      next,
      tabsContentContainer = false,
      activeTab,
      activeContent,
      nextContent,
      containerHeight,
      equalContents,
      nextHeight,
      animateHeight;
    function triggerEnd() {
      tabsContentContainer.style.height = '';
      tabsContentContainer.classList.remove('collapsing');
      tabs.isAnimating = false;
    }
    function triggerShow() {
      if (tabsContentContainer) {
        if ( equalContents ) {
          triggerEnd();
        } else {
          setTimeout(function () {
            tabsContentContainer.style.height = nextHeight + "px";
            tabsContentContainer.offsetWidth;
            emulateTransitionEnd(tabsContentContainer, triggerEnd);
          },50);
        }
      } else {
        tabs.isAnimating = false;
      }
      shownCustomEvent = bootstrapCustomEvent('shown', 'tab', { relatedTarget: activeTab });
      dispatchCustomEvent.call(next, shownCustomEvent);
    }
    function triggerHide() {
      if (tabsContentContainer) {
        activeContent.style.float = 'left';
        nextContent.style.float = 'left';
        containerHeight = activeContent.scrollHeight;
      }
      showCustomEvent = bootstrapCustomEvent('show', 'tab', { relatedTarget: activeTab });
      hiddenCustomEvent = bootstrapCustomEvent('hidden', 'tab', { relatedTarget: next });
      dispatchCustomEvent.call(next, showCustomEvent);
      if ( showCustomEvent.defaultPrevented ) { return; }
      nextContent.classList.add('active');
      activeContent.classList.remove('active');
      if (tabsContentContainer) {
        nextHeight = nextContent.scrollHeight;
        equalContents = nextHeight === containerHeight;
        tabsContentContainer.classList.add('collapsing');
        tabsContentContainer.style.height = containerHeight + "px";
        tabsContentContainer.offsetHeight;
        activeContent.style.float = '';
        nextContent.style.float = '';
      }
      if ( nextContent.classList.contains('fade') ) {
        setTimeout(function () {
          nextContent.classList.add('show');
          emulateTransitionEnd(nextContent,triggerShow);
        },20);
      } else { triggerShow(); }
      dispatchCustomEvent.call(activeTab, hiddenCustomEvent);
    }
    function getActiveTab() {
      var activeTabs = tabs.getElementsByClassName('active'), activeTab;
      if ( activeTabs.length === 1 && !activeTabs[0].parentNode.classList.contains('dropdown') ) {
        activeTab = activeTabs[0];
      } else if ( activeTabs.length > 1 ) {
        activeTab = activeTabs[activeTabs.length-1];
      }
      return activeTab;
    }
    function getActiveContent() { return queryElement(getActiveTab().getAttribute('href')) }
    function clickHandler(e) {
      e.preventDefault();
      next = e.currentTarget;
      !tabs.isAnimating && self.show();
    }
    self.show = function () {
      next = next || element;
      if (!next.classList.contains('active')) {
        nextContent = queryElement(next.getAttribute('href'));
        activeTab = getActiveTab();
        activeContent = getActiveContent();
        hideCustomEvent = bootstrapCustomEvent( 'hide', 'tab', { relatedTarget: next });
        dispatchCustomEvent.call(activeTab, hideCustomEvent);
        if (hideCustomEvent.defaultPrevented) { return; }
        tabs.isAnimating = true;
        activeTab.classList.remove('active');
        activeTab.setAttribute('aria-selected','false');
        next.classList.add('active');
        next.setAttribute('aria-selected','true');
        if ( dropdown ) {
          if ( !element.parentNode.classList.contains('dropdown-menu') ) {
            if (dropdown.classList.contains('active')) { dropdown.classList.remove('active'); }
          } else {
            if (!dropdown.classList.contains('active')) { dropdown.classList.add('active'); }
          }
        }
        if (activeContent.classList.contains('fade')) {
          activeContent.classList.remove('show');
          emulateTransitionEnd(activeContent, triggerHide);
        } else { triggerHide(); }
      }
    };
    self.dispose = function () {
      element.removeEventListener('click',clickHandler,false);
      delete element.Tab;
    };
    element = queryElement(element);
    element.Tab && element.Tab.dispose();
    heightData = element.getAttribute('data-height');
    tabs = element.closest('.nav');
    dropdown = tabs && queryElement('.dropdown-toggle',tabs);
    animateHeight = !supportTransition || (options.height === false || heightData === 'false') ? false : true;
    tabs.isAnimating = false;
    if ( !element.Tab ) {
      element.addEventListener('click',clickHandler,false);
    }
    if (animateHeight) { tabsContentContainer = getActiveContent().parentNode; }
    element.Tab = self;
  }

  function Toast(element,options) {
    options = options || {};
    var self = this,
        toast, timer = 0,
        animationData,
        autohideData,
        delayData,
        showCustomEvent,
        hideCustomEvent,
        shownCustomEvent,
        hiddenCustomEvent,
        ops = {};
    function showComplete() {
      toast.classList.remove( 'showing' );
      toast.classList.add( 'show' );
      dispatchCustomEvent.call(toast,shownCustomEvent);
      if (ops.autohide) { self.hide(); }
    }
    function hideComplete() {
      toast.classList.add( 'hide' );
      dispatchCustomEvent.call(toast,hiddenCustomEvent);
    }
    function close () {
      toast.classList.remove('show' );
      ops.animation ? emulateTransitionEnd(toast, hideComplete) : hideComplete();
    }
    function disposeComplete() {
      clearTimeout(timer);
      element.removeEventListener('click',self.hide,false);
      delete element.Toast;
    }
    self.show = function () {
      if (toast && !toast.classList.contains('show')) {
        dispatchCustomEvent.call(toast,showCustomEvent);
        if (showCustomEvent.defaultPrevented) { return; }
        ops.animation && toast.classList.add( 'fade' );
        toast.classList.remove('hide' );
        toast.offsetWidth;
        toast.classList.add('showing' );
        ops.animation ? emulateTransitionEnd(toast, showComplete) : showComplete();
      }
    };
    self.hide = function (noTimer) {
      if (toast && toast.classList.contains('show')) {
        dispatchCustomEvent.call(toast,hideCustomEvent);
        if(hideCustomEvent.defaultPrevented) { return; }
        noTimer ? close() : (timer = setTimeout( close, ops.delay));
      }
    };
    self.dispose = function () {
      ops.animation ? emulateTransitionEnd(toast, disposeComplete) : disposeComplete();
    };
    element = queryElement(element);
    element.Toast && element.Toast.dispose();
    toast = element.closest('.toast');
    animationData = element.getAttribute('data-animation');
    autohideData = element.getAttribute('data-autohide');
    delayData = element.getAttribute('data-delay');
    showCustomEvent = bootstrapCustomEvent('show', 'toast');
    hideCustomEvent = bootstrapCustomEvent('hide', 'toast');
    shownCustomEvent = bootstrapCustomEvent('shown', 'toast');
    hiddenCustomEvent = bootstrapCustomEvent('hidden', 'toast');
    ops.animation = options.animation === false || animationData === 'false' ? 0 : 1;
    ops.autohide = options.autohide === false || autohideData === 'false' ? 0 : 1;
    ops.delay = parseInt(options.delay || delayData) || 500;
    if ( !element.Toast ) {
      element.addEventListener('click',self.hide,false);
    }
    element.Toast = self;
  }

  function Tooltip(element,options) {
    options = options || {};
    var self = this,
        tooltip = null, timer = 0, titleString,
        animationData,
        placementData,
        delayData,
        containerData,
        showCustomEvent,
        shownCustomEvent,
        hideCustomEvent,
        hiddenCustomEvent,
        containerElement,
        containerDataElement,
        modal,
        navbarFixedTop,
        navbarFixedBottom,
        placementClass,
        ops = {};
    function getTitle() {
      return element.getAttribute('title')
          || element.getAttribute('data-title')
          || element.getAttribute('data-original-title')
    }
    function removeToolTip() {
      ops.container.removeChild(tooltip);
      tooltip = null; timer = null;
    }
    function createToolTip() {
      titleString = getTitle();
      if ( titleString ) {
        tooltip = document.createElement('div');
        if (ops.template) {
          var tooltipMarkup = document.createElement('div');
          tooltipMarkup.innerHTML = ops.template.trim();
          tooltip.className = tooltipMarkup.firstChild.className;
          tooltip.innerHTML = tooltipMarkup.firstChild.innerHTML;
          queryElement('.tooltip-inner',tooltip).innerHTML = titleString.trim();
        } else {
          var tooltipArrow = document.createElement('div');
          tooltipArrow.classList.add('arrow');
          tooltip.appendChild(tooltipArrow);
          var tooltipInner = document.createElement('div');
          tooltipInner.classList.add('tooltip-inner');
          tooltip.appendChild(tooltipInner);
          tooltipInner.innerHTML = titleString;
        }
        tooltip.style.left = '0';
        tooltip.style.top = '0';
        tooltip.setAttribute('role','tooltip');
        !tooltip.classList.contains('tooltip') && tooltip.classList.add('tooltip');
        !tooltip.classList.contains(ops.animation) && tooltip.classList.add(ops.animation);
        !tooltip.classList.contains(placementClass) && tooltip.classList.add(placementClass);
        ops.container.appendChild(tooltip);
      }
    }
    function updateTooltip() {
      styleTip(element, tooltip, ops.placement, ops.container);
    }
    function showTooltip() {
      !tooltip.classList.contains('show') && ( tooltip.classList.add('show') );
    }
    function touchHandler(e){
      if ( tooltip && tooltip.contains(e.target) || e.target === element || element.contains(e.target)) ; else {
        self.hide();
      }
    }
    function toggleAction(action){
      action = action ? 'addEventListener' : 'removeEventListener';
      document[action]( 'touchstart', touchHandler, passiveHandler );
      window[action]( 'resize', self.hide, passiveHandler );
    }
    function showAction() {
      toggleAction(1);
      dispatchCustomEvent.call(element, shownCustomEvent);
    }
    function hideAction() {
      toggleAction();
      removeToolTip();
      dispatchCustomEvent.call(element, hiddenCustomEvent);
    }
    function toggleEvents(action) {
      action = action ? 'addEventListener' : 'removeEventListener';
      element[action](mouseClickEvents.down, self.show,false);
      element[action](mouseHoverEvents[0], self.show,false);
      element[action](mouseHoverEvents[1], self.hide,false);
    }
    self.show = function () {
      clearTimeout(timer);
      timer = setTimeout( function () {
        if (tooltip === null) {
          dispatchCustomEvent.call(element, showCustomEvent);
          if (showCustomEvent.defaultPrevented) { return; }
          if(createToolTip() !== false) {
            updateTooltip();
            showTooltip();
            !!ops.animation ? emulateTransitionEnd(tooltip, showAction) : showAction();
          }
        }
      }, 20 );
    };
    self.hide = function () {
      clearTimeout(timer);
      timer = setTimeout( function () {
        if (tooltip && tooltip.classList.contains('show')) {
          dispatchCustomEvent.call(element, hideCustomEvent);
          if (hideCustomEvent.defaultPrevented) { return; }
          tooltip.classList.remove('show');
          !!ops.animation ? emulateTransitionEnd(tooltip, hideAction) : hideAction();
        }
      }, ops.delay);
    };
    self.toggle = function () {
      if (!tooltip) { self.show(); }
      else { self.hide(); }
    };
    self.dispose = function () {
      toggleEvents();
      self.hide();
      element.setAttribute('title', element.getAttribute('data-original-title'));
      element.removeAttribute('data-original-title');
      delete element.Tooltip;
    };
    element = queryElement(element);
    element.Tooltip && element.Tooltip.dispose();
    animationData = element.getAttribute('data-animation');
    placementData = element.getAttribute('data-placement');
    delayData = element.getAttribute('data-delay');
    containerData = element.getAttribute('data-container');
    showCustomEvent = bootstrapCustomEvent('show', 'tooltip');
    shownCustomEvent = bootstrapCustomEvent('shown', 'tooltip');
    hideCustomEvent = bootstrapCustomEvent('hide', 'tooltip');
    hiddenCustomEvent = bootstrapCustomEvent('hidden', 'tooltip');
    containerElement = queryElement(options.container);
    containerDataElement = queryElement(containerData);
    modal = element.closest('.modal');
    navbarFixedTop = element.closest('.fixed-top');
    navbarFixedBottom = element.closest('.fixed-bottom');
    ops.animation = options.animation && options.animation !== 'fade' ? options.animation : animationData || 'fade';
    ops.placement = options.placement ? options.placement : placementData || 'top';
    ops.template = options.template ? options.template : null;
    ops.delay = parseInt(options.delay || delayData) || 200;
    ops.container = containerElement ? containerElement
                            : containerDataElement ? containerDataElement
                            : navbarFixedTop ? navbarFixedTop
                            : navbarFixedBottom ? navbarFixedBottom
                            : modal ? modal : document.body;
    placementClass = "bs-tooltip-" + (ops.placement);
    titleString = getTitle();
    if ( !titleString ) { return; }
    if (!element.Tooltip) {
      element.setAttribute('data-original-title',titleString);
      element.removeAttribute('title');
      toggleEvents(1);
    }
    element.Tooltip = self;
  }

  var componentsInit = {};

  function initializeDataAPI( Constructor, collection ){
    Array.from(collection).map(function (x){ return new Constructor(x); });
  }
  function initCallback(lookUp){
    lookUp = lookUp || document;
    for (var component in componentsInit) {
      initializeDataAPI( componentsInit[component][0], lookUp.querySelectorAll (componentsInit[component][1]) );
    }
  }

  componentsInit.Alert = [ Alert, '[data-dismiss="alert"]'];
  componentsInit.Button = [ Button, '[data-toggle="buttons"]' ];
  componentsInit.Carousel = [ Carousel, '[data-ride="carousel"]' ];
  componentsInit.Collapse = [ Collapse, '[data-toggle="collapse"]' ];
  componentsInit.Dropdown = [ Dropdown, '[data-toggle="dropdown"]'];
  componentsInit.Modal = [ Modal, '[data-toggle="modal"]' ];
  componentsInit.Popover = [ Popover, '[data-toggle="popover"],[data-tip="popover"]' ];
  componentsInit.ScrollSpy = [ ScrollSpy, '[data-spy="scroll"]' ];
  componentsInit.Tab = [ Tab, '[data-toggle="tab"]' ];
  componentsInit.Toast = [ Toast, '[data-dismiss="toast"]' ];
  componentsInit.Tooltip = [ Tooltip, '[data-toggle="tooltip"],[data-tip="tooltip"]' ];
  document.body ? initCallback() : document.addEventListener( 'DOMContentLoaded', function initWrapper(){
  	initCallback();
  	document.removeEventListener('DOMContentLoaded',initWrapper,false);
  }, false );

  function removeElementDataAPI( ConstructorName, collection ){
    Array.from(collection).map(function (x){ return x[ConstructorName].dispose(); });
  }
  function removeDataAPI(lookUp) {
    lookUp = lookUp || document;
    for (var component in componentsInit) {
      removeElementDataAPI( component, lookUp.querySelectorAll (componentsInit[component][1]) );
    }
  }

  var version = "3.0.14";

  var index = {
    Alert: Alert,
    Button: Button,
    Carousel: Carousel,
    Collapse: Collapse,
    Dropdown: Dropdown,
    Modal: Modal,
    Popover: Popover,
    ScrollSpy: ScrollSpy,
    Tab: Tab,
    Toast: Toast,
    Tooltip: Tooltip,
    initCallback: initCallback,
    removeDataAPI: removeDataAPI,
    componentsInit: componentsInit,
    Version: version
  };

  return index;

})));

/*!
	By André Rinas, www.andrerinas.de
	Documentation, www.simplelightbox.de
	Available for use under the MIT License
	Version 2.7.0
*/
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SimpleLightbox = /*#__PURE__*/function () {
  function SimpleLightbox(elements, options) {
    var _this = this;

    _classCallCheck(this, SimpleLightbox);

    _defineProperty(this, "defaultOptions", {
      sourceAttr: 'href',
      overlay: true,
      spinner: true,
      nav: true,
      navText: ['&lsaquo;', '&rsaquo;'],
      captions: true,
      captionDelay: 0,
      captionSelector: 'img',
      captionType: 'attr',
      captionsData: 'title',
      captionPosition: 'bottom',
      captionClass: '',
      close: true,
      closeText: '&times;',
      swipeClose: true,
      showCounter: true,
      fileExt: 'png|jpg|jpeg|gif|webp',
      animationSlide: true,
      animationSpeed: 250,
      preloading: true,
      enableKeyboard: true,
      loop: true,
      rel: false,
      docClose: true,
      swipeTolerance: 50,
      className: 'simple-lightbox',
      widthRatio: 0.8,
      heightRatio: 0.9,
      scaleImageToRatio: false,
      disableRightClick: false,
      disableScroll: true,
      alertError: true,
      alertErrorMessage: 'Image not found, next image will be loaded',
      additionalHtml: false,
      history: true,
      throttleInterval: 0,
      doubleTapZoom: 2,
      maxZoom: 10,
      htmlClass: 'has-lightbox',
      rtl: false,
      fixedClass: 'sl-fixed',
      fadeSpeed: 300,
      uniqueImages: true,
      focus: true
    });

    _defineProperty(this, "transitionPrefix", void 0);

    _defineProperty(this, "transitionCapable", false);

    _defineProperty(this, "isTouchDevice", 'ontouchstart' in window);

    _defineProperty(this, "initialLocationHash", void 0);

    _defineProperty(this, "pushStateSupport", 'pushState' in history);

    _defineProperty(this, "isOpen", false);

    _defineProperty(this, "isAnimating", false);

    _defineProperty(this, "isClosing", false);

    _defineProperty(this, "isFadeIn", false);

    _defineProperty(this, "urlChangedOnce", false);

    _defineProperty(this, "hashReseted", false);

    _defineProperty(this, "historyHasChanges", false);

    _defineProperty(this, "historyUpdateTimeout", null);

    _defineProperty(this, "currentImage", void 0);

    _defineProperty(this, "eventNamespace", 'simplelightbox');

    _defineProperty(this, "domNodes", {});

    _defineProperty(this, "loadedImages", []);

    _defineProperty(this, "initialImageIndex", 0);

    _defineProperty(this, "currentImageIndex", 0);

    _defineProperty(this, "initialSelector", null);

    _defineProperty(this, "globalScrollbarWidth", 0);

    _defineProperty(this, "controlCoordinates", {
      swipeDiff: 0,
      swipeYDiff: 0,
      swipeStart: 0,
      swipeEnd: 0,
      swipeYStart: 0,
      swipeYEnd: 0,
      mousedown: false,
      imageLeft: 0,
      zoomed: false,
      containerHeight: 0,
      containerWidth: 0,
      containerOffsetX: 0,
      containerOffsetY: 0,
      imgHeight: 0,
      imgWidth: 0,
      capture: false,
      initialOffsetX: 0,
      initialOffsetY: 0,
      initialPointerOffsetX: 0,
      initialPointerOffsetY: 0,
      initialPointerOffsetX2: 0,
      initialPointerOffsetY2: 0,
      initialScale: 1,
      initialPinchDistance: 0,
      pointerOffsetX: 0,
      pointerOffsetY: 0,
      pointerOffsetX2: 0,
      pointerOffsetY2: 0,
      targetOffsetX: 0,
      targetOffsetY: 0,
      targetScale: 0,
      pinchOffsetX: 0,
      pinchOffsetY: 0,
      limitOffsetX: 0,
      limitOffsetY: 0,
      scaleDifference: 0,
      targetPinchDistance: 0,
      touchCount: 0,
      doubleTapped: false,
      touchmoveCount: 0
    });

    this.options = Object.assign(this.defaultOptions, options);

    if (typeof elements === 'string') {
      this.initialSelector = elements;
      this.elements = Array.from(document.querySelectorAll(elements));
    } else {
      this.elements = typeof elements.length !== 'undefined' && elements.length > 0 ? Array.from(elements) : [elements];
    }

    this.relatedElements = [];
    this.transitionPrefix = this.calculateTransitionPrefix();
    this.transitionCapable = this.transitionPrefix !== false;
    this.initialLocationHash = this.hash; // this should be handled by attribute selector IMHO! => 'a[rel=bla]'...

    if (this.options.rel) {
      this.elements = this.getRelated(this.options.rel);
    }

    if (this.options.uniqueImages) {
      var imgArr = [];
      this.elements = Array.from(this.elements).filter(function (element) {
        var src = element.getAttribute(_this.options.sourceAttr);

        if (imgArr.indexOf(src) === -1) {
          imgArr.push(src);
          return true;
        }

        return false;
      });
    }

    this.createDomNodes();

    if (this.options.close) {
      this.domNodes.wrapper.appendChild(this.domNodes.closeButton);
    }

    if (this.options.nav) {
      this.domNodes.wrapper.appendChild(this.domNodes.navigation);
    }

    if (this.options.spinner) {
      this.domNodes.wrapper.appendChild(this.domNodes.spinner);
    }

    this.addEventListener(this.elements, 'click.' + this.eventNamespace, function (event) {
      if (_this.isValidLink(event.currentTarget)) {
        event.preventDefault();

        if (_this.isAnimating) {
          return false;
        }

        _this.initialImageIndex = _this.elements.indexOf(event.currentTarget);

        _this.openImage(event.currentTarget);
      }
    }); // close addEventListener click addEventListener doc

    if (this.options.docClose) {
      this.addEventListener(this.domNodes.wrapper, ['click.' + this.eventNamespace, 'touchstart.' + this.eventNamespace], function (event) {
        if (_this.isOpen && event.target === event.currentTarget) {
          _this.close();
        }
      });
    } // disable rightclick


    if (this.options.disableRightClick) {
      this.addEventListener(document.body, 'contextmenu.' + this.eventNamespace, function (event) {
        if (event.target.classList.contains('sl-overlay')) {
          event.preventDefault();
        }
      });
    } // keyboard-control


    if (this.options.enableKeyboard) {
      this.addEventListener(document.body, 'keyup.' + this.eventNamespace, this.throttle(function (event) {
        _this.controlCoordinates.swipeDiff = 0; // keyboard control only if lightbox is open

        if (_this.isAnimating && event.key === 'Escape') {
          _this.currentImage.setAttribute('src', '');

          _this.isAnimating = false;
          return _this.close();
        }

        if (_this.isOpen) {
          event.preventDefault();

          if (event.key === 'Escape') {
            _this.close();
          }

          if (!_this.isAnimating && ['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1) {
            _this.loadImage(event.key === 'ArrowRight' ? 1 : -1);
          }
        }
      }, this.options.throttleInterval));
    }

    this.addEvents();
  }

  _createClass(SimpleLightbox, [{
    key: "createDomNodes",
    value: function createDomNodes() {
      this.domNodes.overlay = document.createElement('div');
      this.domNodes.overlay.classList.add('sl-overlay');
      this.domNodes.overlay.dataset.opacityTarget = ".7";
      this.domNodes.closeButton = document.createElement('button');
      this.domNodes.closeButton.classList.add('sl-close');
      this.domNodes.closeButton.innerHTML = this.options.closeText;
      this.domNodes.spinner = document.createElement('div');
      this.domNodes.spinner.classList.add('sl-spinner');
      this.domNodes.spinner.innerHTML = '<div></div>';
      this.domNodes.navigation = document.createElement('div');
      this.domNodes.navigation.classList.add('sl-navigation');
      this.domNodes.navigation.innerHTML = "<button class=\"sl-prev\">".concat(this.options.navText[0], "</button><button class=\"sl-next\">").concat(this.options.navText[1], "</button>");
      this.domNodes.counter = document.createElement('div');
      this.domNodes.counter.classList.add('sl-counter');
      this.domNodes.counter.innerHTML = '<span class="sl-current"></span>/<span class="sl-total"></span>';
      this.domNodes.caption = document.createElement('div');
      this.domNodes.caption.classList.add('sl-caption', 'pos-' + this.options.captionPosition);

      if (this.options.captionClass) {
        this.domNodes.caption.classList.add(this.options.captionClass);
      }

      this.domNodes.image = document.createElement('div');
      this.domNodes.image.classList.add('sl-image');
      this.domNodes.wrapper = document.createElement('div');
      this.domNodes.wrapper.classList.add('sl-wrapper');
      this.domNodes.wrapper.setAttribute('tabindex', -1);
      this.domNodes.wrapper.setAttribute('role', 'dialog');
      this.domNodes.wrapper.setAttribute('aria-hidden', false);

      if (this.options.className) {
        this.domNodes.wrapper.classList.add(this.options.className);
      }

      if (this.options.rtl) {
        this.domNodes.wrapper.classList.add('sl-dir-rtl');
      }
    }
  }, {
    key: "throttle",
    value: function throttle(func, limit) {
      var inThrottle;
      return function () {
        if (!inThrottle) {
          func.apply(this, arguments);
          inThrottle = true;
          setTimeout(function () {
            return inThrottle = false;
          }, limit);
        }
      };
    }
  }, {
    key: "isValidLink",
    value: function isValidLink(element) {
      return !this.options.fileExt || 'pathname' in element && new RegExp('(' + this.options.fileExt + ')$', 'i').test(element.pathname);
    }
  }, {
    key: "calculateTransitionPrefix",
    value: function calculateTransitionPrefix() {
      var s = (document.body || document.documentElement).style;
      return 'transition' in s ? '' : 'WebkitTransition' in s ? '-webkit-' : 'MozTransition' in s ? '-moz-' : 'OTransition' in s ? '-o' : false;
    }
  }, {
    key: "toggleScrollbar",
    value: function toggleScrollbar(type) {
      var scrollbarWidth = 0;
      var fixedElements = [].slice.call(document.querySelectorAll('.' + this.options.fixedClass));

      if (type === 'hide') {
        var fullWindowWidth = window.innerWidth;

        if (!fullWindowWidth) {
          var documentElementRect = document.documentElement.getBoundingClientRect();
          fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
        }

        if (document.body.clientWidth < fullWindowWidth) {
          var scrollDiv = document.createElement('div'),
              paddingRight = parseInt(document.body.style.paddingRight || 0, 10);
          scrollDiv.classList.add('sl-scrollbar-measure');
          document.body.appendChild(scrollDiv);
          scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
          document.body.removeChild(scrollDiv);
          document.body.dataset.originalPaddingRight = paddingRight;

          if (scrollbarWidth > 0) {
            document.body.classList.add('hidden-scroll');
            document.body.style.paddingRight = paddingRight + scrollbarWidth + 'px';
            fixedElements.forEach(function (element) {
              var actualPadding = element.style.paddingRight;
              var calculatedPadding = window.getComputedStyle(element)['padding-right'];
              element.dataset.originalPaddingRight = actualPadding;
              element.style.paddingRight = "".concat(parseFloat(calculatedPadding) + scrollbarWidth, "px");
            });
          }
        }
      } else {
        document.body.classList.remove('hidden-scroll');
        document.body.style.paddingRight = document.body.dataset.originalPaddingRight;
        fixedElements.forEach(function (element) {
          var padding = element.dataset.originalPaddingRight;

          if (typeof padding !== 'undefined') {
            element.style.paddingRight = padding;
          }
        });
      }

      return scrollbarWidth;
    }
  }, {
    key: "close",
    value: function close() {
      var _this2 = this;

      if (!this.isOpen || this.isAnimating || this.isClosing) {
        return false;
      }

      this.isClosing = true;
      var element = this.relatedElements[this.currentImageIndex];
      element.dispatchEvent(new Event('close.simplelightbox'));

      if (this.options.history) {
        this.historyHasChanges = false;

        if (!this.hashReseted) {
          this.resetHash();
        }
      }

      this.removeEventListener(document, 'focusin.' + this.eventNamespace);
      this.fadeOut(document.querySelectorAll('.sl-image img, .sl-overlay, .sl-close, .sl-navigation, .sl-image .sl-caption, .sl-counter'), this.options.fadeSpeed, function () {
        if (_this2.options.disableScroll) {
          _this2.toggleScrollbar('show');
        }

        if (_this2.options.htmlClass && _this2.options.htmlClass !== '') {
          document.querySelector('html').classList.remove(_this2.options.htmlClass);
        }

        document.body.removeChild(_this2.domNodes.wrapper);
        document.body.removeChild(_this2.domNodes.overlay);
        _this2.domNodes.additionalHtml = null;
        element.dispatchEvent(new Event('closed.simplelightbox'));
        _this2.isClosing = false;
      });
      this.currentImage = null;
      this.isOpen = false;
      this.isAnimating = false; // reset touchcontrol coordinates

      for (var key in this.controlCoordinates) {
        this.controlCoordinates[key] = 0;
      }

      this.controlCoordinates.mousedown = false;
      this.controlCoordinates.zoomed = false;
      this.controlCoordinates.capture = false;
      this.controlCoordinates.initialScale = this.minMax(1, 1, this.options.maxZoom);
      this.controlCoordinates.doubleTapped = false;
    }
  }, {
    key: "preload",
    value: function preload() {
      var _this3 = this;

      var index = this.currentImageIndex,
          length = this.relatedElements.length,
          next = index + 1 < 0 ? length - 1 : index + 1 >= length - 1 ? 0 : index + 1,
          prev = index - 1 < 0 ? length - 1 : index - 1 >= length - 1 ? 0 : index - 1,
          nextImage = new Image(),
          prevImage = new Image();
      nextImage.addEventListener('load', function (event) {
        var src = event.target.getAttribute('src');

        if (_this3.loadedImages.indexOf(src) === -1) {
          //is this condition even required... setting multiple times will not change usage...
          _this3.loadedImages.push(src);
        }

        _this3.relatedElements[index].dispatchEvent(new Event('nextImageLoaded.' + _this3.eventNamespace));
      });
      nextImage.setAttribute('src', this.relatedElements[next].getAttribute(this.options.sourceAttr));
      prevImage.addEventListener('load', function (event) {
        var src = event.target.getAttribute('src');

        if (_this3.loadedImages.indexOf(src) === -1) {
          _this3.loadedImages.push(src);
        }

        _this3.relatedElements[index].dispatchEvent(new Event('prevImageLoaded.' + _this3.eventNamespace));
      });
      prevImage.setAttribute('src', this.relatedElements[prev].getAttribute(this.options.sourceAttr));
    }
  }, {
    key: "loadImage",
    value: function loadImage(direction) {
      var _this4 = this;

      var slideDirection = direction;

      if (this.options.rtl) {
        direction = -direction;
      }

      this.relatedElements[this.currentImageIndex].dispatchEvent(new Event('change.' + this.eventNamespace));
      this.relatedElements[this.currentImageIndex].dispatchEvent(new Event((direction === 1 ? 'next' : 'prev') + '.' + this.eventNamespace));
      var newIndex = this.currentImageIndex + direction;

      if (this.isAnimating || (newIndex < 0 || newIndex >= this.relatedElements.length) && this.options.loop === false) {
        return false;
      }

      this.currentImageIndex = newIndex < 0 ? this.relatedElements.length - 1 : newIndex > this.relatedElements.length - 1 ? 0 : newIndex;
      this.domNodes.counter.querySelector('.sl-current').innerHTML = this.currentImageIndex + 1;

      if (this.options.animationSlide) {
        this.slide(this.options.animationSpeed / 1000, -100 * slideDirection - this.controlCoordinates.swipeDiff + 'px');
      }

      this.fadeOut(this.domNodes.image, this.options.fadeSpeed, function () {
        _this4.isAnimating = true;

        if (!_this4.isClosing) {
          setTimeout(function () {
            var element = _this4.relatedElements[_this4.currentImageIndex];

            _this4.currentImage.setAttribute('src', element.getAttribute(_this4.options.sourceAttr));

            if (_this4.loadedImages.indexOf(element.getAttribute(_this4.options.sourceAttr)) === -1) {
              _this4.show(_this4.domNodes.spinner);
            }

            if (_this4.domNodes.image.contains(_this4.domNodes.caption)) {
              _this4.domNodes.image.removeChild(_this4.domNodes.caption);
            }

            _this4.adjustImage(slideDirection);

            if (_this4.options.preloading) _this4.preload();
          }, 100);
        } else {
          _this4.isAnimating = false;
        }
      });
    }
  }, {
    key: "adjustImage",
    value: function adjustImage(direction) {
      var _this5 = this;

      if (!this.currentImage) {
        return false;
      }

      var tmpImage = new Image(),
          windowWidth = window.innerWidth * this.options.widthRatio,
          windowHeight = window.innerHeight * this.options.heightRatio;
      tmpImage.setAttribute('src', this.currentImage.getAttribute('src'));
      this.currentImage.dataset.scale = 1;
      this.currentImage.dataset.translateX = 0;
      this.currentImage.dataset.translateY = 0;
      this.zoomPanElement(0, 0, 1);
      tmpImage.addEventListener('error', function (event) {
        _this5.relatedElements[_this5.currentImageIndex].dispatchEvent(new Event('error.' + _this5.eventNamespace));

        _this5.isAnimating = false;
        _this5.isOpen = false;
        _this5.domNodes.spinner.style.display = 'none';
        var dirIsDefined = direction === 1 || direction === -1;

        if (_this5.initialImageIndex === _this5.currentImageIndex && dirIsDefined) {
          return _this5.close();
        }

        if (_this5.options.alertError) {
          alert(_this5.options.alertErrorMessage);
        }

        _this5.loadImage(dirIsDefined ? direction : 1);
      });
      tmpImage.addEventListener('load', function (event) {
        if (typeof direction !== 'undefined') {
          _this5.relatedElements[_this5.currentImageIndex].dispatchEvent(new Event('changed.' + _this5.eventNamespace));

          _this5.relatedElements[_this5.currentImageIndex].dispatchEvent(new Event((direction === 1 ? 'nextDone' : 'prevDone') + '.' + _this5.eventNamespace));
        } // history


        if (_this5.options.history) {
          _this5.updateURL();
        }

        if (_this5.loadedImages.indexOf(_this5.currentImage.getAttribute('src')) === -1) {
          _this5.loadedImages.push(_this5.currentImage.getAttribute('src'));
        }

        var imageWidth = event.target.width,
            imageHeight = event.target.height;

        if (_this5.options.scaleImageToRatio || imageWidth > windowWidth || imageHeight > windowHeight) {
          var ratio = imageWidth / imageHeight > windowWidth / windowHeight ? imageWidth / windowWidth : imageHeight / windowHeight;
          imageWidth /= ratio;
          imageHeight /= ratio;
        }

        _this5.domNodes.image.style.top = (window.innerHeight - imageHeight) / 2 + 'px';
        _this5.domNodes.image.style.left = (window.innerWidth - imageWidth - _this5.globalScrollbarWidth) / 2 + 'px';
        _this5.domNodes.image.style.width = imageWidth + 'px';
        _this5.domNodes.image.style.height = imageHeight + 'px';
        _this5.domNodes.spinner.style.display = 'none';

        if (_this5.options.focus) {
          _this5.forceFocus();
        }

        _this5.fadeIn(_this5.currentImage, _this5.options.fadeSpeed, function () {
          if (_this5.options.focus) {
            _this5.domNodes.wrapper.focus();
          }
        });

        _this5.isOpen = true;
        var captionContainer, captionText;

        if (typeof _this5.options.captionSelector === 'string') {
          captionContainer = _this5.options.captionSelector === 'self' ? _this5.relatedElements[_this5.currentImageIndex] : _this5.relatedElements[_this5.currentImageIndex].querySelector(_this5.options.captionSelector);
        } else if (typeof _this5.options.captionSelector === 'function') {
          captionContainer = _this5.options.captionSelector(_this5.relatedElements[_this5.currentImageIndex]);
        }

        if (_this5.options.captions && captionContainer) {
          if (_this5.options.captionType === 'data') {
            captionText = captionContainer.dataset[_this5.options.captionsData];
          } else if (_this5.options.captionType === 'text') {
            captionText = captionContainer.innerHTML;
          } else {
            captionText = captionContainer.getAttribute(_this5.options.captionsData);
          }
        }

        if (!_this5.options.loop) {
          if (_this5.currentImageIndex === 0) {
            _this5.hide(_this5.domNodes.navigation.querySelector('.sl-prev'));
          }

          if (_this5.currentImageIndex >= _this5.relatedElements.length - 1) {
            _this5.hide(_this5.domNodes.navigation.querySelector('.sl-next'));
          }

          if (_this5.currentImageIndex > 0) {
            _this5.show(_this5.domNodes.navigation.querySelector('.sl-prev'));
          }

          if (_this5.currentImageIndex < _this5.relatedElements.length - 1) {
            _this5.show(_this5.domNodes.navigation.querySelector('.sl-next'));
          }
        }

        if (_this5.relatedElements.length === 1) {
          _this5.hide(_this5.domNodes.navigation.querySelectorAll('.sl-prev, .sl-next'));
        } else {
          _this5.show(_this5.domNodes.navigation.querySelectorAll('.sl-prev, .sl-next'));
        }

        if (direction === 1 || direction === -1) {
          if (_this5.options.animationSlide) {
            _this5.slide(0, 100 * direction + 'px');

            setTimeout(function () {
              _this5.slide(_this5.options.animationSpeed / 1000, 0 + 'px');
            }, 50);
          }

          _this5.fadeIn(_this5.domNodes.image, _this5.options.fadeSpeed, function () {
            _this5.isAnimating = false;

            _this5.setCaption(captionText, imageWidth);
          });
        } else {
          _this5.isAnimating = false;

          _this5.setCaption(captionText, imageWidth);
        }

        if (_this5.options.additionalHtml && !_this5.domNodes.additionalHtml) {
          _this5.domNodes.additionalHtml = document.createElement('div');

          _this5.domNodes.additionalHtml.classList.add('sl-additional-html');

          _this5.domNodes.additionalHtml.innerHTML = _this5.options.additionalHtml;

          _this5.domNodes.image.appendChild(_this5.domNodes.additionalHtml);
        }
      });
    }
  }, {
    key: "zoomPanElement",
    value: function zoomPanElement(targetOffsetX, targetOffsetY, targetScale) {
      this.currentImage.style[this.transitionPrefix + 'transform'] = 'translate(' + targetOffsetX + ',' + targetOffsetY + ') scale(' + targetScale + ')';
    }
  }, {
    key: "minMax",
    value: function minMax(value, min, max) {
      return value < min ? min : value > max ? max : value;
    }
  }, {
    key: "setZoomData",
    value: function setZoomData(initialScale, targetOffsetX, targetOffsetY) {
      this.currentImage.dataset.scale = initialScale;
      this.currentImage.dataset.translateX = targetOffsetX;
      this.currentImage.dataset.translateY = targetOffsetY;
    }
  }, {
    key: "hashchangeHandler",
    value: function hashchangeHandler() {
      if (this.isOpen && this.hash === this.initialLocationHash) {
        this.hashReseted = true;
        this.close();
      }
    }
  }, {
    key: "addEvents",
    value: function addEvents() {
      var _this6 = this;

      // resize/responsive
      this.addEventListener(window, 'resize.' + this.eventNamespace, function (event) {
        //this.adjustImage.bind(this)
        if (_this6.isOpen) {
          _this6.adjustImage();
        }
      });
      this.addEventListener(this.domNodes.closeButton, ['click.' + this.eventNamespace, 'touchstart.' + this.eventNamespace], this.close.bind(this));

      if (this.options.history) {
        setTimeout(function () {
          _this6.addEventListener(window, 'hashchange.' + _this6.eventNamespace, function (event) {
            if (_this6.isOpen) {
              _this6.hashchangeHandler();
            }
          });
        }, 40);
      }

      this.addEventListener(this.domNodes.navigation.getElementsByTagName('button'), 'click.' + this.eventNamespace, function (event) {
        if (!event.currentTarget.tagName.match(/button/i)) {
          return true;
        }

        event.preventDefault();
        _this6.controlCoordinates.swipeDiff = 0;

        _this6.loadImage(event.currentTarget.classList.contains('sl-next') ? 1 : -1);
      });
      this.addEventListener(this.domNodes.image, ['touchstart.' + this.eventNamespace, 'mousedown.' + this.eventNamespace], function (event) {
        if (event.target.tagName === 'A' && event.type === 'touchstart') {
          return true;
        }

        if (event.type === 'mousedown') {
          _this6.controlCoordinates.initialPointerOffsetX = event.clientX;
          _this6.controlCoordinates.initialPointerOffsetY = event.clientY;
          _this6.controlCoordinates.containerHeight = _this6.getDimensions(_this6.domNodes.image).height;
          _this6.controlCoordinates.containerWidth = _this6.getDimensions(_this6.domNodes.image).width;
          _this6.controlCoordinates.imgHeight = _this6.getDimensions(_this6.currentImage).height;
          _this6.controlCoordinates.imgWidth = _this6.getDimensions(_this6.currentImage).width;
          _this6.controlCoordinates.containerOffsetX = _this6.domNodes.image.offsetLeft;
          _this6.controlCoordinates.containerOffsetY = _this6.domNodes.image.offsetTop;
          _this6.controlCoordinates.initialOffsetX = parseFloat(_this6.currentImage.dataset.translateX);
          _this6.controlCoordinates.initialOffsetY = parseFloat(_this6.currentImage.dataset.translateY);
          _this6.controlCoordinates.capture = true;
        } else {
          _this6.controlCoordinates.touchCount = event.touches.length;
          _this6.controlCoordinates.initialPointerOffsetX = event.touches[0].clientX;
          _this6.controlCoordinates.initialPointerOffsetY = event.touches[0].clientY;
          _this6.controlCoordinates.containerHeight = _this6.getDimensions(_this6.domNodes.image).height;
          _this6.controlCoordinates.containerWidth = _this6.getDimensions(_this6.domNodes.image).width;
          _this6.controlCoordinates.imgHeight = _this6.getDimensions(_this6.currentImage).height;
          _this6.controlCoordinates.imgWidth = _this6.getDimensions(_this6.currentImage).width;
          _this6.controlCoordinates.containerOffsetX = _this6.domNodes.image.offsetLeft;
          _this6.controlCoordinates.containerOffsetY = _this6.domNodes.image.offsetTop;

          if (_this6.controlCoordinates.touchCount === 1)
            /* Single touch */
            {
              if (!_this6.controlCoordinates.doubleTapped) {
                _this6.controlCoordinates.doubleTapped = true;
                setTimeout(function () {
                  _this6.controlCoordinates.doubleTapped = false;
                }, 300);
              } else {
                _this6.currentImage.classList.add('sl-transition');

                if (!_this6.controlCoordinates.zoomed) {
                  _this6.controlCoordinates.initialScale = _this6.options.doubleTapZoom;

                  _this6.setZoomData(_this6.controlCoordinates.initialScale, 0, 0);

                  _this6.zoomPanElement(0 + "px", 0 + "px", _this6.controlCoordinates.initialScale);

                  if (!_this6.domNodes.caption.style.opacity && _this6.domNodes.caption.style.display !== 'none') {
                    _this6.fadeOut(_this6.domNodes.caption, _this6.options.fadeSpeed);
                  }

                  _this6.controlCoordinates.zoomed = true;
                } else {
                  _this6.controlCoordinates.initialScale = 1;

                  _this6.setZoomData(_this6.controlCoordinates.initialScale, 0, 0);

                  _this6.zoomPanElement(0 + "px", 0 + "px", _this6.controlCoordinates.initialScale);

                  _this6.controlCoordinates.zoomed = false;
                }

                setTimeout(function () {
                  if (_this6.currentImage) {
                    _this6.currentImage.classList.remove('sl-transition');
                  }
                }, 200);
                return false;
              }

              _this6.controlCoordinates.initialOffsetX = parseFloat(_this6.currentImage.dataset.translateX);
              _this6.controlCoordinates.initialOffsetY = parseFloat(_this6.currentImage.dataset.translateY);
            } else if (_this6.controlCoordinates.touchCount === 2)
            /* Pinch */
            {
              _this6.controlCoordinates.initialPointerOffsetX2 = event.touches[1].clientX;
              _this6.controlCoordinates.initialPointerOffsetY2 = event.touches[1].clientY;
              _this6.controlCoordinates.initialOffsetX = parseFloat(_this6.currentImage.dataset.translateX);
              _this6.controlCoordinates.initialOffsetY = parseFloat(_this6.currentImage.dataset.translateY);
              _this6.controlCoordinates.pinchOffsetX = (_this6.controlCoordinates.initialPointerOffsetX + _this6.controlCoordinates.initialPointerOffsetX2) / 2;
              _this6.controlCoordinates.pinchOffsetY = (_this6.controlCoordinates.initialPointerOffsetY + _this6.controlCoordinates.initialPointerOffsetY2) / 2;
              _this6.controlCoordinates.initialPinchDistance = Math.sqrt((_this6.controlCoordinates.initialPointerOffsetX - _this6.controlCoordinates.initialPointerOffsetX2) * (_this6.controlCoordinates.initialPointerOffsetX - _this6.controlCoordinates.initialPointerOffsetX2) + (_this6.controlCoordinates.initialPointerOffsetY - _this6.controlCoordinates.initialPointerOffsetY2) * (_this6.controlCoordinates.initialPointerOffsetY - _this6.controlCoordinates.initialPointerOffsetY2));
            }

          _this6.controlCoordinates.capture = true;
        }

        if (_this6.controlCoordinates.mousedown) return true;

        if (_this6.transitionCapable) {
          _this6.controlCoordinates.imageLeft = parseInt(_this6.domNodes.image.style.left, 10);
        }

        _this6.controlCoordinates.mousedown = true;
        _this6.controlCoordinates.swipeDiff = 0;
        _this6.controlCoordinates.swipeYDiff = 0;
        _this6.controlCoordinates.swipeStart = event.pageX || event.touches[0].pageX;
        _this6.controlCoordinates.swipeYStart = event.pageY || event.touches[0].pageY;
        return false;
      });
      this.addEventListener(this.domNodes.image, ['touchmove.' + this.eventNamespace, 'mousemove.' + this.eventNamespace, 'MSPointerMove'], function (event) {
        if (!_this6.controlCoordinates.mousedown) {
          return true;
        }

        event.preventDefault();

        if (event.type === 'touchmove') {
          if (_this6.controlCoordinates.capture === false) {
            return false;
          }

          _this6.controlCoordinates.pointerOffsetX = event.touches[0].clientX;
          _this6.controlCoordinates.pointerOffsetY = event.touches[0].clientY;
          _this6.controlCoordinates.touchCount = event.touches.length;
          _this6.controlCoordinates.touchmoveCount++;

          if (_this6.controlCoordinates.touchCount > 1)
            /* Pinch */
            {
              _this6.controlCoordinates.pointerOffsetX2 = event.touches[1].clientX;
              _this6.controlCoordinates.pointerOffsetY2 = event.touches[1].clientY;
              _this6.controlCoordinates.targetPinchDistance = Math.sqrt((_this6.controlCoordinates.pointerOffsetX - _this6.controlCoordinates.pointerOffsetX2) * (_this6.controlCoordinates.pointerOffsetX - _this6.controlCoordinates.pointerOffsetX2) + (_this6.controlCoordinates.pointerOffsetY - _this6.controlCoordinates.pointerOffsetY2) * (_this6.controlCoordinates.pointerOffsetY - _this6.controlCoordinates.pointerOffsetY2));

              if (_this6.controlCoordinates.initialPinchDistance === null) {
                _this6.controlCoordinates.initialPinchDistance = _this6.controlCoordinates.targetPinchDistance;
              }

              if (Math.abs(_this6.controlCoordinates.initialPinchDistance - _this6.controlCoordinates.targetPinchDistance) >= 1) {
                /* Initialize helpers */
                _this6.controlCoordinates.targetScale = _this6.minMax(_this6.controlCoordinates.targetPinchDistance / _this6.controlCoordinates.initialPinchDistance * _this6.controlCoordinates.initialScale, 1, _this6.options.maxZoom);
                _this6.controlCoordinates.limitOffsetX = (_this6.controlCoordinates.imgWidth * _this6.controlCoordinates.targetScale - _this6.controlCoordinates.containerWidth) / 2;
                _this6.controlCoordinates.limitOffsetY = (_this6.controlCoordinates.imgHeight * _this6.controlCoordinates.targetScale - _this6.controlCoordinates.containerHeight) / 2;
                _this6.controlCoordinates.scaleDifference = _this6.controlCoordinates.targetScale - _this6.controlCoordinates.initialScale;
                _this6.controlCoordinates.targetOffsetX = _this6.controlCoordinates.imgWidth * _this6.controlCoordinates.targetScale <= _this6.controlCoordinates.containerWidth ? 0 : _this6.minMax(_this6.controlCoordinates.initialOffsetX - (_this6.controlCoordinates.pinchOffsetX - _this6.controlCoordinates.containerOffsetX - _this6.controlCoordinates.containerWidth / 2 - _this6.controlCoordinates.initialOffsetX) / (_this6.controlCoordinates.targetScale - _this6.controlCoordinates.scaleDifference) * _this6.controlCoordinates.scaleDifference, _this6.controlCoordinates.limitOffsetX * -1, _this6.controlCoordinates.limitOffsetX);
                _this6.controlCoordinates.targetOffsetY = _this6.controlCoordinates.imgHeight * _this6.controlCoordinates.targetScale <= _this6.controlCoordinates.containerHeight ? 0 : _this6.minMax(_this6.controlCoordinates.initialOffsetY - (_this6.controlCoordinates.pinchOffsetY - _this6.controlCoordinates.containerOffsetY - _this6.controlCoordinates.containerHeight / 2 - _this6.controlCoordinates.initialOffsetY) / (_this6.controlCoordinates.targetScale - _this6.controlCoordinates.scaleDifference) * _this6.controlCoordinates.scaleDifference, _this6.controlCoordinates.limitOffsetY * -1, _this6.controlCoordinates.limitOffsetY);

                _this6.zoomPanElement(_this6.controlCoordinates.targetOffsetX + "px", _this6.controlCoordinates.targetOffsetY + "px", _this6.controlCoordinates.targetScale);

                if (_this6.controlCoordinates.targetScale > 1) {
                  _this6.controlCoordinates.zoomed = true;

                  if (!_this6.domNodes.caption.style.opacity && _this6.domNodes.caption.style.display !== 'none') {
                    _this6.fadeOut(_this6.domNodes.caption, _this6.options.fadeSpeed);
                  }
                }

                _this6.controlCoordinates.initialPinchDistance = _this6.controlCoordinates.targetPinchDistance;
                _this6.controlCoordinates.initialScale = _this6.controlCoordinates.targetScale;
                _this6.controlCoordinates.initialOffsetX = _this6.controlCoordinates.targetOffsetX;
                _this6.controlCoordinates.initialOffsetY = _this6.controlCoordinates.targetOffsetY;
              }
            } else {
            _this6.controlCoordinates.targetScale = _this6.controlCoordinates.initialScale;
            _this6.controlCoordinates.limitOffsetX = (_this6.controlCoordinates.imgWidth * _this6.controlCoordinates.targetScale - _this6.controlCoordinates.containerWidth) / 2;
            _this6.controlCoordinates.limitOffsetY = (_this6.controlCoordinates.imgHeight * _this6.controlCoordinates.targetScale - _this6.controlCoordinates.containerHeight) / 2;
            _this6.controlCoordinates.targetOffsetX = _this6.controlCoordinates.imgWidth * _this6.controlCoordinates.targetScale <= _this6.controlCoordinates.containerWidth ? 0 : _this6.minMax(_this6.controlCoordinates.pointerOffsetX - (_this6.controlCoordinates.initialPointerOffsetX - _this6.controlCoordinates.initialOffsetX), _this6.controlCoordinates.limitOffsetX * -1, _this6.controlCoordinates.limitOffsetX);
            _this6.controlCoordinates.targetOffsetY = _this6.controlCoordinates.imgHeight * _this6.controlCoordinates.targetScale <= _this6.controlCoordinates.containerHeight ? 0 : _this6.minMax(_this6.controlCoordinates.pointerOffsetY - (_this6.controlCoordinates.initialPointerOffsetY - _this6.controlCoordinates.initialOffsetY), _this6.controlCoordinates.limitOffsetY * -1, _this6.controlCoordinates.limitOffsetY);

            if (Math.abs(_this6.controlCoordinates.targetOffsetX) === Math.abs(_this6.controlCoordinates.limitOffsetX)) {
              _this6.controlCoordinates.initialOffsetX = _this6.controlCoordinates.targetOffsetX;
              _this6.controlCoordinates.initialPointerOffsetX = _this6.controlCoordinates.pointerOffsetX;
            }

            if (Math.abs(_this6.controlCoordinates.targetOffsetY) === Math.abs(_this6.controlCoordinates.limitOffsetY)) {
              _this6.controlCoordinates.initialOffsetY = _this6.controlCoordinates.targetOffsetY;
              _this6.controlCoordinates.initialPointerOffsetY = _this6.controlCoordinates.pointerOffsetY;
            }

            _this6.setZoomData(_this6.controlCoordinates.initialScale, _this6.controlCoordinates.targetOffsetX, _this6.controlCoordinates.targetOffsetY);

            _this6.zoomPanElement(_this6.controlCoordinates.targetOffsetX + "px", _this6.controlCoordinates.targetOffsetY + "px", _this6.controlCoordinates.targetScale);
          }
        }
        /* Mouse Move implementation */


        if (event.type === 'mousemove' && _this6.controlCoordinates.mousedown) {
          if (event.type == 'touchmove') return true;
          if (_this6.controlCoordinates.capture === false) return false;
          _this6.controlCoordinates.pointerOffsetX = event.clientX;
          _this6.controlCoordinates.pointerOffsetY = event.clientY;
          _this6.controlCoordinates.targetScale = _this6.controlCoordinates.initialScale;
          _this6.controlCoordinates.limitOffsetX = (_this6.controlCoordinates.imgWidth * _this6.controlCoordinates.targetScale - _this6.controlCoordinates.containerWidth) / 2;
          _this6.controlCoordinates.limitOffsetY = (_this6.controlCoordinates.imgHeight * _this6.controlCoordinates.targetScale - _this6.controlCoordinates.containerHeight) / 2;
          _this6.controlCoordinates.targetOffsetX = _this6.controlCoordinates.imgWidth * _this6.controlCoordinates.targetScale <= _this6.controlCoordinates.containerWidth ? 0 : _this6.minMax(_this6.controlCoordinates.pointerOffsetX - (_this6.controlCoordinates.initialPointerOffsetX - _this6.controlCoordinates.initialOffsetX), _this6.controlCoordinates.limitOffsetX * -1, _this6.controlCoordinates.limitOffsetX);
          _this6.controlCoordinates.targetOffsetY = _this6.controlCoordinates.imgHeight * _this6.controlCoordinates.targetScale <= _this6.controlCoordinates.containerHeight ? 0 : _this6.minMax(_this6.controlCoordinates.pointerOffsetY - (_this6.controlCoordinates.initialPointerOffsetY - _this6.controlCoordinates.initialOffsetY), _this6.controlCoordinates.limitOffsetY * -1, _this6.controlCoordinates.limitOffsetY);

          if (Math.abs(_this6.controlCoordinates.targetOffsetX) === Math.abs(_this6.controlCoordinates.limitOffsetX)) {
            _this6.controlCoordinates.initialOffsetX = _this6.controlCoordinates.targetOffsetX;
            _this6.controlCoordinates.initialPointerOffsetX = _this6.controlCoordinates.pointerOffsetX;
          }

          if (Math.abs(_this6.controlCoordinates.targetOffsetY) === Math.abs(_this6.controlCoordinates.limitOffsetY)) {
            _this6.controlCoordinates.initialOffsetY = _this6.controlCoordinates.targetOffsetY;
            _this6.controlCoordinates.initialPointerOffsetY = _this6.controlCoordinates.pointerOffsetY;
          }

          _this6.setZoomData(_this6.controlCoordinates.initialScale, _this6.controlCoordinates.targetOffsetX, _this6.controlCoordinates.targetOffsetY);

          _this6.zoomPanElement(_this6.controlCoordinates.targetOffsetX + "px", _this6.controlCoordinates.targetOffsetY + "px", _this6.controlCoordinates.targetScale);
        }

        if (!_this6.controlCoordinates.zoomed) {
          _this6.controlCoordinates.swipeEnd = event.pageX || event.touches[0].pageX;
          _this6.controlCoordinates.swipeYEnd = event.pageY || event.touches[0].pageY;
          _this6.controlCoordinates.swipeDiff = _this6.controlCoordinates.swipeStart - _this6.controlCoordinates.swipeEnd;
          _this6.controlCoordinates.swipeYDiff = _this6.controlCoordinates.swipeYStart - _this6.controlCoordinates.swipeYEnd;

          if (_this6.options.animationSlide) {
            _this6.slide(0, -_this6.controlCoordinates.swipeDiff + 'px');
          }
        }
      });
      this.addEventListener(this.domNodes.image, ['touchend.' + this.eventNamespace, 'mouseup.' + this.eventNamespace, 'touchcancel.' + this.eventNamespace, 'mouseleave.' + this.eventNamespace, 'pointerup', 'pointercancel', 'MSPointerUp', 'MSPointerCancel'], function (event) {
        if (_this6.isTouchDevice && event.type === 'touchend') {
          _this6.controlCoordinates.touchCount = event.touches.length;

          if (_this6.controlCoordinates.touchCount === 0)
            /* No touch */
            {
              /* Set attributes */
              if (_this6.currentImage) {
                _this6.setZoomData(_this6.controlCoordinates.initialScale, _this6.controlCoordinates.targetOffsetX, _this6.controlCoordinates.targetOffsetY);
              }

              if (_this6.controlCoordinates.initialScale === 1) {
                _this6.controlCoordinates.zoomed = false;

                if (_this6.domNodes.caption.style.display === 'none') {
                  _this6.fadeIn(_this6.domNodes.caption, _this6.options.fadeSpeed);
                }
              }

              _this6.controlCoordinates.initialPinchDistance = null;
              _this6.controlCoordinates.capture = false;
            } else if (_this6.controlCoordinates.touchCount === 1)
            /* Single touch */
            {
              _this6.controlCoordinates.initialPointerOffsetX = event.touches[0].clientX;
              _this6.controlCoordinates.initialPointerOffsetY = event.touches[0].clientY;
            } else if (_this6.controlCoordinates.touchCount > 1)
            /* Pinch */
            {
              _this6.controlCoordinates.initialPinchDistance = null;
            }
        }

        if (_this6.controlCoordinates.mousedown) {
          _this6.controlCoordinates.mousedown = false;
          var possibleDir = true;

          if (!_this6.options.loop) {
            if (_this6.currentImageIndex === 0 && _this6.controlCoordinates.swipeDiff < 0) {
              possibleDir = false;
            }

            if (_this6.currentImageIndex >= _this6.relatedElements.length - 1 && _this6.controlCoordinates.swipeDiff > 0) {
              possibleDir = false;
            }
          }

          if (Math.abs(_this6.controlCoordinates.swipeDiff) > _this6.options.swipeTolerance && possibleDir) {
            _this6.loadImage(_this6.controlCoordinates.swipeDiff > 0 ? 1 : -1);
          } else if (_this6.options.animationSlide) {
            _this6.slide(_this6.options.animationSpeed / 1000, 0 + 'px');
          }

          if (_this6.options.swipeClose && Math.abs(_this6.controlCoordinates.swipeYDiff) > 50 && Math.abs(_this6.controlCoordinates.swipeDiff) < _this6.options.swipeTolerance) {
            _this6.close();
          }
        }
      });
      this.addEventListener(this.domNodes.image, ['dblclick'], function (event) {
        if (_this6.isTouchDevice) return;
        _this6.controlCoordinates.initialPointerOffsetX = event.clientX;
        _this6.controlCoordinates.initialPointerOffsetY = event.clientY;
        _this6.controlCoordinates.containerHeight = _this6.getDimensions(_this6.domNodes.image).height;
        _this6.controlCoordinates.containerWidth = _this6.getDimensions(_this6.domNodes.image).width;
        _this6.controlCoordinates.imgHeight = _this6.getDimensions(_this6.currentImage).height;
        _this6.controlCoordinates.imgWidth = _this6.getDimensions(_this6.currentImage).width;
        _this6.controlCoordinates.containerOffsetX = _this6.domNodes.image.offsetLeft;
        _this6.controlCoordinates.containerOffsetY = _this6.domNodes.image.offsetTop;

        _this6.currentImage.classList.add('sl-transition');

        if (!_this6.controlCoordinates.zoomed) {
          _this6.controlCoordinates.initialScale = _this6.options.doubleTapZoom;

          _this6.setZoomData(_this6.controlCoordinates.initialScale, 0, 0);

          _this6.zoomPanElement(0 + "px", 0 + "px", _this6.controlCoordinates.initialScale);

          if (!_this6.domNodes.caption.style.opacity && _this6.domNodes.caption.style.display !== 'none') {
            _this6.fadeOut(_this6.domNodes.caption, _this6.options.fadeSpeed);
          }

          _this6.controlCoordinates.zoomed = true;
        } else {
          _this6.controlCoordinates.initialScale = 1;

          _this6.setZoomData(_this6.controlCoordinates.initialScale, 0, 0);

          _this6.zoomPanElement(0 + "px", 0 + "px", _this6.controlCoordinates.initialScale);

          _this6.controlCoordinates.zoomed = false;

          if (_this6.domNodes.caption.style.display === 'none') {
            _this6.fadeIn(_this6.domNodes.caption, _this6.options.fadeSpeed);
          }
        }

        setTimeout(function () {
          if (_this6.currentImage) {
            _this6.currentImage.classList.remove('sl-transition');
          }
        }, 200);
        _this6.controlCoordinates.capture = true;
        return false;
      });
    }
  }, {
    key: "getDimensions",
    value: function getDimensions(element) {
      var styles = window.getComputedStyle(element),
          height = element.offsetHeight,
          width = element.offsetWidth,
          borderTopWidth = parseFloat(styles.borderTopWidth),
          borderBottomWidth = parseFloat(styles.borderBottomWidth),
          paddingTop = parseFloat(styles.paddingTop),
          paddingBottom = parseFloat(styles.paddingBottom),
          borderLeftWidth = parseFloat(styles.borderLeftWidth),
          borderRightWidth = parseFloat(styles.borderRightWidth),
          paddingLeft = parseFloat(styles.paddingLeft),
          paddingRight = parseFloat(styles.paddingRight);
      return {
        height: height - borderBottomWidth - borderTopWidth - paddingTop - paddingBottom,
        width: width - borderLeftWidth - borderRightWidth - paddingLeft - paddingRight
      };
    }
  }, {
    key: "updateHash",
    value: function updateHash() {
      var newHash = 'pid=' + (this.currentImageIndex + 1),
          newURL = window.location.href.split('#')[0] + '#' + newHash;
      this.hashReseted = false;

      if (this.pushStateSupport) {
        window.history[this.historyHasChanges ? 'replaceState' : 'pushState']('', document.title, newURL);
      } else {
        // what is the browser target of this?
        if (this.historyHasChanges) {
          window.location.replace(newURL);
        } else {
          window.location.hash = newHash;
        }
      }

      if (!this.historyHasChanges) {
        this.urlChangedOnce = true;
      }

      this.historyHasChanges = true;
    }
  }, {
    key: "resetHash",
    value: function resetHash() {
      this.hashReseted = true;

      if (this.urlChangedOnce) {
        history.back();
      } else {
        if (this.pushStateSupport) {
          history.pushState('', document.title, window.location.pathname + window.location.search);
        } else {
          window.location.hash = '';
        }
      } //
      //in case an history operation is still pending


      clearTimeout(this.historyUpdateTimeout);
    }
  }, {
    key: "updateURL",
    value: function updateURL() {
      clearTimeout(this.historyUpdateTimeout);

      if (!this.historyHasChanges) {
        this.updateHash(); // first time
      } else {
        this.historyUpdateTimeout = setTimeout(this.updateHash.bind(this), 800);
      }
    }
  }, {
    key: "setCaption",
    value: function setCaption(captionText, imageWidth) {
      var _this7 = this;

      if (this.options.captions && captionText && captionText !== '' && typeof captionText !== "undefined") {
        this.hide(this.domNodes.caption);
        this.domNodes.caption.style.width = imageWidth + 'px';
        this.domNodes.caption.innerHTML = captionText;
        this.domNodes.image.appendChild(this.domNodes.caption);
        setTimeout(function () {
          _this7.fadeIn(_this7.domNodes.caption, _this7.options.fadeSpeed);
        }, this.options.captionDelay);
      }
    }
  }, {
    key: "slide",
    value: function slide(speed, pos) {
      if (!this.transitionCapable) {
        return this.domNodes.image.style.left = pos;
      }

      this.domNodes.image.style[this.transitionPrefix + 'transform'] = 'translateX(' + pos + ')';
      this.domNodes.image.style[this.transitionPrefix + 'transition'] = this.transitionPrefix + 'transform ' + speed + 's linear';
    }
  }, {
    key: "getRelated",
    value: function getRelated(rel) {
      var elems;

      if (rel && rel !== false && rel !== 'nofollow') {
        elems = Array.from(this.elements).filter(function (element) {
          return element.getAttribute('rel') === rel;
        });
      } else {
        elems = this.elements;
      }

      return elems;
    }
  }, {
    key: "openImage",
    value: function openImage(element) {
      var _this8 = this;

      element.dispatchEvent(new Event('show.' + this.eventNamespace));

      if (this.options.disableScroll) {
        this.globalScrollbarWidth = this.toggleScrollbar('hide');
      }

      if (this.options.htmlClass && this.options.htmlClass !== '') {
        document.querySelector('html').classList.add(this.options.htmlClass);
      }

      document.body.appendChild(this.domNodes.wrapper);
      this.domNodes.wrapper.appendChild(this.domNodes.image);

      if (this.options.overlay) {
        document.body.appendChild(this.domNodes.overlay);
      }

      this.relatedElements = this.getRelated(element.rel);

      if (this.options.showCounter) {
        if (this.relatedElements.length == 1 && this.domNodes.wrapper.contains(this.domNodes.counter)) {
          this.domNodes.wrapper.removeChild(this.domNodes.counter);
        } else if (this.relatedElements.length > 1 && !this.domNodes.wrapper.contains(this.domNodes.counter)) {
          this.domNodes.wrapper.appendChild(this.domNodes.counter);
        }
      }

      this.isAnimating = true;
      this.currentImageIndex = this.relatedElements.indexOf(element);
      var targetURL = element.getAttribute(this.options.sourceAttr);
      this.currentImage = document.createElement('img');
      this.currentImage.style.display = 'none';
      this.currentImage.setAttribute('src', targetURL);
      this.currentImage.dataset.scale = 1;
      this.currentImage.dataset.translateX = 0;
      this.currentImage.dataset.translateY = 0;

      if (this.loadedImages.indexOf(targetURL) === -1) {
        this.loadedImages.push(targetURL);
      }

      this.domNodes.image.innerHTML = '';
      this.domNodes.image.setAttribute('style', '');
      this.domNodes.image.appendChild(this.currentImage);
      this.fadeIn(this.domNodes.overlay, this.options.fadeSpeed);
      this.fadeIn([this.domNodes.counter, this.domNodes.navigation, this.domNodes.closeButton], this.options.fadeSpeed);
      this.show(this.domNodes.spinner);
      this.domNodes.counter.querySelector('.sl-current').innerHTML = this.currentImageIndex + 1;
      this.domNodes.counter.querySelector('.sl-total').innerHTML = this.relatedElements.length;
      this.adjustImage();

      if (this.options.preloading) {
        this.preload();
      }

      setTimeout(function () {
        element.dispatchEvent(new Event('shown.' + _this8.eventNamespace));
      }, this.options.animationSpeed);
    }
  }, {
    key: "forceFocus",
    value: function forceFocus() {
      var _this9 = this;

      this.removeEventListener(document, 'focusin.' + this.eventNamespace);
      this.addEventListener(document, 'focusin.' + this.eventNamespace, function (event) {
        if (document !== event.target && _this9.domNodes.wrapper !== event.target && !_this9.domNodes.wrapper.contains(event.target)) {
          _this9.domNodes.wrapper.focus();
        }
      });
    } // utility

  }, {
    key: "addEventListener",
    value: function addEventListener(elements, events, callback, opts) {
      elements = this.wrap(elements);
      events = this.wrap(events);

      var _iterator = _createForOfIteratorHelper(elements),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var element = _step.value;

          if (!element.namespaces) {
            element.namespaces = {};
          } // save the namespaces addEventListener the DOM element itself


          var _iterator2 = _createForOfIteratorHelper(events),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var event = _step2.value;
              var options = opts || false;
              element.namespaces[event] = callback;
              element.addEventListener(event.split('.')[0], callback, options);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(elements, events) {
      elements = this.wrap(elements);
      events = this.wrap(events);

      var _iterator3 = _createForOfIteratorHelper(elements),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var element = _step3.value;

          var _iterator4 = _createForOfIteratorHelper(events),
              _step4;

          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var event = _step4.value;

              if (element.namespaces && element.namespaces[event]) {
                element.removeEventListener(event.split('.')[0], element.namespaces[event]);
                delete element.namespaces[event];
              }
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "fadeOut",
    value: function fadeOut(elements, duration, callback) {
      var _this10 = this;

      elements = this.wrap(elements);

      var _iterator5 = _createForOfIteratorHelper(elements),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var element = _step5.value;
          element.style.opacity = 1;
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      this.isFadeIn = false;

      var step = 16.66666 / (duration || this.options.fadeSpeed),
          fade = function fade() {
        var currentOpacity = parseFloat(elements[0].style.opacity);

        if ((currentOpacity -= step) < 0) {
          var _iterator6 = _createForOfIteratorHelper(elements),
              _step6;

          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              var element = _step6.value;
              element.style.display = "none";
              element.style.opacity = '';
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }

          callback && callback.call(_this10, elements);
        } else {
          var _iterator7 = _createForOfIteratorHelper(elements),
              _step7;

          try {
            for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
              var _element = _step7.value;
              _element.style.opacity = currentOpacity;
            }
          } catch (err) {
            _iterator7.e(err);
          } finally {
            _iterator7.f();
          }

          requestAnimationFrame(fade);
        }
      };

      fade();
    }
  }, {
    key: "fadeIn",
    value: function fadeIn(elements, duration, callback, display) {
      var _this11 = this;

      elements = this.wrap(elements);

      var _iterator8 = _createForOfIteratorHelper(elements),
          _step8;

      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var element = _step8.value;
          element.style.opacity = 0;
          element.style.display = display || "block";
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }

      this.isFadeIn = true;

      var opacityTarget = parseFloat(elements[0].dataset.opacityTarget || 1),
          step = 16.66666 * opacityTarget / (duration || this.options.fadeSpeed),
          fade = function fade() {
        var currentOpacity = parseFloat(elements[0].style.opacity);

        if (!((currentOpacity += step) > opacityTarget)) {
          var _iterator9 = _createForOfIteratorHelper(elements),
              _step9;

          try {
            for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
              var element = _step9.value;
              element.style.opacity = currentOpacity;
            }
          } catch (err) {
            _iterator9.e(err);
          } finally {
            _iterator9.f();
          }

          if (!_this11.isFadeIn) return;
          requestAnimationFrame(fade);
        } else {
          var _iterator10 = _createForOfIteratorHelper(elements),
              _step10;

          try {
            for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
              var _element2 = _step10.value;
              _element2.style.opacity = '';
            }
          } catch (err) {
            _iterator10.e(err);
          } finally {
            _iterator10.f();
          }

          callback && callback.call(_this11, elements);
        }
      };

      fade();
    }
  }, {
    key: "hide",
    value: function hide(elements) {
      elements = this.wrap(elements);

      var _iterator11 = _createForOfIteratorHelper(elements),
          _step11;

      try {
        for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
          var element = _step11.value;
          element.dataset.initialDisplay = element.style.display;
          element.style.display = 'none';
        }
      } catch (err) {
        _iterator11.e(err);
      } finally {
        _iterator11.f();
      }
    }
  }, {
    key: "show",
    value: function show(elements, display) {
      elements = this.wrap(elements);

      var _iterator12 = _createForOfIteratorHelper(elements),
          _step12;

      try {
        for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
          var element = _step12.value;
          element.style.display = element.dataset.initialDisplay || display || 'block';
        }
      } catch (err) {
        _iterator12.e(err);
      } finally {
        _iterator12.f();
      }
    }
  }, {
    key: "wrap",
    value: function wrap(input) {
      return typeof input[Symbol.iterator] === 'function' && typeof input !== 'string' ? input : [input];
    }
  }, {
    key: "on",
    value: function on(events, callback) {
      events = this.wrap(events);

      var _iterator13 = _createForOfIteratorHelper(this.elements),
          _step13;

      try {
        for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
          var element = _step13.value;

          if (!element.fullyNamespacedEvents) {
            element.fullyNamespacedEvents = {};
          }

          var _iterator14 = _createForOfIteratorHelper(events),
              _step14;

          try {
            for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
              var event = _step14.value;
              element.fullyNamespacedEvents[event] = callback;
              element.addEventListener(event, callback);
            }
          } catch (err) {
            _iterator14.e(err);
          } finally {
            _iterator14.f();
          }
        }
      } catch (err) {
        _iterator13.e(err);
      } finally {
        _iterator13.f();
      }

      return this;
    }
  }, {
    key: "off",
    value: function off(events) {
      events = this.wrap(events);

      var _iterator15 = _createForOfIteratorHelper(this.elements),
          _step15;

      try {
        for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
          var element = _step15.value;

          var _iterator16 = _createForOfIteratorHelper(events),
              _step16;

          try {
            for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
              var event = _step16.value;

              if (typeof element.fullyNamespacedEvents !== 'undefined' && event in element.fullyNamespacedEvents) {
                element.removeEventListener(event, element.fullyNamespacedEvents[event]);
              }
            }
          } catch (err) {
            _iterator16.e(err);
          } finally {
            _iterator16.f();
          }
        }
      } catch (err) {
        _iterator15.e(err);
      } finally {
        _iterator15.f();
      }

      return this;
    } // api

  }, {
    key: "open",
    value: function open(elem) {
      elem = elem || this.elements[0];

      if (typeof jQuery !== "undefined" && elem instanceof jQuery) {
        elem = elem.get(0);
      }

      this.initialImageIndex = this.elements.indexOf(elem);

      if (this.initialImageIndex > -1) {
        this.openImage(elem);
      }
    }
  }, {
    key: "next",
    value: function next() {
      this.loadImage(1);
    }
  }, {
    key: "prev",
    value: function prev() {
      this.loadImage(-1);
    } //close is exposed anyways..

  }, {
    key: "destroy",
    value: function destroy() {
      //remove all custom event listeners from elements
      this.off(['close.' + this.eventNamespace, 'closed.' + this.eventNamespace, 'nextImageLoaded.' + this.eventNamespace, 'prevImageLoaded.' + this.eventNamespace, 'change.' + this.eventNamespace, 'nextDone.' + this.eventNamespace, 'prevDone.' + this.eventNamespace, 'error.' + this.eventNamespace, 'changed.' + this.eventNamespace, 'next.' + this.eventNamespace, 'prev.' + this.eventNamespace, 'show.' + this.eventNamespace, 'shown.' + this.eventNamespace]);
      this.removeEventListener(this.elements, 'click.' + this.eventNamespace);
      this.removeEventListener(document, 'focusin.' + this.eventNamespace);
      this.removeEventListener(document.body, 'contextmenu.' + this.eventNamespace);
      this.removeEventListener(document.body, 'keyup.' + this.eventNamespace);
      this.removeEventListener(this.domNodes.navigation.getElementsByTagName('button'), 'click.' + this.eventNamespace);
      this.removeEventListener(this.domNodes.closeButton, 'click.' + this.eventNamespace);
      this.removeEventListener(window, 'resize.' + this.eventNamespace);
      this.removeEventListener(window, 'hashchange.' + this.eventNamespace);
      this.close();

      if (this.isOpen) {
        document.body.removeChild(this.domNodes.wrapper);
        document.body.removeChild(this.domNodes.overlay);
      }

      this.elements = null;
    }
  }, {
    key: "refresh",
    value: function refresh() {
      if (!this.initialSelector) {
        throw 'refreshing only works when you initialize using a selector!';
      }

      var options = this.options,
          selector = this.initialSelector;
      this.destroy();
      this.constructor(selector, options);
      return this;
    }
  }, {
    key: "hash",
    get: function get() {
      return window.location.hash.substring(1);
    }
  }]);

  return SimpleLightbox;
}();

var _default = SimpleLightbox;
exports["default"] = _default;
global.SimpleLightbox = SimpleLightbox;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);

// FUNCIÓN CARGAR ARCHIVOS SCRIPTS
function loadScript(url, callback) {
	var s = document.createElement('script');
	s.onload = callback;
	s.src = url;
	document.querySelector('head').appendChild(s);
}

// SCROLL BEHAVIOR SMOOTH EN NAVEGADORES INCOMPATIBLES (SAFARI) IMPORTANDO smoothscroll.min.js
if(!('scrollBehavior' in document.documentElement.style)){
	function smoothScroll(){
		var anchorOffset = 48;
		var links = document.querySelectorAll('[href^="#"]');
		links.forEach(link => {
			link.addEventListener('click', click => {
				click.preventDefault();
				var target = document.querySelector(link.getAttribute('href'));
				target.scrollIntoView({behavior:'smooth'});
				//target.setAttribute('tabindex', '-1');
				//target.focus();
			});
		});
	}
	loadScript('/js/smooth-scroll.min.js', smoothScroll);
}
// FUNCIÓN SCROLL-SHOT
function scrollShot(windowMarginTop, windowMarginBottom, selectorCSS, doAfterPre, doBefore = () => undefined, doAfterPost = 0){
	const callbackScroll = (entries, observer) =>
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				doAfterPre(entry.target);
				if(!doAfterPost){
					observer.unobserve(entry.target);
				}
			} else if(doAfterPost) {
				doAfterPost(entry.target);
			}
		});
	const observerScroll = new IntersectionObserver(callbackScroll, {
		rootMargin: windowMarginTop + ' 0px ' + windowMarginBottom + ' 0px'
	});
	document.querySelectorAll(selectorCSS).forEach(nodo => {
		observerScroll.observe(nodo);
		doBefore(nodo);
	});
}
// APARECER CON SCROLL HACIA ARRIBA
scrollShot(
  '-15%',
  '-15%',
  '[data-showup]',
  nodo => nodo.classList.remove('showup'),
  nodo => nodo.classList.add('showup')
)

// LAZY-LOAD DATA-SRC
scrollShot(
	'0px',
	'0px',
	'[data-src]',
	nodo => {
		nodo.src = nodo.dataset.src;
		if(nodo.dataset.srcset) nodo.srcset = nodo.dataset.srcset;
		if(nodo.dataset.sizes) nodo.sizes = nodo.dataset.sizes;
		nodo.classList.remove('lazyload');
	},
	nodo => {
		nodo.classList.add('lazyload');
		var width = nodo.getAttribute('width') || '100%';
		var height = nodo.getAttribute('height') || '100%';
		nodo.setAttribute('src', `data:image/svg+xml,%3csvg%20width='${width}'%20height='${height}'%20viewBox='0%200%2016%2016'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20fill='none'%20stroke='gray'%20stroke-width='1'%20stroke-miterlimit='10'%20cx='8'%20cy='8'%20r='7.5'/%3e%3cpolyline%20fill='none'%20stroke='gray'%20stroke-width='1'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-miterlimit='10'%20points='8,3 8,8 10,10'/%3e%3c/svg%3e`);
	}
);

// LAZY-LOAD DATA-STYLE
scrollShot(
	'0px',
	'160px',
	'[data-style]',
	nodo => nodo.style = nodo.dataset.style
);
// SimpleLightbox
(function () {
  document.querySelectorAll('.group-lightbox').forEach(group => {
    const groupName = group.querySelector('[data-lightbox]').getAttribute('data-lightbox')
    const gallery = new SimpleLightbox(`[data-lightbox='${groupName}']`)
  })
  const galleryAccesorios = new SimpleLightbox("[data-lightbox='accesorios']")
})()

// Modal
const modals = document.querySelectorAll('.modal[id]')
const btnCloseModalAndHash = document.querySelectorAll('[href^="#"][data-dismiss="modal"]')

modals.forEach(modal => {
  // Actualizate hash when open modal
  modal.addEventListener('shown.bs.modal', event => {
    window.location.hash = modal.getAttribute('id')
  }, false)
  // Remove hash when close modal
  modal.addEventListener('hide.bs.modal', event => {
    if (window.location.hash) {
      window.history.pushState('', document.title, window.location.pathname + window.location.search)
    }
  }, false)
})

// Actualizate hash when close modal by button with hash
btnCloseModalAndHash.forEach(e => {
  e.addEventListener('click', c => {
    setTimeout(() => window.location.hash = c.target.getAttribute('href'), 400)
  })
})

// Open modal when load URL with hash
if (window.location.hash) {
  modals.forEach(modal => {
    const hash = '#' + modal.getAttribute('id')
    if (window.location.hash === hash) {
      const whenLoadNewModalInstance = new BSN.Modal(hash, { backdrop: true }).show()
    }
  })
}

// Buttons next/prev modal
let modalsZapatos
let idZapatos = []
function startNextPrev () {
  modalsZapatos = document.querySelectorAll('.modal[id^="zapatos-"]')
  idZapatos = []
  modalsZapatos.forEach(e => idZapatos.push(e.getAttribute('id')))
  modalsZapatos.forEach((e, i) => {
    let idModalPrev, idModalNext
    e.querySelector('.btn-prev').addEventListener('click', btnPrev => {
      if (i === 0) {
        idModalPrev = modalsZapatos[modalsZapatos.length - 1].getAttribute('id')
      } else {
        idModalPrev = modalsZapatos[i - 1].getAttribute('id')
      }
      new BSN.Modal('#' + idModalPrev, {}).show()
    })
    e.querySelector('.btn-next').addEventListener('click', btnPrev => {
      if (i === modalsZapatos.length - 1) {
        idModalNext = modalsZapatos[0].getAttribute('id')
      } else {
        idModalNext = modalsZapatos[i + 1].getAttribute('id')
      }
      new BSN.Modal('#' + idModalNext, {}).show()
    })
  })
}
startNextPrev()
