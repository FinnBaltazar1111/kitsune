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
         *
         * The Ih (keyboard handler) structure:
         * - Ea: direction → key array mappings {0: [37,65], 1: [39,68], 2: [38,87], 3: [40,83], 4: [32,13], 5: [8,49,46]}
         * - tb: key → direction reverse mapping
         * - Ob: key → boolean pressed state
         */
        pressDirection: function(direction) {
            if (!this._keyboardHandler) {
                console.warn('[TAS] Not initialized');
                return;
            }
            const keyMappings = this._keyboardHandler.Ea;
            if (keyMappings && keyMappings[direction] && keyMappings[direction].length > 0) {
                // Press the first key mapped to this direction
                const keyCode = keyMappings[direction][0];
                this.pressKey(keyCode);
            } else {
                // Fallback: use hardcoded key mappings
                const fallbackKeys = {
                    0: 37,  // LEFT arrow
                    1: 39,  // RIGHT arrow
                    2: 38,  // UP arrow
                    3: 40,  // DOWN arrow
                    4: 32,  // SPACE (action)
                    5: 8    // BACKSPACE (cancel)
                };
                if (fallbackKeys[direction] !== undefined) {
                    this.pressKey(fallbackKeys[direction]);
                }
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
            if (keyMappings && keyMappings[direction] && keyMappings[direction].length > 0) {
                // Release all keys mapped to this direction
                for (const keyCode of keyMappings[direction]) {
                    this.releaseKey(keyCode);
                }
            } else {
                // Fallback: use hardcoded key mappings
                const fallbackKeys = {
                    0: [37, 65],   // LEFT arrow, A
                    1: [39, 68],   // RIGHT arrow, D
                    2: [38, 87],   // UP arrow, W
                    3: [40, 83],   // DOWN arrow, S
                    4: [32, 13],   // SPACE, ENTER (action)
                    5: [8, 49, 46] // BACKSPACE, 1, DELETE (cancel)
                };
                if (fallbackKeys[direction]) {
                    for (const keyCode of fallbackKeys[direction]) {
                        this.releaseKey(keyCode);
                    }
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
         * Press action button (Enter key directly)
         */
        action: function() { this.pressKey(13); },

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
         * Release action button (Enter key directly)
         */
        releaseAction: function() { this.releaseKey(13); },

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
         * Get current input state from the input manager (Kh)
         * The input manager's tb object contains boolean states for each direction:
         * - tb[0]: left
         * - tb[1]: right
         * - tb[2]: up
         * - tb[3]: down
         * - tb[4]: action
         * - tb[5]: cancel
         * @returns {Object} Current state of all directions
         */
        getInputState: function() {
            if (!this._inputManager) return null;

            // Kh.tb is an object, not array, so we check with ||
            const tb = this._inputManager.tb || {};

            return {
                left: !!tb[0],
                right: !!tb[1],
                up: !!tb[2],
                down: !!tb[3],
                action: !!tb[4],
                cancel: !!tb[5],
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
         * This hooks into the game's tick loop to capture inputs each frame
         */
        startRecording: function() {
            this._recording = [];
            this._isRecording = true;
            this._frameCount = 0;

            // Hook into the game's tick loop if not already hooked
            if (!this._tickHooked) {
                this._hookGameTick();
            }

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
         * Hook into the game's tick loop for automatic recording/playback
         */
        _hookGameTick: function() {
            if (this._tickHooked) return;

            const self = this;

            // Try to hook into Vv.prototype.tick (game main tick)
            if (typeof Vv !== 'undefined' && Vv.prototype && Vv.prototype.tick) {
                const originalTick = Vv.prototype.tick;
                Vv.prototype.tick = function(b) {
                    // Call original tick first
                    originalTick.call(this, b);

                    // Then do our recording/playback after input has been processed
                    if (self._isRecording) {
                        self.recordFrame();
                    }
                    if (self._isPlaying) {
                        self.playbackFrame();
                    }
                };
                this._tickHooked = true;
                console.log('[TAS] Hooked into game tick (Vv.prototype.tick)');
            } else {
                console.warn('[TAS] Could not hook into game tick. Recording may not work automatically.');
            }
        },

        /**
         * Record current frame's input state (call this each game tick)
         */
        recordFrame: function() {
            if (!this._isRecording) return;

            const state = this.getInputState();
            if (state) {
                // Only record if there's any input (to save space)
                const hasInput = state.left || state.right || state.up || state.down ||
                                 state.action || state.cancel;

                this._recording.push({
                    frame: this._frameCount,
                    left: state.left,
                    right: state.right,
                    up: state.up,
                    down: state.down,
                    action: state.action,
                    cancel: state.cancel,
                    hasInput: hasInput
                });
            }
            this._frameCount++;
        },

        /**
         * Start playing back a recorded sequence
         * @param {Array} [sequence] - Array of input states to play. If not provided, uses the current recording.
         */
        startPlayback: function(sequence) {
            // If no sequence provided, use the current recording
            if (sequence === undefined) {
                sequence = this._recording;
            }

            // Handle string input (JSON)
            if (typeof sequence === 'string') {
                try {
                    sequence = JSON.parse(sequence);
                } catch (e) {
                    console.error('[TAS] Failed to parse sequence JSON:', e);
                    return;
                }
            }

            // Handle array input (already parsed)
            if (Array.isArray(sequence) && sequence.length > 0) {
                this._recording = sequence;
            }

            if (!this._recording || !Array.isArray(this._recording) || this._recording.length === 0) {
                console.warn('[TAS] No sequence to play. Use TAS.importRecording(json) first or pass a sequence.');
                return;
            }

            // Ensure the game tick is hooked for playback
            if (!this._tickHooked) {
                this._hookGameTick();
            }

            this._playbackIndex = 0;
            this._isPlaying = true;
            this._isRecording = false; // Stop recording if it was active
            console.log('[TAS] Playback started. ' + this._recording.length + ' frames to play.');
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
         * Import recording from JSON string or array
         * @param {string|Array} data - JSON string or array of recorded inputs
         */
        importRecording: function(data) {
            try {
                // Handle array input directly
                if (Array.isArray(data)) {
                    this._recording = data;
                    console.log('[TAS] Imported ' + this._recording.length + ' frames (from array)');
                    return true;
                }

                // Handle JSON string
                if (typeof data === 'string') {
                    this._recording = JSON.parse(data);
                    console.log('[TAS] Imported ' + this._recording.length + ' frames (from JSON)');
                    return true;
                }

                console.error('[TAS] Invalid import data type. Expected array or JSON string.');
                return false;
            } catch (e) {
                console.error('[TAS] Failed to import recording:', e);
                return false;
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
            // Also hook into game tick for recording/playback
            TAS._hookGameTick();
            console.log('[TAS] Ready! Use TAS.logState() to see current state.');
            console.log('[TAS] Commands: TAS.action(), TAS.left(), TAS.right(), TAS.up(), TAS.down()');
            console.log('[TAS] Recording: TAS.startRecording(), TAS.stopRecording(), TAS.exportRecording()');
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
