# fitme-story Makefile — framework targets vendored from FT2 (2026-05-09)
# per user directive "every feature on fitme story must invoke full
# framework". Mirrors FT2's targets so muscle-memory works in either repo.

.PHONY: install-hooks integrity-check verify-local schema-check case-study-check

# Install the vendored pre-commit hook into the local git config.
install-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/pre-commit
	chmod +x scripts/check-state-schema.py
	chmod +x scripts/check-case-study-preflight.py
	chmod +x scripts/integrity-check.py
	@echo "✓ Pre-commit hook installed. Gates fire on every git commit."

# Run all framework gates locally without committing.
verify-local: schema-check case-study-check integrity-check
	@echo "✓ All local framework gates pass."

# State.json schema (write-time gates run in --all mode).
schema-check:
	python3 scripts/check-state-schema.py

# Case-study preflight (BROKEN_PR_CITATION + tier-tag presence).
case-study-check:
	python3 scripts/check-case-study-preflight.py

# Cycle-time integrity scan against every state.json + case study.
integrity-check:
	python3 scripts/integrity-check.py

# Membrane status — what feature is active, what gates fired recently.
membrane-status:
	@if [ -f .claude/active-feature ]; then \
		echo "Active feature: $$(cat .claude/active-feature)"; \
	else \
		echo "No active feature (run /pm-workflow {name} to set)"; \
	fi
	@if [ -f .claude/logs/gate-coverage.jsonl ]; then \
		echo "Recent gate fires: $$(tail -5 .claude/logs/gate-coverage.jsonl | wc -l) (last 5)"; \
	fi
