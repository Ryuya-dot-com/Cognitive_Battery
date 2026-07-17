// ==================== Cognitive Battery — Main Controller ====================

/**
 * @typedef {'flanker'|'dccs'|'list-sorting'|'visual_digit_span'|'ecorsi'|'pattern-comparison'|'picture-sequence'} TestId
 *
 * @typedef {object} FlankerTrial
 * @property {number} trialNum
 * @property {'congruent'|'incongruent'} type
 * @property {'left'|'right'} direction
 * @property {'left'|'right'|'timeout'} response
 * @property {0|1} correct
 * @property {number} rt
 * @property {number} tOnset
 * @property {number} tResponse
 *
 * @typedef {object} DCCSTrial
 * @property {number} trialNum
 * @property {'color'|'shape'} dimension
 * @property {number} cardIndex
 * @property {number} correctSide
 * @property {number} response
 * @property {0|1} correct
 * @property {number} rt
 * @property {0|1} isDominant
 * @property {number} tOnset
 * @property {number} tResponse
 *
 * @typedef {object} PatternComparisonTrial
 * @property {number} trialNum
 * @property {0|1} isSame
 * @property {'same'|'different'} response
 * @property {0|1} correct
 * @property {number} rt
 * @property {number} tOnset
 * @property {number} tResponse
 *
 * @typedef {object} OutlierThresholds
 * @property {number} rt_too_fast_ms
 * @property {number} rt_too_slow_ms
 * @property {number} rt_exclude_below_ms
 * @property {number} saa_rt_clip_min_ms
 * @property {number} saa_rt_clip_max_ms
 * @property {number} saa_rt_sd_multiplier
 * @property {number} [inattention_easy_acc_threshold]
 *
 * @typedef {object} QualityState
 * @property {string} created_at
 * @property {number} resumed_at_count
 * @property {number} visibility_hidden_count
 * @property {number} blur_count
 * @property {number} focus_count
 * @property {number} fullscreen_requested_count
 * @property {number} fullscreen_entered_count
 * @property {number} fullscreen_exit_count
 * @property {number} fullscreen_failed_count
 * @property {number} resize_count
 * @property {number} long_task_count
 * @property {number} long_task_ms_total
 * @property {number|null} grayscale_steps_visible
 * @property {Record<string, any>} environment
 * @property {any[]} checks
 * @property {string[]} warnings
 * @property {string[]} blocks
 * @property {Array<{timestamp: string, stage: string, type: string, detail: any}>} events
 * @property {OutlierThresholds} [outlier_thresholds]
 * @property {number} [random_seed]
 * @property {number|null} [counterbalance_group]
 * @property {string} [counterbalance_order]
 * @property {string} [consent_version]
 * @property {number} [session_number]
 * @property {number} [grayscale_confirmed]
 */

