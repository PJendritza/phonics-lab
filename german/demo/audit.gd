extends SceneTree
## Read-only integration audit against the prepared demo's real autoloads and pack.
## Run with: godot --headless --path <frontend> --script res://demo/audit.gd
## Demo's ordinary bootstrap installs its own user-data copy before these checks.

var failures: Array[String] = []
var database: Node
var checked_audio: Dictionary = {}
var checked_gps: Dictionary = {}
var checked_words: Dictionary = {}
var checked_syllables: Dictionary = {}
var lesson_results: Array[Dictionary] = []


func _initialize() -> void:
	_audit.call_deferred()


func _audit() -> void:
	await process_frame
	database = root.get_node_or_null("Database")
	if not _require(database != null, "Database autoload is unavailable"):
		_finish()
		return
	if not _require(database.get("language") == "de_DE", "Demo did not select de_DE"):
		_finish()
		return
	if not _require(bool(database.get("is_open")), "German database is not open"):
		_finish()
		return
	var sqlite: Object = database.get("db")
	if not _require(sqlite != null, "SQLite handle is unavailable"):
		_finish()
		return
	_require(bool(sqlite.call("query", "SELECT COUNT(*) AS total, MIN(LessonNb) AS first, MAX(LessonNb) AS last FROM Lessons")), "Lesson-count SQL failed")
	var lesson_rows: Array = sqlite.get("query_result")
	if _require(lesson_rows.size() == 1, "Lesson-count query returned no row"):
		_require(int(lesson_rows[0].total) == 6, "Expected exactly six Lessons rows")
		_require(int(lesson_rows[0].first) == 1 and int(lesson_rows[0].last) == 6, "Lesson numbers must span 1 through 6")
	_require(int(database.call("get_lessons_count")) == 6, "Upstream lesson-count API must return six")
	_require(bool(sqlite.call("query", "PRAGMA integrity_check")), "SQLite integrity check could not run")
	var integrity: Array = sqlite.get("query_result")
	_require(integrity.size() == 1 and str(integrity[0].get("integrity_check", "")) == "ok", "SQLite integrity_check failed")
	_require(bool(sqlite.call("query", "PRAGMA foreign_key_check")), "SQLite foreign-key check could not run")
	_require((sqlite.get("query_result") as Array).is_empty(), "SQLite foreign-key violations found")
	for lesson: int in range(1, 7):
		_check_lesson(lesson)
	for game: String in ["jellyfish", "frog"]:
		for kind: String in ["intro", "help", "end"]:
			_check_audio(str(database.call("get_kalulu_speech_path", game, kind)), "%s_%s speech" % [game, kind])
	_check_audio(str(database.call("get_kalulu_speech_path", "minigame", "lose")), "minigame_lose speech")
	_finish()


func _check_lesson(lesson: int) -> void:
	var exercises: Array = database.call("get_exercise_for_lesson", lesson)
	_require(exercises.has(1), "Lesson %d has no jellyfish exercise ID 1" % lesson)
	_require(exercises.has(6), "Lesson %d has no frog exercise ID 6" % lesson)
	var gps: Array = database.call("get_gps_for_lesson", lesson, false)
	_require(not gps.is_empty(), "Lesson %d has no available GPs" % lesson)
	for gp: Dictionary in gps:
		_check_gp(gp, lesson)
	var syllables: Array = database.call("get_syllables_for_lesson", lesson, false)
	_require(not syllables.is_empty(), "Lesson %d has an empty syllable pool" % lesson)
	for syllable: Dictionary in syllables:
		var context: String = "lesson %d syllable %s" % [lesson, syllable.get("Grapheme", "?")]
		_require(int(syllable.get("LessonNb", 99)) <= lesson, context + " is introduced too late")
		var decomposition: Array = syllable.get("GPs", [])
		_check_decomposition(decomposition, str(syllable.get("Grapheme", "")), lesson, context)
		_check_audio(str(database.call("resolve_syllable_sound_path", syllable)), context)
		checked_syllables[syllable.get("ID", -1)] = true
	var words: Array = database.call("get_words_for_lesson", lesson, false, 2, 6)
	_require(not words.is_empty(), "Lesson %d has an empty 2-6 GP word pool" % lesson)
	for word: Dictionary in words:
		var context: String = "lesson %d word %s" % [lesson, word.get("Word", "?")]
		_require(int(word.get("LessonNb", 99)) <= lesson, context + " is introduced too late")
		var decomposition: Array = database.call("get_gp_from_word", int(word.get("ID", -1)))
		_require(decomposition.size() == int(word.get("GPsCount", -1)), context + " GP count differs between upstream queries")
		_require(decomposition.size() >= 2 and decomposition.size() <= 6, context + " is outside the frog's supported GP count")
		_check_decomposition(decomposition, str(word.get("Word", "")), lesson, context)
		_check_audio(str(database.call("resolve_word_sound_path", word)), context)
		checked_words[word.get("ID", -1)] = true
	lesson_results.append({"lesson": lesson, "gps": gps.size(), "syllables": syllables.size(), "words": words.size(), "exercises": exercises})


