/**
 * TAS (Tool-Assisted Speedrun) Input Simulation Module for Kitsune
 *
 * This module provides functions to simulate user input for TAS functionality.
 * Uses native KeyboardEvent dispatching for maximum compatibility.
 *
 * Direction indices:
 *   0: Left/West
 *   1: Right/East
 *   2: Up/North
 *   3: Down/South
 *   4: Action/Confirm (Space/Enter)
 *   5: Cancel/Back (Backspace/1/Delete)
 */

(function(global) {
    'use strict';

    const TAS = {
        // Internal state
        _inputManager: null,
        _keyboardHandler: null,
        _recording: [],
        _isRecording: false,
        _isPlaying: false,
        _playbackIndex: 0,
        _frameCount: 0,
        _tickHooked: false,

        // Direction constants
        DIRECTION: {
            LEFT: 0,
            RIGHT: 1,
            UP: 2,
            DOWN: 3,
            ACTION: 4,
            CANCEL: 5
        },

        // Key code mappings
        KEYS: {
            LEFT: 37,
            RIGHT: 39,
            UP: 38,
            DOWN: 40,
            SPACE: 32,
            ENTER: 13,
            BACKSPACE: 8
        },

        // Key code to key name mapping for KeyboardEvent
        _keyNames: {
            37: 'ArrowLeft',
            39: 'ArrowRight',
            38: 'ArrowUp',
            40: 'ArrowDown',
            32: ' ',
            13: 'Enter',
            8: 'Backspace'
        },

        /**
         * Initialize TAS system
         */
        init: function() {
            if (typeof Wv !== 'undefined' && Wv && Wv.Jc && Wv.Jc.Dk) {
                this._inputManager = Wv.Jc.Dk;
                this._keyboardHandler = this._inputManager.Jc;
                this._gameInstance = Wv;
                console.log('[TAS] Initialized successfully');
                return true;
            }
            console.warn('[TAS] Could not find input manager. Try TAS.init() after game loads.');
            return false;
        },

        // ==================== KEYBOARD EVENT SIMULATION ====================

        /**
         * Dispatch a native KeyboardEvent
         * @param {string} type - 'keydown' or 'keyup'
         * @param {number} keyCode - The key code
         */
        _dispatchKeyEvent: function(type, keyCode) {
            const key = this._keyNames[keyCode] || String.fromCharCode(keyCode);
            const event = new KeyboardEvent(type, {
                bubbles: true,
                cancelable: true,
                key: key,
                code: key === ' ' ? 'Space' : key,
                keyCode: keyCode,
                which: keyCode,
                view: window
            });
            document.dispatchEvent(event);
        },

        /**
         * Simulate pressing a key using native KeyboardEvent
         * @param {number} keyCode - The key code to press
         */
        pressKey: function(keyCode) {
            this._dispatchKeyEvent('keydown', keyCode);
        },

        /**
         * Simulate releasing a key using native KeyboardEvent
         * @param {number} keyCode - The key code to release
         */
        releaseKey: function(keyCode) {
            this._dispatchKeyEvent('keyup', keyCode);
        },

        /**
         * Press and release a key (tap)
         * @param {number} keyCode - The key code
         */
        tapKey: function(keyCode) {
            this.pressKey(keyCode);
            setTimeout(() => this.releaseKey(keyCode), 50);
        },

        /**
         * Release all keys
         */
        releaseAllKeys: function() {
            Object.keys(this.KEYS).forEach(name => {
                this.releaseKey(this.KEYS[name]);
            });
        },

        // ==================== DIRECTION SHORTCUTS ====================

        /**
         * Press left arrow
         */
        left: function() { this.pressKey(this.KEYS.LEFT); },

        /**
         * Press right arrow
         */
        right: function() { this.pressKey(this.KEYS.RIGHT); },

        /**
         * Press up arrow
         */
        up: function() { this.pressKey(this.KEYS.UP); },

        /**
         * Press down arrow
         */
        down: function() { this.pressKey(this.KEYS.DOWN); },

        /**
         * Press action (Enter key)
         */
        action: function() { this.pressKey(this.KEYS.ENTER); },

        /**
         * Press cancel (Backspace key)
         */
        cancel: function() { this.pressKey(this.KEYS.BACKSPACE); },

        /**
         * Release left arrow
         */
        releaseLeft: function() { this.releaseKey(this.KEYS.LEFT); },

        /**
         * Release right arrow
         */
        releaseRight: function() { this.releaseKey(this.KEYS.RIGHT); },

        /**
         * Release up arrow
         */
        releaseUp: function() { this.releaseKey(this.KEYS.UP); },

        /**
         * Release down arrow
         */
        releaseDown: function() { this.releaseKey(this.KEYS.DOWN); },

        /**
         * Release action
         */
        releaseAction: function() { this.releaseKey(this.KEYS.ENTER); },

        /**
         * Release cancel
         */
        releaseCancel: function() { this.releaseKey(this.KEYS.BACKSPACE); },

        // ==================== TAP SHORTCUTS ====================

        /**
         * Tap action (press and release Enter)
         */
        tapAction: function() { this.tapKey(this.KEYS.ENTER); },

        /**
         * Tap space
         */
        tapSpace: function() { this.tapKey(this.KEYS.SPACE); },

        // ==================== INPUT STATE ====================

        /**
         * Get current input state from the input manager
         * @returns {Object} Current state of all directions
         */
        getInputState: function() {
            if (!this._inputManager) return null;

            const tb = this._inputManager.tb || {};
            return {
                left: !!tb[0],
                right: !!tb[1],
                up: !!tb[2],
                down: !!tb[3],
                action: !!tb[4],
                cancel: !!tb[5]
            };
        },

        /**
         * Set input state for a frame (used during playback)
         * @param {Object} state - Input state object
         */
        setInputState: function(state) {
            this.releaseAllKeys();
            if (state.left) this.left();
            if (state.right) this.right();
            if (state.up) this.up();
            if (state.down) this.down();
            if (state.action) this.pressKey(this.KEYS.ENTER);
            if (state.cancel) this.pressKey(this.KEYS.BACKSPACE);
        },

        // ==================== RECORDING & PLAYBACK ====================

        /**
         * Hook into game tick for recording/playback
         */
        _hookGameTick: function() {
            if (this._tickHooked) return;

            const self = this;
            if (typeof Vv !== 'undefined' && Vv.prototype && Vv.prototype.tick) {
                const originalTick = Vv.prototype.tick;
                Vv.prototype.tick = function(b) {
                    originalTick.call(this, b);
                    if (self._isRecording) self.recordFrame();
                    if (self._isPlaying) self.playbackFrame();
                };
                this._tickHooked = true;
                console.log('[TAS] Hooked into game tick');
            }
        },

        /**
         * Start recording inputs
         */
        startRecording: function() {
            this._recording = [];
            this._isRecording = true;
            this._frameCount = 0;
            if (!this._tickHooked) this._hookGameTick();
            console.log('[TAS] Recording started');
        },

        /**
         * Stop recording inputs
         * @returns {Array} The recorded input sequence
         */
        stopRecording: function() {
            this._isRecording = false;
            console.log('[TAS] Recording stopped. ' + this._recording.length + ' frames recorded.');
            return this._recording.slice();
        },

        /**
         * Record current frame's input state
         */
        recordFrame: function() {
            if (!this._isRecording) return;

            const state = this.getInputState();
            if (state) {
                this._recording.push({
                    frame: this._frameCount,
                    left: state.left,
                    right: state.right,
                    up: state.up,
                    down: state.down,
                    action: state.action,
                    cancel: state.cancel
                });
            }
            this._frameCount++;
        },

        /**
         * Start playback
         * @param {Array|string} [sequence] - Input sequence (array or JSON string)
         */
        startPlayback: function(sequence) {
            if (sequence === undefined) {
                sequence = this._recording;
            }
            if (typeof sequence === 'string') {
                try {
                    sequence = JSON.parse(sequence);
                } catch (e) {
                    console.error('[TAS] Failed to parse sequence:', e);
                    return;
                }
            }
            if (Array.isArray(sequence) && sequence.length > 0) {
                this._recording = sequence;
            }
            if (!this._recording || this._recording.length === 0) {
                console.warn('[TAS] No sequence to play');
                return;
            }
            if (!this._tickHooked) this._hookGameTick();
            this._playbackIndex = 0;
            this._isPlaying = true;
            this._isRecording = false;
            console.log('[TAS] Playback started. ' + this._recording.length + ' frames.');
        },

        /**
         * Stop playback
         */
        stopPlayback: function() {
            this._isPlaying = false;
            this._playbackIndex = 0;
            this.releaseAllKeys();
            console.log('[TAS] Playback stopped');
        },

        /**
         * Execute one frame of playback
         */
        playbackFrame: function() {
            if (!this._isPlaying) return false;

            if (this._playbackIndex >= this._recording.length) {
                this.stopPlayback();
                return false;
            }

            const state = this._recording[this._playbackIndex];
            this.setInputState(state);
            this._playbackIndex++;
            return true;
        },

        /**
         * Check if recording
         */
        isRecording: function() { return this._isRecording; },

        /**
         * Check if playing
         */
        isPlaying: function() { return this._isPlaying; },

        /**
         * Get recording
         */
        getRecording: function() { return this._recording.slice(); },

        /**
         * Export recording as JSON
         */
        exportRecording: function() {
            return JSON.stringify(this._recording);
        },

        /**
         * Import recording from JSON or array
         * @param {string|Array} data
         */
        importRecording: function(data) {
            try {
                if (Array.isArray(data)) {
                    this._recording = data;
                } else if (typeof data === 'string') {
                    this._recording = JSON.parse(data);
                } else {
                    console.error('[TAS] Invalid data type');
                    return false;
                }
                console.log('[TAS] Imported ' + this._recording.length + ' frames');
                return true;
            } catch (e) {
                console.error('[TAS] Import failed:', e);
                return false;
            }
        },

        /**
         * Log debug info
         */
        logState: function() {
            console.log('[TAS] Debug:', {
                initialized: !!(this._inputManager),
                recording: this._isRecording,
                playing: this._isPlaying,
                frameCount: this._frameCount,
                recordingLength: this._recording.length,
                inputState: this.getInputState()
            });
        }
    };

    // Export to global
    global.TAS = TAS;

    // Auto-init with retry
    const tryInit = function(attempts) {
        if (TAS.init()) {
            TAS._hookGameTick();
            console.log('[TAS] Ready! Commands: TAS.action(), TAS.tapAction(), TAS.left(), etc.');
        } else if (attempts > 0) {
            setTimeout(function() { tryInit(attempts - 1); }, 500);
        }
    };

    if (document.readyState === 'complete') {
        setTimeout(function() { tryInit(10); }, 500);
    } else {
        window.addEventListener('load', function() {
            setTimeout(function() { tryInit(10); }, 500);
        });
    }

})(typeof window !== 'undefined' ? window : this);
