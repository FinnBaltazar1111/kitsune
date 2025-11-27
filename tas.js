/**
 * TAS (Tool-Assisted Speedrun) Input Simulation Module for Kitsune
 *
 * This module provides functions to simulate user input for TAS functionality.
 * It hooks into the game's existing input system (Kh, Ih, Hh, Jh handlers).
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
        _originalTick: null,

        // Direction constants
        DIRECTION: {
            LEFT: 0,
            RIGHT: 1,
            UP: 2,
            DOWN: 3,
            ACTION: 4,
            CANCEL: 5
        },

        // Key code mappings (matching game's Ih handler)
        KEYS: {
            LEFT: 37,
            RIGHT: 39,
            UP: 38,
            DOWN: 40,
            A: 65,
            D: 68,
            W: 87,
            S: 83,
            SPACE: 32,
            ENTER: 13,
            BACKSPACE: 8,
            DELETE: 46,
            ONE: 49
        },

        /**
         * Initialize TAS system by finding the input manager
         * Call this after the game has loaded
         */
        init: function() {
            // The game stores the main instance in global Wv
            // Wv.Jc is the game controller, Wv.Jc.Dk is the input manager (Kh)
            if (typeof Wv !== 'undefined' && Wv && Wv.Jc && Wv.Jc.Dk) {
                this._inputManager = Wv.Jc.Dk;
                this._keyboardHandler = this._inputManager.Jc; // Ih instance
                this._gameInstance = Wv;
                console.log('[TAS] Initialized successfully via Wv.Jc.Dk');
                return true;
            }

            // Fallback: Try to find via xh(yp) pattern
            if (typeof xh === 'function' && typeof yp !== 'undefined') {
                try {
                    const gameInstance = xh(yp);
                    if (gameInstance && gameInstance.Dk) {
                        this._inputManager = gameInstance.Dk;
                        this._keyboardHandler = this._inputManager.Jc;
                        console.log('[TAS] Initialized successfully via xh(yp)');
                        return true;
                    }
                } catch (e) {
                    // Ignore errors
                }
            }

            console.warn('[TAS] Could not find input manager. Make sure game is loaded.');
            console.warn('[TAS] Try calling TAS.init() after the game starts.');
            return false;
        },

        /**
         * Set the input manager directly (if auto-detection fails)
         * @param {Object} inputManager - The Kh instance
         */
        setInputManager: function(inputManager) {
            this._inputManager = inputManager;
            if (inputManager) {
                this._keyboardHandler = inputManager.Jc;
            }
        },

        // ==================== DIRECT INPUT SIMULATION ====================

        /**
         * Simulate pressing a key
         * @param {number} keyCode - The key code to press
         */
        pressKey: function(keyCode) {
            if (!this._keyboardHandler) {
                console.warn('[TAS] Not initialized');
                return;
            }
            this._keyboardHandler.Ob[keyCode] = true;
        },

        /**
         * Simulate releasing a key
         * @param {number} keyCode - The key code to release
         */
        releaseKey: function(keyCode) {
            if (!this._keyboardHandler) {
                console.warn('[TAS] Not initialized');
                return;
            }
            this._keyboardHandler.Ob[keyCode] = false;
        },

        /**
         * Release all currently pressed keys
         */
        releaseAllKeys: function() {
            if (!this._keyboardHandler) {
                console.warn('[TAS] Not initialized');
                return;
            }
            for (const key of Object.keys(this._keyboardHandler.Ob)) {
                this._keyboardHandler.Ob[Number(key)] = false;
            }
        },

        /**
         * Simulate pressing a direction
         * @param {number} direction - Direction index (0-5)
         */
        pressDirection: function(direction) {
            if (!this._keyboardHandler) {
                console.warn('[TAS] Not initialized');
                return;
            }
            const keyMappings = this._keyboardHandler.Ea;
            if (keyMappings && keyMappings[direction]) {
                // Press the first key mapped to this direction
                const keyCode = keyMappings[direction][0];
                this.pressKey(keyCode);
            }
        },

        /**
         * Simulate releasing a direction
         * @param {number} direction - Direction index (0-5)
         */
        releaseDirection: function(direction) {
            if (!this._keyboardHandler) {
                console.warn('[TAS] Not initialized');
                return;
            }
            const keyMappings = this._keyboardHandler.Ea;
            if (keyMappings && keyMappings[direction]) {
                // Release all keys mapped to this direction
                for (const keyCode of keyMappings[direction]) {
                    this.releaseKey(keyCode);
                }
            }
        },

        // ==================== CONVENIENCE METHODS ====================

        /**
         * Press left direction
         */
        left: function() { this.pressDirection(this.DIRECTION.LEFT); },

        /**
         * Press right direction
         */
        right: function() { this.pressDirection(this.DIRECTION.RIGHT); },

        /**
         * Press up direction
         */
        up: function() { this.pressDirection(this.DIRECTION.UP); },

        /**
         * Press down direction
         */
        down: function() { this.pressDirection(this.DIRECTION.DOWN); },

        /**
         * Press action button (Space/Enter)
         */
        action: function() { this.pressDirection(this.DIRECTION.ACTION); },

        /**
         * Press cancel button (Backspace)
         */
        cancel: function() { this.pressDirection(this.DIRECTION.CANCEL); },

        /**
         * Release left direction
         */
        releaseLeft: function() { this.releaseDirection(this.DIRECTION.LEFT); },

        /**
         * Release right direction
         */
        releaseRight: function() { this.releaseDirection(this.DIRECTION.RIGHT); },

        /**
         * Release up direction
         */
        releaseUp: function() { this.releaseDirection(this.DIRECTION.UP); },

        /**
         * Release down direction
         */
        releaseDown: function() { this.releaseDirection(this.DIRECTION.DOWN); },

        /**
         * Release action button
         */
        releaseAction: function() { this.releaseDirection(this.DIRECTION.ACTION); },

        /**
         * Release cancel button
         */
        releaseCancel: function() { this.releaseDirection(this.DIRECTION.CANCEL); },

        // ==================== TIMED INPUT ====================

        /**
         * Press and release a direction after specified frames
         * @param {number} direction - Direction index (0-5)
         * @param {number} frames - Number of frames to hold (game runs at 30fps)
         * @returns {Promise} Resolves when input is complete
         */
        tapDirection: function(direction, frames) {
            frames = frames || 1;
            const self = this;
            return new Promise(function(resolve) {
                self.pressDirection(direction);
                setTimeout(function() {
                    self.releaseDirection(direction);
                    resolve();
                }, frames * (1000 / 30)); // 30fps = ~33.33ms per frame
            });
        },

        /**
         * Tap action button
         * @param {number} frames - Number of frames to hold
         * @returns {Promise}
         */
        tapAction: function(frames) {
            return this.tapDirection(this.DIRECTION.ACTION, frames);
        },

        /**
         * Wait for specified number of frames
         * @param {number} frames - Number of frames to wait
         * @returns {Promise}
         */
        wait: function(frames) {
            return new Promise(function(resolve) {
                setTimeout(resolve, frames * (1000 / 30));
            });
        },

        // ==================== INPUT STATE ====================

        /**
         * Get current input state
         * @returns {Object} Current state of all directions
         */
        getInputState: function() {
            if (!this._inputManager) return null;

            return {
                left: this._inputManager.tb[0] || false,
                right: this._inputManager.tb[1] || false,
                up: this._inputManager.tb[2] || false,
                down: this._inputManager.tb[3] || false,
                action: this._inputManager.tb[4] || false,
                cancel: this._inputManager.tb[5] || false,
                vector: this._inputManager.ha ? {
                    x: this._inputManager.ha.x,
                    y: this._inputManager.ha.y
                } : null
            };
        },

        /**
         * Set a complete input state for a frame
         * @param {Object} state - Input state object with direction booleans
         */
        setInputState: function(state) {
            this.releaseAllKeys();

            if (state.left) this.left();
            if (state.right) this.right();
            if (state.up) this.up();
            if (state.down) this.down();
            if (state.action) this.action();
            if (state.cancel) this.cancel();
        },

        // ==================== RECORDING & PLAYBACK ====================

        /**
         * Start recording inputs
         */
        startRecording: function() {
            this._recording = [];
            this._isRecording = true;
            this._frameCount = 0;
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
         * Record current frame's input state (call this each game tick)
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
         * Start playing back a recorded sequence
         * @param {Array} sequence - Array of input states to play
         */
        startPlayback: function(sequence) {
            if (!sequence || sequence.length === 0) {
                console.warn('[TAS] No sequence to play');
                return;
            }

            this._recording = sequence;
            this._playbackIndex = 0;
            this._isPlaying = true;
            console.log('[TAS] Playback started. ' + sequence.length + ' frames to play.');
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
         * Execute one frame of playback (call this each game tick)
         * @returns {boolean} true if playback is still active
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
         * Check if currently recording
         * @returns {boolean}
         */
        isRecording: function() {
            return this._isRecording;
        },

        /**
         * Check if currently playing back
         * @returns {boolean}
         */
        isPlaying: function() {
            return this._isPlaying;
        },

        /**
         * Get the recorded sequence
         * @returns {Array}
         */
        getRecording: function() {
            return this._recording.slice();
        },

        /**
         * Export recording as JSON string
         * @returns {string}
         */
        exportRecording: function() {
            return JSON.stringify(this._recording);
        },

        /**
         * Import recording from JSON string
         * @param {string} json - JSON string of recorded inputs
         */
        importRecording: function(json) {
            try {
                this._recording = JSON.parse(json);
                console.log('[TAS] Imported ' + this._recording.length + ' frames');
            } catch (e) {
                console.error('[TAS] Failed to import recording:', e);
            }
        },

        // ==================== SEQUENCE BUILDER ====================

        /**
         * Create a sequence of inputs programmatically
         * @returns {Object} Sequence builder with chainable methods
         */
        sequence: function() {
            const seq = [];
            let currentFrame = 0;

            const builder = {
                /**
                 * Hold direction for N frames
                 */
                hold: function(direction, frames) {
                    for (let i = 0; i < frames; i++) {
                        const state = {
                            frame: currentFrame++,
                            left: false, right: false, up: false, down: false,
                            action: false, cancel: false
                        };

                        if (direction === TAS.DIRECTION.LEFT) state.left = true;
                        if (direction === TAS.DIRECTION.RIGHT) state.right = true;
                        if (direction === TAS.DIRECTION.UP) state.up = true;
                        if (direction === TAS.DIRECTION.DOWN) state.down = true;
                        if (direction === TAS.DIRECTION.ACTION) state.action = true;
                        if (direction === TAS.DIRECTION.CANCEL) state.cancel = true;

                        seq.push(state);
                    }
                    return builder;
                },

                /**
                 * Wait (no input) for N frames
                 */
                wait: function(frames) {
                    for (let i = 0; i < frames; i++) {
                        seq.push({
                            frame: currentFrame++,
                            left: false, right: false, up: false, down: false,
                            action: false, cancel: false
                        });
                    }
                    return builder;
                },

                /**
                 * Convenience methods
                 */
                left: function(frames) { return builder.hold(TAS.DIRECTION.LEFT, frames || 1); },
                right: function(frames) { return builder.hold(TAS.DIRECTION.RIGHT, frames || 1); },
                up: function(frames) { return builder.hold(TAS.DIRECTION.UP, frames || 1); },
                down: function(frames) { return builder.hold(TAS.DIRECTION.DOWN, frames || 1); },
                action: function(frames) { return builder.hold(TAS.DIRECTION.ACTION, frames || 1); },
                cancel: function(frames) { return builder.hold(TAS.DIRECTION.CANCEL, frames || 1); },

                /**
                 * Build and return the sequence
                 */
                build: function() {
                    return seq;
                },

                /**
                 * Build and immediately start playback
                 */
                play: function() {
                    TAS.startPlayback(seq);
                    return seq;
                }
            };

            return builder;
        },

        // ==================== FRAME ADVANCE / PAUSE ====================

        /**
         * Get the game's current frame count (if available)
         * @returns {number|null}
         */
        getFrameCount: function() {
            return this._frameCount;
        },

        /**
         * Check if the game instance is available
         * @returns {boolean}
         */
        isGameReady: function() {
            return !!(this._inputManager && this._keyboardHandler);
        },

        /**
         * Get debug info about current state
         * @returns {Object}
         */
        getDebugInfo: function() {
            return {
                initialized: this.isGameReady(),
                recording: this._isRecording,
                playing: this._isPlaying,
                frameCount: this._frameCount,
                recordingLength: this._recording.length,
                playbackIndex: this._playbackIndex,
                inputState: this.getInputState()
            };
        },

        // ==================== HELPER FOR GAME STATE ====================

        /**
         * Get the current scene/game mode name
         * @returns {string|null}
         */
        getCurrentScene: function() {
            if (this._gameInstance && this._gameInstance.Jc && this._gameInstance.Jc.fm) {
                return this._gameInstance.Jc.fm.name;
            }
            return null;
        },

        /**
         * Log current state to console
         */
        logState: function() {
            console.log('[TAS] Debug Info:', this.getDebugInfo());
            console.log('[TAS] Current Scene:', this.getCurrentScene());
        }
    };

    // Export to global scope
    global.TAS = TAS;

    // Auto-initialize when DOM is ready, with retry
    const tryInit = function(attempts) {
        if (TAS.init()) {
            console.log('[TAS] Ready! Use TAS.logState() to see current state.');
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