func _check_decomposition(gps: Array, spelling: String, lesson: int, context: String) -> void:
	_require(not gps.is_empty(), context + " has no ordered GP decomposition")
	var reconstructed: String = ""
	for gp: Dictionary in gps:
		reconstructed += str(gp.get("Grapheme", ""))
		_check_gp(gp, lesson)
	_require(not spelling.is_empty() and reconstructed.to_lower() == spelling.to_lower(), context + " cannot be reconstructed from its ordered GPs")


func _check_gp(gp: Dictionary, lesson: int) -> void:
	var gp_id: int = int(gp.get("ID", -1))
	var context: String = "GP %d (%s/%s)" % [gp_id, gp.get("Grapheme", "?"), gp.get("Phoneme", "?")]
	_require(gp_id > 0 and not str(gp.get("Grapheme", "")).is_empty() and not str(gp.get("Phoneme", "")).is_empty(), context + " has incomplete fields")
	_require(int(gp.get("Type", -1)) in [1, 2], context + " must be a vowel or consonant")
	var first_lesson: int = int(database.call("get_min_lesson_for_gp_id", gp_id))
	_require(first_lesson >= 1 and first_lesson <= lesson, context + " is not available by lesson %d" % lesson)
	_check_audio(str(database.call("resolve_gp_asset_path", gp, "/language_sounds/", ".mp3")), context)
	checked_gps[gp_id] = true
	var distractors: Array = database.call("get_distractors_for_grapheme", gp_id, lesson)
	for distractor: Dictionary in distractors:
		_require(distractor.get("Grapheme") != gp.get("Grapheme") and distractor.get("Phoneme") != gp.get("Phoneme"), context + " has an ambiguous distractor")


func _check_audio(path: String, context: String) -> void:
	if not _require(not path.is_empty(), context + " has no resolved sound path"):
		return
	if checked_audio.has(path):
		return
	_require(path.begins_with("user://language_resources/de_DE/"), context + " resolves outside the German pack")
	if not _require(FileAccess.file_exists(path), context + " audio file does not exist: " + path):
		return
	var stream: AudioStream = database.call("load_external_sound", path) as AudioStream
	if not _require(stream != null, context + " audio cannot be decoded: " + path):
		return
	_require(is_finite(stream.get_length()) and stream.get_length() > 0.0, context + " audio duration is not positive: " + path)
	checked_audio[path] = stream.get_length()


func _require(condition: bool, message: String) -> bool:
	if not condition:
		failures.append(message)
		push_error("GERMAN_AUDIT: " + message)
	return condition


func _finish() -> void:
	var summary: Dictionary = {"lessons": lesson_results, "unique_gps": checked_gps.size(), "unique_syllables": checked_syllables.size(), "unique_words": checked_words.size(), "audio_files": checked_audio.size(), "failures": failures}
	if failures.is_empty():
		print("GERMAN_AUDIT_PASS " + JSON.stringify(summary))
		quit(0)
	else:
		print("GERMAN_AUDIT_FAIL " + JSON.stringify(summary))
		quit(1)