const App = {
    STORAGE_KEY: 'cognitive-battery-session-v2',
    SESSION_PAYLOAD_VERSION: 3,
    MIN_VIEWPORT_WIDTH: 1024,
    MIN_VIEWPORT_HEIGHT: 700,
    QUALITY_EVENT_LIMIT: 200,
    get NAVIGATION_WARNING() { return this.t('common.navigationWarning'); },
    APP_VERSION: 'cb-2026-07-research-v8',
    PROTOCOL_VERSION: 'protocol-2026-07-study-config-v4',
    TASK_VERSION: 'tasks-2026-07-v3',
    SCORING_VERSION: 'scoring-2026-07-v2',
    STIMULUS_VERSION: 'stimuli-2026-07-bilingual-v3',
    STIMULUS_RENDERING_MODE: 'system-emoji+html-text-geometric',
    QUALITY_FLAG_THRESHOLDS: {
        lowAccuracyPercent: 60,
        pictureSequenceProportion: 0.25,
        timeoutCount: 3,
        fastResponseCount: 1,
        slowResponseCount: 1,
        focusLossCount: 1,
        fullscreenExitCount: 1,
        longTaskCount: 1,
        practiceAttempts: 2,
    },
    QC_MULTIVERSE_VERSION: 'qc-multiverse-2026-05-v1',
    QC_MULTIVERSE_SPEC: [
        {
            id: 'qc_u00_all_sessions',
            label: 'All sessions descriptive',
            family: 'descriptive',
            analysis_role: 'primary_descriptive',
            description: 'QC による除外候補化を行わず、全セッションを記述統計に含める universe。',
            researcher_degree_of_freedom: 'QC を共変量・記述指標として扱い、除外判断には使わない。',
            rules: {},
        },
        {
            id: 'qc_u01_protocol_deviation_only',
            label: 'Protocol deviation only',
            family: 'minimal',
            analysis_role: 'sensitivity_minimal_qc',
            description: '実施不能環境など明確なプロトコル逸脱のみを除外候補にする universe。',
            researcher_degree_of_freedom: '環境ブロックを除外候補にするかどうか。',
            rules: {
                maxEnvironmentBlocks: 0,
            },
        },
        {
            id: 'qc_u02_behavioral_lenient',
            label: 'Behavioral lenient',
            family: 'behavioral',
            analysis_role: 'sensitivity_lenient_behavioral_qc',
            description: '明確な不注意・反応異常のみを除外候補にする緩い behavioral QC universe。',
            researcher_degree_of_freedom: '低正答率・極端 RT・タイムアウトを緩い閾値で扱う。',
            rules: {
                minAccuracyPercent: 50,
                minPictureSequenceProportion: 0.15,
                maxTimeoutTotal: 5,
                fastRtMs: 150,
                maxFastResponses: 3,
                slowRtMs: 5000,
                maxSlowResponses: 3,
            },
        },
        {
            id: 'qc_u03_behavioral_standard',
            label: 'Behavioral standard',
            family: 'behavioral',
            analysis_role: 'sensitivity_standard_behavioral_qc',
            description: '標準的な behavioral QC universe。低正答率、極端 RT、タイムアウト、練習反復を除外候補化する。',
            researcher_degree_of_freedom: '低正答率・タイムアウト・練習反復を標準閾値で扱う。',
            rules: {
                minAccuracyPercent: 60,
                minPictureSequenceProportion: 0.25,
                maxTimeoutTotal: 2,
                fastRtMs: 150,
                maxFastResponses: 0,
                slowRtMs: 5000,
                maxSlowResponses: 0,
                maxPracticeAttemptsAllowed: 2,
            },
        },
        {
            id: 'qc_u04_full_strict',
            label: 'Full strict',
            family: 'strict',
            analysis_role: 'sensitivity_strict_full_qc',
            description: '行動指標と実施環境の両方に厳しい QC universe。遠隔実施の影響を最大限保守的に扱う。',
            researcher_degree_of_freedom: '行動品質、フォーカス離脱、画面変更、環境警告をすべて厳格に扱う。',
            rules: {
                minAccuracyPercent: 70,
                minPictureSequenceProportion: 0.35,
                maxTimeoutTotal: 0,
                fastRtMs: 200,
                maxFastResponses: 0,
                slowRtMs: 4000,
                maxSlowResponses: 0,
                maxTabHidden: 0,
                maxBlur: 0,
                maxFullscreenExit: 0,
                maxResize: 0,
                maxLongTasks: 0,
                maxEnvironmentWarnings: 0,
                maxEnvironmentBlocks: 0,
                maxPracticeAttemptsAllowed: 1,
            },
        },
    ],

    participantName: '',
    participantId: '',
    participantAge: 0,
    viewingDistanceCm: null,
    selectedTests: [],
    currentTestIndex: 0,
    results: {},
    trialData: {},
    startTime: null,
    sessionStage: 'idle',
    inProgressTestId: null,
    quality: null,
    breakKeyHandler: null,
    primaryAdvanceHandler: null,
    resizeDebounceId: null,
    lastViewport: null,
    randomSeed: null,
    _randomState: null,
    _sessionPerfStart: null,
    consentAccepted: false,
    privacyMode: false,
    sessionNumber: 1,
    counterbalanceGroup: null,
    studyConfig: null,
    studyConfigHash: null,
    resolvedTaskOrder: [],
    sessionProtocolMetadata: null,
    studyConfigError: '',
    studyConfigErrorKey: '',
    startTransitionInProgress: false,
    longTaskObserver: null,
    HISTORY_STORAGE_KEY: 'cognitive-battery-history-v2',
    CONSENT_VERSION: '1.3.0',
    CONSENT_VERSIONS: Object.freeze({ ja: '1.3.0-ja', en: '1.1.0-en' }),
    sessionConsentVersion: null,
    uiLanguage: I18n.getLocale(),
    instructionLanguage: I18n.getLocale(),
    stimulusLanguage: I18n.getLocale(),
    consentLanguage: I18n.getLocale(),
    languageLocked: false,
    participantLanguageLocked: false,
    ALL_TEST_IDS: [
        'flanker',
        'dccs',
        'list-sorting',
        'visual_digit_span',
        'ecorsi',
        'pattern-comparison',
        'picture-sequence',
    ],
    ADAPTIVE_SPAN_TEST_IDS: ['visual_digit_span', 'ecorsi'],
    // Odd-sized Williams designs require the seven rows plus their reversals
    // to balance immediate carryover as well as serial position.
    COUNTERBALANCE_WILLIAMS_DESIGN: [
        ['flanker', 'dccs', 'picture-sequence', 'list-sorting', 'pattern-comparison', 'visual_digit_span', 'ecorsi'],
        ['dccs', 'list-sorting', 'flanker', 'visual_digit_span', 'picture-sequence', 'ecorsi', 'pattern-comparison'],
        ['list-sorting', 'visual_digit_span', 'dccs', 'ecorsi', 'flanker', 'pattern-comparison', 'picture-sequence'],
        ['visual_digit_span', 'ecorsi', 'list-sorting', 'pattern-comparison', 'dccs', 'picture-sequence', 'flanker'],
        ['ecorsi', 'pattern-comparison', 'visual_digit_span', 'picture-sequence', 'list-sorting', 'flanker', 'dccs'],
        ['pattern-comparison', 'picture-sequence', 'ecorsi', 'flanker', 'visual_digit_span', 'dccs', 'list-sorting'],
        ['picture-sequence', 'flanker', 'pattern-comparison', 'dccs', 'ecorsi', 'list-sorting', 'visual_digit_span'],
        ['ecorsi', 'visual_digit_span', 'pattern-comparison', 'list-sorting', 'picture-sequence', 'dccs', 'flanker'],
        ['pattern-comparison', 'ecorsi', 'picture-sequence', 'visual_digit_span', 'flanker', 'list-sorting', 'dccs'],
        ['picture-sequence', 'pattern-comparison', 'flanker', 'ecorsi', 'dccs', 'visual_digit_span', 'list-sorting'],
        ['flanker', 'picture-sequence', 'dccs', 'pattern-comparison', 'list-sorting', 'ecorsi', 'visual_digit_span'],
        ['dccs', 'flanker', 'list-sorting', 'picture-sequence', 'visual_digit_span', 'pattern-comparison', 'ecorsi'],
        ['list-sorting', 'dccs', 'visual_digit_span', 'flanker', 'ecorsi', 'picture-sequence', 'pattern-comparison'],
        ['visual_digit_span', 'list-sorting', 'ecorsi', 'dccs', 'pattern-comparison', 'flanker', 'picture-sequence'],
    ],

    testRegistry: {
        'flanker': { nameKey: 'common.tasks.flanker.name', domainKey: 'common.tasks.flanker.domain', get name() { return I18n.t(this.nameKey); }, get domain() { return I18n.t(this.domainKey); }, module: null },
        'pattern-comparison': { nameKey: 'common.tasks.patternComparison.name', domainKey: 'common.tasks.patternComparison.domain', get name() { return I18n.t(this.nameKey); }, get domain() { return I18n.t(this.domainKey); }, module: null },
        'dccs': { nameKey: 'common.tasks.dccs.name', domainKey: 'common.tasks.dccs.domain', get name() { return I18n.t(this.nameKey); }, get domain() { return I18n.t(this.domainKey); }, module: null },
        'list-sorting': { nameKey: 'common.tasks.listSorting.name', domainKey: 'common.tasks.listSorting.domain', get name() { return I18n.t(this.nameKey); }, get domain() { return I18n.t(this.domainKey); }, module: null },
        'visual_digit_span': { nameKey: 'common.tasks.visualDigitSpan.name', domainKey: 'common.tasks.visualDigitSpan.domain', get name() { return I18n.t(this.nameKey); }, get domain() { return I18n.t(this.domainKey); }, module: null },
        'ecorsi': { nameKey: 'common.tasks.ecorsi.name', domainKey: 'common.tasks.ecorsi.domain', get name() { return I18n.t(this.nameKey); }, get domain() { return I18n.t(this.domainKey); }, module: null },
        'picture-sequence': { nameKey: 'common.tasks.pictureSequence.name', domainKey: 'common.tasks.pictureSequence.domain', get name() { return I18n.t(this.nameKey); }, get domain() { return I18n.t(this.domainKey); }, module: null },
    },

    async init() {
        this.initLanguageControls();
        this.quality = this.createQualityState();
        await StudyConfig.init(this);
        this.bindEvents();
        this.bindQualityListeners();
        this.initLongTaskObserver();
        this.renderEnvironmentChecks();
        this.renderSavedSessionBanner();
    },

    t(key, params = {}) {
        return I18n.t(key, params);
    },

    getConsentVersion(locale = this.consentLanguage || this.uiLanguage || I18n.getLocale()) {
        return this.CONSENT_VERSIONS[locale] || this.CONSENT_VERSIONS.ja;
    },

    getActiveConsentVersion() {
        return this.sessionConsentVersion || this.getConsentVersion();
    },

    initLanguageControls() {
        const initialLocale = I18n.getLocale();
        this.uiLanguage = initialLocale;
        this.instructionLanguage = initialLocale;
        this.stimulusLanguage = initialLocale;
        this.consentLanguage = initialLocale;
        I18n.apply(document);

        document.querySelectorAll('.language-option').forEach((button) => {
            button.addEventListener('click', () => {
                if (this.languageLocked) return;
                this.setLanguage(button.dataset.locale);
            });
        });
        this.updateLanguageControls();
    },

    setLanguage(locale, { force = false, resetConsent = true } = {}) {
        if ((this.languageLocked || this.participantLanguageLocked) && !force) return false;
        const previousLocale = this.uiLanguage;
        const nextLocale = I18n.setLocale(locale);
        this.uiLanguage = nextLocale;
        this.instructionLanguage = nextLocale;
        this.stimulusLanguage = nextLocale;
        this.consentLanguage = nextLocale;

        if (resetConsent && previousLocale !== nextLocale) {
            const consentEl = document.getElementById('consent-agree');
            if (consentEl) consentEl.checked = false;
            this.consentAccepted = false;
            this.sessionConsentVersion = null;
            if (this.studyConfigErrorKey) {
                this.studyConfigError = this.t(this.studyConfigErrorKey);
                this.setStartError(this.studyConfigError);
            } else {
                this.setStartError('');
            }
        }

        this.updateLanguageControls();
        if (this.quality) this.renderEnvironmentChecks();
        this.renderSavedSessionBanner();
        return true;
    },

    updateLanguageControls() {
        document.querySelectorAll('.language-option').forEach((button) => {
            const selected = button.dataset.locale === this.uiLanguage;
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
            button.disabled = this.languageLocked || this.participantLanguageLocked;
        });
    },

    lockLanguage() {
        this.languageLocked = true;
        this.updateLanguageControls();
    },

    unlockLanguage() {
        this.languageLocked = false;
        this.updateLanguageControls();
    },

    initLongTaskObserver() {
        if (typeof PerformanceObserver === 'undefined') return;
        const supported = PerformanceObserver.supportedEntryTypes || [];
        if (!supported.includes('longtask')) return;

        try {
            const observer = new PerformanceObserver((list) => {
                if (!this.isSessionActive() || this.sessionStage !== 'test') return;
                for (const entry of list.getEntries()) {
                    this.quality.long_task_count = (this.quality.long_task_count || 0) + 1;
                    this.quality.long_task_ms_total = (this.quality.long_task_ms_total || 0) + Math.round(entry.duration);
                    this.logQualityEvent('long_task', {
                        duration_ms: Math.round(entry.duration),
                        session_ms: this.sessionElapsedMs(entry.startTime),
                    });
                }
            });
            observer.observe({ type: 'longtask', buffered: false });
            this.longTaskObserver = observer;
        } catch (error) {
            console.warn('longtask observer unavailable', error);
        }
    },

    bindEvents() {
        document.getElementById('btn-start').addEventListener('click', () => this.start());
        document.getElementById('btn-download-excel').addEventListener('click', () => this.downloadExcel());
        const btnDownloadJson = document.getElementById('btn-download-json');
        if (btnDownloadJson) btnDownloadJson.addEventListener('click', () => this.downloadJson());
        document.getElementById('btn-restart').addEventListener('click', () => this.restart());

        const selectAll = document.getElementById('select-all-tests');
        selectAll.addEventListener('change', () => {
            const individual = document.getElementById('individual-tests');
            individual.classList.toggle('hidden', selectAll.checked);
            document.querySelectorAll('.test-checkbox').forEach(cb => {
                cb.checked = selectAll.checked;
            });
            this.persistSession();
        });

        document.querySelectorAll('.test-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                const allChecked = Array.from(document.querySelectorAll('.test-checkbox')).every(box => box.checked);
                selectAll.checked = allChecked;
                document.getElementById('individual-tests').classList.toggle('hidden', allChecked);
                this.persistSession();
            });
        });

        ['participant-name', 'participant-id', 'participant-age', 'participant-viewing-distance'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => this.clearStartError());
        });

        const consentEl = document.getElementById('consent-agree');
        if (consentEl) {
            consentEl.addEventListener('change', () => {
                this.consentAccepted = consentEl.checked;
                this.clearStartError();
            });
        }

        document.querySelectorAll('.readiness-checkbox').forEach(cb => {
            cb.addEventListener('change', () => this.clearStartError());
        });
    },

    bindQualityListeners() {
        document.addEventListener('visibilitychange', () => {
            if (!this.isSessionActive()) return;

            if (document.hidden) {
                this.quality.visibility_hidden_count++;
                this.logQualityEvent('tab_hidden');
            } else {
                this.logQualityEvent('tab_visible');
            }
            this.persistSession();
        });

        window.addEventListener('blur', () => {
            if (!this.isSessionActive()) return;
            this.quality.blur_count++;
            this.logQualityEvent('window_blur');
            this.persistSession();
        });

        window.addEventListener('focus', () => {
            if (!this.isSessionActive()) return;
            this.quality.focus_count++;
            this.logQualityEvent('window_focus');
            this.persistSession();
        });

        document.addEventListener('fullscreenchange', () => {
            if (!this.isSessionActive()) return;

            if (document.fullscreenElement) {
                this.quality.fullscreen_entered_count++;
                this.logQualityEvent('fullscreen_entered');
            } else {
                this.quality.fullscreen_exit_count++;
                this.logQualityEvent('fullscreen_exited');
            }
            this.persistSession();
        });

        window.addEventListener('resize', () => {
            clearTimeout(this.resizeDebounceId);
            this.resizeDebounceId = setTimeout(() => {
                const viewport = `${window.innerWidth}x${window.innerHeight}`;
                if (viewport !== this.lastViewport) {
                    this.lastViewport = viewport;
                    if (this.isSessionActive()) {
                        this.quality.resize_count++;
                        this.logQualityEvent('viewport_resize', {
                            width: window.innerWidth,
                            height: window.innerHeight,
                        });
                        this.persistSession();
                    }
                    this.renderEnvironmentChecks();
                }
            }, 250);
        });

        window.addEventListener('beforeunload', (event) => {
            if (!this.startTime) return;
            this.persistSession();
            if (!this.isSessionActive()) return;
            event.preventDefault();
            event.returnValue = this.NAVIGATION_WARNING;
            return this.NAVIGATION_WARNING;
        });
    },

    createQualityState() {
        return {
            created_at: new Date().toISOString(),
            resumed_at_count: 0,
            visibility_hidden_count: 0,
            blur_count: 0,
            focus_count: 0,
            fullscreen_requested_count: 0,
            fullscreen_entered_count: 0,
            fullscreen_exit_count: 0,
            fullscreen_failed_count: 0,
            resize_count: 0,
            long_task_count: 0,
            long_task_ms_total: 0,
            grayscale_steps_visible: null,
            environment: {},
            checks: [],
            warnings: [],
            blocks: [],
            events: [],
            ui_language: this.uiLanguage,
            instruction_language: this.instructionLanguage,
            stimulus_language: this.stimulusLanguage,
            consent_language: this.consentLanguage,
            translation_version: I18n.TRANSLATION_VERSION,
        };
    },

    storageAvailable(type) {
        try {
            const storage = window[type];
            if (!storage) return false;
            const key = '__cb_storage_probe__';
            storage.setItem(key, '1');
            storage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    },

    collectEnvironmentSnapshot() {
        const timezone = typeof Intl !== 'undefined' && Intl.DateTimeFormat
            ? (Intl.DateTimeFormat().resolvedOptions().timeZone || '')
            : '';
        return {
            browser: this.detectBrowser(),
            userAgent: navigator.userAgent,
            platform: navigator.platform || '',
            language: navigator.language || '',
            maxTouchPoints: navigator.maxTouchPoints || 0,
            hardwareConcurrency: navigator.hardwareConcurrency || null,
            deviceMemoryGb: navigator.deviceMemory || null,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            colorDepth: window.screen.colorDepth || null,
            pixelDepth: window.screen.pixelDepth || null,
            devicePixelRatio: window.devicePixelRatio || 1,
            timezone,
            timezoneOffsetMinutes: new Date().getTimezoneOffset(),
            cookiesEnabled: navigator.cookieEnabled ? 1 : 0,
            localStorageAvailable: this.storageAvailable('localStorage') ? 1 : 0,
            sessionStorageAvailable: this.storageAvailable('sessionStorage') ? 1 : 0,
            pageVisibilityState: document.visibilityState || '',
        };
    },

    detectBrowser() {
        const ua = navigator.userAgent;
        if (/Edg\//.test(ua)) return 'Edge';
        if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return 'Chrome';
        if (/Firefox\//.test(ua)) return 'Firefox';
        if (/Safari\//.test(ua) && !/Chrome\//.test(ua) && !/Edg\//.test(ua)) return 'Safari';
        return 'Other';
    },

    getEnvironmentChecks() {
        const env = this.collectEnvironmentSnapshot();
        const ua = navigator.userAgent;
        const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
        const hasTouch = env.maxTouchPoints > 0;
        const browser = env.browser;
        const browserStatus = ['Chrome', 'Edge'].includes(browser) ? 'pass' : (['Firefox', 'Safari'].includes(browser) ? 'warn' : 'fail');

        return [
            {
                key: 'device',
                status: isMobileUA ? 'fail' : 'pass',
                label: this.t(isMobileUA ? 'common.environment.mobile' : 'common.environment.pc'),
                detail: this.t('common.environment.mobileDetail'),
            },
            {
                key: 'viewport',
                status: (env.viewportWidth >= this.MIN_VIEWPORT_WIDTH && env.viewportHeight >= this.MIN_VIEWPORT_HEIGHT) ? 'pass' : 'fail',
                label: this.t('common.environment.viewport', { width: env.viewportWidth, height: env.viewportHeight }),
                detail: this.t('common.environment.viewportDetail', { width: this.MIN_VIEWPORT_WIDTH, height: this.MIN_VIEWPORT_HEIGHT }),
            },
            {
                key: 'browser',
                status: 'pass',
                label: this.t('common.environment.browser', { browser }),
                detail: this.t('common.environment.browserDetail'),
            },
            {
                key: 'touch',
                status: hasTouch ? 'warn' : 'pass',
                label: this.t(hasTouch ? 'common.environment.touch' : 'common.environment.keyboard'),
                detail: this.t('common.environment.touchDetail'),
            },
            {
                key: 'fullscreen',
                status: document.fullscreenEnabled ? 'pass' : 'warn',
                label: this.t(document.fullscreenEnabled ? 'common.environment.fullscreenYes' : 'common.environment.fullscreenNo'),
                detail: this.t('common.environment.fullscreenDetail'),
            },
            {
                key: 'storage',
                status: env.localStorageAvailable ? 'pass' : 'warn',
                label: this.t(env.localStorageAvailable ? 'common.environment.storageYes' : 'common.environment.storageNo'),
                detail: this.t('common.environment.storageDetail'),
            },
        ];
    },

    renderEnvironmentChecks() {
        const container = document.getElementById('environment-check-list');
        if (!container) return;

        const checks = this.getEnvironmentChecks();
        container.innerHTML = checks.map(check => `
            <li class="environment-check environment-check-${check.status}">
                <span class="environment-status">${this.t(check.status === 'pass' ? 'common.environment.statusPass' : (check.status === 'warn' ? 'common.environment.statusWarn' : 'common.environment.statusFail'))}</span>
                <div class="environment-copy">
                    <strong>${check.label}</strong>
                    <span>${check.detail}</span>
                </div>
            </li>
        `).join('');

        if (this.quality) {
            const previousRefreshRate = this.quality.environment?.refreshRateHzEstimate;
            const environment = this.collectEnvironmentSnapshot();
            if (previousRefreshRate != null) {
                environment.refreshRateHzEstimate = previousRefreshRate;
            }
            this.quality.environment = environment;
            this.quality.checks = checks;
            this.quality.warnings = checks.filter(check => check.status === 'warn').map(check => check.label);
            this.quality.blocks = checks.filter(check => check.status === 'fail').map(check => check.label);
        }
    },

    estimateRefreshRate(sampleFrames = 18) {
        return new Promise(resolve => {
            if (typeof requestAnimationFrame !== 'function') {
                resolve(null);
                return;
            }

            const intervals = [];
            let lastTs = null;
            let settled = false;

            const finish = (value) => {
                if (settled) return;
                settled = true;
                resolve(value);
            };

            const step = (ts) => {
                if (lastTs != null && Number.isFinite(ts - lastTs) && ts > lastTs) {
                    intervals.push(ts - lastTs);
                }
                lastTs = ts;

                if (intervals.length >= sampleFrames) {
                    const med = this.median(intervals);
                    finish(med ? Math.round(1000 / med) : null);
                    return;
                }
                requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
            setTimeout(() => finish(null), 900);
        });
    },

    async captureDisplayTiming() {
        if (!this.quality || this.quality.environment.refreshRateHzEstimate != null) return;
        const refreshRateHzEstimate = await this.estimateRefreshRate();
        if (this.quality && refreshRateHzEstimate != null) {
            this.quality.environment.refreshRateHzEstimate = refreshRateHzEstimate;
        }
    },

    renderSavedSessionBanner() {
        const container = document.getElementById('saved-session');
        if (!container) return;

        if (this.isSessionActive()) {
            container.classList.add('hidden');
            container.innerHTML = '';
            return;
        }

        const saved = this.getSavedSessionPayload();
        if (!saved || !saved.startTime) {
            container.classList.add('hidden');
            container.innerHTML = '';
            return;
        }

        const currentTestName = saved.selectedTests && saved.currentTestIndex < saved.selectedTests.length
            ? (this.testRegistry[saved.selectedTests[saved.currentTestIndex]]
                ? this.testRegistry[saved.selectedTests[saved.currentTestIndex]].name
                : saved.selectedTests[saved.currentTestIndex])
            : this.t('common.saved.complete');
        const startedAt = new Date(saved.startTime).toLocaleString(this.uiLanguage === 'ja' ? 'ja-JP' : 'en-US');

        container.innerHTML = `
            <div class="saved-session-copy">
                <strong>${this.t('common.saved.found')}</strong>
                <span>${saved.participantName || this.t('common.saved.unnamed')} / ${saved.participantId || this.t('common.saved.noId')} / ${startedAt}</span>
                <span>${this.t('common.saved.resumePoint', { task: currentTestName })}</span>
            </div>
            <div class="saved-session-actions">
                <button type="button" class="btn btn-secondary" id="btn-resume-session">${this.t('common.saved.resume')}</button>
                <button type="button" class="btn btn-primary" id="btn-discard-session">${this.t('common.saved.discard')}</button>
            </div>
        `;
        container.classList.remove('hidden');

        document.getElementById('btn-resume-session').addEventListener('click', () => this.restoreSavedSession());
        document.getElementById('btn-discard-session').addEventListener('click', () => this.discardSavedSession());
    },

    getSavedSessionPayload() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Failed to parse saved session.', error);
            return null;
        }
    },

    discardSavedSession() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.renderSavedSessionBanner();
        this.clearStartError();
    },

    async restoreSavedSession() {
        if (this.startTransitionInProgress || this.startTime) return false;
        this.startTransitionInProgress = true;
        const resumeButton = document.getElementById('btn-resume-session');
        if (resumeButton) resumeButton.disabled = true;
        try {
            await this.restoreSavedSessionInternal();
            return Boolean(this.startTime);
        } finally {
            if (!this.startTime) {
                this.startTransitionInProgress = false;
                if (resumeButton) resumeButton.disabled = false;
            }
        }
    },

    async restoreSavedSessionInternal() {
        const saved = this.getSavedSessionPayload();
        if (!saved) return;

        const isVersionedSession = saved.sessionPayloadVersion === this.SESSION_PAYLOAD_VERSION;
        if ((Number.isFinite(saved.sessionPayloadVersion) && saved.sessionPayloadVersion > this.SESSION_PAYLOAD_VERSION)
            || (saved.studyConfig && !isVersionedSession)
            || (isVersionedSession
                && (saved.appVersion !== this.APP_VERSION
                    || saved.protocolVersion !== this.PROTOCOL_VERSION))) {
            this.setStartError(this.t('common.researcherConfig.validation.sessionVersion'));
            return;
        }

        let restoredConfig;
        try {
            restoredConfig = await StudyConfig.restoreSessionConfig(saved);
            const savedProtocolHash = saved.sessionProtocolMetadata?.study_config_hash;
            if ((isVersionedSession && !savedProtocolHash)
                || (savedProtocolHash && savedProtocolHash !== restoredConfig.config_hash)) {
                throw new Error('integrity');
            }

            const savedLanguages = [
                saved.ui_language || saved.quality?.ui_language,
                saved.instruction_language || saved.quality?.instruction_language,
                saved.stimulus_language || saved.quality?.stimulus_language,
                saved.consent_language || saved.quality?.consent_language,
            ];
            if (isVersionedSession
                && (savedLanguages.some(language => !['ja', 'en'].includes(language))
                    || savedLanguages.some(language => language !== savedLanguages[0]))) {
                throw new Error('integrity');
            }
            if (restoredConfig.language_policy === 'fixed'
                && savedLanguages.some(language => language && language !== restoredConfig.participant_language)) {
                throw new Error('integrity');
            }
        } catch (configError) {
            console.error('Saved study configuration failed verification.', configError);
            this.setStartError(this.t('common.researcherConfig.validation.integrity'));
            return;
        }

        // A stored in-progress session owns its instruction/consent language.
        // Query-string preferences apply only to a new session and must not
        // silently change the wording under which consent was obtained.
        const savedUiLanguage = saved.ui_language || saved.quality?.ui_language || 'ja';
        this.setLanguage(savedUiLanguage, { force: true, resetConsent: false });
        this.instructionLanguage = saved.instruction_language || saved.quality?.instruction_language || this.uiLanguage;
        this.stimulusLanguage = saved.stimulus_language || saved.quality?.stimulus_language || this.uiLanguage;
        this.consentLanguage = saved.consent_language || saved.quality?.consent_language || this.uiLanguage;
        this.lockLanguage();

        this.participantName = saved.participantName || '';
        this.participantId = saved.participantId || '';
        this.participantAge = saved.participantAge || 0;
        this.viewingDistanceCm = saved.viewingDistanceCm != null ? saved.viewingDistanceCm : null;
        this.consentAccepted = Boolean(saved.consentAccepted);
        this.sessionConsentVersion = saved.consent_version || saved.quality?.consent_version || this.getConsentVersion(this.consentLanguage);
        this.selectedTests = this.resolvedTaskOrder.length > 0
            ? this.resolvedTaskOrder.slice()
            : (saved.selectedTests || []);
        this.currentTestIndex = saved.currentTestIndex || 0;
        this.results = saved.results || {};
        this.trialData = saved.trialData || {};
        this.startTime = saved.startTime ? new Date(saved.startTime) : new Date();
        this.sessionStage = saved.sessionStage || 'test';
        this.inProgressTestId = saved.inProgressTestId || this.selectedTests[this.currentTestIndex] || null;
        this.quality = saved.quality || this.createQualityState();
        Object.assign(this.quality, {
            consent_version: this.getActiveConsentVersion(),
            ui_language: this.uiLanguage,
            instruction_language: this.instructionLanguage,
            stimulus_language: this.stimulusLanguage,
            consent_language: this.consentLanguage,
            translation_version: saved.translation_version || saved.quality?.translation_version || I18n.TRANSLATION_VERSION,
            ...StudyConfig.getMetadata(),
        });
        this.quality.resumed_at_count = (this.quality.resumed_at_count || 0) + 1;

        const savedSeed = Number.isFinite(saved.randomSeed) ? saved.randomSeed : null;
        if (savedSeed != null) {
            this.randomSeed = savedSeed >>> 0;
            const savedState = Number.isFinite(saved.randomState) ? saved.randomState : savedSeed;
            this._randomState = savedState >>> 0;
        } else {
            this.seedRandom(this.generateSeed());
            this.quality.random_seed = this.randomSeed;
        }
        const elapsedAtSave = Number.isFinite(saved.sessionElapsedMsAtSave) ? saved.sessionElapsedMsAtSave : 0;
        this._sessionPerfStart = performance.now() - elapsedAtSave;
        this.sessionNumber = Number.isFinite(saved.sessionNumber) ? saved.sessionNumber : 1;
        this.counterbalanceGroup = Number.isFinite(saved.counterbalanceGroup) ? saved.counterbalanceGroup : null;
        this.sessionProtocolMetadata = saved.sessionProtocolMetadata
            || (saved.sessionPayloadVersion >= 3 ? saved.quality?.protocol : null)
            || this.buildProtocolMetadata();

        this.applyParticipantFormValues();
        this.syncTestSelectionUi();
        this.logQualityEvent('session_resumed', {
            stage: this.sessionStage,
            testId: this.inProgressTestId,
        });
        this.persistSession();
        this.renderSavedSessionBanner();

        if (this.currentTestIndex >= this.selectedTests.length || this.sessionStage === 'results') {
            this.showResults();
            return;
        }

        if (this.sessionStage === 'break') {
            this.showScreen('screen-test');
            this.showBreak();
            return;
        }

        this.showResumePrompt();
    },

    applyParticipantFormValues() {
        document.getElementById('participant-name').value = this.participantName || '';
        document.getElementById('participant-id').value = this.participantId || '';
        document.getElementById('participant-age').value = this.participantAge || '';
    },

    syncTestSelectionUi() {
        const allTests = this.ALL_TEST_IDS;
        const allChecked = allTests.every(testId => this.selectedTests.includes(testId));
        document.getElementById('select-all-tests').checked = allChecked;
        document.getElementById('individual-tests').classList.toggle('hidden', allChecked);
        document.querySelectorAll('.test-checkbox').forEach(cb => {
            cb.checked = this.selectedTests.includes(cb.value);
        });
    },

    showResumePrompt() {
        const content = this.getTestContent();
        const currentTest = this.selectedTests[this.currentTestIndex];
        const testInfo = this.testRegistry[currentTest];
        this.showScreen('screen-test');
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('common.saved.restoredHeading')}</h2>
                <p>${this.t('common.saved.restored')}</p>
                <p>${this.t('common.saved.currentTask', { task: testInfo ? testInfo.name : currentTest })}</p>
                <p>${this.t('common.saved.restartTask')}</p>
                <button class="btn btn-primary" id="btn-resume-current-test">${this.t('common.saved.restartButton')}</button>
            </div>
        `;
        document.getElementById('btn-resume-current-test').addEventListener('click', async () => {
            await this.preloadStimuli();
            await this.requestFullscreenIfPossible();
            this.runCurrentTest();
        });
    },

    async requestFullscreenIfPossible() {
        if (!document.fullscreenEnabled || document.fullscreenElement) return;

        this.quality.fullscreen_requested_count++;
        try {
            await document.documentElement.requestFullscreen();
        } catch (error) {
            this.quality.fullscreen_failed_count++;
            this.logQualityEvent('fullscreen_request_failed', {
                message: error.message,
            });
        } finally {
            this.persistSession();
        }
    },

    setStartError(message) {
        const errorEl = document.getElementById('start-error');
        if (!errorEl) return;

        if (!message) {
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
            return;
        }

        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    },

    clearStartError() {
        if (this.studyConfigErrorKey) {
            this.studyConfigError = this.t(this.studyConfigErrorKey);
            this.setStartError(this.studyConfigError);
            return;
        }
        this.setStartError('');
    },

    validateStartForm() {
        const participantId = document.getElementById('participant-id').value.trim();
        const age = parseInt(document.getElementById('participant-age').value, 10);
        const viewingRaw = document.getElementById('participant-viewing-distance').value.trim();
        const viewing = viewingRaw === '' ? null : parseInt(viewingRaw, 10);
        const selectedTests = this.getSelectedTestsFromUi();
        const blockingChecks = this.getEnvironmentChecks().filter(check => check.status === 'fail');
        const readinessComplete = Array.from(document.querySelectorAll('.readiness-checkbox')).every(cb => cb.checked);
        const consentEl = document.getElementById('consent-agree');
        const consent = consentEl ? consentEl.checked : false;

        if (this.studyConfigErrorKey) return this.t(this.studyConfigErrorKey);
        if (this.studyConfigError) return this.studyConfigError;
        if (!consent) return this.t('common.validation.consent');
        if (!participantId) return this.t('common.validation.id');
        if (!age || age < 18 || age > 85) return this.t('common.validation.age');
        if (viewing != null && (isNaN(viewing) || viewing < 30 || viewing > 150)) return this.t('common.validation.distance');
        if (selectedTests.length === 0) return this.t('common.validation.tests');
        if (blockingChecks.length > 0) return this.t('common.validation.environment', { details: blockingChecks.map(check => check.label).join(' / ') });
        if (!readinessComplete) return this.t('common.validation.readiness');
        return '';
    },

    getSelectedTestsFromUi() {
        const selectAll = document.getElementById('select-all-tests');
        if (selectAll.checked) {
            return this.ALL_TEST_IDS.slice();
        }
        return Array.from(document.querySelectorAll('.test-checkbox:checked')).map(cb => cb.value);
    },

    async start() {
        if (this.startTransitionInProgress || this.startTime) return false;
        this.startTransitionInProgress = true;
        const startButton = document.getElementById('btn-start');
        if (startButton) startButton.disabled = true;
        try {
            await this.startInternal();
            return Boolean(this.startTime);
        } finally {
            if (!this.startTime) {
                this.startTransitionInProgress = false;
                if (startButton) startButton.disabled = false;
            }
        }
    },

    async startInternal() {
        this.renderEnvironmentChecks();
        const error = this.validateStartForm();
        if (error) {
            this.setStartError(error);
            return;
        }

        this.uiLanguage = I18n.getLocale();
        this.instructionLanguage = this.uiLanguage;
        this.stimulusLanguage = this.uiLanguage;
        this.consentLanguage = this.uiLanguage;
        this.sessionConsentVersion = this.getConsentVersion(this.consentLanguage);

        this.participantName = document.getElementById('participant-name').value.trim();
        this.participantId = document.getElementById('participant-id').value.trim();
        this.participantAge = parseInt(document.getElementById('participant-age').value, 10);
        const viewingInput = document.getElementById('participant-viewing-distance');
        const viewingRaw = viewingInput ? parseInt(viewingInput.value, 10) : NaN;
        this.viewingDistanceCm = Number.isFinite(viewingRaw) ? viewingRaw : null;
        const consentEl = document.getElementById('consent-agree');
        this.consentAccepted = consentEl ? consentEl.checked : false;
        const privacyEl = document.getElementById('privacy-no-persist');
        this.privacyMode = privacyEl ? privacyEl.checked : false;
        if (this.privacyMode) {
            try {
                localStorage.removeItem(this.STORAGE_KEY);
                localStorage.removeItem(this.HISTORY_STORAGE_KEY);
            } catch (e) { /* ignore */ }
        }

        try {
            this.studyConfig = await StudyConfig.createSessionConfig();
        } catch (configError) {
            const message = configError?.message === 'hash_unavailable'
                ? this.t('common.researcherConfig.validation.hashUnavailable')
                : this.t('common.researcherConfig.validation.invalid');
            this.setStartError(message);
            return;
        }
        this.studyConfigHash = this.studyConfig.config_hash;
        const resolvedPlan = StudyConfig.resolveTaskOrder(this.studyConfig, this.participantId);
        this.counterbalanceGroup = resolvedPlan.group;
        this.selectedTests = resolvedPlan.order.slice();
        this.resolvedTaskOrder = this.selectedTests.slice();
        this.lockLanguage();

        this.currentTestIndex = 0;
        this.results = {};
        this.trialData = {};
        this.startTime = new Date();
        this._sessionPerfStart = performance.now();
        this.seedRandom(this.generateSeed());
        this.sessionStage = 'test';
        this.inProgressTestId = this.selectedTests[0];
        this.quality = this.createQualityState();
        this.renderEnvironmentChecks();
        this.quality.started_at = this.startTime.toISOString();
        this.quality.random_seed = this.randomSeed;
        this.quality.grayscale_confirmed = document.getElementById('readiness-grayscale')?.checked ? 1 : 0;
        this.quality.outlier_thresholds = {
            rt_too_fast_ms: 150,
            rt_too_slow_ms: 5000,
            rt_exclude_below_ms: 100,
            saa_rt_clip_min_ms: 500,
            saa_rt_clip_max_ms: 3000,
            saa_rt_sd_multiplier: 3,
            inattention_easy_acc_threshold: 0.85,
        };
        this.sessionNumber = this.bumpSessionNumber(this.participantId);
        this.quality.session_number = this.sessionNumber;
        this.quality.counterbalance_group = this.counterbalanceGroup;
        this.quality.counterbalance_order = this.selectedTests.join(',');
        this.quality.consent_version = this.getActiveConsentVersion();
        this.quality.ui_language = this.uiLanguage;
        this.quality.instruction_language = this.instructionLanguage;
        this.quality.stimulus_language = this.stimulusLanguage;
        this.quality.consent_language = this.consentLanguage;
        this.quality.translation_version = I18n.TRANSLATION_VERSION;
        this.quality.privacy_mode = this.privacyMode ? 1 : 0;
        Object.assign(this.quality, StudyConfig.getMetadata());
        this.sessionProtocolMetadata = this.buildProtocolMetadata();
        this.quality.protocol = this.sessionProtocolMetadata;
        await this.captureDisplayTiming();
        this.logQualityEvent('session_started', {
            selectedTests: this.selectedTests.join(','),
            randomSeed: this.randomSeed,
            uiLanguage: this.uiLanguage,
            translationVersion: I18n.TRANSLATION_VERSION,
            studyConfigId: this.studyConfig.config_id,
            studyConfigHash: this.studyConfigHash,
        });
        this.persistSession();

        const content = this.getTestContent();
        this.showScreen('screen-test');
        this.updateTestStatus(this.t('common.status.preparing'));
        content.innerHTML = `
            <div class="instructions" role="status" aria-live="polite">
                <h2>${this.t('common.loading.heading')}</h2>
                <p>${this.t('common.loading.body')}</p>
            </div>
        `;

        await this.preloadStimuli();
        await this.requestFullscreenIfPossible();
        this.runCurrentTest();
    },

    runCurrentTest() {
        if (this.currentTestIndex >= this.selectedTests.length) {
            this.showResults();
            return;
        }

        const testId = this.selectedTests[this.currentTestIndex];
        const testInfo = this.testRegistry[testId];
        this.inProgressTestId = testId;
        this.sessionStage = 'test';
        this.logQualityEvent('test_started', {
            testId,
        });
        this.persistSession();
        this.updateTestStatus(this.t('common.status.taskPreparing'));

        if (testInfo.module && typeof testInfo.module.run === 'function') {
            testInfo.module.run();
            return;
        }

        const content = this.getTestContent();
        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('common.error.heading')}</h2>
                <p>${this.t('common.error.task', { task: testInfo ? testInfo.name : testId })}</p>
                <p>${this.t('common.error.recovery')}</p>
                <button class="btn btn-primary" id="btn-return-start">${this.t('common.error.return')}</button>
            </div>
        `;
        document.getElementById('btn-return-start').addEventListener('click', () => this.restart());
    },

    onTestComplete(testId, result, trials) {
        this.results[testId] = result;
        this.trialData[testId] = trials;
        this.currentTestIndex++;
        this.inProgressTestId = this.selectedTests[this.currentTestIndex] || null;
        this.logQualityEvent('test_completed', {
            testId,
            score: result.score,
        });

        if (this.currentTestIndex < this.selectedTests.length) {
            this.sessionStage = 'break';
            this.persistSession();
            this.showBreak();
            return;
        }

        this.sessionStage = 'results';
        this.persistSession();
        this.showResults();
    },

    showBreak() {
        const content = this.getTestContent();
        const completed = this.currentTestIndex;
        const total = this.selectedTests.length;
        const nextTestId = this.selectedTests[this.currentTestIndex];
        const nextTestInfo = this.testRegistry[nextTestId];

        this.clearPrimaryAdvanceBinding();
        this.updateTestStatus(this.t('common.status.break'));

        content.innerHTML = `
            <div class="instructions">
                <h2>${this.t('common.breakScreen.heading')}</h2>
                <p>${this.t('common.breakScreen.complete', { completed, total })}</p>
                <p>${this.t('common.breakScreen.next', { task: nextTestInfo.name, domain: nextTestInfo.domain })}</p>
                <p>${this.t('common.breakScreen.instruction')}</p>
                <button class="btn btn-primary" id="btn-break-next">${this.t('common.breakScreen.nextButton')}</button>
            </div>
        `;

        this.bindPrimaryAdvance('btn-break-next', () => this.advanceFromBreak());
        this.persistSession();
    },

    advanceFromBreak() {
        this.clearPrimaryAdvanceBinding();
        this.runCurrentTest();
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },

    updateTestStatus(phaseLabel = '') {
        const bar = document.getElementById('test-status-bar');
        if (!bar) return;

        const total = this.selectedTests.length;
        const activeIndex = Math.min(this.currentTestIndex, Math.max(total - 1, 0));
        const testId = this.selectedTests[activeIndex];
        const testInfo = testId ? this.testRegistry[testId] : null;
        const isVisible = total > 0 && this.sessionStage !== 'idle' && this.sessionStage !== 'results';

        bar.hidden = !isVisible;
        if (!isVisible) return;

        const completedCount = Math.min(this.currentTestIndex, total);
        const displayIndex = Math.min(this.currentTestIndex + 1, total);
        const progress = total ? Math.round((completedCount / total) * 100) : 0;

        const countEl = document.getElementById('test-status-count');
        const taskEl = document.getElementById('test-status-task');
        const phaseEl = document.getElementById('test-status-phase');
        const fillEl = document.getElementById('test-status-progress-fill');

        if (countEl) countEl.textContent = this.t('common.status.taskCount', { current: displayIndex, total });
        if (taskEl) taskEl.textContent = testInfo ? this.t('common.status.taskAndDomain', { task: testInfo.name, domain: testInfo.domain }) : '';
        if (phaseEl) phaseEl.textContent = phaseLabel;
        if (fillEl) fillEl.style.width = `${progress}%`;
    },

    showResults() {
        this.showScreen('screen-results');
        this.updateTestStatus('');
        const container = document.getElementById('results-summary');
        const quality = this.getQualitySummary();
        const qualityFlags = this.buildQualityFlags();
        const qualityClass = qualityFlags.any_quality_flag ? 'quality-note quality-note-warn' : 'quality-note';
        const qualityMessage = qualityFlags.any_quality_flag
            ? this.t('common.resultScreen.review', { notes: qualityFlags.review_notes || this.t('common.resultScreen.reviewFallback') })
            : this.t('common.resultScreen.clear');

        const participantLabel = this.participantName
            ? `${this.participantName} (${this.participantId})`
            : this.participantId;
        const seedLabel = this.randomSeed != null ? this.t('common.resultScreen.seed', { seed: this.randomSeed }) : '';
        const date = this.startTime.toLocaleString(this.uiLanguage === 'ja' ? 'ja-JP' : 'en-US');
        let html = `<p style="color:#888; margin-bottom:1em;">${this.t('common.resultScreen.participant', { participant: participantLabel, age: this.participantAge, date, seed: seedLabel })}</p>`;
        html += `<table class="results-table"><thead><tr><th>${this.t('common.resultScreen.test')}</th><th>${this.t('common.resultScreen.domain')}</th><th>${this.t('common.resultScreen.score')}</th><th>${this.t('common.resultScreen.detail')}</th></tr></thead><tbody>`;

        for (const testId of this.selectedTests) {
            const info = this.testRegistry[testId];
            const result = this.results[testId] || {};
            html += `<tr>
                <td>${info.name}</td>
                <td>${info.domain}</td>
                <td class="score">${result.score != null && isFinite(result.score) ? result.score : '—'}</td>
                <td>${result.detail || ''}</td>
            </tr>`;
        }

        html += '</tbody></table>';
        html += `
            <div class="quality-summary">
                <h2 class="panel-title">${this.t('common.resultScreen.qualityHeading')}</h2>
                <div class="quality-summary-grid">
                    <div><strong>${this.t('common.resultScreen.tab')}</strong><span>${this.t('common.resultScreen.countTimes', { count: quality.visibility_hidden_count })}</span></div>
                    <div><strong>${this.t('common.resultScreen.focus')}</strong><span>${this.t('common.resultScreen.countTimes', { count: quality.blur_count })}</span></div>
                    <div><strong>${this.t('common.resultScreen.fullscreen')}</strong><span>${this.t('common.resultScreen.countTimes', { count: quality.fullscreen_exit_count })}</span></div>
                    <div><strong>${this.t('common.resultScreen.resize')}</strong><span>${this.t('common.resultScreen.countTimes', { count: quality.resize_count })}</span></div>
                    <div><strong>${this.t('common.resultScreen.fast')}</strong><span>${this.t('common.resultScreen.countItems', { count: quality.fast_response_count })}</span></div>
                    <div><strong>${this.t('common.resultScreen.timeout')}</strong><span>${this.t('common.resultScreen.countItems', { count: quality.timeout_total })}</span></div>
                </div>
                <p class="${qualityClass}">${qualityMessage}</p>
                <p class="download-note">${this.t('common.resultScreen.qcNote')}</p>
                <p class="download-note">${this.t('common.resultScreen.downloadNote')}</p>
            </div>
        `;

        container.innerHTML = html;
        this.persistSession();
    },

    getQualitySummary() {
        const quality = this.quality || this.createQualityState();
        const thresholds = quality.outlier_thresholds || {};
        const fastThreshold = thresholds.rt_too_fast_ms != null ? thresholds.rt_too_fast_ms : 150;
        const slowThreshold = thresholds.rt_too_slow_ms != null ? thresholds.rt_too_slow_ms : 5000;
        const rtValues = this.getResponseTimeValues();
        const timeoutTotal = Object.values(this.results).reduce((sum, result) => sum + (result.timeoutCount || 0), 0);
        const fastResponseCount = rtValues.filter(rt => rt > 0 && rt < fastThreshold).length;
        const slowResponseCount = rtValues.filter(rt => rt > slowThreshold).length;
        return {
            visibility_hidden_count: quality.visibility_hidden_count || 0,
            blur_count: quality.blur_count || 0,
            focus_count: quality.focus_count || 0,
            fullscreen_exit_count: quality.fullscreen_exit_count || 0,
            fullscreen_failed_count: quality.fullscreen_failed_count || 0,
            resize_count: quality.resize_count || 0,
            long_task_count: quality.long_task_count || 0,
            long_task_ms_total: quality.long_task_ms_total || 0,
            timeout_total: timeoutTotal,
            fast_response_count: fastResponseCount,
            slow_response_count: slowResponseCount,
            warning_count: quality.warnings ? quality.warnings.length : 0,
            block_count: quality.blocks ? quality.blocks.length : 0,
            event_count: quality.events ? quality.events.length : 0,
        };
    },

    getResponseTimeValues() {
        return Object.entries(this.trialData).flatMap(([testId, trials]) => {
            // Untimed free recall in adaptive span tasks is not a speeded RT
            // outcome and must not trigger generic fast/slow-response QC.
            if (this.ADAPTIVE_SPAN_TEST_IDS.includes(testId)) return [];
            return (trials || []).flatMap(trial => {
                const values = [];
                if (Number.isFinite(trial.rt)) values.push(trial.rt);
                if (Number.isFinite(trial.responseTime)) values.push(trial.responseTime);
                return values;
            });
        });
    },

    buildProtocolMetadata() {
        const studyMetadata = StudyConfig.getMetadata();
        const randomizationMethod = studyMetadata.task_order_policy === 'fixed'
            ? 'Researcher-configured fixed task order; within-task randomization uses mulberry32 with independently derived task seeds.'
            : 'mulberry32 seedable PRNG with independently derived task seeds; Williams-design sessions use FNV-1a participant ID hash to choose one of 14 task orders.';
        return {
            app_version: this.APP_VERSION,
            protocol_version: this.PROTOCOL_VERSION,
            task_version: this.TASK_VERSION,
            scoring_version: this.SCORING_VERSION,
            stimulus_version: this.STIMULUS_VERSION,
            stimulus_rendering_mode: this.STIMULUS_RENDERING_MODE,
            qc_multiverse_version: this.QC_MULTIVERSE_VERSION,
            consent_version: this.getActiveConsentVersion(),
            ui_language: this.uiLanguage,
            instruction_language: this.instructionLanguage,
            stimulus_language: this.stimulusLanguage,
            consent_language: this.consentLanguage,
            translation_version: I18n.TRANSLATION_VERSION,
            ...studyMetadata,
            build_date: '2026-07-17',
            participant_population: 'Japanese- or English-speaking adults; language-dependent task forms require language-specific validation.',
            intended_population: 'Japanese- or English-speaking adults; language-dependent task forms require language-specific validation.',
            intended_use: 'Remote within-sample research comparison; not a clinical or normative diagnostic instrument.',
            delivery_mode: 'Static browser app with local Excel workbook export for participant submission; optional JSON export is available for researcher diagnostics.',
            timing_method: 'requestAnimationFrame-aligned stimulus onset/offset plus KeyboardEvent.timeStamp/performance.now response timing; span tasks retain per-item measured onsets and offsets.',
            randomization_method: randomizationMethod,
            adaptive_span_rule: 'Two scored trials per length (2-9); advance after at least one exact response and discontinue after two errors at the same length. Forward and backward scores remain separate.',
            visual_digit_span_timing: 'Black digits 1-9 on white; 500 ms visible with 1000 ms stimulus-onset asynchrony.',
            visual_digit_span_references: 'Ebaid & Crewther (2018), Frontiers in Aging Neuroscience 10:352; Kemtes & Allen (2008), Journal of Clinical and Experimental Neuropsychology 30(6):661-665.',
            ecorsi_timing: 'Nine-block browser layout; 500 ms highlight with 1000 ms inter-onset interval.',
            ecorsi_references: 'Brunetti et al. (2014), Frontiers in Psychology 5:939; Kessels et al. (2000), Applied Neuropsychology 7(4):252-258.',
            stimulus_copyright_note: 'Digit and eCorsi forms are independently authored and versioned; proprietary WAIS items/norms and published standardized Corsi sequence lists are not reproduced.',
            qc_principle: 'Quality Control is exported as a multiverse/sensitivity-analysis factor, not as an automatic exclusion decision.',
        };
    },

    buildExportManifestRows({ protocolMetadata, qcMultiverseSummary, workbookSheets, exportedAt }) {
        const manifest = {
            export_manifest_version: 'export-manifest-2026-07-v4',
            export_format: 'xlsx',
            submission_instruction: 'Participant submits this single Excel workbook to the researcher.',
            exported_at: exportedAt,
            participant_id: this.participantId,
            session_number: this.sessionNumber,
            started_at: this.startTime ? this.startTime.toISOString() : null,
            selected_tests: this.selectedTests.join(','),
            random_seed: this.randomSeed,
            counterbalance_group: this.counterbalanceGroup,
            workbook_sheets: workbookSheets.join(','),
            ...protocolMetadata,
            qc_universe_count: qcMultiverseSummary.qc_universe_count,
            qc_exclude_candidate_count: qcMultiverseSummary.qc_exclude_candidate_count,
            qc_exclude_candidate_universes: qcMultiverseSummary.qc_exclude_candidate_universes,
        };

        return Object.entries(manifest).map(([field, value]) => ({ field, value }));
    },

    computeTaskMetricsForReview(testId) {
        const trials = this.trialData[testId] || [];
        switch (testId) {
            case 'flanker': return this.computeFlankerMetrics(trials);
            case 'dccs': return this.computeDCCSMetrics(trials);
            case 'pattern-comparison': return this.computePatternComparisonMetrics(trials);
            case 'picture-sequence': return this.computePictureSequenceMetrics(trials);
            case 'list-sorting': return this.computeListSortingMetrics(trials);
            case 'visual_digit_span': return this.computeAdaptiveSpanMetrics(trials, false);
            case 'ecorsi': return this.computeAdaptiveSpanMetrics(trials, true);
            default: return {};
        }
    },

    getAccuracySignals() {
        const signals = [];
        for (const testId of this.selectedTests) {
            const result = this.results[testId] || {};
            const metrics = this.computeTaskMetricsForReview(testId);
            const label = this.testRegistry[testId] ? this.testRegistry[testId].name : testId;

            // Error trials are intentionally generated by the staircase stopping
            // rule, so their percentage is not comparable to fixed-trial accuracy.
            if (this.ADAPTIVE_SPAN_TEST_IDS.includes(testId)) continue;

            if (Number.isFinite(result.accuracy)) {
                signals.push({
                    testId,
                    label,
                    metric: 'result_accuracy',
                    valuePercent: result.accuracy <= 1 ? result.accuracy * 100 : result.accuracy,
                });
            }

            if (Number.isFinite(metrics.overall_accuracy)) {
                signals.push({
                    testId,
                    label,
                    metric: 'overall_accuracy',
                    valuePercent: metrics.overall_accuracy,
                });
            }

            if (testId === 'list-sorting') {
                for (const key of ['single_accuracy', 'dual_accuracy']) {
                    if (Number.isFinite(metrics[key])) {
                        signals.push({
                            testId,
                            label,
                            metric: key,
                            valuePercent: metrics[key],
                        });
                    }
                }
            }

            if (testId === 'picture-sequence' && Number.isFinite(metrics.proportion_correct)) {
                signals.push({
                    testId,
                    label,
                    metric: 'picture_sequence_proportion',
                    valuePercent: metrics.proportion_correct * 100,
                    valueProportion: metrics.proportion_correct,
                });
            }
        }
        return signals;
    },

    collectQcAccuracyReasons(minAccuracyPercent, minPictureSequenceProportion) {
        const reasons = [];
        for (const signal of this.getAccuracySignals()) {
            if (signal.metric === 'picture_sequence_proportion') {
                if (Number.isFinite(minPictureSequenceProportion)
                    && signal.valueProportion < minPictureSequenceProportion) {
                    reasons.push(`${signal.label} ${signal.metric} ${signal.valueProportion}`);
                }
                continue;
            }

            if (Number.isFinite(minAccuracyPercent) && signal.valuePercent < minAccuracyPercent) {
                reasons.push(`${signal.label} ${signal.metric} ${signal.valuePercent.toFixed(1)}%`);
            }
        }
        return [...new Set(reasons)];
    },

    collectPracticeAttemptReasons(maxPracticeAttemptsAllowed) {
        if (!Number.isFinite(maxPracticeAttemptsAllowed)) return [];
        const reasons = [];
        for (const testId of this.selectedTests) {
            const result = this.results[testId] || {};
            const label = this.testRegistry[testId] ? this.testRegistry[testId].name : testId;
            if (Number.isFinite(result.practiceAttempts) && result.practiceAttempts > maxPracticeAttemptsAllowed) {
                reasons.push(`${label} practiceAttempts ${result.practiceAttempts}`);
            }
        }
        return reasons;
    },

    evaluateQcUniverse(universe) {
        const rules = universe.rules || {};
        const summary = this.getQualitySummary();
        const env = this.quality?.environment || {};
        const rtValues = this.getResponseTimeValues();
        const fastRtCount = Number.isFinite(rules.fastRtMs)
            ? rtValues.filter(rt => rt > 0 && rt < rules.fastRtMs).length
            : null;
        const slowRtCount = Number.isFinite(rules.slowRtMs)
            ? rtValues.filter(rt => rt > rules.slowRtMs).length
            : null;
        const reasons = [];

        const addMaxReason = (actual, maxAllowed, label) => {
            if (Number.isFinite(maxAllowed) && Number.isFinite(actual) && actual > maxAllowed) {
                reasons.push(`${label} ${actual} > ${maxAllowed}`);
            }
        };

        addMaxReason(summary.block_count, rules.maxEnvironmentBlocks, 'environment_blocks');
        addMaxReason(summary.warning_count, rules.maxEnvironmentWarnings, 'environment_warnings');
        addMaxReason(summary.visibility_hidden_count, rules.maxTabHidden, 'tab_hidden_count');
        addMaxReason(summary.blur_count, rules.maxBlur, 'blur_count');
        addMaxReason(summary.fullscreen_exit_count, rules.maxFullscreenExit, 'fullscreen_exit_count');
        addMaxReason(summary.resize_count, rules.maxResize, 'resize_count');
        addMaxReason(summary.long_task_count, rules.maxLongTasks, 'long_task_count');
        addMaxReason(summary.timeout_total, rules.maxTimeoutTotal, 'timeout_total');
        addMaxReason(fastRtCount, rules.maxFastResponses, 'fast_rt_count');
        addMaxReason(slowRtCount, rules.maxSlowResponses, 'slow_rt_count');

        if (rules.requireLocalStorage && env.localStorageAvailable === 0) {
            reasons.push('localStorageAvailable 0');
        }

        reasons.push(...this.collectQcAccuracyReasons(
            rules.minAccuracyPercent,
            rules.minPictureSequenceProportion
        ));
        reasons.push(...this.collectPracticeAttemptReasons(rules.maxPracticeAttemptsAllowed));

        const accuracySignals = this.getAccuracySignals();
        const lowestAccuracyPercent = accuracySignals.length > 0
            ? Math.min(...accuracySignals.map(signal => signal.valuePercent))
            : null;
        const includeCandidate = reasons.length === 0 ? 1 : 0;

        return {
            participant_id: this.participantId,
            session_number: this.sessionNumber,
            qc_multiverse_version: this.QC_MULTIVERSE_VERSION,
            universe_id: universe.id,
            universe_label: universe.label,
            family: universe.family,
            analysis_role: universe.analysis_role,
            description: universe.description,
            researcher_degree_of_freedom: universe.researcher_degree_of_freedom,
            include_candidate: includeCandidate,
            exclude_candidate: includeCandidate ? 0 : 1,
            reason_count: reasons.length,
            reasons: reasons.join(' ; '),
            min_accuracy_percent_rule: rules.minAccuracyPercent ?? null,
            min_picture_sequence_proportion_rule: rules.minPictureSequenceProportion ?? null,
            max_timeout_total_rule: rules.maxTimeoutTotal ?? null,
            fast_rt_ms_rule: rules.fastRtMs ?? null,
            max_fast_responses_rule: rules.maxFastResponses ?? null,
            slow_rt_ms_rule: rules.slowRtMs ?? null,
            max_slow_responses_rule: rules.maxSlowResponses ?? null,
            max_tab_hidden_rule: rules.maxTabHidden ?? null,
            max_blur_rule: rules.maxBlur ?? null,
            max_fullscreen_exit_rule: rules.maxFullscreenExit ?? null,
            max_resize_rule: rules.maxResize ?? null,
            max_long_tasks_rule: rules.maxLongTasks ?? null,
            max_environment_warnings_rule: rules.maxEnvironmentWarnings ?? null,
            max_environment_blocks_rule: rules.maxEnvironmentBlocks ?? null,
            max_practice_attempts_allowed_rule: rules.maxPracticeAttemptsAllowed ?? null,
            observed_lowest_accuracy_percent: lowestAccuracyPercent != null ? parseFloat(lowestAccuracyPercent.toFixed(1)) : null,
            observed_timeout_total: summary.timeout_total,
            observed_fast_rt_count: fastRtCount,
            observed_slow_rt_count: slowRtCount,
            observed_tab_hidden_count: summary.visibility_hidden_count,
            observed_blur_count: summary.blur_count,
            observed_fullscreen_exit_count: summary.fullscreen_exit_count,
            observed_resize_count: summary.resize_count,
            observed_long_task_count: summary.long_task_count,
            observed_environment_warning_count: summary.warning_count,
            observed_environment_block_count: summary.block_count,
        };
    },

    buildQcMultiverseRows() {
        return this.QC_MULTIVERSE_SPEC.map(universe => this.evaluateQcUniverse(universe));
    },

    summarizeQcMultiverseRows(rows) {
        const excludeIds = rows.filter(row => row.exclude_candidate).map(row => row.universe_id);
        const includeIds = rows.filter(row => row.include_candidate).map(row => row.universe_id);
        return {
            qc_multiverse_version: this.QC_MULTIVERSE_VERSION,
            qc_universe_count: rows.length,
            qc_include_candidate_universes: includeIds.join(','),
            qc_exclude_candidate_universes: excludeIds.join(','),
            qc_exclude_candidate_count: excludeIds.length,
        };
    },

    buildQualityFlags() {
        const thresholds = this.QUALITY_FLAG_THRESHOLDS;
        const summary = this.getQualitySummary();
        const quality = this.quality || this.createQualityState();
        const env = quality.environment || {};
        const flags = {};
        const notes = [];

        const addFlag = (key, condition, note) => {
            flags[key] = condition ? 1 : 0;
            if (condition && note) notes.push(note);
        };

        addFlag('tab_hidden_flag', summary.visibility_hidden_count > 0, this.t('common.qualityFlags.tab', { count: summary.visibility_hidden_count }));
        addFlag('focus_loss_flag', summary.blur_count >= thresholds.focusLossCount, this.t('common.qualityFlags.focus', { count: summary.blur_count }));
        addFlag('fullscreen_exit_flag', summary.fullscreen_exit_count >= thresholds.fullscreenExitCount, this.t('common.qualityFlags.fullscreen', { count: summary.fullscreen_exit_count }));
        addFlag('resize_flag', summary.resize_count > 0, this.t('common.qualityFlags.resize', { count: summary.resize_count }));
        addFlag('many_timeouts_flag', summary.timeout_total >= thresholds.timeoutCount, this.t('common.qualityFlags.timeout', { count: summary.timeout_total }));
        addFlag('fast_response_flag', summary.fast_response_count >= thresholds.fastResponseCount, this.t('common.qualityFlags.fast', { count: summary.fast_response_count }));
        addFlag('slow_response_flag', summary.slow_response_count >= thresholds.slowResponseCount, this.t('common.qualityFlags.slow', { count: summary.slow_response_count }));
        addFlag('long_task_flag', summary.long_task_count >= thresholds.longTaskCount, this.t('common.qualityFlags.longTask', { count: summary.long_task_count }));
        addFlag(
            'small_viewport_flag',
            Number.isFinite(env.viewportWidth) && Number.isFinite(env.viewportHeight)
                && (env.viewportWidth < this.MIN_VIEWPORT_WIDTH || env.viewportHeight < this.MIN_VIEWPORT_HEIGHT),
            this.t('common.qualityFlags.viewport', { width: env.viewportWidth || '?', height: env.viewportHeight || '?' })
        );
        addFlag('environment_block_flag', summary.block_count > 0, this.t('common.qualityFlags.block', { count: summary.block_count }));
        addFlag('environment_warning_flag', summary.warning_count > 0, this.t('common.qualityFlags.warning', { count: summary.warning_count }));
        addFlag('storage_unavailable_flag', env.localStorageAvailable === 0, this.t('common.qualityFlags.storage'));

        const lowAccuracyItems = [];
        const practiceRepeatItems = [];
        for (const testId of this.selectedTests) {
            const result = this.results[testId] || {};
            const metrics = this.computeTaskMetricsForReview(testId);
            const label = this.testRegistry[testId] ? this.testRegistry[testId].name : testId;

            if (this.ADAPTIVE_SPAN_TEST_IDS.includes(testId)) {
                continue;
            }

            if (Number.isFinite(result.accuracy)) {
                const accuracyPercent = result.accuracy <= 1 ? result.accuracy * 100 : result.accuracy;
                if (accuracyPercent < thresholds.lowAccuracyPercent) {
                    lowAccuracyItems.push(`${label} ${accuracyPercent.toFixed(1)}%`);
                }
            }

            if (Number.isFinite(metrics.overall_accuracy) && metrics.overall_accuracy < thresholds.lowAccuracyPercent) {
                lowAccuracyItems.push(`${label} ${metrics.overall_accuracy.toFixed(1)}%`);
            }

            if (testId === 'list-sorting') {
                for (const key of ['single_accuracy', 'dual_accuracy']) {
                    if (Number.isFinite(metrics[key]) && metrics[key] < thresholds.lowAccuracyPercent) {
                        lowAccuracyItems.push(`${label} ${key} ${metrics[key].toFixed(1)}%`);
                    }
                }
            }

            if (testId === 'picture-sequence'
                && Number.isFinite(metrics.proportion_correct)
                && metrics.proportion_correct < thresholds.pictureSequenceProportion) {
                lowAccuracyItems.push(`${label} adjacent-pair proportion ${metrics.proportion_correct}`);
            }

            if ((result.practiceAttempts || 0) >= thresholds.practiceAttempts) {
                practiceRepeatItems.push(this.t('common.qualityFlags.practiceItem', { task: label, count: result.practiceAttempts }));
            }
        }

        addFlag('low_accuracy_flag', lowAccuracyItems.length > 0, this.t('common.qualityFlags.lowAccuracy', { items: [...new Set(lowAccuracyItems)].join(', ') }));
        addFlag('practice_repeat_flag', practiceRepeatItems.length > 0, this.t('common.qualityFlags.practice', { items: practiceRepeatItems.join(', ') }));

        const flagKeys = Object.keys(flags).filter(key => key.endsWith('_flag'));
        const anyQualityFlag = flagKeys.some(key => flags[key] === 1) ? 1 : 0;
        return {
            any_quality_flag: anyQualityFlag,
            ...flags,
            review_recommendation: anyQualityFlag ? 'review' : 'ok',
            review_notes: notes.join(' ; '),
        };
    },

    buildResearcherReviewRows() {
        const protocol = this.sessionProtocolMetadata || this.buildProtocolMetadata();
        const qualitySummary = this.getQualitySummary();
        const qualityFlags = this.buildQualityFlags();
        const qcMultiverseRows = this.buildQcMultiverseRows();
        const qcMultiverseSummary = this.summarizeQcMultiverseRows(qcMultiverseRows);
        const row = {
            participant_id: this.participantId,
            session_number: this.sessionNumber,
            start_time: this.startTime ? this.startTime.toISOString() : null,
            selected_tests: this.selectedTests.join(','),
            random_seed: this.randomSeed,
            counterbalance_group: this.counterbalanceGroup,
            counterbalance_order: this.selectedTests.join(','),
            ...protocol,
            ...qualityFlags,
            ...qcMultiverseSummary,
            ...qualitySummary,
            environment_warnings: this.quality?.warnings ? this.quality.warnings.join(' / ') : '',
            environment_blocks: this.quality?.blocks ? this.quality.blocks.join(' / ') : '',
        };

        for (const testId of this.selectedTests) {
            const prefix = testId.replace(/-/g, '_');
            const result = this.results[testId] || {};
            row[`${prefix}_score`] = result.score != null && isFinite(result.score) ? result.score : null;
            row[`${prefix}_accuracy`] = result.accuracy != null ? result.accuracy : null;
            row[`${prefix}_practice_attempts`] = result.practiceAttempts != null ? result.practiceAttempts : null;
            row[`${prefix}_test_duration_ms`] = result.testDurationMs != null ? result.testDurationMs : null;
            row[`${prefix}_timeout_count`] = result.timeoutCount != null ? result.timeoutCount : null;
            row[`${prefix}_stimulus_set_id`] = result.setId || null;
            row[`${prefix}_stimulus_theme`] = result.theme || null;
            row[`${prefix}_stimulus_form`] = result.stimulus_form || null;
            row[`${prefix}_task_seed`] = result.task_seed != null ? result.task_seed : null;
            row[`${prefix}_condition_order`] = result.condition_order || null;
            row[`${prefix}_forward_span`] = result.forward_span != null ? result.forward_span : null;
            row[`${prefix}_backward_span`] = result.backward_span != null ? result.backward_span : null;
        }

        return [row];
    },

    // ==================== Research Metrics ====================

    _mean(arr) {
        if (arr.length === 0) return null;
        return arr.reduce((sum, value) => sum + value, 0) / arr.length;
    },

    _sd(arr) {
        if (arr.length < 2) return null;
        const mean = this._mean(arr);
        const variance = arr.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (arr.length - 1);
        return Math.sqrt(variance);
    },

    _zScore(p) {
        p = Math.max(0.001, Math.min(0.999, p));
        if (p < 0.5) return -this._zScore(1 - p);
        const t = Math.sqrt(-2 * Math.log(1 - p));
        const c0 = 2.515517;
        const c1 = 0.802853;
        const c2 = 0.010328;
        const d1 = 1.432788;
        const d2 = 0.189269;
        const d3 = 0.001308;
        return t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
    },

    _ies(meanRT, accuracy) {
        if (meanRT == null || accuracy == null || accuracy <= 0) return null;
        return meanRT / accuracy;
    },

    computeFlankerMetrics(trials) {
        if (!trials || trials.length === 0) return {};

        const congruent = trials.filter(t => t.type === 'congruent');
        const incongruent = trials.filter(t => t.type === 'incongruent');
        const congCorrect = congruent.filter(t => t.correct);
        const incongCorrect = incongruent.filter(t => t.correct);
        const congRTs = congCorrect.filter(t => t.rt >= 100).map(t => t.rt);
        const incongRTs = incongCorrect.filter(t => t.rt >= 100).map(t => t.rt);

        const congAccuracy = congruent.length > 0 ? congCorrect.length / congruent.length : null;
        const incongAccuracy = incongruent.length > 0 ? incongCorrect.length / incongruent.length : null;
        const overallAccuracy = trials.length > 0 ? trials.filter(t => t.correct).length / trials.length : null;
        const congMeanRT = this._mean(congRTs);
        const incongMeanRT = this._mean(incongRTs);
        const overallMeanRT = this._mean(trials.filter(t => t.correct && t.rt >= 100).map(t => t.rt));
        const congMedianRT = congRTs.length > 0 ? this.median(congRTs) : null;
        const incongMedianRT = incongRTs.length > 0 ? this.median(incongRTs) : null;
        const congruencyEffect = (incongMeanRT != null && congMeanRT != null) ? incongMeanRT - congMeanRT : null;
        const iesOverall = this._ies(overallMeanRT, overallAccuracy);
        const iesCongruent = this._ies(congMeanRT, congAccuracy);
        const iesIncongruent = this._ies(incongMeanRT, incongAccuracy);
        const threshold = this.quality?.outlier_thresholds?.inattention_easy_acc_threshold ?? 0.85;
        const inattentionFlag = (congAccuracy != null && congAccuracy < threshold) ? 1 : 0;

        return {
            congruent_n: congruent.length,
            incongruent_n: incongruent.length,
            congruent_accuracy: congAccuracy != null ? parseFloat((congAccuracy * 100).toFixed(1)) : null,
            incongruent_accuracy: incongAccuracy != null ? parseFloat((incongAccuracy * 100).toFixed(1)) : null,
            overall_accuracy: overallAccuracy != null ? parseFloat((overallAccuracy * 100).toFixed(1)) : null,
            congruent_mean_rt: congMeanRT != null ? Math.round(congMeanRT) : null,
            incongruent_mean_rt: incongMeanRT != null ? Math.round(incongMeanRT) : null,
            overall_mean_rt: overallMeanRT != null ? Math.round(overallMeanRT) : null,
            congruent_median_rt: congMedianRT != null ? Math.round(congMedianRT) : null,
            incongruent_median_rt: incongMedianRT != null ? Math.round(incongMedianRT) : null,
            congruent_sd_rt: this._sd(congRTs) != null ? Math.round(this._sd(congRTs)) : null,
            incongruent_sd_rt: this._sd(incongRTs) != null ? Math.round(this._sd(incongRTs)) : null,
            congruency_effect_ms: congruencyEffect != null ? Math.round(congruencyEffect) : null,
            ies_overall_ms: iesOverall != null ? Math.round(iesOverall) : null,
            ies_congruent_ms: iesCongruent != null ? Math.round(iesCongruent) : null,
            ies_incongruent_ms: iesIncongruent != null ? Math.round(iesIncongruent) : null,
            inattention_flag: inattentionFlag,
        };
    },

    computeDCCSMetrics(trials) {
        if (!trials || trials.length === 0) return {};

        const dominant = trials.filter(t => t.isDominant);
        const nonDominant = trials.filter(t => !t.isDominant);
        const domCorrect = dominant.filter(t => t.correct);
        const nonDomCorrect = nonDominant.filter(t => t.correct);
        const domRTs = domCorrect.filter(t => t.rt >= 100).map(t => t.rt);
        const nonDomRTs = nonDomCorrect.filter(t => t.rt >= 100).map(t => t.rt);

        const domAccuracy = dominant.length > 0 ? domCorrect.length / dominant.length : null;
        const nonDomAccuracy = nonDominant.length > 0 ? nonDomCorrect.length / nonDominant.length : null;
        const overallAccuracy = trials.length > 0 ? trials.filter(t => t.correct).length / trials.length : null;
        const domMeanRT = this._mean(domRTs);
        const nonDomMeanRT = this._mean(nonDomRTs);
        const overallMeanRT = this._mean(trials.filter(t => t.correct && t.rt >= 100).map(t => t.rt));
        const switchCost = (nonDomMeanRT != null && domMeanRT != null) ? nonDomMeanRT - domMeanRT : null;
        const iesOverall = this._ies(overallMeanRT, overallAccuracy);
        const iesDominant = this._ies(domMeanRT, domAccuracy);
        const iesNonDominant = this._ies(nonDomMeanRT, nonDomAccuracy);
        const threshold = this.quality?.outlier_thresholds?.inattention_easy_acc_threshold ?? 0.85;
        const inattentionFlag = (domAccuracy != null && domAccuracy < threshold) ? 1 : 0;

        return {
            dominant_n: dominant.length,
            non_dominant_n: nonDominant.length,
            dominant_accuracy: domAccuracy != null ? parseFloat((domAccuracy * 100).toFixed(1)) : null,
            non_dominant_accuracy: nonDomAccuracy != null ? parseFloat((nonDomAccuracy * 100).toFixed(1)) : null,
            overall_accuracy: overallAccuracy != null ? parseFloat((overallAccuracy * 100).toFixed(1)) : null,
            dominant_mean_rt: domMeanRT != null ? Math.round(domMeanRT) : null,
            non_dominant_mean_rt: nonDomMeanRT != null ? Math.round(nonDomMeanRT) : null,
            overall_mean_rt: overallMeanRT != null ? Math.round(overallMeanRT) : null,
            dominant_median_rt: domRTs.length > 0 ? Math.round(this.median(domRTs)) : null,
            non_dominant_median_rt: nonDomRTs.length > 0 ? Math.round(this.median(nonDomRTs)) : null,
            dominant_sd_rt: this._sd(domRTs) != null ? Math.round(this._sd(domRTs)) : null,
            non_dominant_sd_rt: this._sd(nonDomRTs) != null ? Math.round(this._sd(nonDomRTs)) : null,
            switch_cost_ms: switchCost != null ? Math.round(switchCost) : null,
            ies_overall_ms: iesOverall != null ? Math.round(iesOverall) : null,
            ies_dominant_ms: iesDominant != null ? Math.round(iesDominant) : null,
            ies_non_dominant_ms: iesNonDominant != null ? Math.round(iesNonDominant) : null,
            inattention_flag: inattentionFlag,
        };
    },

    computePatternComparisonMetrics(trials) {
        if (!trials || trials.length === 0) return {};

        const sameTrials = trials.filter(t => t.isSame === 1);
        const diffTrials = trials.filter(t => t.isSame === 0);
        const hits = sameTrials.filter(t => t.response === 'same').length;
        const misses = sameTrials.filter(t => t.response === 'different').length;
        const falseAlarms = diffTrials.filter(t => t.response === 'same').length;
        const correctRejections = diffTrials.filter(t => t.response === 'different').length;

        const hitRate = sameTrials.length > 0 ? hits / sameTrials.length : 0;
        const falseAlarmRate = diffTrials.length > 0 ? falseAlarms / diffTrials.length : 0;
        const zHit = this._zScore(hitRate);
        const zFA = this._zScore(falseAlarmRate);
        const dPrime = zHit - zFA;
        const criterion = -0.5 * (zHit + zFA);
        const allRTs = trials.filter(t => t.rt >= 100).map(t => t.rt);
        const correctRTs = trials.filter(t => t.correct && t.rt >= 100).map(t => t.rt);
        const totalCorrect = trials.filter(t => t.correct).length;
        const overallAccuracy = totalCorrect / trials.length;

        const iesCorrect = this._ies(this._mean(correctRTs), overallAccuracy);

        return {
            total_attempted: trials.length,
            total_correct: totalCorrect,
            overall_accuracy: parseFloat((overallAccuracy * 100).toFixed(1)),
            same_trials_n: sameTrials.length,
            different_trials_n: diffTrials.length,
            hits,
            misses,
            false_alarms: falseAlarms,
            correct_rejections: correctRejections,
            hit_rate: parseFloat(hitRate.toFixed(3)),
            false_alarm_rate: parseFloat(falseAlarmRate.toFixed(3)),
            d_prime: parseFloat(dPrime.toFixed(3)),
            criterion_c: parseFloat(criterion.toFixed(3)),
            mean_rt: this._mean(allRTs) != null ? Math.round(this._mean(allRTs)) : null,
            median_rt: allRTs.length > 0 ? Math.round(this.median(allRTs)) : null,
            sd_rt: this._sd(allRTs) != null ? Math.round(this._sd(allRTs)) : null,
            correct_mean_rt: this._mean(correctRTs) != null ? Math.round(this._mean(correctRTs)) : null,
            ies_correct_ms: iesCorrect != null ? Math.round(iesCorrect) : null,
        };
    },

    computePictureSequenceMetrics(trials) {
        if (!trials || trials.length === 0) return {};

        const totalPairs = trials.reduce((sum, trial) => sum + trial.adjacentPairs, 0);
        const maxPairs = trials.reduce((sum, trial) => sum + trial.maxPairs, 0);
        const pairsPerTrial = trials.map(trial => trial.adjacentPairs);
        const responseTimes = trials.map(trial => trial.responseTime);

        return {
            sequence_length: trials[0].sequenceLength,
            total_learning_trials: trials.length,
            total_adjacent_pairs: totalPairs,
            max_possible_pairs: maxPairs,
            proportion_correct: parseFloat((totalPairs / maxPairs).toFixed(3)),
            pairs_trial_1: pairsPerTrial.length > 0 ? pairsPerTrial[0] : null,
            pairs_trial_2: pairsPerTrial.length > 1 ? pairsPerTrial[1] : null,
            pairs_trial_3: pairsPerTrial.length > 2 ? pairsPerTrial[2] : null,
            learning_slope: pairsPerTrial.length >= 2
                ? parseFloat(((pairsPerTrial[pairsPerTrial.length - 1] - pairsPerTrial[0]) / (pairsPerTrial.length - 1)).toFixed(2))
                : null,
            mean_response_time: this._mean(responseTimes) != null ? Math.round(this._mean(responseTimes)) : null,
        };
    },

    computeListSortingMetrics(trials) {
        if (!trials || trials.length === 0) return {};

        const singleTrials = trials.filter(t => t.phase === 'single');
        const dualTrials = trials.filter(t => t.phase === 'dual');
        const singleCorrectTrials = singleTrials.filter(t => t.correct);
        const dualCorrectTrials = dualTrials.filter(t => t.correct);
        const singleMaxLength = singleCorrectTrials.length > 0 ? Math.max(...singleCorrectTrials.map(t => t.length)) : 0;
        const dualMaxLength = dualCorrectTrials.length > 0 ? Math.max(...dualCorrectTrials.map(t => t.length)) : 0;

        return {
            single_trials_n: singleTrials.length,
            dual_trials_n: dualTrials.length,
            single_correct: singleCorrectTrials.length,
            dual_correct: dualCorrectTrials.length,
            single_accuracy: singleTrials.length > 0 ? parseFloat((singleCorrectTrials.length / singleTrials.length * 100).toFixed(1)) : null,
            dual_accuracy: dualTrials.length > 0 ? parseFloat((dualCorrectTrials.length / dualTrials.length * 100).toFixed(1)) : null,
            single_max_span: singleMaxLength,
            dual_max_span: dualMaxLength,
        };
    },

    _parseNumberArray(value) {
        if (Array.isArray(value)) {
            return value.map(Number).filter(Number.isFinite);
        }
        if (typeof value !== 'string' || value.trim() === '') return [];
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed.map(Number).filter(Number.isFinite);
        } catch (error) {
            // Excel-friendly delimited values are handled below.
        }
        return value.split(/[;,|]/).map(part => Number(part.trim())).filter(Number.isFinite);
    },

    computeAdaptiveSpanMetrics(trials, includeTapLatency = false) {
        if (!trials || trials.length === 0) return {};

        const isPractice = trial => trial.practice === true
            || trial.practice === 1
            || trial.isPractice === true
            || trial.is_practice === 1
            || String(trial.phase || '').toLowerCase() === 'practice'
            || String(trial.trialType || trial.trial_type || '').toLowerCase() === 'practice';
        const scoredTrials = trials.filter(trial => !isPractice(trial));
        const conditionOf = trial => String(trial.condition || trial.direction || '').toLowerCase();
        const lengthOf = trial => {
            const value = trial.setSize ?? trial.set_size ?? trial.length ?? trial.sequenceLength ?? trial.sequence_length;
            return Number.isFinite(Number(value)) ? Number(value) : null;
        };
        const correctOf = trial => Number(trial.exactCorrect ?? trial.exact_correct ?? trial.correct ?? 0) === 1;
        const valueOf = (trial, keys) => {
            for (const key of keys) {
                const value = Number(trial[key]);
                if (Number.isFinite(value)) return value;
            }
            return null;
        };
        const summarizeCondition = condition => {
            const rows = scoredTrials.filter(trial => conditionOf(trial) === condition);
            const correctRows = rows.filter(correctOf);
            const correctLengths = correctRows.map(lengthOf).filter(Number.isFinite);
            const span = correctLengths.length > 0 ? Math.max(...correctLengths) : 0;
            const recallDurations = rows
                .map(trial => valueOf(trial, ['recallDurationMs', 'recall_duration_ms', 'responseTime']))
                .filter(Number.isFinite);
            const firstTapLatencies = rows
                .map(trial => valueOf(trial, ['firstTapLatencyMs', 'first_tap_latency_ms']))
                .filter(Number.isFinite);
            const prefix = condition;
            const summary = {
                [`${prefix}_trials_n`]: rows.length,
                [`${prefix}_correct_trials`]: correctRows.length,
                [`${prefix}_exact_response_percent`]: rows.length > 0
                    ? parseFloat((correctRows.length / rows.length * 100).toFixed(1))
                    : null,
                [`${prefix}_span`]: span,
                [`${prefix}_span_x_correct_trials`]: span * correctRows.length,
                [`${prefix}_mean_recall_duration_ms`]: recallDurations.length > 0
                    ? Math.round(this._mean(recallDurations))
                    : null,
            };
            if (includeTapLatency) {
                summary[`${prefix}_mean_first_tap_latency_ms`] = firstTapLatencies.length > 0
                    ? Math.round(this._mean(firstTapLatencies))
                    : null;
            }
            return summary;
        };

        const visibleDurations = [];
        const onsetIntervals = [];
        for (const trial of trials) {
            const onsets = this._parseNumberArray(
                trial.itemOnsetsMs ?? trial.item_onsets_ms ?? trial.stimulusOnsetsMs ?? trial.stimulus_onsets_ms
            );
            const offsets = this._parseNumberArray(
                trial.itemOffsetsMs ?? trial.item_offsets_ms ?? trial.stimulusOffsetsMs ?? trial.stimulus_offsets_ms
            );
            for (let i = 0; i < Math.min(onsets.length, offsets.length); i++) {
                if (offsets[i] >= onsets[i]) visibleDurations.push(offsets[i] - onsets[i]);
            }
            for (let i = 1; i < onsets.length; i++) {
                if (onsets[i] >= onsets[i - 1]) onsetIntervals.push(onsets[i] - onsets[i - 1]);
            }
        }

        return {
            ...summarizeCondition('forward'),
            ...summarizeCondition('backward'),
            scored_trials_n: scoredTrials.length,
            practice_trials_n: trials.length - scoredTrials.length,
            observed_item_visible_ms_mean: visibleDurations.length > 0
                ? Math.round(this._mean(visibleDurations))
                : null,
            observed_item_soa_ms_mean: onsetIntervals.length > 0
                ? Math.round(this._mean(onsetIntervals))
                : null,
        };
    },

    // ==================== Excel Export ====================

    downloadExcel() {
        if (typeof XLSX === 'undefined') {
            alert(this.t('common.alerts.xlsxMissing'));
            return;
        }
        if (!this.startTime) {
            alert(this.t('common.alerts.noSession'));
            return;
        }

        const qualitySummary = this.getQualitySummary();
        const qualityFlags = this.buildQualityFlags();
        const protocolMetadata = this.sessionProtocolMetadata || this.buildProtocolMetadata();
        const researcherReviewRows = this.buildResearcherReviewRows();
        const qcMultiverseRows = this.buildQcMultiverseRows();
        const qcMultiverseSummary = this.summarizeQcMultiverseRows(qcMultiverseRows);
        const taskMetricRows = this.buildTaskMetricsLongRows();
        const exportedAt = new Date().toISOString();
        const thresholds = (this.quality && this.quality.outlier_thresholds) || {};
        const participantSheetRow = {
            participantName: this.participantName || null,
            participantId: this.participantId,
            age: this.participantAge,
            viewing_distance_cm: this.viewingDistanceCm != null ? this.viewingDistanceCm : null,
            consent_accepted: this.consentAccepted ? 1 : 0,
            random_seed: this.randomSeed,
            date: this.startTime.toISOString(),
            date_local: this.startTime.toLocaleString(this.uiLanguage === 'ja' ? 'ja-JP' : 'en-US'),
            browser: this.quality.environment.browser,
            user_agent: this.quality.environment.userAgent,
            platform: this.quality.environment.platform,
            language: this.quality.environment.language,
            viewport_width: this.quality.environment.viewportWidth,
            viewport_height: this.quality.environment.viewportHeight,
            screen_width: this.quality.environment.screenWidth,
            screen_height: this.quality.environment.screenHeight,
            device_pixel_ratio: this.quality.environment.devicePixelRatio,
            max_touch_points: this.quality.environment.maxTouchPoints,
            hardware_concurrency: this.quality.environment.hardwareConcurrency,
            device_memory_gb: this.quality.environment.deviceMemoryGb,
            color_depth: this.quality.environment.colorDepth,
            pixel_depth: this.quality.environment.pixelDepth,
            timezone: this.quality.environment.timezone,
            timezone_offset_minutes: this.quality.environment.timezoneOffsetMinutes,
            cookies_enabled: this.quality.environment.cookiesEnabled,
            local_storage_available: this.quality.environment.localStorageAvailable,
            session_storage_available: this.quality.environment.sessionStorageAvailable,
            refresh_rate_hz_estimate: this.quality.environment.refreshRateHzEstimate,
            warning_count: this.quality.warnings.length,
            block_count: this.quality.blocks.length,
            session_number: this.sessionNumber,
            counterbalance_group: this.counterbalanceGroup,
            counterbalance_order: this.selectedTests.join(','),
            ...StudyConfig.getMetadata(),
            consent_version: this.getActiveConsentVersion(),
            ui_language: this.uiLanguage,
            instruction_language: this.instructionLanguage,
            stimulus_language: this.stimulusLanguage,
            consent_language: this.consentLanguage,
            translation_version: I18n.TRANSLATION_VERSION,
            privacy_mode: this.privacyMode ? 1 : 0,
            grayscale_confirmed: this.quality.grayscale_confirmed != null ? this.quality.grayscale_confirmed : null,
            long_task_count: this.quality.long_task_count || 0,
            long_task_ms_total: this.quality.long_task_ms_total || 0,
            rt_too_fast_ms: thresholds.rt_too_fast_ms != null ? thresholds.rt_too_fast_ms : null,
            rt_too_slow_ms: thresholds.rt_too_slow_ms != null ? thresholds.rt_too_slow_ms : null,
            rt_exclude_below_ms: thresholds.rt_exclude_below_ms != null ? thresholds.rt_exclude_below_ms : null,
            saa_rt_clip_min_ms: thresholds.saa_rt_clip_min_ms != null ? thresholds.saa_rt_clip_min_ms : null,
            saa_rt_clip_max_ms: thresholds.saa_rt_clip_max_ms != null ? thresholds.saa_rt_clip_max_ms : null,
            saa_rt_sd_multiplier: thresholds.saa_rt_sd_multiplier != null ? thresholds.saa_rt_sd_multiplier : null,
            inattention_easy_acc_threshold: thresholds.inattention_easy_acc_threshold != null ? thresholds.inattention_easy_acc_threshold : null,
            app_version: protocolMetadata.app_version,
            protocol_version: protocolMetadata.protocol_version,
            task_version: protocolMetadata.task_version,
            scoring_version: protocolMetadata.scoring_version,
            stimulus_version: protocolMetadata.stimulus_version,
            stimulus_rendering_mode: protocolMetadata.stimulus_rendering_mode,
            qc_multiverse_version: protocolMetadata.qc_multiverse_version,
            qc_universe_count: qcMultiverseSummary.qc_universe_count,
            qc_exclude_candidate_count: qcMultiverseSummary.qc_exclude_candidate_count,
            qc_exclude_candidate_universes: qcMultiverseSummary.qc_exclude_candidate_universes,
        };

        const scoreRows = [];
        for (const testId of this.selectedTests) {
            const info = this.testRegistry[testId];
            const result = this.results[testId] || {};
            scoreRows.push({
                test: info.name,
                testId,
                domain: info.domain,
                score: result.score != null && isFinite(result.score) ? result.score : null,
                detail: result.detail || null,
                accuracy: result.accuracy != null ? result.accuracy : null,
                accScore: result.accScore != null ? result.accScore : null,
                rtScore: result.rtScore != null ? result.rtScore : null,
                timeoutCount: result.timeoutCount != null ? result.timeoutCount : null,
                forward_span: result.forward_span != null ? result.forward_span : null,
                backward_span: result.backward_span != null ? result.backward_span : null,
                stimulus_form: result.stimulus_form || null,
            });
        }

        const wideRow = this.buildWideMetricsRow();

        wideRow.session_visibility_hidden_count = qualitySummary.visibility_hidden_count;
        wideRow.session_blur_count = qualitySummary.blur_count;
        wideRow.session_fullscreen_exit_count = qualitySummary.fullscreen_exit_count;
        wideRow.session_resize_count = qualitySummary.resize_count;
        wideRow.session_timeout_total = qualitySummary.timeout_total;
        wideRow.session_fast_response_count = qualitySummary.fast_response_count;
        wideRow.session_slow_response_count = qualitySummary.slow_response_count;
        const rawSheetNames = this.selectedTests
            .filter(testId => this.trialData[testId] && this.trialData[testId].length > 0)
            .map(testId => `${testId.replace(/-/g, '_').substring(0, 24)}_raw`);
        const workbookSheets = [
            'Export Manifest',
            'Participant',
            'Scores',
            'Research Metrics',
            'Task Metrics Long',
            'Protocol Metadata',
            'Study Configuration',
            'Researcher Review',
            'QC Multiverse',
            'Session Quality',
            ...(this.quality.events.length > 0 ? ['Session Events'] : []),
            'Codebook',
            ...rawSheetNames,
        ];
        const manifestRows = this.buildExportManifestRows({
            protocolMetadata,
            qcMultiverseSummary,
            workbookSheets,
            exportedAt,
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(manifestRows), 'Export Manifest');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([participantSheetRow]), 'Participant');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scoreRows), 'Scores');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([wideRow]), 'Research Metrics');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taskMetricRows), 'Task Metrics Long');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(Object.entries(protocolMetadata).map(([field, value]) => ({
            field,
            value,
        }))), 'Protocol Metadata');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(StudyConfig.buildRows()), 'Study Configuration');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(researcherReviewRows), 'Researcher Review');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(qcMultiverseRows), 'QC Multiverse');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
            ...qualitySummary,
            ...qualityFlags,
            ...qcMultiverseSummary,
            resumed_at_count: this.quality.resumed_at_count,
            fullscreen_requested_count: this.quality.fullscreen_requested_count,
            fullscreen_entered_count: this.quality.fullscreen_entered_count,
            fullscreen_failed_count: this.quality.fullscreen_failed_count,
            environment_warnings: this.quality.warnings.join(' / '),
            environment_blocks: this.quality.blocks.join(' / '),
        }]), 'Session Quality');

        if (this.quality.events.length > 0) {
            const eventRows = this.quality.events.map(event => ({
                timestamp: event.timestamp,
                stage: event.stage,
                type: event.type,
                detail: JSON.stringify(event.detail),
            }));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(eventRows), 'Session Events');
        }

        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(this.buildCodebook()), 'Codebook');

        for (const testId of this.selectedTests) {
            const trials = this.trialData[testId];
            if (!trials || trials.length === 0) continue;
            const sheetName = `${testId.replace(/-/g, '_').substring(0, 24)}_raw`;
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trials), sheetName);
        }

        const safeParticipantId = this.sanitizeFileNamePart(this.participantId || 'participant');
        const prefix = `${safeParticipantId}_${this.startTime.toISOString().slice(0, 10)}`;

        try {
            XLSX.writeFile(wb, `cognitive_battery_${prefix}.xlsx`);
        } catch (error) {
            console.error('Failed to save workbook.', error);
            alert(this.t('common.alerts.excelFailed'));
        }
    },

    buildCodebook() {
        return [
            { sheet: 'Participant', field: 'participantName', unit: '-', description: '参加者氏名（任意・未記入可）' },
            { sheet: 'Participant', field: 'participantId', unit: '-', description: '参加者ID（必須）' },
            { sheet: 'Participant', field: 'age', unit: '歳', description: '自己申告年齢（18-85）' },
            { sheet: 'Participant', field: 'viewing_distance_cm', unit: 'cm', description: '自己申告の目と画面中央までの距離（視覚度換算の参考値）' },
            { sheet: 'Participant', field: 'consent_accepted', unit: '1/0', description: '同意チェックの受諾状態' },
            { sheet: 'Participant', field: 'random_seed', unit: '-', description: 'mulberry32 に与えた試行順シード（32bit 符号なし整数）。再現実行に使用可能' },
            { sheet: 'Participant', field: 'session_number', unit: '-', description: '同じ研究設定ハッシュ＋参加者 ID での累積セッション数（同じ端末の localStorage で管理）。プライバシーモードでは保存しない' },
            { sheet: 'Participant', field: 'counterbalance_group', unit: '-', description: '7課題 Williams design の順序番号（0-13）。参加者 ID の FNV-1a ハッシュ mod 14 で決定。全課題選択時のみ適用' },
            { sheet: 'Participant', field: 'counterbalance_order', unit: '-', description: 'この参加者に割り当てられた実施順（カンマ区切り）' },
            { sheet: 'Participant / Protocol Metadata / Export Manifest / Study Configuration', field: 'study_config_id / study_config_hash', unit: '-', description: '研究設定の識別子と、正規化設定JSONに対するSHA-256ハッシュ' },
            { sheet: 'Participant / Protocol Metadata / Export Manifest / Study Configuration', field: 'study_config_schema_version / protocol_preset', unit: '-', description: '研究設定スキーマと先行研究参照・固定プロトコルプリセットの版' },
            { sheet: 'Study Configuration', field: 'configured_tasks / task_order_policy / fixed_order / resolved_task_order', unit: '-', description: '設定した課題、順序方式、固定順、および当該参加者に実際に割り当てられた順序' },
            { sheet: 'Study Configuration', field: 'participant_language_default / language_policy', unit: '-', description: '既定言語と、研究者固定または参加者選択可の言語ポリシー' },
            { sheet: 'Participant', field: 'consent_version', unit: '-', description: '同意画面のバージョン文字列（文言変更のトラッキング用）' },
            { sheet: 'Participant / Protocol Metadata / Export Manifest', field: 'ui_language', unit: 'BCP 47', description: '参加者画面の表示言語（ja または en）' },
            { sheet: 'Participant / Protocol Metadata / Export Manifest', field: 'instruction_language', unit: 'BCP 47', description: '課題教示に使用した言語（ja または en）' },
            { sheet: 'Participant / Protocol Metadata / Export Manifest', field: 'stimulus_language', unit: 'BCP 47', description: '言語依存刺激に使用した言語（ja または en）' },
            { sheet: 'Participant / Protocol Metadata / Export Manifest', field: 'consent_language', unit: 'BCP 47', description: '同意取得時に表示した言語（ja または en）' },
            { sheet: 'Participant / Protocol Metadata / Export Manifest', field: 'translation_version', unit: '-', description: '日英翻訳辞書の版数' },
            { sheet: 'Participant', field: 'privacy_mode', unit: '1/0', description: '共有 PC 向け「この端末に保存しない」モードが有効かどうか。1 の場合 localStorage への書き込みが抑止される' },
            { sheet: 'Participant', field: 'grayscale_confirmed', unit: '1/0', description: '開始前に 8 段階グレースケールがすべて区別できることを自己申告した' },
            { sheet: 'Participant', field: 'long_task_count', unit: '件', description: 'テスト中に発生した PerformanceObserver longtask の件数（50ms 超の長タスク）' },
            { sheet: 'Participant', field: 'long_task_ms_total', unit: 'ms', description: 'longtask の総経過時間' },
            { sheet: 'Participant', field: 'inattention_easy_acc_threshold', unit: '-', description: '不注意フラグ判定の易試行正答率閾値（既定 0.85）' },
            { sheet: 'Participant', field: 'date', unit: 'ISO8601', description: 'セッション開始時刻（UTC）' },
            { sheet: 'Participant', field: 'browser', unit: '-', description: '検出ブラウザ（Chrome/Edge/Firefox/Safari/Other）' },
            { sheet: 'Participant', field: 'viewport_width / viewport_height', unit: 'px', description: '実施時のビューポートサイズ' },
            { sheet: 'Participant', field: 'device_pixel_ratio', unit: '-', description: 'window.devicePixelRatio' },
            { sheet: 'Participant', field: 'hardware_concurrency', unit: '論理コア数', description: 'navigator.hardwareConcurrency。端末性能差の参考値' },
            { sheet: 'Participant', field: 'device_memory_gb', unit: 'GB', description: 'navigator.deviceMemory が提供される場合の概算メモリ量' },
            { sheet: 'Participant', field: 'color_depth / pixel_depth', unit: 'bit', description: 'screen.colorDepth / screen.pixelDepth' },
            { sheet: 'Participant', field: 'timezone / timezone_offset_minutes', unit: '-', description: '実施端末のタイムゾーン情報' },
            { sheet: 'Participant', field: 'local_storage_available / session_storage_available', unit: '1/0', description: 'ブラウザストレージが利用可能かどうか' },
            { sheet: 'Participant', field: 'refresh_rate_hz_estimate', unit: 'Hz', description: 'requestAnimationFrame 間隔から推定した表示リフレッシュレート' },
            { sheet: 'Participant', field: 'rt_too_fast_ms', unit: 'ms', description: '品質ログ集計時の「極端に速い反応」閾値（集計のみに使用）' },
            { sheet: 'Participant', field: 'rt_too_slow_ms', unit: 'ms', description: '品質ログ集計時の「極端に遅い反応」閾値' },
            { sheet: 'Participant', field: 'rt_exclude_below_ms', unit: 'ms', description: 'Research Metrics 集計時に除外する RT 下限' },
            { sheet: 'Participant', field: 'saa_rt_clip_min_ms / saa_rt_clip_max_ms', unit: 'ms', description: 'SAA スコア計算時の RT クリップ範囲' },
            { sheet: 'Participant', field: 'saa_rt_sd_multiplier', unit: '-', description: 'SAA RT の外れ値除外における SD 乗数' },
            { sheet: 'Participant', field: 'app_version', unit: '-', description: 'アプリのビルド識別子' },
            { sheet: 'Participant', field: 'protocol_version / task_version / scoring_version / stimulus_version', unit: '-', description: 'プロトコル、課題、採点、刺激プールの版数' },
            { sheet: 'Participant', field: 'stimulus_rendering_mode', unit: '-', description: '刺激レンダリング方式。絵文字に加えてHTMLテキスト数字と幾何学ブロックを使用' },
            { sheet: 'Participant', field: 'qc_multiverse_version', unit: '-', description: 'QC multiverse 定義の版数' },
            { sheet: 'Participant', field: 'qc_universe_count / qc_exclude_candidate_count', unit: '-', description: '出力に含まれる QC universe 数と除外候補 universe 数' },
            { sheet: 'Participant', field: 'qc_exclude_candidate_universes', unit: '-', description: 'この参加者が除外候補となる QC universe ID（カンマ区切り）' },

            { sheet: 'Export Manifest', field: 'export_manifest_version', unit: '-', description: 'Excel 提出ファイルの manifest 版数' },
            { sheet: 'Export Manifest', field: 'export_format', unit: '-', description: '提出ファイル形式。通常は xlsx' },
            { sheet: 'Export Manifest', field: 'submission_instruction', unit: '-', description: '受験者が研究者へ提出するファイルの説明' },
            { sheet: 'Export Manifest', field: 'exported_at / started_at', unit: 'ISO8601', description: 'Excel ファイル保存時刻とセッション開始時刻' },
            { sheet: 'Export Manifest', field: 'workbook_sheets', unit: '-', description: 'この Excel ブックに含まれるシート一覧' },
            { sheet: 'Export Manifest', field: 'app_version / protocol_version / task_version / scoring_version / stimulus_version', unit: '-', description: '解析時に確認する実装・手続き・採点・刺激プールの版数' },

            { sheet: 'Protocol Metadata', field: 'app_version', unit: '-', description: 'アプリのビルド識別子' },
            { sheet: 'Protocol Metadata', field: 'protocol_version', unit: '-', description: '実施手続きの版数' },
            { sheet: 'Protocol Metadata', field: 'task_version', unit: '-', description: '課題実装の版数' },
            { sheet: 'Protocol Metadata', field: 'scoring_version', unit: '-', description: '採点ロジックの版数' },
            { sheet: 'Protocol Metadata', field: 'stimulus_version', unit: '-', description: '刺激プールの版数' },
            { sheet: 'Protocol Metadata', field: 'qc_multiverse_version', unit: '-', description: 'QC multiverse 定義の版数' },
            { sheet: 'Protocol Metadata', field: 'timing_method', unit: '-', description: 'RT 計測手続きの概要' },
            { sheet: 'Protocol Metadata', field: 'adaptive_span_rule', unit: '-', description: 'Visual Digit Span / eCorsi の開始長、進行・中止規則' },
            { sheet: 'Protocol Metadata', field: 'visual_digit_span_timing / ecorsi_timing', unit: '-', description: '各スパン課題の目標提示時間と SOA' },
            { sheet: 'Protocol Metadata', field: 'visual_digit_span_references / ecorsi_references', unit: '-', description: '課題手続きの根拠とした先行研究' },
            { sheet: 'Protocol Metadata', field: 'stimulus_copyright_note', unit: '-', description: '独自刺激であり、保護された検査項目・規準を複製しない旨' },
            { sheet: 'Protocol Metadata', field: 'qc_principle', unit: '-', description: 'QC を自動除外ではなく multiverse / sensitivity analysis の研究者自由度として扱う方針' },

            { sheet: 'Scores', field: 'score', unit: '-', description: '課題別の表示スコア。スパン課題では Forward/Backward span の単純合計を表示するが、解析では条件別 span を使用する' },
            { sheet: 'Scores', field: 'accuracy', unit: '%', description: '正答率' },
            { sheet: 'Scores', field: 'accScore', unit: '-', description: 'SAA の正答率由来スコア成分' },
            { sheet: 'Scores', field: 'rtScore', unit: '-', description: 'SAA の RT 由来スコア成分（正答率 >0.8 のみ算出）' },
            { sheet: 'Scores', field: 'timeoutCount', unit: '件', description: 'その課題でのタイムアウト試行数' },
            { sheet: 'Scores', field: 'forward_span / backward_span', unit: '項目数', description: '適応的スパン課題の条件別最長完全正答系列' },
            { sheet: 'Scores', field: 'stimulus_form', unit: '-', description: 'スパン課題で割り当てた独立刺激フォーム' },

            { sheet: 'Researcher Review', field: 'review_recommendation', unit: 'ok/review', description: '品質ログから研究者確認を推奨するかどうか。自動除外ではない' },
            { sheet: 'Researcher Review', field: 'review_notes', unit: '-', description: '確認候補になった品質ログの要約' },
            { sheet: 'Researcher Review', field: '*_flag', unit: '1/0', description: '低正答率、タブ離脱、フォーカス離脱、タイムアウト、極端 RT、環境警告などの確認フラグ' },
            { sheet: 'Researcher Review', field: 'qc_include_candidate_universes / qc_exclude_candidate_universes', unit: '-', description: 'QC multiverse の各 universe で、この参加者が含入候補または除外候補になる universe ID' },
            { sheet: 'Researcher Review', field: '<test>_stimulus_set_id / stimulus_theme / stimulus_form', unit: '-', description: 'DCCS のカードセット ID、Picture Sequence のテーマ、スパン課題のフォームなど刺激条件の識別子' },

            { sheet: 'QC Multiverse', field: 'universe_id', unit: '-', description: 'QC universe の識別子。解析時の感度分析要因として使用' },
            { sheet: 'QC Multiverse', field: 'analysis_role', unit: '-', description: '記述統計、最小 QC、behavioral QC、strict QC など、この universe の解析上の役割' },
            { sheet: 'QC Multiverse', field: 'researcher_degree_of_freedom', unit: '-', description: 'この universe が表現する研究者自由度' },
            { sheet: 'QC Multiverse', field: 'include_candidate / exclude_candidate', unit: '1/0', description: '当該 universe で含入候補か除外候補か。自動除外ではなく感度分析用の符号化' },
            { sheet: 'QC Multiverse', field: 'reasons', unit: '-', description: '除外候補となった理由。空欄なら当該 universe では含入候補' },
            { sheet: 'QC Multiverse', field: '*_rule', unit: '-', description: 'その universe で用いた QC 閾値' },
            { sheet: 'QC Multiverse', field: 'observed_*', unit: '-', description: '参加者セッションで観測された QC 指標' },

            { sheet: 'Research Metrics', field: 'flanker_congruency_effect_ms', unit: 'ms', description: 'Incongruent - Congruent の平均 RT 差' },
            { sheet: 'Research Metrics', field: 'flanker_ies_overall_ms / ies_incongruent_ms', unit: 'ms', description: 'Inverse Efficiency Score = mean_rt / accuracy（小さいほど効率的）' },
            { sheet: 'Research Metrics', field: 'flanker_inattention_flag / dccs_inattention_flag', unit: '1/0', description: '易試行（congruent / dominant）正答率が閾値未満なら 1。自動除外はせず、解析時の判断材料' },
            { sheet: 'Research Metrics', field: 'dccs_switch_cost_ms', unit: 'ms', description: 'Non-dominant - Dominant の平均 RT 差' },
            { sheet: 'Research Metrics', field: 'pattern_comparison_d_prime', unit: '-', description: "Signal Detection Theory の感度指標 d'（zHit - zFA）" },
            { sheet: 'Research Metrics', field: 'pattern_comparison_criterion_c', unit: '-', description: '反応バイアス c = -0.5 × (zHit + zFA)' },
            { sheet: 'Research Metrics', field: 'picture_sequence_learning_slope', unit: 'ペア/試行', description: '3学習試行での隣接ペア数の平均変化率' },
            { sheet: 'Research Metrics', field: 'visual_digit_span_forward_span / backward_span', unit: '桁', description: '各条件で完全正答した最長系列。視覚提示のため聴覚版の規準値を流用しない' },
            { sheet: 'Research Metrics', field: 'ecorsi_forward_span / backward_span', unit: 'ブロック', description: '各条件で完全正答した最長系列' },
            { sheet: 'Research Metrics', field: '<span>_span_x_correct_trials', unit: 'score', description: 'span × 中止までの完全正答試行数。Kessels et al. の Total Score 型指標。条件別に保持' },
            { sheet: 'Research Metrics', field: '<span>_observed_item_visible_ms_mean / observed_item_soa_ms_mean', unit: 'ms', description: '実測した刺激の平均点灯時間と平均 SOA（提示品質確認用）' },
            { sheet: 'Research Metrics', field: '<test>_practice_attempts', unit: '回', description: '本番到達までの練習試行セット数' },
            { sheet: 'Research Metrics', field: '<test>_test_duration_ms', unit: 'ms', description: '課題の本番所要時間' },
            { sheet: 'Research Metrics', field: '<test>_timeout_count', unit: '件', description: '本番でのタイムアウト試行数' },
            { sheet: 'Research Metrics', field: 'session_*', unit: '件', description: 'セッション全体の品質ログ集計（タブ離脱・フォーカス離脱など）' },

            { sheet: 'Task Metrics Long', field: 'participant_id / session_number', unit: '-', description: '参加者 ID とセッション番号。参加者レベル表との結合キー' },
            { sheet: 'Task Metrics Long', field: 'testId / test / domain', unit: '-', description: '課題 ID、表示名、測定領域' },
            { sheet: 'Task Metrics Long', field: 'metric', unit: '-', description: '課題別メトリクス名。ワイド形式の列を long 形式に展開したもの' },
            { sheet: 'Task Metrics Long', field: 'metric_source', unit: '-', description: 'result = 課題終了時スコア、computed = 試行データから再計算した研究用指標' },
            { sheet: 'Task Metrics Long', field: 'unit', unit: '-', description: 'メトリクス単位（ms, %, count, score など）' },
            { sheet: 'Task Metrics Long', field: 'value / value_numeric / value_text', unit: '-', description: '解析しやすいよう、元値・数値化した値・文字列値を分離' },

            { sheet: '*_raw', field: 'trialNum / trial_number', unit: '-', description: '課題内試行番号（1 起点）' },
            { sheet: '*_raw', field: 'rt', unit: 'ms', description: '反応時間。刺激呈示フレーム（requestAnimationFrame 同期）からキー押下までの performance.now() 差' },
            { sheet: '*_raw', field: 'tOnset', unit: 'ms', description: 'セッション開始時点からの刺激呈示時刻' },
            { sheet: '*_raw', field: 'tResponse', unit: 'ms', description: 'セッション開始時点からの反応時刻' },
            { sheet: '*_raw', field: 'correct', unit: '1/0', description: '正答 = 1、誤答 = 0' },
            { sheet: 'flanker_raw', field: 'type', unit: '-', description: 'congruent / incongruent' },
            { sheet: 'flanker_raw', field: 'direction', unit: '-', description: '中央矢印の正解方向 (left/right)' },
            { sheet: 'flanker_raw', field: 'response', unit: '-', description: '参加者応答 (left/right/timeout)' },
            { sheet: 'dccs_raw', field: 'dimension', unit: '-', description: 'その試行のルール (color/shape)' },
            { sheet: 'dccs_raw', field: 'isDominant', unit: '1/0', description: '優位ルール (ブロック内多数派) 試行か' },
            { sheet: 'pattern_comparison_raw', field: 'isSame', unit: '1/0', description: '2つのパターンが同一か' },
            { sheet: 'pattern_comparison_raw', field: 'response', unit: '-', description: '参加者応答 (same/different)' },
            { sheet: 'list_sorting_raw', field: 'phase', unit: '-', description: 'single = 1リスト条件、dual = 2リスト条件' },
            { sheet: 'list_sorting_raw', field: 'length', unit: '-', description: '提示アイテム数' },
            { sheet: 'list_sorting_raw', field: 'attempt', unit: '-', description: '当該長での試行回数（1 または 2）' },
            { sheet: 'list_sorting_raw', field: 'itemIds / correctOrderIds / responseIds', unit: '-', description: '表示言語に依存しない項目 ID、正答順 ID、回答順 ID（セミコロン区切り）' },
            { sheet: 'picture_sequence_raw', field: 'adjacentPairs', unit: '-', description: '正しく隣接する順序で並べられたペア数' },
            { sheet: 'picture_sequence_raw', field: 'maxPairs', unit: '-', description: '最大隣接ペア数 = sequenceLength - 1' },
            { sheet: 'picture_sequence_raw', field: 'itemIds / correctOrderIds / responseOrderIds', unit: '-', description: '表示言語に依存しない提示項目 ID、正答順 ID、回答順 ID（セミコロン区切り）' },
            { sheet: 'list_sorting_raw / picture_sequence_raw', field: 'stimulus_language', unit: 'BCP 47', description: 'その試行で使用した言語依存刺激の言語（ja または en）' },
            { sheet: 'list_sorting_raw / picture_sequence_raw', field: 'stimulus_bank_version', unit: '-', description: '言語依存刺激バンクの版数' },
            { sheet: 'visual_digit_span_raw / ecorsi_raw', field: 'condition / set_size / attempt', unit: '-', description: 'Forward/Backward、系列長、当該系列長での試行番号' },
            { sheet: 'visual_digit_span_raw / ecorsi_raw', field: 'presented_sequence / expected_sequence / response_sequence', unit: '-', description: '提示系列、採点対象系列（Backward は逆順）、参加者回答' },
            { sheet: 'visual_digit_span_raw / ecorsi_raw', field: 'exact_correct', unit: '1/0', description: '系列全体および順序が完全一致したか' },
            { sheet: 'visual_digit_span_raw / ecorsi_raw', field: 'item_onsets_ms / item_offsets_ms', unit: 'ms', description: '各刺激についてセッション開始からの実測点灯・消灯時刻' },
            { sheet: 'visual_digit_span_raw / ecorsi_raw', field: 'recall_duration_ms', unit: 'ms', description: '回答画面表示から確定までの時間。速度得点・汎用 RT QC には使用しない' },
            { sheet: 'visual_digit_span_raw', field: 'first_input_latency_ms / input_methods', unit: 'ms / -', description: '最初の数字入力までの時間と利用した入力方法' },
            { sheet: 'ecorsi_raw', field: 'first_tap_latency_ms / input_method', unit: 'ms / -', description: '回答開始までの時間と入力方法（pointer/keyboard/mixed）' },

            { sheet: 'Session Quality', field: 'visibility_hidden_count', unit: '回', description: 'タブが非可視になった回数（visibilitychange）' },
            { sheet: 'Session Quality', field: 'blur_count', unit: '回', description: 'ウィンドウフォーカスが外れた回数' },
            { sheet: 'Session Quality', field: 'fullscreen_exit_count', unit: '回', description: 'フルスクリーンが解除された回数' },
            { sheet: 'Session Quality', field: 'resize_count', unit: '回', description: 'ビューポートサイズが変更された回数' },
            { sheet: 'Session Quality', field: 'fast_response_count', unit: '件', description: 'RT < rt_too_fast_ms（既定 150 ms）の試行数（分析用。自動除外はしない）' },
            { sheet: 'Session Quality', field: 'slow_response_count', unit: '件', description: 'RT > 5000 ms の試行数' },
            { sheet: 'Session Quality', field: 'timeout_total', unit: '件', description: 'タイムアウト試行の合計' },
            { sheet: 'Session Quality', field: 'resumed_at_count', unit: '回', description: 'セッションを途中から復元した回数' },
            { sheet: 'Session Quality', field: 'any_quality_flag', unit: '1/0', description: '研究者レビュー用品質フラグのいずれかが立ったかどうか' },
            { sheet: 'Session Quality', field: 'review_recommendation / review_notes', unit: '-', description: '研究者確認の推奨と理由' },
            { sheet: 'Session Quality', field: 'qc_universe_count / qc_exclude_candidate_count', unit: '-', description: 'QC multiverse での universe 数と除外候補 universe 数' },

            { sheet: 'Session Events', field: 'timestamp', unit: 'ISO8601', description: 'イベント発生時刻' },
            { sheet: 'Session Events', field: 'stage', unit: '-', description: 'そのときのセッション段階 (test/break/results)' },
            { sheet: 'Session Events', field: 'type', unit: '-', description: 'イベント種別 (tab_hidden, window_blur, fullscreen_entered, long_task ほか)' },
            { sheet: 'Session Events', field: 'detail', unit: '-', description: 'イベント補足情報 (JSON 文字列)' },

            { sheet: 'JSON / integrity_sha256', field: 'integrity_sha256', unit: '-', description: 'JSON 出力では、payload 本体の SHA-256 を 16 進で格納。改ざん検出に使用' },
        ];
    },

    async downloadJson() {
        if (!this.startTime) {
            alert(this.t('common.alerts.noSession'));
            return;
        }

        const payload = await this.buildJsonPayload();
        const safeParticipantId = this.sanitizeFileNamePart(this.participantId || 'participant');
        const prefix = `${safeParticipantId}_${this.startTime.toISOString().slice(0, 10)}`;
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `cognitive_battery_${prefix}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    async buildJsonPayload() {
        const protocol = this.sessionProtocolMetadata || this.buildProtocolMetadata();
        const qualityFlags = this.buildQualityFlags();
        const qcMultiverseRows = this.buildQcMultiverseRows();
        const payload = {
            version: this.APP_VERSION,
            exported_at: new Date().toISOString(),
            protocol,
            study_configuration: StudyConfig.publicSessionConfiguration(),
            participant: {
                participantName: this.participantName || null,
                participantId: this.participantId,
                age: this.participantAge,
                viewing_distance_cm: this.viewingDistanceCm,
                consent_accepted: this.consentAccepted,
                consent_version: this.getActiveConsentVersion(),
                ui_language: this.uiLanguage,
                instruction_language: this.instructionLanguage,
                stimulus_language: this.stimulusLanguage,
                consent_language: this.consentLanguage,
                translation_version: I18n.TRANSLATION_VERSION,
                privacy_mode: this.privacyMode,
                random_seed: this.randomSeed,
                session_number: this.sessionNumber,
                counterbalance_group: this.counterbalanceGroup,
                counterbalance_order: this.selectedTests.slice(),
                grayscale_confirmed: this.quality.grayscale_confirmed,
                start_time: this.startTime.toISOString(),
            },
            environment: this.quality.environment,
            outlier_thresholds: this.quality.outlier_thresholds,
            warnings: this.quality.warnings,
            blocks: this.quality.blocks,
            checks: this.quality.checks,
            session_quality: {
                ...this.getQualitySummary(),
                long_task_count: this.quality.long_task_count || 0,
                long_task_ms_total: this.quality.long_task_ms_total || 0,
            },
            quality_flags: qualityFlags,
            researcher_review: this.buildResearcherReviewRows(),
            qc_multiverse: {
                version: this.QC_MULTIVERSE_VERSION,
                principle: 'Quality Control is a researcher degree of freedom represented as multiverse/sensitivity-analysis universes. Rows mark include/exclude candidates; the app does not apply automatic exclusion.',
                universes: qcMultiverseRows,
            },
            session_events: this.quality.events,
            results: this.results,
            research_metrics: this.buildWideMetricsRow(),
            task_metrics_long: this.buildTaskMetricsLongRows(),
            trials: this.trialData,
            codebook: this.buildCodebook(),
        };

        const canonical = JSON.stringify(payload);
        const hash = await this.computeSha256(canonical);
        payload.integrity_sha256 = hash;
        return payload;
    },

    inferMetricUnit(metric) {
        const key = String(metric || '').toLowerCase();
        if (key.endsWith('_ms')
            || key.includes('duration_ms')
            || key.includes('response_time')
            || key.includes('mean_rt')
            || key.includes('median_rt')
            || key.includes('sd_rt')
            || key.includes('_rt_')
            || key.endsWith('_rt')
            || key === 'rt') return 'ms';
        if (key.includes('accuracy') || key.includes('percent')) return '%';
        if (key.includes('span_x')) return 'score';
        if (key.includes('score')) return 'score';
        if (key.includes('learning_slope')) return 'pairs/trial';
        if (key.includes('proportion')
            || key.includes('rate')
            || key.includes('d_prime')
            || key.includes('criterion')
            || key.includes('ies')) return '-';
        if (key.includes('count')
            || key.includes('timeout')
            || key.includes('attempt')
            || key.includes('trials')
            || key.endsWith('_n')
            || key.endsWith('_correct')
            || key.includes('span')
            || key.includes('pairs')) return 'count';
        return '-';
    },

    normalizeMetricValue(value) {
        if (value == null || value === '') {
            return { value: null, value_numeric: null, value_text: null };
        }
        if (typeof value === 'number') {
            return {
                value: Number.isFinite(value) ? value : null,
                value_numeric: Number.isFinite(value) ? value : null,
                value_text: null,
            };
        }
        if (typeof value === 'boolean') {
            const numeric = value ? 1 : 0;
            return { value: numeric, value_numeric: numeric, value_text: null };
        }
        if (typeof value === 'string') {
            return { value, value_numeric: null, value_text: value };
        }
        const text = JSON.stringify(value);
        return { value: text, value_numeric: null, value_text: text };
    },

    buildTaskMetricsLongRows() {
        const rows = [];
        const resultMetricMap = {
            score: 'score',
            accuracy: 'accuracy',
            accScore: 'acc_score',
            rtScore: 'rt_score',
            timeoutCount: 'timeout_count',
            practiceAttempts: 'practice_attempts',
            testDurationMs: 'test_duration_ms',
            setId: 'stimulus_set_id',
            theme: 'stimulus_theme',
            forward_span: 'forward_span',
            backward_span: 'backward_span',
            combined_span: 'combined_span',
            forward_correct_trials: 'forward_correct_trials',
            backward_correct_trials: 'backward_correct_trials',
            forward_administered_trials: 'forward_administered_trials',
            backward_administered_trials: 'backward_administered_trials',
            forward_span_x_correct_trials: 'forward_span_x_correct_trials',
            backward_span_x_correct_trials: 'backward_span_x_correct_trials',
            forward_stop_length: 'forward_stop_length',
            backward_stop_length: 'backward_stop_length',
            total_scored_trials: 'total_scored_trials',
            practice_trial_count: 'practice_trial_count',
            stimulus_form: 'stimulus_form',
            stimulus_version: 'task_stimulus_version',
            task_version: 'task_implementation_version',
            scoring_version: 'task_scoring_version',
            task_seed: 'task_seed',
            condition_order: 'condition_order',
        };

        const pushRow = (testId, metric, metricSource, value) => {
            const info = this.testRegistry[testId] || { name: testId, domain: null };
            const normalized = this.normalizeMetricValue(value);
            rows.push({
                participant_id: this.participantId,
                session_number: this.sessionNumber,
                start_time: this.startTime ? this.startTime.toISOString() : null,
                app_version: this.APP_VERSION,
                protocol_version: this.PROTOCOL_VERSION,
                random_seed: this.randomSeed,
                counterbalance_group: this.counterbalanceGroup,
                testId,
                test: info.name,
                domain: info.domain,
                metric,
                metric_source: metricSource,
                unit: this.inferMetricUnit(metric),
                ...normalized,
            });
        };

        for (const testId of this.selectedTests) {
            const result = this.results[testId] || {};
            for (const [resultKey, metricName] of Object.entries(resultMetricMap)) {
                if (Object.prototype.hasOwnProperty.call(result, resultKey)) {
                    pushRow(testId, metricName, 'result', result[resultKey]);
                }
            }

            const computedMetrics = this.computeTaskMetricsForReview(testId);
            for (const [metric, value] of Object.entries(computedMetrics)) {
                pushRow(testId, metric, 'computed', value);
            }
        }

        return rows;
    },

    buildWideMetricsRow() {
        const wideRow = {};
        for (const testId of this.selectedTests) {
            const trials = this.trialData[testId];
            const result = this.results[testId] || {};
            let metrics = {};
            switch (testId) {
                case 'flanker': metrics = this.computeFlankerMetrics(trials); break;
                case 'dccs': metrics = this.computeDCCSMetrics(trials); break;
                case 'pattern-comparison': metrics = this.computePatternComparisonMetrics(trials); break;
                case 'picture-sequence': metrics = this.computePictureSequenceMetrics(trials); break;
                case 'list-sorting': metrics = this.computeListSortingMetrics(trials); break;
                case 'visual_digit_span': metrics = this.computeAdaptiveSpanMetrics(trials, false); break;
                case 'ecorsi': metrics = this.computeAdaptiveSpanMetrics(trials, true); break;
            }
            const prefix = testId.replace(/-/g, '_');
            for (const [key, value] of Object.entries(metrics)) {
                wideRow[`${prefix}_${key}`] = value;
            }
            if (result.practiceAttempts != null) wideRow[`${prefix}_practice_attempts`] = result.practiceAttempts;
            if (result.testDurationMs != null) wideRow[`${prefix}_test_duration_ms`] = result.testDurationMs;
            if (result.timeoutCount != null) wideRow[`${prefix}_timeout_count`] = result.timeoutCount;
            if (result.setId != null) wideRow[`${prefix}_stimulus_set_id`] = result.setId;
            if (result.theme != null) wideRow[`${prefix}_stimulus_theme`] = result.theme;
            if (result.stimulus_form != null) wideRow[`${prefix}_stimulus_form`] = result.stimulus_form;
            if (result.task_seed != null) wideRow[`${prefix}_task_seed`] = result.task_seed;
            if (result.condition_order != null) wideRow[`${prefix}_condition_order`] = result.condition_order;
        }
        return wideRow;
    },

    sanitizeFileNamePart(value) {
        return value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/\s+/g, '_');
    },

    persistSession() {
        if (!this.startTime) return;
        if (this.privacyMode) {
            try { localStorage.removeItem(this.STORAGE_KEY); } catch (e) { /* ignore */ }
            return;
        }

        const hasVersionedStudyConfig = Boolean(this.studyConfig && this.studyConfigHash);
        const payload = {
            sessionPayloadVersion: hasVersionedStudyConfig ? this.SESSION_PAYLOAD_VERSION : 2,
            appVersion: this.APP_VERSION,
            protocolVersion: this.PROTOCOL_VERSION,
            participantName: this.participantName,
            participantId: this.participantId,
            participantAge: this.participantAge,
            viewingDistanceCm: this.viewingDistanceCm,
            consentAccepted: this.consentAccepted,
            consent_version: this.getActiveConsentVersion(),
            ui_language: this.uiLanguage,
            instruction_language: this.instructionLanguage,
            stimulus_language: this.stimulusLanguage,
            consent_language: this.consentLanguage,
            translation_version: I18n.TRANSLATION_VERSION,
            selectedTests: this.selectedTests,
            currentTestIndex: this.currentTestIndex,
            results: this.results,
            trialData: this.trialData,
            startTime: this.startTime.toISOString(),
            sessionStage: this.sessionStage,
            inProgressTestId: this.inProgressTestId,
            quality: this.quality,
            randomSeed: this.randomSeed,
            randomState: this._randomState,
            sessionElapsedMsAtSave: this.sessionElapsedMs(),
            sessionNumber: this.sessionNumber,
            counterbalanceGroup: this.counterbalanceGroup,
            studyConfig: this.studyConfig,
            studyConfigHash: this.studyConfigHash,
            resolvedTaskOrder: this.resolvedTaskOrder,
            sessionProtocolMetadata: this.sessionProtocolMetadata,
        };

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
        } catch (error) {
            console.error('Failed to persist session.', error);
        }
    },

    restart() {
        this.clearPrimaryAdvanceBinding();
        this.unlockLanguage();

        this.participantName = '';
        this.participantId = '';
        this.participantAge = 0;
        this.viewingDistanceCm = null;
        this.consentAccepted = false;
        this.sessionConsentVersion = null;
        this.privacyMode = false;
        this.sessionNumber = 1;
        this.counterbalanceGroup = null;
        this.studyConfig = StudyConfig.activeConfig || null;
        this.studyConfigHash = this.studyConfig ? this.studyConfig.config_hash : null;
        this.resolvedTaskOrder = [];
        this.sessionProtocolMetadata = null;
        this.startTransitionInProgress = false;
        this.selectedTests = [];
        this.currentTestIndex = 0;
        this.results = {};
        this.trialData = {};
        this.startTime = null;
        this._sessionPerfStart = null;
        this.randomSeed = null;
        this._randomState = null;
        this.sessionStage = 'idle';
        this.inProgressTestId = null;
        this.quality = this.createQualityState();
        this.clearStartError();
        this.discardSavedSession();

        const startButton = document.getElementById('btn-start');
        if (startButton) startButton.disabled = false;

        document.getElementById('participant-name').value = '';
        document.getElementById('participant-id').value = '';
        document.getElementById('participant-age').value = '';
        const viewingEl = document.getElementById('participant-viewing-distance');
        if (viewingEl) viewingEl.value = '';
        const consentEl = document.getElementById('consent-agree');
        if (consentEl) consentEl.checked = false;
        const privacyEl = document.getElementById('privacy-no-persist');
        if (privacyEl) privacyEl.checked = false;
        document.getElementById('select-all-tests').checked = true;
        document.getElementById('individual-tests').classList.add('hidden');
        document.querySelectorAll('.test-checkbox').forEach(cb => {
            cb.checked = true;
        });
        document.querySelectorAll('.readiness-checkbox').forEach(cb => {
            cb.checked = false;
        });

        StudyConfig.applyActiveConfigurationToParticipantUi();
        this.renderEnvironmentChecks();
        this.renderSavedSessionBanner();
        this.showScreen('screen-start');
    },

    // ==================== Quality Logging ====================

    logQualityEvent(type, detail = {}) {
        if (!this.quality) return;

        this.quality.events.push({
            timestamp: new Date().toISOString(),
            stage: this.sessionStage,
            type,
            detail,
        });

        if (this.quality.events.length > this.QUALITY_EVENT_LIMIT) {
            this.quality.events = this.quality.events.slice(-this.QUALITY_EVENT_LIMIT);
        }
    },

    isSessionActive() {
        return Boolean(this.startTime) && ['test', 'break', 'results'].includes(this.sessionStage);
    },

    // ==================== Utility ====================

    clearPrimaryAdvanceBinding() {
        if (this.primaryAdvanceHandler) {
            document.removeEventListener('keydown', this.primaryAdvanceHandler);
            this.primaryAdvanceHandler = null;
        }
        if (this.breakKeyHandler) {
            document.removeEventListener('keydown', this.breakKeyHandler);
            this.breakKeyHandler = null;
        }
    },

    bindPrimaryAdvance(buttonId, action) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        this.clearPrimaryAdvanceBinding();

        let activated = false;
        const activate = () => {
            if (activated) return;
            activated = true;
            this.clearPrimaryAdvanceBinding();
            action();
        };

        button.addEventListener('click', activate);
        this.primaryAdvanceHandler = (event) => {
            if (event.code !== 'Space' && event.key !== ' ') return;
            if (event.repeat) return;
            event.preventDefault();
            activate();
        };
        document.addEventListener('keydown', this.primaryAdvanceHandler);
    },

    getTestContent() {
        return document.getElementById('test-content');
    },

    shuffle(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    },

    median(arr) {
        if (arr.length === 0) return null;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ==================== Seeded PRNG (mulberry32) ====================

    /** @returns {number} A 32-bit unsigned integer seed derived from crypto or Math.random. */
    generateSeed() {
        if (window.crypto && window.crypto.getRandomValues) {
            const buf = new Uint32Array(1);
            window.crypto.getRandomValues(buf);
            return buf[0] >>> 0;
        }
        return Math.floor(Math.random() * 0x100000000) >>> 0;
    },

    /** @param {number} seed */
    seedRandom(seed) {
        this.randomSeed = seed >>> 0;
        this._randomState = this.randomSeed;
    },

    /** @returns {number} A uniform random float in [0, 1) using the seeded stream. */
    random() {
        if (this._randomState === null) {
            this.seedRandom(this.generateSeed());
        }
        let t = this._randomState = (this._randomState + 0x6D2B79F5) | 0;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },

    // ==================== Frame-synchronized Stimulus Onset ====================

    /**
     * Resolves with a performance.now() timestamp aligned to the next paint frame.
     * @returns {Promise<number>}
     */
    waitForStimulusOnset() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    resolve(performance.now());
                });
            });
        });
    },

    simpleHash(str) {
        let h = 2166136261 >>> 0;
        const s = String(str || '');
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h;
    },

    /**
     * Deterministically map a participant ID to a Williams-design row.
     * @param {string} participantId
     * @returns {{group: number, order: TestId[]}}
     */
    counterbalanceOrderFor(participantId) {
        const design = this.COUNTERBALANCE_WILLIAMS_DESIGN;
        if (!participantId) return { group: 0, order: design[0].slice() };
        const idx = this.simpleHash(participantId) % design.length;
        return { group: idx, order: design[idx].slice() };
    },

    /**
     * Derive an independent deterministic seed for a task or stimulus namespace.
     * This prevents an adaptive task's stopping point from changing later tasks.
     * @param {string} namespace
     * @returns {number}
     */
    deriveTaskSeed(namespace) {
        const baseSeed = Number.isFinite(this.randomSeed) ? this.randomSeed >>> 0 : 0;
        return this.simpleHash([
            baseSeed,
            this.participantId || '',
            this.sessionNumber || 1,
            namespace || '',
        ].join('|')) >>> 0;
    },

    /** @param {number} seed @returns {() => number} */
    createSeededRandom(seed) {
        let state = seed >>> 0;
        return () => {
            let t = state = (state + 0x6D2B79F5) | 0;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    },

    bumpSessionNumber(participantId) {
        if (!participantId) return 1;
        if (this.privacyMode) return 1;
        const historyKey = `${this.studyConfigHash || 'unconfigured'}|${participantId}`;
        let history = {};
        try {
            const raw = localStorage.getItem(this.HISTORY_STORAGE_KEY);
            history = raw ? JSON.parse(raw) : {};
        } catch (error) {
            history = {};
        }
        const next = (history[historyKey] || 0) + 1;
        history[historyKey] = next;
        try {
            localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            // non-fatal
        }
        return next;
    },

    /**
     * SHA-256 hex digest of the given string, or null if SubtleCrypto is unavailable.
     * @param {string} str
     * @returns {Promise<string|null>}
     */
    async computeSha256(str) {
        if (!window.crypto || !window.crypto.subtle) return null;
        try {
            const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            return null;
        }
    },

    /**
     * Returns a performance.now-compatible timestamp from an Event.
     * Falls back to performance.now() if the event's timeStamp is absent or
     * not in the performance timeline (legacy browsers).
     * @param {Event|{timeStamp?: number}} event
     * @returns {number}
     */
    eventTime(event) {
        if (!event || typeof event.timeStamp !== 'number') return performance.now();
        const t = event.timeStamp;
        const now = performance.now();
        // Guard: some older browsers use a Date-epoch timestamp that is not comparable
        // to performance.now(). Reject clearly-out-of-timeline values.
        if (!Number.isFinite(t) || t < 0 || t > now + 1 || (now - t) > 60000) {
            return now;
        }
        return t;
    },

    /**
     * Milliseconds elapsed since session start, as recorded by performance.now().
     * @param {number} [tPerf] Optional explicit performance.now() to convert.
     * @returns {number|null} null if the session has not started.
     */
    sessionElapsedMs(tPerf) {
        if (this._sessionPerfStart == null) return null;
        const t = Number.isFinite(tPerf) ? tPerf : performance.now();
        return Math.round(t - this._sessionPerfStart);
    },

    // ==================== Stimulus Preload ====================

    async preloadStimuli() {
        const preloadEl = document.createElement('div');
        preloadEl.setAttribute('aria-hidden', 'true');
        preloadEl.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:400px;height:400px;opacity:0.01;pointer-events:none;';

        preloadEl.innerHTML = `
            <div class="flanker-stimulus">←←→←←</div>
            <div class="dccs-rule">色</div>
            <div style="font-size:5rem;">\uD83D\uDC01\uD83D\uDC08\uD83D\uDC15\uD83D\uDC11\uD83D\uDC04\uD83D\uDC18\uD83C\uDF53\uD83C\uDF4B\uD83C\uDF4E\uD83C\uDF48\uD83C\uDF83\uD83C\uDF49\u23F0\uD83D\uDECF\uFE0F\uD83E\uDEA5\uD83D\uDEBF\uD83E\uDDF4\uD83D\uDC55\uD83C\uDF73\u2615\uD83D\uDCF1\uD83D\uDC5F\uD83D\uDCBC\uD83D\uDEAA\uD83D\uDEB6\uD83D\uDE83\uD83C\uDFE2\uD83D\uDCD6\uD83D\uDED2\uD83E\uDD6C\uD83C\uDF56\uD83C\uDFE0\uD83E\uDD55\uD83D\uDD2A\uD83E\uDDC5\uD83E\uDD69\uD83E\uDDC2\uD83C\uDF72\uD83C\uDF5A\uD83C\uDF7D\uFE0F\uD83D\uDE0B\uD83C\uDF19\uD83D\uDECB\uFE0F\uD83D\uDCFA\uD83D\uDCA4\uD83C\uDF1E\uD83E\uDDD1\u200D\uD83C\uDF73\uD83C\uDF6A</div>
        `;

        const svgNs = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNs, 'svg');
        svg.setAttribute('width', '60');
        svg.setAttribute('height', '60');
        svg.setAttribute('viewBox', '0 0 100 100');
        const circle = document.createElementNS(svgNs, 'circle');
        circle.setAttribute('cx', '50');
        circle.setAttribute('cy', '50');
        circle.setAttribute('r', '40');
        circle.setAttribute('fill', '#3498db');
        svg.appendChild(circle);
        const star = document.createElementNS(svgNs, 'polygon');
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
            const angle = (i * 36 - 90) * Math.PI / 180;
            const r = i % 2 === 0 ? 45 : 20;
            starPoints.push(`${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`);
        }
        star.setAttribute('points', starPoints.join(' '));
        star.setAttribute('fill', '#e74c3c');
        svg.appendChild(star);
        preloadEl.appendChild(svg);

        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 150, 150);
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        colors.forEach((c, i) => {
            ctx.fillStyle = c;
            ctx.fillRect((i % 3) * 50, Math.floor(i / 3) * 50, 48, 48);
        });
        preloadEl.appendChild(canvas);

        document.body.appendChild(preloadEl);

        try {
            if (document.fonts && document.fonts.ready) {
                await Promise.race([
                    document.fonts.ready,
                    new Promise(resolve => setTimeout(resolve, 1500)),
                ]);
            }
        } catch (error) {
            // font loading timeout or unsupported — safe to ignore
        }

        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await new Promise(resolve => setTimeout(resolve, 120));

        if (preloadEl.parentNode) {
            preloadEl.parentNode.removeChild(preloadEl);
        }
    },

    practiceProgressHtml(current, total) {
        const pct = (current / total) * 100;
        const item = Math.min(current + 1, total);
        return `
            <div class="practice-progress">
                <div class="trial-progress-label">
                    <span>${this.t('common.status.practice')}</span>
                    <span>${item} / ${total}</span>
                </div>
                <div class="practice-progress-bar">
                    <div class="practice-progress-fill" style="width:${pct}%"></div>
                </div>
            </div>
        `;
    },

    mainTrialProgressHtml(current, total) {
        if (!total) return '';
        const pct = Math.min(100, Math.max(0, (current / total) * 100));
        const item = Math.min(current + 1, total);
        return `
            <div class="main-progress" aria-label="${this.t('common.status.progress', { current: item, total })}">
                <div class="trial-progress-label">
                    <span>${this.t('common.status.test')}</span>
                    <span>${item} / ${total}</span>
                </div>
                <div class="main-progress-bar">
                    <div class="main-progress-fill" style="width:${pct}%"></div>
                </div>
            </div>
        `;
    },

    computeSAAScore(accuracy, correctRTs) {
        const accScore = accuracy * 5;

        if (accuracy <= 0.8 || correctRTs.length === 0) {
            return {
                total: parseFloat(accScore.toFixed(2)),
                accScore: parseFloat(accScore.toFixed(2)),
                rtScore: null,
            };
        }

        let filteredRTs = [...correctRTs];
        if (filteredRTs.length >= 3) {
            const mean = this._mean(filteredRTs);
            const sd = this._sd(filteredRTs);
            if (sd != null && sd > 0) {
                filteredRTs = filteredRTs.filter(rt => Math.abs(rt - mean) <= 3 * sd);
            }
        }

        if (filteredRTs.length === 0) {
            return {
                total: parseFloat(accScore.toFixed(2)),
                accScore: parseFloat(accScore.toFixed(2)),
                rtScore: null,
            };
        }

        const clipped = filteredRTs.map(rt => Math.max(500, Math.min(3000, rt)));
        const medRT = this.median(clipped);
        const logRT = Math.log10(medRT);
        const logMin = Math.log10(500);
        const logMax = Math.log10(3000);
        const rtScore = 5 - (5 * (logRT - logMin) / (logMax - logMin));
        const total = accScore + rtScore;

        return {
            total: parseFloat(total.toFixed(2)),
            accScore: parseFloat(accScore.toFixed(2)),
            rtScore: parseFloat(rtScore.toFixed(2)),
        };
    },
};

document.addEventListener('DOMContentLoaded', () => App.init());
