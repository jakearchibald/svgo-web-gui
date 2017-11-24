"use strict";

var utils = require('../utils');
var Spinner = require('./spinner');

class MainMenu extends (require('events').EventEmitter) {
  constructor() {
    super();

    this.allowHide = false;
    this._spinner = new Spinner();

    utils.domReady.then(_ => {
      this.container = document.querySelector('.main-menu');
      this._selectFileInput = document.querySelector('.select-file-input');
      this._pasteInput = document.querySelector('.paste-input');
      this._loadDemoBtn = document.querySelector('.load-demo');
      this._selectFileBtn = document.querySelector('.select-file');
      this._pasteLabel = document.querySelector('.menu-input');
      this._overlay = this.container.querySelector('.overlay');
      this._menu = this.container.querySelector('.menu');

      document.querySelector('.menu-btn')
        .addEventListener('click', e => this._onMenuButtonClick(e));

      this._overlay.addEventListener('click', e => this._onOverlayClick(e));

      this._selectFileBtn.addEventListener('click', e => this._onSelectFileClick(e));
      this._loadDemoBtn.addEventListener('click', e => this._onLoadDemoClick(e));
      this._selectFileInput.addEventListener('change', e => this._onFileInputChange(e));
      this._pasteInput.addEventListener('input', e => this._onTextInputChange(e));
    });
  }

  show() {
    this.container.classList.remove('hidden');
    utils.transitionFromClass(this._overlay, 'hidden');
    utils.transitionFromClass(this._menu, 'hidden');
  }

  hide() {
    if (!this.allowHide) {
      return;
    }
    this.stopSpinner();
    this.container.classList.add('hidden');
    utils.transitionToClass(this._overlay, 'hidden');
    utils.transitionToClass(this._menu, 'hidden');
  }

  stopSpinner() {
    this._spinner.hide();
  }

  _onOverlayClick(event) {
    event.preventDefault();
    this.hide();
  }

  _onMenuButtonClick(event) {
    event.preventDefault();
    this.show();
  }

  _onTextInputChange(event) {
    var val = this._pasteInput.value.trim().replace(/\0$/, "");

    if (val.indexOf('</svg>') != -1) {
      this._pasteInput.value = '';
      this._pasteInput.blur();

      this._pasteLabel.appendChild(this._spinner.container);
      this._spinner.show();

      this.emit('svgDataLoad', {
        data: val,
        filename: 'image.svg'
      });
    }
  }

  _onSelectFileClick(event) {
    event.preventDefault();
    event.target.blur();
    this._selectFileInput.click();
  }

  async _onFileInputChange(event) {
    var file = this._selectFileInput.files[0];

    if (!file) {
      return;
    }

    this._selectFileBtn.appendChild(this._spinner.container);
    this._spinner.show();

    this.emit('svgDataLoad', {
      data: await utils.readFileAsText(file),
      filename: file.name
    });
  }

  async _onLoadDemoClick(event) {
    event.preventDefault();
    event.target.blur();
    this._loadDemoBtn.appendChild(this._spinner.container);
    this._spinner.show();

    try {
      this.emit('svgDataLoad', {
        data: await utils.get('test-svgs/car-lite.svg'),
        filename: 'car.svg'
      });
    }
    catch (error) {
      this.stopSpinner();

      var e;

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        e = Error("Demo not available offline");
      }
      else {
        e = Error("Couldn't fetch demo SVG");
      }

      this.emit('error', {
        error: e
      });
    }
  }
}

module.exports = MainMenu;