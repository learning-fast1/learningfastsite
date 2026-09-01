/* ============================================================
   RAN — Phase 5: local profiles, localStorage persistence, export/
   import. Pure logic, no DOM — Node-testable via configure() with an
   injected mock backend, same dual-module pattern as the rest of RAN.

   Deliberately NOT a copy of Phono.sessionLog's capped/ring-buffer
   pattern (eidiki-ekpaideysi/fonologiki-epignosi/paixnidi): every
   valid administration is appended and kept, never silently dropped
   or overwritten past a size limit.

   A profile is the ONLY thing that gets a persistent studentId in
   this codebase. The ephemeral id Phase 3 generates
   (RAN.timed.generateEphemeralStudentId) is a throwaway technical
   placeholder for one live administration — saveAdministration()
   here REPLACES it with the chosen profile's id before anything is
   written to storage. An administration is never persisted under its
   own ephemeral id, and a profile is never created implicitly just by
   saving — the examiner always explicitly picks or creates one.
   ============================================================ */
(function (root) {
    'use strict';

    const RAN = root.RAN = root.RAN || {};
    if (!RAN.validateAdministration || !RAN.STATUS) {
        throw new Error('RAN.storage requires ran_engine.js to be loaded first');
    }

    const PROFILES_KEY = 'ran:profiles';
    const ADMINISTRATIONS_KEY = 'ran:administrations';

    let backend = (typeof root.localStorage !== 'undefined') ? root.localStorage : null;

    function generateProfileId() {
        if (root.crypto && typeof root.crypto.randomUUID === 'function') {
            return 'profile_' + root.crypto.randomUUID();
        }
        return 'profile_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    }

    function readList(key) {
        if (!backend) return [];
        const raw = backend.getItem(key);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function writeList(key, list) {
        if (!backend) throw new Error('RAN.storage: no storage backend configured/available');
        backend.setItem(key, JSON.stringify(list));
    }

    RAN.storage = {};

    /**
     * Scientific Protocol Correction decision §1: initialCorrect was
     * renamed to independentCorrect, and the derivation formula itself
     * changed (now also subtracts examinerProvidedAnswers). A record
     * saved by an earlier V1-development build of this tool may still
     * carry the old `initialCorrect` field and lack `independentCorrect`
     * entirely. This is an EXPLICIT, visible migration step — never a
     * silent field rename — applied to every record read out of
     * storage (RAN.storage.listAllAdministrations) or brought in via
     * import (RAN.storage.importAll), never mutating what's actually
     * persisted in localStorage. No production data exists yet for
     * this tool, so this only needs to cover local dev/test records,
     * not a general-purpose versioned migration system.
     *
     * Returns a NEW object (never mutates `admin`); returns `admin`
     * unchanged if it's already in the current shape (no `initialCorrect`
     * field, or already has `independentCorrect`).
     */
    RAN.storage.migrateAdministrationRecord = function (admin) {
        if (!admin || typeof admin !== 'object') return admin;
        if (admin.independentCorrect !== undefined || admin.initialCorrect === undefined) return admin;

        const migrated = Object.assign({}, admin);
        const examinerProvidedAnswers = migrated.examinerProvidedAnswers != null ? migrated.examinerProvidedAnswers : 0;
        // Recomputed via the current formula, not just copied over — the
        // old initialCorrect value never subtracted examinerProvidedAnswers,
        // so copying it verbatim would silently carry a stale number.
        migrated.independentCorrect = (typeof migrated.totalStimuli === 'number'
            && typeof migrated.substitutions === 'number'
            && typeof migrated.omissions === 'number')
            ? RAN.deriveIndependentCorrect(migrated.totalStimuli, migrated.substitutions, migrated.omissions, examinerProvidedAnswers)
            : migrated.initialCorrect;
        migrated.examinerProvidedAnswers = examinerProvidedAnswers;
        delete migrated.initialCorrect;

        if (typeof console !== 'undefined' && console.warn) {
            console.warn(
                'RAN.storage: migrated a V1-development record (administrationId='
                + migrated.administrationId + ') from initialCorrect to independentCorrect on read.'
            );
        }
        return migrated;
    };

    RAN.storage = Object.assign(RAN.storage, {
        PROFILES_KEY,
        ADMINISTRATIONS_KEY,

        /** Swaps the storage backend (localStorage-shaped: getItem/
         * setItem/removeItem). Defaults to root.localStorage. Node
         * tests inject a plain in-memory mock; pass null to simulate
         * storage being unavailable. */
        configure(customBackend) {
            backend = customBackend;
        },

        isAvailable() {
            if (!backend) return false;
            try {
                const testKey = '__ran_storage_probe__';
                backend.setItem(testKey, '1');
                backend.removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        },

        listProfiles() {
            return readList(PROFILES_KEY).slice().sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
        },

        getProfile(profileId) {
            return readList(PROFILES_KEY).find(p => p.profileId === profileId) || null;
        },

        /** "Μαθητής 01", "Μαθητής 02", ... — a suggestion only, always
         * editable by the examiner before saving (spec: displayLabel
         * must not encourage typing a real name, but the user can
         * change the suggested default). */
        suggestNextDisplayLabel() {
            const profiles = readList(PROFILES_KEY);
            let max = 0;
            profiles.forEach(p => {
                const m = /^Μαθητής (\d+)$/.exec(p.displayLabel || '');
                if (m) max = Math.max(max, parseInt(m[1], 10));
            });
            return 'Μαθητής ' + String(max + 1).padStart(2, '0');
        },

        /**
         * `grade` is optional context metadata (RAN.GRADE value or
         * null/undefined for "not set") — never required, never
         * inferred. Validated with RAN.isValidGrade as a live-write
         * guard (the UI only ever offers real RAN.GRADE options in its
         * <select>, so this only catches direct API misuse, not normal
         * examiner input) — throws rather than silently coercing a bad
         * value, since this is the strict-write side of the grade
         * data-flow (see RAN.storage.updateProfileGrade/
         * saveAdministration for the same guard elsewhere, and
         * RAN.wording.resolveGradeLabel for the separate tolerant-read
         * side used for legacy/imported data).
         */
        createProfile(displayLabel, grade) {
            const label = (displayLabel && displayLabel.trim()) || this.suggestNextDisplayLabel();
            const gradeValue = grade !== undefined ? grade : null;
            if (!RAN.isValidGrade(gradeValue)) {
                throw new Error('RAN.storage.createProfile: invalid grade "' + gradeValue + '"');
            }
            const profile = { profileId: generateProfileId(), displayLabel: label, createdAt: new Date().toISOString(), grade: gradeValue };
            const profiles = readList(PROFILES_KEY);
            profiles.push(profile);
            writeList(PROFILES_KEY, profiles);
            return profile;
        },

        renameProfile(profileId, displayLabel) {
            const profiles = readList(PROFILES_KEY);
            const profile = profiles.find(p => p.profileId === profileId);
            if (!profile) throw new Error('RAN.storage.renameProfile: unknown profileId "' + profileId + '"');
            profile.displayLabel = displayLabel;
            writeList(PROFILES_KEY, profiles);
            return profile;
        },

        /**
         * Updates a profile's CURRENT grade — pure standing metadata
         * used only as future prefill (see ran_ui.js renderSaveSection).
         * Never touches any already-saved administration's
         * gradeAtAdministration snapshot: those live entirely on their
         * own administration records, written once at save time and
         * never re-derived from profile.grade afterwards (grade
         * data-flow correction — no fallback/inference lives in this
         * storage layer).
         */
        updateProfileGrade(profileId, grade) {
            if (!RAN.isValidGrade(grade)) {
                throw new Error('RAN.storage.updateProfileGrade: invalid grade "' + grade + '"');
            }
            const profiles = readList(PROFILES_KEY);
            const profile = profiles.find(p => p.profileId === profileId);
            if (!profile) throw new Error('RAN.storage.updateProfileGrade: unknown profileId "' + profileId + '"');
            profile.grade = grade;
            writeList(PROFILES_KEY, profiles);
            return profile;
        },

        listAllAdministrations() {
            return readList(ADMINISTRATIONS_KEY).map(RAN.storage.migrateAdministrationRecord);
        },

        listAdministrations(profileId) {
            return this.listAllAdministrations()
                .filter(a => a.studentId === profileId)
                .slice()
                .sort((a, b) => (a.dateISO || '').localeCompare(b.dateISO || ''));
        },

        /**
         * Item 23: permanently removes exactly one administration by
         * its administrationId — nothing else. History/graph/comparison
         * never need a separate invalidation step: they're all derived
         * live from listAdministrations()/listAllAdministrations() on
         * every render, so the deleted record simply stops appearing
         * the next time the examiner is navigated back to that screen
         * (ran_ui.js does this immediately after a successful delete).
         * Returns { deleted:false } (never throws) for an unknown id,
         * mirroring saveAdministration's own "report a problem, don't
         * throw" convention.
         */
        deleteAdministration(administrationId) {
            const all = readList(ADMINISTRATIONS_KEY);
            const next = all.filter(a => a.administrationId !== administrationId);
            if (next.length === all.length) {
                return { deleted: false, problems: ['Άγνωστη χορήγηση (δεν βρέθηκε administrationId "' + administrationId + '")'] };
            }
            writeList(ADMINISTRATIONS_KEY, next);
            return { deleted: true };
        },

        /**
         * Item 23: cascade-deletes a profile AND every administration
         * that references it. Deliberately cascade (not orphan-and-
         * leave, not block-while-non-empty): the storage layer already
         * treats "an administration referencing a profileId not present
         * locally" as invalid data (see importAll's own rejection of
         * exactly that shape) — leaving orphaned administrations behind
         * would create data this same storage layer could never import
         * back cleanly. The examiner-facing confirmation (ran_ui.js) is
         * responsible for stating the real administration count up
         * front before this is ever called — this function does not
         * ask for confirmation itself, matching every other storage
         * function's "pure data operation" contract.
         * Returns { deleted:false, problems } for an unknown profileId
         * (never throws), or { deleted:true, deletedAdministrationsCount }.
         */
        deleteProfile(profileId) {
            const profiles = readList(PROFILES_KEY);
            const profileExists = profiles.some(p => p.profileId === profileId);
            if (!profileExists) {
                return { deleted: false, problems: ['Άγνωστο προφίλ (δεν βρέθηκε profileId "' + profileId + '")'] };
            }
            const remainingProfiles = profiles.filter(p => p.profileId !== profileId);
            const allAdmins = readList(ADMINISTRATIONS_KEY);
            const remainingAdmins = allAdmins.filter(a => a.studentId !== profileId);
            const deletedAdministrationsCount = allAdmins.length - remainingAdmins.length;
            writeList(PROFILES_KEY, remainingProfiles);
            writeList(ADMINISTRATIONS_KEY, remainingAdmins);
            return { deleted: true, deletedAdministrationsCount };
        },

        /**
         * Re-associates `administration` (as built by RAN.timed.
         * build*Administration, still carrying its ephemeral Phase 3
         * studentId) with `profileId`, validates the result with the
         * same RAN.validateAdministration used everywhere else, and
         * appends it to storage — never overwriting, never capping.
         * Returns { saved:false, problems } instead of throwing on a
         * data problem, mirroring RAN.timed's own build* functions, so
         * the UI can show the problem instead of losing the record.
         */
        saveAdministration(profileId, administration) {
            const profile = this.getProfile(profileId);
            if (!profile) {
                return { saved: false, problems: ['Άγνωστο προφίλ (δεν βρέθηκε profileId "' + profileId + '")'] };
            }
            // Grade data-flow correction: gradeAtAdministration is NEVER
            // read from `profile.grade` here — whatever is already on
            // `administration` (set explicitly by the UI/save-flow
            // before this call, or left null/absent) is what gets
            // persisted, verbatim. This is only a strict-write validity
            // guard against a live-write API misuse (e.g. a hand-typed
            // value) — the examiner-facing <select> in ran_ui.js only
            // ever offers real RAN.GRADE options, so this should never
            // actually trigger from normal use. RAN.validateAdministration
            // itself (used by import too) deliberately does NOT check
            // this field — that keeps legacy/imported records with an
            // unknown grade importable (tolerant read), which this
            // stricter, storage-local check must not interfere with.
            if (administration.gradeAtAdministration !== undefined && !RAN.isValidGrade(administration.gradeAtAdministration)) {
                return { saved: false, problems: ['Μη έγκυρη τιμή τάξης χορήγησης (gradeAtAdministration)'] };
            }
            const stored = Object.assign({}, administration, { studentId: profileId });
            const problems = RAN.validateAdministration(stored);
            if (problems.length) {
                return { saved: false, problems };
            }
            const all = readList(ADMINISTRATIONS_KEY);
            if (all.some(a => a.administrationId === stored.administrationId)) {
                return { saved: false, problems: ['Η εγγραφή υπάρχει ήδη αποθηκευμένη (διπλότυπο administrationId)'] };
            }
            all.push(stored);
            writeList(ADMINISTRATIONS_KEY, all);
            return { saved: true, administration: stored };
        },

        exportAll() {
            return {
                formatVersion: 1,
                exportedAt: new Date().toISOString(),
                profiles: readList(PROFILES_KEY),
                administrations: readList(ADMINISTRATIONS_KEY),
            };
        },

        /**
         * Imports profiles/administrations from a previously exported
         * payload. Never overwrites an existing profileId/
         * administrationId silently — a conflict is skipped and
         * reported, not merged or replaced. Every administration is
         * re-validated with RAN.validateAdministration before being
         * accepted, so a malformed or incompatible (e.g. tampered
         * stimulusSequence, wrong assessmentVersion) record is
         * rejected and reported rather than imported. Returns a full
         * report of what happened to every record; only ever WRITES
         * the accepted ones (merged into existing storage).
         */
        importAll(data) {
            if (!data || !Array.isArray(data.profiles) || !Array.isArray(data.administrations)) {
                throw new Error('RAN.storage.importAll: malformed import data (expected {profiles: [], administrations: []})');
            }

            const report = { importedProfiles: [], skippedProfiles: [], importedAdministrations: [], skippedAdministrations: [] };

            const profiles = readList(PROFILES_KEY);
            const profileIds = new Set(profiles.map(p => p.profileId));
            data.profiles.forEach(p => {
                if (!p || typeof p.profileId !== 'string' || typeof p.displayLabel !== 'string') {
                    report.skippedProfiles.push({ profileId: p && p.profileId, reason: 'malformed profile record' });
                    return;
                }
                if (profileIds.has(p.profileId)) {
                    report.skippedProfiles.push({ profileId: p.profileId, reason: 'profileId already exists locally (no silent overwrite)' });
                    return;
                }
                // Tolerant read: `grade` is passed through as-is,
                // whatever it is (a real RAN.GRADE value, an absent/
                // undefined field from an older export, or an unknown/
                // corrupt string) — never validated or rejected here.
                // RAN.wording.resolveGradeLabel is solely responsible
                // for turning anything not a recognized RAN.GRADE value
                // into the neutral "Μη διαθέσιμη τάξη" at display time;
                // this import step must never itself skip/reject a
                // profile over its grade field, and must never coerce
                // an unrecognized value into OTHER_UNSPECIFIED.
                profiles.push({
                    profileId: p.profileId,
                    displayLabel: p.displayLabel,
                    createdAt: p.createdAt || new Date().toISOString(),
                    grade: p.grade !== undefined ? p.grade : null,
                });
                profileIds.add(p.profileId);
                report.importedProfiles.push(p.profileId);
            });

            const admins = readList(ADMINISTRATIONS_KEY);
            const adminIds = new Set(admins.map(a => a.administrationId));
            data.administrations.forEach(rawA => {
                if (!rawA || typeof rawA !== 'object' || typeof rawA.administrationId !== 'string') {
                    report.skippedAdministrations.push({ administrationId: rawA && rawA.administrationId, reason: 'malformed administration record' });
                    return;
                }
                if (adminIds.has(rawA.administrationId)) {
                    report.skippedAdministrations.push({ administrationId: rawA.administrationId, reason: 'administrationId already exists locally (no silent overwrite)' });
                    return;
                }
                // Migrate a V1-development export (old initialCorrect
                // field) to the current shape before validating it —
                // see RAN.storage.migrateAdministrationRecord.
                const a = RAN.storage.migrateAdministrationRecord(rawA);
                const problems = RAN.validateAdministration(a);
                if (problems.length) {
                    report.skippedAdministrations.push({ administrationId: a.administrationId, reason: 'failed validation: ' + problems.join('; ') });
                    return;
                }
                if (!profileIds.has(a.studentId)) {
                    report.skippedAdministrations.push({ administrationId: a.administrationId, reason: 'references a profileId not present locally — import the matching profile first' });
                    return;
                }
                admins.push(a);
                adminIds.add(a.administrationId);
                report.importedAdministrations.push(a.administrationId);
            });

            writeList(PROFILES_KEY, profiles);
            writeList(ADMINISTRATIONS_KEY, admins);
            return report;
        },
    });

    if (typeof module !== 'undefined' && module.exports) module.exports = RAN;
})(typeof window !== 'undefined' ? window : globalThis);
