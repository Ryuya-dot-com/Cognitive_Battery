// ==================== Cognitive Battery — Researcher Study Configuration ====================

(function initStudyConfiguration(global) {
    'use strict';

    const SCHEMA_VERSION = 'study-config-2026-07-v1';
    const PROTOCOL_PRESET = 'literature-aligned-2026-07-v1';
    const ACTIVE_STORAGE_KEY = 'cognitive-battery-active-study-config-v1';
    const PRESET_STORAGE_KEY = 'cognitive-battery-study-config-presets-v1';

    const clone = (value) => JSON.parse(JSON.stringify(value));

    const deepFreeze = (value) => {
        if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
        Object.values(value).forEach(deepFreeze);
        return Object.freeze(value);
    };

    const uniqueKnownTasks = (values, knownTasks) => {
        const seen = new Set();
        return (Array.isArray(values) ? values : []).filter((taskId) => {
            if (!knownTasks.includes(taskId) || seen.has(taskId)) return false;
            seen.add(taskId);
            return true;
        });
    };

    const encodeBase64Url = (value) => {
        const bytes = new TextEncoder().encode(value);
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    };

    const decodeBase64Url = (value) => {
        const padded = String(value || '').replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(String(value || '').length / 4) * 4, '=');
        const binary = atob(padded);
        const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    };

    const StudyConfig = {
        SCHEMA_VERSION,
        PROTOCOL_PRESET,
        ACTIVE_STORAGE_KEY,
        PRESET_STORAGE_KEY,
        app: null,
        activeConfig: null,
        draft: null,
        researcherMode: false,
        fixedDraftState: null,
        linkedConfigInvalid: false,
        storedConfigInvalid: false,

        async init(app) {
            this.app = app;
            this.researcherMode = this.queryValue('mode') === 'researcher';
            this.installAppApi();
            this.bindEvents();

            const linkedConfig = this.readLinkedConfiguration();
            const storedConfig = (linkedConfig || this.linkedConfigInvalid) ? null : this.readActiveConfiguration();
            const candidate = linkedConfig || storedConfig;
            if (candidate) {
                try {
                    this.activeConfig = await this.finalizeConfig(candidate, {
                        expectedHash: candidate.config_hash || candidate.study_config_hash || null,
                        requireHash: true,
                    });
                } catch (error) {
                    console.error('Study configuration could not be verified.', error);
                    this.activeConfig = null;
                    this.setBlockingConfigError('common.researcherConfig.validation.integrity');
                }
            } else if (this.linkedConfigInvalid || this.storedConfigInvalid) {
                this.setBlockingConfigError('common.researcherConfig.validation.invalid');
            }

            this.applyActiveConfigurationToParticipantUi();
            this.renderPresetOptions();

            document.addEventListener('i18n:change', () => {
                if (this.draft) {
                    this.renderTaskOrder();
                    this.renderProtocolSummary();
                }
                const selectedPreset = document.getElementById('study-preset-select')?.value || '';
                this.renderPresetOptions(selectedPreset);
                this.renderActiveSummary();
                this.renderParticipantLanguageHint();
                this.renderResearcherLanguageControls();
                if (this.app.studyConfigErrorKey) this.setBlockingConfigError(this.app.studyConfigErrorKey);
            });

            if (this.researcherMode) this.openResearcherConfig();
        },

        installAppApi() {
            this.app.openResearcherConfig = () => this.openResearcherConfig();
            this.app.buildStudyConfig = () => this.buildStudyConfig();
            this.app.applyStudyConfig = config => this.applyStudyConfig(config);
            this.app.clearStudyConfig = () => this.clearStudyConfig();
            this.app.getEffectiveStudyConfigMetadata = () => this.getMetadata();
            this.app.buildStudyConfigurationRows = () => this.buildRows();
        },

        queryValue(key) {
            try {
                return new URLSearchParams(global.location.search).get(key);
            } catch (error) {
                return null;
            }
        },

        hasQueryParameter(key) {
            try {
                return new URLSearchParams(global.location.search).has(key);
            } catch (error) {
                return false;
            }
        },

        defaultDraft() {
            return {
                schema_version: SCHEMA_VERSION,
                study_id: 'cognitive-battery-study',
                participant_language: this.app ? this.app.uiLanguage : 'ja',
                language_policy: 'fixed',
                task_selection_policy: 'researcher_fixed',
                selected_tests: this.app ? this.app.ALL_TEST_IDS.slice() : [],
                order_policy: 'williams',
                fixed_order: this.app ? this.app.ALL_TEST_IDS.slice() : [],
                protocol_preset: PROTOCOL_PRESET,
                protocol_version: this.app ? this.app.PROTOCOL_VERSION : '',
                config_source: 'researcher_ui',
            };
        },

        normalizeConfig(input) {
            if (!input || typeof input !== 'object' || Array.isArray(input)) {
                throw new TypeError('Invalid study configuration.');
            }
            const allTests = this.app.ALL_TEST_IDS.slice();
            const orderPolicy = input.order_policy === 'fixed' ? 'fixed' : 'williams';
            const participantLanguage = input.participant_language === 'en' ? 'en' : 'ja';
            const languagePolicy = input.language_policy === 'participant_choice' ? 'participant_choice' : 'fixed';
            const sourceOrder = uniqueKnownTasks(input.fixed_order, allTests);
            const sourceSelected = uniqueKnownTasks(input.selected_tests, allTests);
            const hasExplicitSelection = Array.isArray(input.selected_tests);
            let selectedTests = hasExplicitSelection ? sourceSelected : sourceOrder;
            let fixedOrder = sourceOrder.concat(allTests.filter(taskId => !sourceOrder.includes(taskId)));

            if (orderPolicy === 'williams') {
                selectedTests = allTests.slice();
                fixedOrder = allTests.slice();
            } else {
                const selectedSet = new Set(selectedTests);
                fixedOrder = fixedOrder.filter(taskId => selectedSet.has(taskId));
                for (const taskId of selectedTests) {
                    if (!fixedOrder.includes(taskId)) fixedOrder.push(taskId);
                }
                selectedTests = fixedOrder.slice();
            }

            return {
                schema_version: SCHEMA_VERSION,
                study_id: String(input.study_id || '').trim().slice(0, 80),
                participant_language: participantLanguage,
                language_policy: languagePolicy,
                task_selection_policy: input.task_selection_policy === 'participant_choice' ? 'participant_choice' : 'researcher_fixed',
                selected_tests: selectedTests,
                order_policy: orderPolicy,
                fixed_order: fixedOrder,
                protocol_preset: PROTOCOL_PRESET,
                protocol_version: this.app.PROTOCOL_VERSION,
                config_source: ['researcher_ui', 'preset', 'participant_link', 'participant_setup', 'legacy-session-v2'].includes(input.config_source)
                    ? input.config_source
                    : 'researcher_ui',
            };
        },

        canonicalConfiguration(input) {
            const config = this.normalizeConfig(input);
            return {
                schema_version: config.schema_version,
                study_id: config.study_id,
                participant_language: config.participant_language,
                language_policy: config.language_policy,
                task_selection_policy: config.task_selection_policy,
                selected_tests: config.selected_tests.slice(),
                order_policy: config.order_policy,
                fixed_order: config.fixed_order.slice(),
                protocol_preset: config.protocol_preset,
                protocol_version: config.protocol_version,
            };
        },

        validateConfig(input) {
            if (input?.order_policy !== 'fixed' && Array.isArray(input?.selected_tests)) {
                const requested = uniqueKnownTasks(input.selected_tests, this.app.ALL_TEST_IDS);
                if (requested.length !== this.app.ALL_TEST_IDS.length) throw new Error('williams_all');
            }
            const config = this.normalizeConfig(input);
            if (!config.study_id) throw new Error('study_id');
            if (config.selected_tests.length === 0) throw new Error('no_tasks');
            if (config.order_policy === 'williams' && config.selected_tests.length !== this.app.ALL_TEST_IDS.length) {
                throw new Error('williams_all');
            }
            return config;
        },

        async finalizeConfig(input, { expectedHash = null, requireHash = false } = {}) {
            if (requireHash && !expectedHash) throw new Error('integrity');
            const config = this.validateConfig(input);
            const canonical = JSON.stringify(this.canonicalConfiguration(config));
            const digest = await this.app.computeSha256(canonical);
            if (!digest) throw new Error('hash_unavailable');
            const configHash = `sha256:${digest}`;
            if (expectedHash && expectedHash !== configHash) throw new Error('integrity');
            const idPrefix = config.study_id
                .normalize('NFKC')
                .replace(/\s+/g, '-')
                .replace(/[^A-Za-z0-9._-]/g, '')
                .replace(/^-+|-+$/g, '')
                .slice(0, 48) || 'study';
            return deepFreeze({
                ...config,
                config_id: `${idPrefix}-${digest.slice(0, 12)}`,
                config_hash: configHash,
            });
        },

        readActiveConfiguration() {
            try {
                const raw = localStorage.getItem(ACTIVE_STORAGE_KEY);
                if (raw === null) return null;
                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid');
                return parsed;
            } catch (error) {
                this.storedConfigInvalid = true;
                return null;
            }
        },

        readLinkedConfiguration() {
            if (!this.hasQueryParameter('study')) return null;
            const encoded = this.queryValue('study');
            if (!encoded) {
                this.linkedConfigInvalid = true;
                return null;
            }
            try {
                const parsed = JSON.parse(decodeBase64Url(encoded));
                return { ...parsed, config_source: 'participant_link' };
            } catch (error) {
                console.error('Invalid participant configuration link.', error);
                this.linkedConfigInvalid = true;
                return null;
            }
        },

        persistActiveConfiguration(config) {
            try {
                localStorage.setItem(ACTIVE_STORAGE_KEY, JSON.stringify(config));
            } catch (error) {
                console.error('Failed to save the active study configuration.', error);
            }
        },

        readPresets() {
            try {
                const raw = localStorage.getItem(PRESET_STORAGE_KEY);
                const parsed = raw ? JSON.parse(raw) : {};
                return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
            } catch (error) {
                return {};
            }
        },

        writePresets(presets) {
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        },

        bindEvents() {
            const orderRadios = document.querySelectorAll('input[name="study-order-policy"]');
            orderRadios.forEach(radio => radio.addEventListener('change', () => {
                const previousPolicy = this.draft?.order_policy;
                this.syncDraftFromControls();
                if (previousPolicy === 'fixed' && radio.value === 'williams') {
                    this.fixedDraftState = {
                        selected_tests: this.draft.selected_tests.slice(),
                        fixed_order: this.draft.fixed_order.slice(),
                    };
                }
                this.draft.order_policy = radio.value === 'fixed' ? 'fixed' : 'williams';
                if (this.draft.order_policy === 'williams') {
                    this.draft.selected_tests = this.app.ALL_TEST_IDS.slice();
                    this.draft.fixed_order = this.app.ALL_TEST_IDS.slice();
                } else if (this.fixedDraftState) {
                    this.draft.selected_tests = this.fixedDraftState.selected_tests.slice();
                    this.draft.fixed_order = this.fixedDraftState.fixed_order.slice();
                }
                this.renderTaskOrder();
                this.renderProtocolSummary();
                this.setError('');
            }));

            ['study-id', 'study-language', 'lock-participant-language'].forEach((id) => {
                const element = document.getElementById(id);
                if (!element) return;
                const eventName = element.tagName === 'INPUT' && element.type === 'text' ? 'input' : 'change';
                element.addEventListener(eventName, () => {
                    this.syncDraftFromControls();
                    this.renderProtocolSummary();
                    this.setError('');
                });
            });

            document.getElementById('btn-apply-study-config').addEventListener('click', async () => {
                try {
                    await this.applyStudyConfig(this.buildStudyConfig());
                    this.setStatus(this.app.t('common.researcherConfig.applied'));
                    this.researcherMode = false;
                    this.removeQueryParameter('mode');
                    this.renderActiveSummary();
                    this.app.showScreen('screen-start');
                } catch (error) {
                    this.handleValidationError(error);
                }
            });
            document.getElementById('btn-cancel-study-config').addEventListener('click', () => {
                this.setError('');
                this.setStatus('');
                this.researcherMode = false;
                this.removeQueryParameter('mode');
                this.removeQueryParameter('researcher_lang');
                this.applyActiveConfigurationToParticipantUi();
                this.renderActiveSummary();
                this.app.showScreen('screen-start');
            });
            document.getElementById('btn-clear-study-config').addEventListener('click', () => {
                if (global.confirm(this.app.t('common.researcherConfig.clearConfirm'))) this.clearStudyConfig();
            });
            document.getElementById('btn-save-study-preset').addEventListener('click', () => this.savePreset({ confirmOverwrite: true }));
            document.getElementById('btn-load-study-preset').addEventListener('click', () => this.loadPreset());
            document.getElementById('btn-delete-study-preset').addEventListener('click', () => this.deletePreset({ confirmDelete: true }));
            document.getElementById('study-preset-select').addEventListener('change', () => this.updatePresetActionAvailability());
            document.getElementById('btn-copy-participant-link').addEventListener('click', () => this.copyParticipantLink());
            document.querySelectorAll('.researcher-ui-language-option').forEach(button => {
                button.addEventListener('click', () => {
                    const locale = button.dataset.locale === 'en' ? 'en' : 'ja';
                    this.app.setLanguage(locale, { force: true, resetConsent: false });
                    this.setQueryParameter('researcher_lang', locale);
                    this.renderResearcherLanguageControls();
                });
            });
        },

        openResearcherConfig() {
            if (this.app.startTime) {
                this.app.setStartError(this.app.t('common.researcherConfig.validation.sessionActive'));
                return false;
            }
            this.researcherMode = true;
            this.fixedDraftState = null;
            this.draft = this.activeConfig ? this.normalizeConfig(this.activeConfig) : this.defaultDraft();
            this.populateControls();
            this.renderPresetOptions();
            this.renderResearcherLanguageControls();
            this.setError(this.app.studyConfigError || '');
            this.setStatus('');
            this.app.showScreen('screen-researcher-config');
            return true;
        },

        populateControls() {
            const draft = this.draft || this.defaultDraft();
            if (draft.order_policy === 'fixed') {
                this.fixedDraftState = {
                    selected_tests: draft.selected_tests.slice(),
                    fixed_order: draft.fixed_order.slice(),
                };
            }
            document.getElementById('study-id').value = draft.study_id;
            document.getElementById('study-protocol-preset').value = PROTOCOL_PRESET;
            document.getElementById('study-language').value = draft.participant_language;
            document.getElementById('lock-participant-language').checked = draft.language_policy === 'fixed';
            const policy = document.querySelector(`input[name="study-order-policy"][value="${draft.order_policy}"]`);
            if (policy) policy.checked = true;
            this.renderTaskOrder();
            this.renderProtocolSummary();
        },

        syncDraftFromControls() {
            if (!this.draft) this.draft = this.defaultDraft();
            this.draft.study_id = document.getElementById('study-id').value.trim();
            this.draft.participant_language = document.getElementById('study-language').value === 'en' ? 'en' : 'ja';
            this.draft.language_policy = document.getElementById('lock-participant-language').checked ? 'fixed' : 'participant_choice';
            this.draft.order_policy = document.querySelector('input[name="study-order-policy"]:checked')?.value === 'fixed' ? 'fixed' : 'williams';
            const rows = Array.from(document.querySelectorAll('#study-task-order-list [data-task-id]'));
            if (rows.length > 0) {
                this.draft.fixed_order = rows.map(row => row.dataset.taskId);
                this.draft.selected_tests = rows
                    .filter(row => row.querySelector('.study-task-checkbox')?.checked)
                    .map(row => row.dataset.taskId);
            }
            this.draft.protocol_preset = PROTOCOL_PRESET;
            this.draft.protocol_version = this.app.PROTOCOL_VERSION;
        },

        buildStudyConfig() {
            this.syncDraftFromControls();
            return this.normalizeConfig(this.draft);
        },

        async applyStudyConfig(input) {
            this.assertSessionIdle();
            const finalized = await this.finalizeConfig(input);
            this.activeConfig = finalized;
            this.linkedConfigInvalid = false;
            this.storedConfigInvalid = false;
            this.app.studyConfigError = '';
            this.app.studyConfigErrorKey = '';
            this.app.setStartError('');
            this.persistActiveConfiguration(finalized);
            this.removeQueryParameter('lang');
            this.removeQueryParameter('researcher_lang');
            this.applyActiveConfigurationToParticipantUi();
            return finalized;
        },

        clearStudyConfig() {
            if (this.app.startTime) {
                const error = new Error('session_active');
                this.handleValidationError(error);
                this.app.setStartError(this.app.t('common.researcherConfig.validation.sessionActive'));
                return false;
            }
            try { localStorage.removeItem(ACTIVE_STORAGE_KEY); } catch (error) { /* non-fatal */ }
            this.activeConfig = null;
            this.linkedConfigInvalid = false;
            this.storedConfigInvalid = false;
            this.app.studyConfig = null;
            this.app.studyConfigHash = null;
            this.app.resolvedTaskOrder = [];
            this.app.participantLanguageLocked = false;
            this.app.studyConfigError = '';
            this.app.studyConfigErrorKey = '';
            this.app.setStartError('');
            this.app.updateLanguageControls();
            this.setParticipantTaskControls(null, { reset: true });
            this.renderActiveSummary();
            this.renderParticipantLanguageHint();
            this.removeQueryParameter('study');
            this.removeQueryParameter('mode');
            this.removeQueryParameter('researcher_lang');
            this.researcherMode = false;
            this.setError('');
            this.setStatus(this.app.t('common.researcherConfig.cleared'));
            this.app.showScreen('screen-start');
            return true;
        },

        setBlockingConfigError(key) {
            this.app.studyConfigErrorKey = key;
            this.app.studyConfigError = this.app.t(key);
            this.setError(this.app.studyConfigError);
            this.app.setStartError(this.app.studyConfigError);
        },

        assertSessionIdle() {
            if (this.app.startTime) throw new Error('session_active');
        },

        applyActiveConfigurationToParticipantUi() {
            const config = this.activeConfig;
            if (!config) {
                this.app.studyConfig = null;
                this.app.studyConfigHash = null;
                this.app.participantLanguageLocked = false;
                this.app.updateLanguageControls();
                this.setParticipantTaskControls(null);
                this.renderActiveSummary();
                this.renderParticipantLanguageHint();
                return;
            }

            const explicitQueryLanguage = this.researcherMode
                ? (this.queryValue('researcher_lang') || this.queryValue('lang'))
                : this.queryValue('lang');
            if (this.researcherMode && ['ja', 'en'].includes(explicitQueryLanguage)) {
                this.app.setLanguage(explicitQueryLanguage, { force: true, resetConsent: false });
            } else if (config.language_policy === 'fixed' || !explicitQueryLanguage) {
                this.app.setLanguage(config.participant_language, { force: true, resetConsent: true });
            }
            this.app.participantLanguageLocked = config.language_policy === 'fixed';
            this.app.studyConfig = config;
            this.app.studyConfigHash = config.config_hash;
            this.app.updateLanguageControls();
            this.setParticipantTaskControls(config);
            this.renderActiveSummary();
            this.renderParticipantLanguageHint();
        },

        setParticipantTaskControls(config, { reset = false } = {}) {
            const selectAll = document.getElementById('select-all-tests');
            const individual = document.getElementById('individual-tests');
            const selectionGroup = document.getElementById('participant-task-selection');
            const checkboxes = Array.from(document.querySelectorAll('.test-checkbox'));
            if (!config) {
                selectionGroup?.classList.remove('hidden');
                selectAll.disabled = false;
                if (reset) {
                    selectAll.checked = true;
                    individual.classList.add('hidden');
                }
                checkboxes.forEach(checkbox => {
                    checkbox.disabled = false;
                    if (reset) checkbox.checked = true;
                });
                return;
            }
            selectionGroup?.classList.add('hidden');
            const selected = new Set(config.selected_tests);
            const allSelected = this.app.ALL_TEST_IDS.every(taskId => selected.has(taskId));
            selectAll.checked = allSelected;
            selectAll.disabled = true;
            checkboxes.forEach(checkbox => {
                checkbox.checked = selected.has(checkbox.value);
                checkbox.disabled = true;
            });
            individual.classList.add('hidden');
        },

        renderParticipantLanguageHint() {
            const hint = document.getElementById('language-hint');
            if (!hint) return;
            const key = this.activeConfig?.language_policy === 'fixed'
                ? 'common.language.lockedHint'
                : 'common.language.hint';
            hint.textContent = this.app.t(key);
        },

        renderResearcherLanguageControls() {
            document.querySelectorAll('.researcher-ui-language-option').forEach(button => {
                button.setAttribute('aria-pressed', button.dataset.locale === this.app.uiLanguage ? 'true' : 'false');
            });
        },

        renderActiveSummary() {
            const container = document.getElementById('active-study-config-summary');
            if (!container) return;
            const config = this.activeConfig;
            if (!config) {
                container.classList.add('hidden');
                container.innerHTML = '';
                return;
            }
            const taskNames = config.selected_tests.map(taskId => this.app.testRegistry[taskId]?.name || taskId);
            const languageName = config.participant_language === 'en' ? 'English' : '日本語';
            const languagePolicy = config.language_policy === 'fixed'
                ? this.app.t('common.researcherConfig.summary.locked')
                : this.app.t('common.researcherConfig.summary.selectable');
            const orderName = config.order_policy === 'williams'
                ? this.app.t('common.researcherConfig.summary.williams')
                : this.app.t('common.researcherConfig.summary.fixed');
            container.innerHTML = `
                <div class="active-config-copy">
                    <strong>${this.app.t('common.researcherConfig.summary.heading')}</strong>
                    <span><b>${this.app.t('common.researcherConfig.summary.id')}:</b> ${config.config_id}</span>
                    <span><b>${this.app.t('common.researcherConfig.summary.language')}:</b> ${languageName} (${languagePolicy})</span>
                    <span><b>${this.app.t('common.researcherConfig.summary.order')}:</b> ${orderName}</span>
                    <span><b>${this.app.t('common.researcherConfig.summary.tasks')}:</b> ${taskNames.join(' / ')}</span>
                </div>
                ${this.researcherMode ? `<button type="button" id="btn-edit-study-config" class="btn btn-secondary">${this.app.t('common.researcherConfig.summary.edit')}</button>` : ''}
            `;
            container.classList.remove('hidden');
            const editButton = document.getElementById('btn-edit-study-config');
            if (editButton) editButton.addEventListener('click', () => this.openResearcherConfig());
        },

        renderTaskOrder() {
            if (!this.draft) return;
            const list = document.getElementById('study-task-order-list');
            const policyIsWilliams = this.draft.order_policy === 'williams';
            const selected = new Set(policyIsWilliams ? this.app.ALL_TEST_IDS : this.draft.selected_tests);
            const baseOrder = uniqueKnownTasks(this.draft.fixed_order, this.app.ALL_TEST_IDS)
                .concat(this.app.ALL_TEST_IDS.filter(taskId => !this.draft.fixed_order.includes(taskId)));
            this.draft.fixed_order = baseOrder;
            if (policyIsWilliams) this.draft.selected_tests = this.app.ALL_TEST_IDS.slice();
            list.innerHTML = '';

            baseOrder.forEach((taskId, index) => {
                const task = this.app.testRegistry[taskId];
                const taskName = task ? task.name : taskId;
                const item = document.createElement('li');
                item.className = `task-order-item${selected.has(taskId) ? '' : ' task-order-item-unselected'}`;
                item.dataset.taskId = taskId;
                item.draggable = false;
                item.setAttribute('aria-label', taskName);
                const selectedPosition = baseOrder.slice(0, index + 1).filter(id => selected.has(id)).length;
                const selectedOrder = baseOrder.filter(id => selected.has(id));
                const selectedIndex = selectedOrder.indexOf(taskId);
                item.innerHTML = `
                    <label class="task-order-label">
                        <input type="checkbox" class="study-task-checkbox" ${selected.has(taskId) ? 'checked' : ''} ${policyIsWilliams ? 'disabled' : ''}>
                        <span class="task-order-position" aria-hidden="true">${policyIsWilliams ? '•' : (selected.has(taskId) ? selectedPosition : '—')}</span>
                        <span class="task-order-copy"><strong>${taskName}</strong><small>${task ? task.domain : ''}</small></span>
                    </label>
                    <span class="move-controls">
                        <button type="button" class="task-move-up" aria-label="${this.app.t('common.researcherConfig.order.moveUp', { task: taskName })}" ${policyIsWilliams || selectedIndex <= 0 ? 'disabled' : ''}>↑</button>
                        <button type="button" class="task-move-down" aria-label="${this.app.t('common.researcherConfig.order.moveDown', { task: taskName })}" ${policyIsWilliams || selectedIndex < 0 || selectedIndex === selectedOrder.length - 1 ? 'disabled' : ''}>↓</button>
                    </span>
                `;
                list.appendChild(item);

                item.querySelector('.study-task-checkbox').addEventListener('change', (event) => {
                    if (event.target.checked) selected.add(taskId);
                    else selected.delete(taskId);
                    this.draft.selected_tests = baseOrder.filter(id => selected.has(id));
                    this.renderTaskOrder();
                    this.renderProtocolSummary();
                    this.setError('');
                    this.focusTaskControl(taskId, '.study-task-checkbox');
                });
                item.querySelector('.task-move-up').addEventListener('click', () => this.moveTask(taskId, -1));
                item.querySelector('.task-move-down').addEventListener('click', () => this.moveTask(taskId, 1));
            });
        },

        moveTask(taskId, direction) {
            if (!this.draft || this.draft.order_policy !== 'fixed') return;
            const order = this.draft.fixed_order.slice();
            const selectedOrder = order.filter(id => this.draft.selected_tests.includes(id));
            const selectedIndex = selectedOrder.indexOf(taskId);
            const nextSelectedIndex = selectedIndex + direction;
            if (selectedIndex < 0 || nextSelectedIndex < 0 || nextSelectedIndex >= selectedOrder.length) return;
            const swapTaskId = selectedOrder[nextSelectedIndex];
            const index = order.indexOf(taskId);
            const swapIndex = order.indexOf(swapTaskId);
            [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
            this.draft.fixed_order = order;
            this.draft.selected_tests = order.filter(id => this.draft.selected_tests.includes(id));
            this.renderTaskOrder();
            this.renderProtocolSummary();
            this.focusTaskControl(taskId, direction < 0 ? '.task-move-up' : '.task-move-down');
            const taskName = this.app.testRegistry[taskId]?.name || taskId;
            this.setStatus(this.app.t('common.researcherConfig.order.moved', { task: taskName, position: nextSelectedIndex + 1 }));
        },

        focusTaskControl(taskId, selector) {
            const row = Array.from(document.querySelectorAll('#study-task-order-list [data-task-id]'))
                .find(element => element.dataset.taskId === taskId);
            if (!row) return;
            const preferred = row.querySelector(selector);
            const fallback = row.querySelector('.task-move-up:not(:disabled), .task-move-down:not(:disabled), .study-task-checkbox');
            (preferred && !preferred.disabled ? preferred : fallback)?.focus();
        },

        renderProtocolSummary() {
            if (!this.draft) return;
            const summary = document.getElementById('study-protocol-summary');
            const taskNames = this.draft.selected_tests.map(taskId => this.app.testRegistry[taskId]?.name || taskId);
            const language = this.draft.participant_language === 'en' ? 'English' : '日本語';
            const languagePolicy = this.draft.language_policy === 'fixed'
                ? this.app.t('common.researcherConfig.language.fixed')
                : this.app.t('common.researcherConfig.language.selectable');
            const order = this.draft.order_policy === 'williams'
                ? this.app.t('common.researcherConfig.order.williams')
                : this.app.t('common.researcherConfig.order.fixed');
            const rows = [
                [this.app.t('common.researcherConfig.protocol.version'), this.app.PROTOCOL_VERSION],
                [this.app.t('common.researcherConfig.protocol.configuredLanguage'), language],
                [this.app.t('common.researcherConfig.protocol.languagePolicy'), languagePolicy],
                [this.app.t('common.researcherConfig.protocol.orderPolicy'), order],
                [this.app.t('common.researcherConfig.protocol.selectedTasks'), this.app.t('common.researcherConfig.tasks.selectedCount', { count: taskNames.length })],
            ];
            summary.innerHTML = rows.map(([term, detail]) => `<div><dt>${term}</dt><dd>${detail}</dd></div>`).join('');
            const taskDetail = document.createElement('div');
            taskDetail.className = 'protocol-task-preview';
            taskDetail.innerHTML = `<dt>${this.app.t('common.researcherConfig.protocol.configPreview')}</dt><dd></dd>`;
            taskDetail.querySelector('dd').textContent = this.draft.order_policy === 'williams'
                ? this.app.t('common.researcherConfig.protocol.williamsPreview')
                : (taskNames.join(' → ') || '—');
            summary.appendChild(taskDetail);
        },

        savePreset({ confirmOverwrite = false } = {}) {
            const nameInput = document.getElementById('study-preset-name');
            const name = nameInput.value.trim();
            if (!name) {
                this.setError(this.app.t('common.researcherConfig.preset.nameRequired'));
                nameInput.focus();
                return;
            }
            try {
                const configuration = this.validateConfig(this.buildStudyConfig());
                const presets = this.readPresets();
                if (confirmOverwrite && presets[name]
                    && !global.confirm(this.app.t('common.researcherConfig.preset.overwriteConfirm', { name }))) return;
                presets[name] = { configuration, saved_at: new Date().toISOString() };
                this.writePresets(presets);
                this.renderPresetOptions(name);
                this.setError('');
                this.setStatus(this.app.t('common.researcherConfig.preset.savedStatus', { name }));
            } catch (error) {
                this.handleValidationError(error);
            }
        },

        loadPreset() {
            const select = document.getElementById('study-preset-select');
            const name = select.value;
            if (!name) {
                this.setError(this.app.t('common.researcherConfig.preset.selectRequired'));
                select.focus();
                return;
            }
            const preset = this.readPresets()[name];
            try {
                this.draft = this.normalizeConfig({ ...(preset?.configuration || {}), config_source: 'preset' });
                this.fixedDraftState = null;
                this.populateControls();
                document.getElementById('study-preset-name').value = name;
                this.setError('');
                this.setStatus(this.app.t('common.researcherConfig.preset.loadedStatus', { name }));
            } catch (error) {
                this.setError(this.app.t('common.researcherConfig.preset.invalid'));
            }
        },

        deletePreset({ confirmDelete = false } = {}) {
            const select = document.getElementById('study-preset-select');
            const name = select.value;
            if (!name) {
                this.setError(this.app.t('common.researcherConfig.preset.selectRequired'));
                select.focus();
                return;
            }
            const presets = this.readPresets();
            if (confirmDelete
                && !global.confirm(this.app.t('common.researcherConfig.preset.deleteConfirm', { name }))) return;
            delete presets[name];
            this.writePresets(presets);
            this.renderPresetOptions();
            this.setError('');
            this.setStatus(this.app.t('common.researcherConfig.preset.deletedStatus', { name }));
        },

        renderPresetOptions(selectedName = '') {
            const select = document.getElementById('study-preset-select');
            if (!select) return;
            const names = Object.keys(this.readPresets()).sort((a, b) => a.localeCompare(b));
            select.innerHTML = '';
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = this.app.t('common.researcherConfig.preset.none');
            select.appendChild(placeholder);
            for (const name of names) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
            }
            select.value = names.includes(selectedName) ? selectedName : '';
            this.updatePresetActionAvailability();
        },

        updatePresetActionAvailability() {
            const hasSelection = Boolean(document.getElementById('study-preset-select')?.value);
            document.getElementById('btn-load-study-preset').disabled = !hasSelection;
            document.getElementById('btn-delete-study-preset').disabled = !hasSelection;
        },

        async copyParticipantLink() {
            try {
                const finalized = await this.finalizeConfig(this.buildStudyConfig());
                const url = new URL(global.location.href);
                url.searchParams.delete('mode');
                url.searchParams.delete('lang');
                url.searchParams.set('study', encodeBase64Url(JSON.stringify(finalized)));
                const text = url.toString();
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                } else {
                    const temporary = document.createElement('textarea');
                    temporary.value = text;
                    temporary.setAttribute('readonly', '');
                    temporary.style.position = 'fixed';
                    temporary.style.opacity = '0';
                    document.body.appendChild(temporary);
                    temporary.select();
                    const copied = document.execCommand('copy');
                    document.body.removeChild(temporary);
                    if (!copied) throw new Error('clipboard');
                }
                this.setError('');
                this.setStatus(this.app.t('common.researcherConfig.link.copied'));
            } catch (error) {
                if (['study_id', 'no_tasks', 'williams_all', 'hash_unavailable'].includes(error.message)) {
                    this.handleValidationError(error);
                } else {
                    this.setError(this.app.t('common.researcherConfig.link.copyFailed'));
                }
            }
        },

        removeQueryParameter(name) {
            try {
                const url = new URL(global.location.href);
                url.searchParams.delete(name);
                global.history.replaceState({}, '', url.toString());
            } catch (error) {
                // non-fatal
            }
        },

        setQueryParameter(name, value) {
            try {
                const url = new URL(global.location.href);
                url.searchParams.set(name, value);
                global.history.replaceState({}, '', url.toString());
            } catch (error) {
                // non-fatal
            }
        },

        handleValidationError(error) {
            const keyByMessage = {
                study_id: 'common.researcherConfig.validation.studyId',
                no_tasks: 'common.researcherConfig.validation.noTasks',
                williams_all: 'common.researcherConfig.validation.williamsAll',
                hash_unavailable: 'common.researcherConfig.validation.hashUnavailable',
                integrity: 'common.researcherConfig.validation.integrity',
                session_active: 'common.researcherConfig.validation.sessionActive',
            };
            this.setError(this.app.t(keyByMessage[error?.message] || 'common.researcherConfig.validation.invalid'));
        },

        setError(message) {
            const element = document.getElementById('study-config-error');
            if (!element) return;
            element.textContent = message || '';
            element.classList.toggle('hidden', !message);
        },

        setStatus(message) {
            const element = document.getElementById('study-config-status');
            if (element) element.textContent = message || '';
        },

        async createSessionConfig() {
            if (this.activeConfig) {
                return this.finalizeConfig(this.activeConfig, {
                    expectedHash: this.activeConfig.config_hash,
                    requireHash: true,
                });
            }
            const selectedTests = this.app.getSelectedTestsFromUi();
            const allSelected = this.app.ALL_TEST_IDS.every(taskId => selectedTests.includes(taskId));
            return this.finalizeConfig({
                schema_version: SCHEMA_VERSION,
                study_id: 'unspecified-study',
                participant_language: this.app.uiLanguage,
                language_policy: 'participant_choice',
                task_selection_policy: 'participant_choice',
                selected_tests: selectedTests,
                order_policy: allSelected ? 'williams' : 'fixed',
                fixed_order: selectedTests,
                protocol_preset: PROTOCOL_PRESET,
                protocol_version: this.app.PROTOCOL_VERSION,
                config_source: 'participant_setup',
            });
        },

        resolveTaskOrder(config, participantId) {
            if (config.order_policy === 'williams') {
                const allocation = this.app.counterbalanceOrderFor(participantId);
                return { order: allocation.order, group: allocation.group };
            }
            return { order: config.fixed_order.slice(), group: null };
        },

        async restoreSessionConfig(saved) {
            const isVersionedSession = saved.sessionPayloadVersion === this.app.SESSION_PAYLOAD_VERSION;
            if (saved.studyConfig && !isVersionedSession) throw new Error('integrity');
            if (isVersionedSession) {
                if (!saved.studyConfig
                    || !Array.isArray(saved.selectedTests)
                    || saved.selectedTests.length === 0
                    || !Array.isArray(saved.resolvedTaskOrder)
                    || saved.resolvedTaskOrder.length === 0) {
                    throw new Error('integrity');
                }
            }
            let restored;
            if (saved.studyConfig) {
                restored = await this.finalizeConfig(saved.studyConfig, {
                    expectedHash: saved.studyConfigHash || saved.studyConfig.config_hash || null,
                    requireHash: isVersionedSession,
                });
            } else {
                restored = await this.finalizeConfig({
                    schema_version: SCHEMA_VERSION,
                    study_id: 'legacy-session',
                    participant_language: saved.ui_language || saved.quality?.ui_language || 'ja',
                    language_policy: 'fixed',
                    task_selection_policy: 'researcher_fixed',
                    selected_tests: saved.selectedTests || [],
                    order_policy: Number.isFinite(saved.counterbalanceGroup) ? 'williams' : 'fixed',
                    fixed_order: saved.selectedTests || [],
                    protocol_preset: PROTOCOL_PRESET,
                    protocol_version: this.app.PROTOCOL_VERSION,
                    config_source: 'legacy-session-v2',
                });
            }
            const rawResolved = Array.isArray(saved.resolvedTaskOrder) && saved.resolvedTaskOrder.length > 0
                ? saved.resolvedTaskOrder
                : saved.selectedTests;
            const resolved = uniqueKnownTasks(rawResolved, this.app.ALL_TEST_IDS);
            if (!Array.isArray(rawResolved)
                || resolved.length !== rawResolved.length
                || new Set(rawResolved).size !== rawResolved.length) {
                throw new Error('integrity');
            }
            if (Array.isArray(saved.selectedTests)
                && saved.selectedTests.length > 0
                && JSON.stringify(saved.selectedTests) !== JSON.stringify(resolved)) {
                throw new Error('integrity');
            }
            if (restored.order_policy === 'fixed') {
                if (JSON.stringify(resolved) !== JSON.stringify(restored.fixed_order)
                    || (isVersionedSession
                        ? saved.counterbalanceGroup !== null
                        : Number.isFinite(saved.counterbalanceGroup))) {
                    throw new Error('integrity');
                }
            } else {
                if (isVersionedSession && !String(saved.participantId || '').trim()) throw new Error('integrity');
                const allocation = this.app.counterbalanceOrderFor(saved.participantId || '');
                if (JSON.stringify(resolved) !== JSON.stringify(allocation.order)
                    || saved.counterbalanceGroup !== allocation.group) {
                    throw new Error('integrity');
                }
            }
            this.app.studyConfig = restored;
            this.app.studyConfigHash = restored.config_hash;
            this.app.resolvedTaskOrder = resolved;
            return restored;
        },

        getMetadata() {
            const config = this.app.studyConfig || this.activeConfig;
            if (!config) return {
                study_config_schema_version: SCHEMA_VERSION,
                study_id: null,
                study_config_id: null,
                study_config_hash: null,
                protocol_preset: PROTOCOL_PRESET,
                task_order_policy: null,
                configured_tasks: '',
                resolved_task_order: (this.app.resolvedTaskOrder || []).join(','),
                language_policy: null,
                language_locked: 0,
                task_selection_policy: null,
                study_config_source: null,
            };
            return {
                study_config_schema_version: config.schema_version,
                study_id: config.study_id,
                study_config_id: config.config_id,
                study_config_hash: config.config_hash,
                protocol_preset: config.protocol_preset,
                task_order_policy: config.order_policy,
                configured_tasks: config.selected_tests.join(','),
                resolved_task_order: (this.app.resolvedTaskOrder?.length ? this.app.resolvedTaskOrder : config.fixed_order).join(','),
                language_policy: config.language_policy,
                language_locked: config.language_policy === 'fixed' ? 1 : 0,
                task_selection_policy: config.task_selection_policy,
                study_config_source: config.config_source,
            };
        },

        buildRows() {
            const config = this.app.studyConfig || this.activeConfig;
            if (!config) return [];
            const rows = [
                ['study_config_schema_version', config.schema_version],
                ['study_id', config.study_id],
                ['study_config_id', config.config_id],
                ['study_config_hash', config.config_hash],
                ['protocol_preset', config.protocol_preset],
                ['protocol_version', config.protocol_version],
                ['participant_language_default', config.participant_language],
                ['language_policy', config.language_policy],
                ['task_selection_policy', config.task_selection_policy],
                ['configured_tasks', config.selected_tests.join(',')],
                ['task_order_policy', config.order_policy],
                ['fixed_order', config.fixed_order.join(',')],
                ['resolved_task_order', (this.app.resolvedTaskOrder || []).join(',')],
                ['study_config_source', config.config_source],
            ];
            return rows.map(([field, value]) => ({ field, value }));
        },

        publicSessionConfiguration() {
            const config = this.app.studyConfig;
            return config ? {
                ...clone(config),
                resolved_task_order: (this.app.resolvedTaskOrder || []).slice(),
            } : null;
        },
    };

    global.StudyConfig = StudyConfig;
})(window);
