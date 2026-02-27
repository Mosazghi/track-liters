import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import St from "gi://St";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
const CHANGE_AMOUNT = 0.5;
const SETTINGS_KEY = "total-liters";
const LitersIndicator = GObject.registerClass(class LitersIndicator extends PanelMenu.Button {
    _totalLiters = 0;
    _withWaterEmoji = true;
    _settings;
    _label;
    _resetLitersTimer = 0;
    _toggleEmojiTimer = 0;
    _init() {
        super._init(0.0, "Liters Counter", false);
    }
    _litersDisplay(liters) {
        return `${liters} L ${this._withWaterEmoji ? "💧" : ""}`;
    }
    _increase() {
        this._totalLiters += CHANGE_AMOUNT;
        this._updateDisplay("inc");
    }
    _decrease() {
        if (this._totalLiters <= 0)
            return;
        this._totalLiters = Math.max(0, this._totalLiters - CHANGE_AMOUNT);
        this._updateDisplay("dec");
    }
    _animateLabel(type) {
        const color = type === "inc" ? "#91d293" : "#dc685c";
        const direction = type === "inc" ? -3 : 3;
        this._label?.set_style(`color: ${color};`);
        // Move up/down
        this._label?.save_easing_state();
        this._label?.set_easing_duration(120);
        this._label?.set_easing_mode(Clutter.AnimationMode.EASE_OUT_QUAD);
        this._label?.set_translation(0, direction, 0);
        this._label?.restore_easing_state();
        // Return to origin
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 120, () => {
            this._label?.save_easing_state();
            this._label?.set_easing_duration(180);
            this._label?.set_easing_mode(Clutter.AnimationMode.EASE_IN_OUT_QUAD);
            this._label?.set_translation(0, 0, 0);
            this._label?.restore_easing_state();
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 180, () => {
                this._label?.set_style("");
                return GLib.SOURCE_REMOVE;
            });
            return GLib.SOURCE_REMOVE;
        });
    }
    _updateDisplay(type) {
        this._settings?.set_double(SETTINGS_KEY, this._totalLiters);
        this._label.text = this._litersDisplay(this._totalLiters);
        this._animateLabel(type);
    }
    destroy() {
        if (this._resetLitersTimer !== 0) {
            GLib.source_remove(this._resetLitersTimer);
            this._resetLitersTimer = 0;
        }
        if (this._toggleEmojiTimer !== 0) {
            GLib.source_remove(this._toggleEmojiTimer);
            this._toggleEmojiTimer = 0;
        }
        super.destroy();
    }
    setup(settings) {
        this._settings = settings;
        this._totalLiters = this._settings.get_double(SETTINGS_KEY);
        this._label = new St.Label({
            text: this._litersDisplay(this._totalLiters),
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._label.set_pivot_point(0.5, 0.5);
        this.add_child(this._label);
        this.connect("button-press-event", (_actor, event) => {
            const btn = event.get_button();
            if (btn === 1) {
                if (this._resetLitersTimer !== 0) {
                    GLib.source_remove(this._resetLitersTimer);
                    this._resetLitersTimer = 0;
                }
                this._resetLitersTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 800, () => {
                    this._totalLiters = 0;
                    this._settings?.set_double(SETTINGS_KEY, 0);
                    this._label.text = this._litersDisplay(0);
                    this._resetLitersTimer = 0;
                    return GLib.SOURCE_REMOVE;
                });
            }
            if (btn === 3) {
                if (this._toggleEmojiTimer !== 0) {
                    GLib.source_remove(this._toggleEmojiTimer);
                    this._toggleEmojiTimer = 0;
                }
                this._toggleEmojiTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 800, () => {
                    this._withWaterEmoji = !this._withWaterEmoji;
                    this._label.text = this._litersDisplay(this._totalLiters);
                    this._toggleEmojiTimer = 0;
                    return GLib.SOURCE_REMOVE;
                });
            }
            return Clutter.EVENT_STOP;
        });
        this.connect("button-release-event", (_actor, event) => {
            if (event.get_button() === 1 && this._resetLitersTimer !== 0) {
                GLib.source_remove(this._resetLitersTimer);
                this._resetLitersTimer = 0;
                this._increase();
            }
            if (event.get_button() === 3 && this._toggleEmojiTimer !== 0) {
                GLib.source_remove(this._toggleEmojiTimer);
                this._toggleEmojiTimer = 0;
                this._decrease();
            }
            return Clutter.EVENT_STOP;
        });
    }
});
export default class TrackLitersExtension extends Extension {
    _indicator = null;
    enable() {
        const settings = this.getSettings();
        this._indicator = new LitersIndicator(0, "Liters Indicator");
        this._indicator.setup(settings);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }
    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
