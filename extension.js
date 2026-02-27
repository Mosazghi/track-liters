"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("gi://Clutter");
var _2 = require("gi://GLib");
var _3 = require("gi://GObject");
var _4 = require("gi://St");
var extension_js_1 = require("resource:///org/gnome/shell/extensions/extension.js");
var Main = require("resource:///org/gnome/shell/ui/main.js");
var PanelMenu = require("resource:///org/gnome/shell/ui/panelMenu.js");
var CHANGE_AMOUNT = 0.5;
var SETTINGS_KEY = "total-liters";
var LitersIndicator = _3.default.registerClass(/** @class */ (function (_super) {
    __extends(LitersIndicator, _super);
    function LitersIndicator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._totalLiters = 0;
        _this._withWaterEmoji = true;
        _this._resetLitersTimer = 0;
        _this._toggleEmojiTimer = 0;
        return _this;
    }
    LitersIndicator.prototype._init = function () {
        _super.prototype._init.call(this, 0.0, "Liters Counter", false);
    };
    LitersIndicator.prototype._litersDisplay = function (liters) {
        return "".concat(liters, " L ").concat(this._withWaterEmoji ? "💧" : "");
    };
    LitersIndicator.prototype._increase = function () {
        this._totalLiters += CHANGE_AMOUNT;
        this._updateDisplay("inc");
    };
    LitersIndicator.prototype._decrease = function () {
        if (this._totalLiters <= 0)
            return;
        this._totalLiters = Math.max(0, this._totalLiters - CHANGE_AMOUNT);
        this._updateDisplay("dec");
    };
    LitersIndicator.prototype._animateLabel = function (type) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        var color = type === "inc" ? "#91d293" : "#dc685c";
        var direction = type === "inc" ? -3 : 3;
        (_a = this._label) === null || _a === void 0 ? void 0 : _a.set_style("color: ".concat(color, ";"));
        // Move up/down
        (_b = this._label) === null || _b === void 0 ? void 0 : _b.save_easing_state();
        (_c = this._label) === null || _c === void 0 ? void 0 : _c.set_easing_duration(120);
        (_d = this._label) === null || _d === void 0 ? void 0 : _d.set_easing_mode(_1.default.AnimationMode.EASE_OUT_QUAD);
        (_e = this._label) === null || _e === void 0 ? void 0 : _e.set_translation(0, direction, 0);
        (_f = this._label) === null || _f === void 0 ? void 0 : _f.restore_easing_state();
        // Return to origin
        _2.default.timeout_add(_2.default.PRIORITY_DEFAULT, 120, function () {
            var _a, _b, _c, _d, _e;
            (_a = _this._label) === null || _a === void 0 ? void 0 : _a.save_easing_state();
            (_b = _this._label) === null || _b === void 0 ? void 0 : _b.set_easing_duration(180);
            (_c = _this._label) === null || _c === void 0 ? void 0 : _c.set_easing_mode(_1.default.AnimationMode.EASE_IN_OUT_QUAD);
            (_d = _this._label) === null || _d === void 0 ? void 0 : _d.set_translation(0, 0, 0);
            (_e = _this._label) === null || _e === void 0 ? void 0 : _e.restore_easing_state();
            _2.default.timeout_add(_2.default.PRIORITY_DEFAULT, 180, function () {
                var _a;
                (_a = _this._label) === null || _a === void 0 ? void 0 : _a.set_style("");
                return _2.default.SOURCE_REMOVE;
            });
            return _2.default.SOURCE_REMOVE;
        });
    };
    LitersIndicator.prototype._updateDisplay = function (type) {
        var _a;
        (_a = this._settings) === null || _a === void 0 ? void 0 : _a.set_double(SETTINGS_KEY, this._totalLiters);
        this._label.text = this._litersDisplay(this._totalLiters);
        this._animateLabel(type);
    };
    LitersIndicator.prototype.destroy = function () {
        if (this._resetLitersTimer !== 0) {
            _2.default.source_remove(this._resetLitersTimer);
            this._resetLitersTimer = 0;
        }
        if (this._toggleEmojiTimer !== 0) {
            _2.default.source_remove(this._toggleEmojiTimer);
            this._toggleEmojiTimer = 0;
        }
        _super.prototype.destroy.call(this);
    };
    LitersIndicator.prototype.setup = function (settings) {
        var _this = this;
        this._settings = settings;
        this._totalLiters = this._settings.get_double(SETTINGS_KEY);
        this._label = new _4.default.Label({
            text: this._litersDisplay(this._totalLiters),
            y_align: _1.default.ActorAlign.CENTER,
        });
        this._label.set_pivot_point(0.5, 0.5);
        this.add_child(this._label);
        this.connect("button-press-event", function (_actor, event) {
            var btn = event.get_button();
            if (btn === 1) {
                if (_this._resetLitersTimer !== 0) {
                    _2.default.source_remove(_this._resetLitersTimer);
                    _this._resetLitersTimer = 0;
                }
                _this._resetLitersTimer = _2.default.timeout_add(_2.default.PRIORITY_DEFAULT, 800, function () {
                    var _a;
                    _this._totalLiters = 0;
                    (_a = _this._settings) === null || _a === void 0 ? void 0 : _a.set_double(SETTINGS_KEY, 0);
                    _this._label.text = _this._litersDisplay(0);
                    _this._resetLitersTimer = 0;
                    return _2.default.SOURCE_REMOVE;
                });
            }
            if (btn === 3) {
                if (_this._toggleEmojiTimer !== 0) {
                    _2.default.source_remove(_this._toggleEmojiTimer);
                    _this._toggleEmojiTimer = 0;
                }
                _this._toggleEmojiTimer = _2.default.timeout_add(_2.default.PRIORITY_DEFAULT, 800, function () {
                    _this._withWaterEmoji = !_this._withWaterEmoji;
                    _this._label.text = _this._litersDisplay(_this._totalLiters);
                    _this._toggleEmojiTimer = 0;
                    return _2.default.SOURCE_REMOVE;
                });
            }
            return _1.default.EVENT_STOP;
        });
        this.connect("button-release-event", function (_actor, event) {
            if (event.get_button() === 1 && _this._resetLitersTimer !== 0) {
                _2.default.source_remove(_this._resetLitersTimer);
                _this._resetLitersTimer = 0;
                _this._increase();
            }
            if (event.get_button() === 3 && _this._toggleEmojiTimer !== 0) {
                _2.default.source_remove(_this._toggleEmojiTimer);
                _this._toggleEmojiTimer = 0;
                _this._decrease();
            }
            return _1.default.EVENT_STOP;
        });
    };
    return LitersIndicator;
}(PanelMenu.Button)));
var TrackLitersExtension = /** @class */ (function (_super) {
    __extends(TrackLitersExtension, _super);
    function TrackLitersExtension() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._indicator = null;
        return _this;
    }
    TrackLitersExtension.prototype.enable = function () {
        var settings = this.getSettings();
        this._indicator = new LitersIndicator(0, "Liters Indicator");
        this._indicator.setup(settings);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    };
    TrackLitersExtension.prototype.disable = function () {
        var _a;
        (_a = this._indicator) === null || _a === void 0 ? void 0 : _a.destroy();
        this._indicator = null;
    };
    return TrackLitersExtension;
}(extension_js_1.Extension));
exports.default = TrackLitersExtension;
